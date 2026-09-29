# Arquitectura — Diagnóstico de liderazgo Reypar

Fuente funcional: `Encuesta_Liderazgo_Reypar.xlsx` (hojas `Encuesta`, `Captura`, `Resultados`, `Resumen`, `Config`).
Flujo del producto: **capturar → analizar → comparar → identificar alertas → exportar**.

## 1. Propuesta de arquitectura

Monolito Next.js (App Router) con capas separadas por responsabilidad. Sin microservicios ni APIs
innecesarias: las páginas administrativas son Server Components que leen de Prisma y pasan
resultados ya calculados a componentes de UI; las mutaciones son Server Actions.

```
┌──────────── UI (React, shadcn/ui, Recharts) ─────────────┐
│ components/survey/*   components/admin/*   components/charts/* │
└───────────────▲──────────────────────────────▲────────────┘
                │ props (datos ya calculados)   │ Server Actions
┌───────────────┴──────────┐   ┌───────────────┴────────────┐
│ lib/analytics/*  (puro)  │   │ server/actions/*            │
│ lib/export/*     (puro)  │   │  (validación Zod + auth)    │
└───────────────▲──────────┘   └───────────────┬────────────┘
                │ AnalyticsResponse[]           │
┌───────────────┴───────────────────────────────▼────────────┐
│ lib/data/*  (repositorios Prisma → modelos de dominio)      │
└───────────────▲─────────────────────────────────────────────┘
                │
        PostgreSQL (Prisma 7 + driver adapter pg)
```

- **Configuración de la encuesta** (`lib/survey/questions.ts`): catálogo tipado de bloques y preguntas.
  Es la fuente de verdad para el wizard, la validación, el análisis y la exportación. El seed lo
  replica en las tablas `SurveyBlock` / `Question` para integridad referencial y para BI externo.
- **Parámetros de negocio** (umbrales, nota favorable, brecha, mínimo por segmento, niveles de
  frecuencia, líderes) viven en la base de datos y se editan en `/admin/configuracion`.
- **Cálculos** (`lib/analytics`): funciones puras, sin Prisma ni React, probadas con Vitest.
- **Exportación** (`lib/export`): recibe el reporte calculado y construye el `.xlsx` con ExcelJS.

## 2. Árbol de carpetas

```
prisma/
  schema.prisma            modelo normalizado
  migrations/              migraciones SQL
  seed.ts                  encuesta, líderes, bloques, preguntas, frecuencias, config, admin
  seed-demo.ts             respuestas ficticias (solo desarrollo, comando aparte)
prisma.config.ts           datasource + comando de seed (Prisma 7)
docker-compose.yml         PostgreSQL local
src/
  auth.ts                  Auth.js (Credentials + JWT)
  app/
    page.tsx               redirección a /encuesta
    encuesta/page.tsx                  introducción
    encuesta/[surveyId]/page.tsx       wizard
    encuesta/[surveyId]/gracias/page.tsx
    admin/login/page.tsx
    admin/(panel)/layout.tsx           protege todo el panel
    admin/(panel)/page.tsx             dashboard
    admin/(panel)/resultados/...       general, preguntas, comentarios, abiertas
    admin/(panel)/configuracion/page.tsx
    api/auth/[...nextauth]/route.ts
    api/export/resultados/route.ts
  components/
    ui/        shadcn/ui (Base UI)
    survey/    SurveyWizard, SurveyProgress, LikertQuestion, NpsQuestion, ...
    admin/     MetricCard, TrafficLightBadge, ResultsFilters, tablas, paneles
    charts/    gráficos Recharts (client components)
  lib/
    survey/    questions.ts, types.ts, submission-schema.ts, labels.ts
    analytics/ average, favorability, traffic-light, nps, question/block results,
               frequency-gap, priorities, alerts, build-report  (+ __tests__)
    export/    export-results-xlsx.ts
    data/      prisma.ts, settings.ts, leaders.ts, surveys.ts, responses.ts, filters.ts
    format.ts
  server/actions/  submit-survey.ts, settings.ts, leaders.ts, survey-status.ts, auth.ts
```

## 3. Modelo Prisma

Ver `prisma/schema.prisma`. Decisiones:

| Modelo | Propósito |
|---|---|
| `Survey` | Encuesta aplicable; `active` abre/cierra la recepción. |
| `Leader` | Líderes configurables (N líderes, no limitado a A/B). |
| `SurveyBlock`, `Question`, `FrequencyOption` | Catálogo replicado desde la configuración central. |
| `SurveyResponse` | Una por encuesta completada. `id` = UUID. Solo líder, antigüedad y fechas. |
| `SurveyAnswer` | Una fila por pregunta: `numericValue`, `isNotApplicable`, `optionValue`, `textValue`, `comment`. |
| `PriorityRank` | PR1 persistido por dimensión; `@@unique([responseId, rank])` impide posiciones repetidas a nivel de BD. |
| `AppSettings` | Fila única con umbrales y parámetros. |
| `AdminUser` | Administradores (hash bcrypt). No tiene relación con respuestas. |

