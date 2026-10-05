# Diagnóstico de liderazgo · Reypar

Aplicación web para aplicar y analizar la **Encuesta de percepción de asesores comerciales sobre su liderazgo**.
Digitaliza el libro `Encuesta_Liderazgo_Reypar.xlsx`: captura anónima por bloques, cálculo automático de
los indicadores de las hojas **Resultados** y **Resumen**, dashboard administrativo y exportación a Excel.

**Capturar → analizar → comparar → identificar alertas → exportar.**

Producción: <https://reypar-eight.vercel.app>

- Arquitectura, modelo de datos, reglas de negocio y rutas: [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md)
- Stack: Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui (Base UI) · Prisma 7 + PostgreSQL ·
  Zod · React Hook Form · Recharts · ExcelJS · Auth.js · Vitest

## Puesta en marcha

Requisitos: Node.js 20+ y PostgreSQL 16 (o Docker).

```bash
cp .env.example .env        # complete AUTH_SECRET y ADMIN_PASSWORD
docker compose up -d        # PostgreSQL local en el puerto 5433 (opcional si ya tiene uno)
```

```bash
npm install

npx prisma migrate dev

npx prisma db seed

npm run dev
```

- Encuesta: <http://localhost:3000/encuesta>
- Panel administrativo: <http://localhost:3000/admin> (usuario = `ADMIN_EMAIL` / `ADMIN_PASSWORD` del `.env`)

### Datos de prueba (solo desarrollo)

El seed **no** crea respuestas. Para poblar el dashboard con respuestas ficticias:

```bash
npm run db:seed:demo -- 19
```

El script se niega a correr con `NODE_ENV=production`.

## Variables de entorno

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Cadena de conexión PostgreSQL. Con `docker-compose.yml`: `postgresql://reypar:reypar@localhost:5433/reypar_liderazgo?schema=public` |
| `AUTH_SECRET` | Secreto de Auth.js para firmar la sesión. Genere uno con `npx auth secret` u `openssl rand -base64 32`. |
| `ADMIN_EMAIL` | Correo del administrador inicial que crea el seed. |
| `ADMIN_PASSWORD` | Contraseña inicial de ese administrador (se guarda con hash bcrypt). Cámbiela en producción. |

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build y servidor de producción |
| `npm test` | Pruebas unitarias (Vitest) |
| `npm run typecheck` | Genera tipos de rutas y ejecuta `tsc` |
| `npm run lint` | ESLint |
| `npm run db:up` | Levanta PostgreSQL con Docker |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:seed` | Seed de producción (encuesta, líderes, bloques, preguntas, frecuencias, configuración, admin) |
| `npm run db:seed:demo -- N` | N respuestas ficticias (desarrollo) |

`npm install` ejecuta `prisma generate` automáticamente (el cliente se genera en `src/generated/prisma`).

## Cómo funciona

### Encuesta (sin login)

- Wizard de 14 pasos: datos de clasificación (líder directo y antigüedad), los 11 bloques, ranking de
  prioridades (drag & drop o flechas) y preguntas abiertas.
- Escalas con botones grandes `1 2 3 4 5 N/A`; cada pregunta de escala admite un comentario opcional.
- Las preguntas de escala son obligatorias (N/A es válida); comentarios y preguntas abiertas son opcionales.
- El borrador se guarda solo en `sessionStorage` del dispositivo; **la respuesta se guarda en la base de datos
  únicamente al enviar**, en una transacción. El UUID de la respuesta se genera al iniciar y hace el envío
  idempotente: un doble clic o un reintento no duplica ni modifica una respuesta ya guardada.

### Anonimato

- No se piden nombre, correo, documento ni teléfono. No se guarda IP, user-agent ni huella del navegador.
- El UUID nunca se muestra en la interfaz; solo aparece como "ID anónimo" en la hoja Respuestas del Excel.
- Si un filtro deja menos de `minResponsesForSegment` respuestas (3 por defecto, editable), no se muestran
  resultados ni comentarios. Los líderes con menos respuestas que ese mínimo no tienen columna propia
  (sus respuestas sí cuentan en el total) y sus comentarios aparecen como "Otros líderes".
- Los comentarios se listan en orden alfabético para no revelar el orden de llegada.

### Cálculos (idénticos al Excel)

Viven en `src/lib/analytics` como funciones puras con pruebas en `src/lib/analytics/__tests__`.

- **Promedio y % favorable por pregunta**: solo respuestas numéricas; N/A y vacíos excluidos.
- **Promedio de bloque** = promedio de los promedios de sus preguntas (igual que `AVERAGEIFS` sobre la hoja
  Resultados), no el promedio de todas las notas juntas.
- **Promedio general**: las 61 preguntas de Resultados (Likert + G1), sin G2, G3, G4, PR1 ni abiertas.
- **Semáforo**, **NPS**, **brecha de acompañamiento**, **mapa de prioridades** (`RANK` ascendente con empates
  compartidos) y las **tres alertas cruzadas**, con los umbrales de `/admin/configuracion`.
- D7 está redactada en positivo y **no** se invierte.

Se verificó que la exportación coincide con un recálculo independiente de las fórmulas del Excel
(bloques, 61 preguntas, NPS, brecha y prioridades) sobre las mismas respuestas.

### Exportación

`Exportar resultados` descarga `Resultados_Encuesta_Liderazgo_YYYY-MM-DD.xlsx` con los filtros activos y
seis hojas: Resumen, Resultados por pregunta, Respuestas, Comentarios, Preguntas abiertas y Configuración.
Si hay más de dos líderes, las columnas se agregan dinámicamente.

## Mantenimiento

- **Líderes, umbrales, mínimo por segmento y niveles de frecuencia**: `/admin/configuracion` (sin tocar código).
  Los líderes no se borran, se desactivan, para conservar el histórico.
- **Preguntas**: se definen en `src/lib/survey/questions.ts`. Los códigos (L1, CO4, G2…) se usan en
  cálculos y exportación: no los cambie. Tras editar textos ejecute `npx prisma db seed` para sincronizar el
  catálogo en la base de datos.
- **Nuevos administradores**: el seed crea el inicial; para otros, inserte un registro en `AdminUser` con un
  hash bcrypt (o ejecute el seed con otro `ADMIN_EMAIL`/`ADMIN_PASSWORD`).

## Fuera de alcance

La hoja `Preguntas adicionales` del Excel (motivación, rutina, hábitos) no forma parte de la encuesta
principal ni de sus cálculos, por lo que no se incluyó.