N/A se guarda explícitamente (`isNotApplicable = true`, `numericValue = null`) para distinguirlo
de "sin respuesta" y excluirlo de promedios y favorabilidad.

## 4. Definición TypeScript de preguntas

```ts
type QuestionType = "likert" | "satisfaction" | "nps" | "frequency" | "ranking" | "open"

type SurveyQuestion = {
  id: string            // código: L1, CO4, G2, PR1, O1…
  block: BlockId
  text: string
  shortLabel: string    // "Tiempo de respuesta" (vista de comentarios)
  type: QuestionType
  allowComment: boolean
  required: boolean
  inResults: boolean    // entra en hoja Resultados / promedio general (Likert + G1)
}
```

## 5. Reglas de negocio (réplica exacta del Excel)

| Indicador | Regla | Referencia Excel |
|---|---|---|
| Promedio pregunta | media de respuestas numéricas; excluye N/A y vacíos | `AVERAGE` |
| % favorable | `#(nota ≥ favorableMin) / #válidas` | `COUNTIF/COUNT` |
| Promedio bloque | **media de los promedios de sus preguntas** | `AVERAGEIFS(Resultados!E)` |
| % fav. bloque | media de los % favorables de sus preguntas | `AVERAGEIFS(Resultados!I)` |
| Promedio general | media de los promedios de las 61 preguntas de Resultados (sin G2, G3, G4, PR1, O*) | `AVERAGE(Resultados!E)` |
| Semáforo | `≥ fortaleza` Fortaleza · `≥ aMejorar` A mejorar · resto Crítico | `Resumen!J` |
| NPS | `%promotores(9–10) − %detractores(0–6)`, escala −100…100 | `Resumen!B27` |
| Brecha acompañamiento | `nivel G4 − nivel G3`; `> umbral` Falta · `< −umbral` Sobra · resto Ajustado | `Resumen!B42` |
| Posición prioridad | `RANK` ascendente del ranking promedio (empates comparten posición) | `Resumen!C47` |
| Lectura prioridad | posición ≤ 2 y desempeño < fortaleza → Invertir primero; ≤ 2 → Mantener; > 2 y < fortaleza → Mejorar después; resto Sin urgencia | `Resumen!E47` |
| Alertas | FT (bloque) y FT5 < alerta; D (bloque) y D7 < alerta; M1 < alerta; sin datos → "Sin datos" | `Resumen!D56:D58` |

D7 **no** se invierte. Los filtros (líder, antigüedad, fechas) afectan todos los cálculos.

**Anonimato:** si el segmento filtrado tiene menos de `minResponsesForSegment` (3 por defecto,
editable) respuestas, no se muestran resultados ni comentarios; las columnas de un líder con
menos respuestas que el mínimo aparecen como "—".

## 6. Rutas

| Ruta | Acceso | Contenido |
|---|---|---|
| `/` | público | redirige a `/encuesta` |
| `/encuesta` | público | introducción, escala, botón comenzar |
| `/encuesta/[surveyId]` | público | wizard (14 pasos) |
| `/encuesta/[surveyId]/gracias` | público | confirmación |
| `/admin/login` | público | inicio de sesión |
| `/admin` | admin | KPIs, estado de la encuesta, enlace para compartir |
| `/admin/resultados` | admin | bloques, NPS, frecuencia, prioridades, alertas, gráficos |
| `/admin/resultados/preguntas` | admin | tabla equivalente a `Resultados` |
| `/admin/resultados/comentarios` | admin | comentarios por pregunta |
| `/admin/resultados/abiertas` | admin | O1–O4 |
| `/admin/configuracion` | admin | líderes, umbrales, frecuencias, estado |
| `/api/export/resultados` | admin | `.xlsx` con los mismos filtros |

## 7. Componentes principales

- **Encuesta:** `SurveyWizard`, `SurveyProgress`, `SurveySection`, `ClassificationStep`,
  `LikertQuestion`, `NpsQuestion`, `FrequencyQuestion`, `RankingQuestion`, `OpenQuestion`, `CommentField`.
- **Admin:** `AdminShell`, `MetricCard`, `TrafficLightBadge`, `ResultsFilters`, `BlockResultsTable`,
  `QuestionResultsTable`, `NpsCard`, `FrequencyGapCard`, `PriorityTable`, `AlertsPanel`,
  `CommentsList`, `ExportButton`, `InsufficientData`.
- **Gráficos:** `BlockAverageChart`, `BlockFavorabilityChart`, `LeaderComparisonChart`, `NpsChart`,
  `FrequencyChart`, `PriorityMatrix`.
