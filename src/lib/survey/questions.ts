import type {
  BlockId,
  FrequencyOptionId,
  PriorityDimension,
  QuestionType,
  Seniority,
  SurveyBlock,
  SurveyQuestion,
} from "./types"

/**
 * Configuración central de la encuesta (hoja "Encuesta" del Excel).
 * El seed replica este catálogo en la base de datos.
 */

export const SURVEY_TITLE = "Encuesta de percepción de asesores comerciales sobre su liderazgo"

export const SURVEY_INTRO =
  "Esta encuesta busca conocer su percepción sobre el liderazgo, acompañamiento y apoyo que recibe en su función comercial. Las respuestas son anónimas y serán analizadas de manera agregada."

export const BLOCKS: SurveyBlock[] = [
  { id: "LEADERSHIP", name: "Liderazgo", scored: true },
  { id: "FOLLOW_UP", name: "Seguimiento", scored: true },
  { id: "CONTROL", name: "Control", scored: true },
  { id: "SUPPORT", name: "Acompañamiento", scored: true },
  { id: "ADDED_VALUE", name: "Valor agregado", scored: true },
  { id: "GLOBAL", name: "Evaluación global", scored: true },
  { id: "COMMUNICATION", name: "Calidad de la comunicación", scored: true },
  { id: "DECISIONS", name: "Calidad y agilidad en decisiones", scored: true },
  { id: "COMMERCIAL_TRAINING", name: "Formación comercial", scored: true },
  { id: "TECHNICAL_TRAINING", name: "Formación técnica", scored: true },
  { id: "METHODOLOGY", name: "Metodología comercial", scored: true },
  {
    id: "PRIORITIES",
    name: "Ranking de prioridades",
    scored: false,
    description: "Ordene de 1 a 5 qué aspecto de su líder es más importante para su éxito como asesor.",
  },
  {
    id: "OPEN",
    name: "Preguntas abiertas",
    scored: false,
    description: "Respuestas opcionales. Escriba con libertad: nadie sabrá quién respondió.",
  },
]

type Row = [id: string, text: string, shortLabel: string]

function likertBlock(block: BlockId, rows: Row[]): SurveyQuestion[] {
  return rows.map(([id, text, shortLabel]) => ({
    id,
    block,
    text,
    shortLabel,
    type: "likert" as QuestionType,
    allowComment: true,
    required: true,
    inResults: true,
  }))
}

export const QUESTIONS: SurveyQuestion[] = [
  ...likertBlock("LEADERSHIP", [
    ["L1", "Mi líder comunica con claridad las metas y prioridades comerciales.", "Claridad de metas"],
    ["L2", "Mi líder trata a todo el equipo con respeto y de forma equitativa.", "Respeto y equidad"],
    ["L3", "Mi líder me motiva a alcanzar mis metas.", "Motivación"],
    ["L4", "Puedo comunicarle a mi líder problemas o dificultades sin temor a represalias.", "Confianza sin represalias"],
    ["L5", "Mi líder toma decisiones oportunas cuando le consulto situaciones de clientes o zona.", "Decisiones oportunas"],
  ]),
  ...likertBlock("FOLLOW_UP", [
    ["S1", "El seguimiento que hace mi líder a mis resultados es constante y periódico.", "Seguimiento constante"],
    ["S2", "Las reuniones de seguimiento (semanales, mensuales, etc.) son productivas.", "Reuniones productivas"],
    ["S3", "Mi líder revisa mi cartera de clientes y me da recomendaciones concretas.", "Revisión de cartera"],
    ["S4", "Cuando no cumplo una meta, mi líder busca entender las causas antes de presionar.", "Entiende causas"],
  ]),
  ...likertBlock("CONTROL", [
    ["C1", "Entiendo claramente qué se evalúa de mi gestión (visitas, pedidos, recaudo, reportes).", "Claridad del control"],
    ["C2", "El nivel de control sobre mi trabajo es justo y proporcional.", "Control proporcional"],
    ["C3", "Los reportes y registros que debo diligenciar son útiles y no excesivos.", "Reportes útiles"],
    ["C4", "Los indicadores con los que me miden reflejan realmente mi esfuerzo y las condiciones de mi zona.", "Indicadores justos"],
  ]),
  ...likertBlock("SUPPORT", [
    ["A1", "Mi líder me acompaña en campo con la frecuencia que necesito.", "Frecuencia en campo"],
    ["A2", "En las visitas conjuntas recibo retroalimentación clara y útil.", "Retroalimentación en visitas"],
    ["A3", "Mi líder me apoya en la negociación o cierre de clientes difíciles.", "Apoyo en cierres"],
    ["A4", "Mi líder me ayuda a resolver problemas con inventario, precios, crédito, cartera o despachos.", "Resolución de problemas"],
    ["A5", "Recibo capacitación o entrenamiento que mejora mi forma de vender.", "Entrenamiento en ventas"],
  ]),
  ...likertBlock("ADDED_VALUE", [
    ["V1", "El liderazgo que recibo me ayuda a vender más.", "Ayuda a vender más"],
    ["V2", "Mi líder aporta conocimiento o experiencia que yo no tendría por mi cuenta.", "Aporta conocimiento"],
    ["V3", "Siento que su seguimiento y control me ayudan al buen desarrollo de mis actividades y gestión.", "Ayuda a mi gestión"],
    ["V4", "Mi desempeño ha mejorado gracias al acompañamiento de mi líder.", "Mejora del desempeño"],
    ["V5", "Siento que mi líder es un apoyo real para mi función y no solo un supervisor.", "Apoyo real"],
  ]),
  {
    id: "G1",
    block: "GLOBAL",
    text: "Mi nivel de satisfacción general con mi líder es…",
    shortLabel: "Satisfacción general",
    type: "satisfaction",
    allowComment: true,
    required: true,
    inResults: true,
    scaleHint: { min: "Muy insatisfecho", max: "Muy satisfecho" },
  },
  {
    id: "G2",
    block: "GLOBAL",
    text: "¿Recomendaría a su líder como jefe a un colega?",
    shortLabel: "Recomendación (NPS)",
    type: "nps",
    allowComment: true,
    required: true,
    inResults: false,
    scaleHint: { min: "Nada probable", max: "Muy probable" },
  },
  {
    id: "G3",
    block: "GLOBAL",
    text: "¿Con qué frecuencia recibe acompañamiento ya sea virtual, telefónico o campo?",
    shortLabel: "Frecuencia real",
    type: "frequency",
    allowComment: false,
    required: true,
    inResults: false,
  },
  {
    id: "G4",
    block: "GLOBAL",
    text: "¿Con qué frecuencia le gustaría recibirlo?",
    shortLabel: "Frecuencia deseada",
    type: "frequency",
    allowComment: false,
    required: true,
    inResults: false,
  },
  ...likertBlock("COMMUNICATION", [
    ["CO1", "Mi líder me informa a tiempo sobre cambios de precios, promociones, políticas y lanzamientos.", "Información oportuna"],
    ["CO2", "Las instrucciones que recibo son claras y no generan confusión ni contradicciones.", "Instrucciones claras"],
    ["CO3", "Mi líder me escucha con atención cuando le planteo una necesidad o problema.", "Escucha activa"],
    ["CO4", "Recibo respuesta a mis mensajes y consultas en un tiempo razonable.", "Tiempo de respuesta"],
    ["CO5", "Los canales de comunicación (WhatsApp, llamadas, reuniones, correo) se usan de forma ordenada y adecuada.", "Uso de canales"],
    ["CO6", "Mi líder da retroalimentación honesta, directa y respetuosa sobre mi desempeño.", "Retroalimentación honesta"],
    ["CO7", "La información que baja de la gerencia u otras áreas llega completa y sin distorsiones.", "Información sin distorsiones"],
  ]),
  ...likertBlock("DECISIONS", [
    ["D1", "Mi líder resuelve mis consultas o solicitudes en un tiempo que no afecta la venta ni al cliente.", "Resolución a tiempo"],
    ["D2", "Las decisiones que toma mi líder (descuentos, cupos de crédito, excepciones, devoluciones) son coherentes y justas.", "Decisiones coherentes"],
    ["D3", "Mi líder decide con criterio y con información suficiente, no de forma improvisada.", "Decide con criterio"],
    ["D4", "Cuando una decisión no depende de mi líder, me indica con claridad a quién acudir y hace seguimiento.", "Escalamiento claro"],
    ["D5", "Las decisiones se mantienen y no cambian de un día para otro sin explicación.", "Decisiones estables"],
    ["D6", "Me explica el porqué de sus decisiones, incluso cuando no son las que yo esperaba.", "Explica sus decisiones"],
    // Redactada en positivo: NO se invierte la puntuación.
    ["D7", "Las demoras en decisiones casi nunca me han costado ventas o clientes.", "Demoras sin costo en ventas"],
  ]),
  ...likertBlock("COMMERCIAL_TRAINING", [
    ["FC1", "Recibo capacitación comercial (técnicas de venta, negociación, manejo de objeciones) con regularidad.", "Capacitación regular"],
    ["FC2", "Los contenidos de formación comercial se relacionan con la realidad de mis clientes (almacenes, distribuidores o talleres (manejo garantías o reclamos)).","Contenidos aterrizados"],
    ["FC3", "Después de una capacitación, mi líder hace seguimiento para que lo aprendido se aplique en campo.", "Seguimiento a lo aprendido"],
    ["FC4", "Me forman en cómo abrir clientes nuevos y aumentar la compra de los actuales (mix, recompra, venta cruzada).", "Apertura y crecimiento de clientes"],
    ["FC5", "Me capacitan en manejo de cartera, cobro y cuidado del crédito del cliente.", "Cartera y cobro"],
    ["FC6", "Me capacitan en uso de herramientas (CRM, reportes, pedidos, catálogos digitales).", "Herramientas digitales"],
    ["FC7", "La formación comercial que recibo ha mejorado mis resultados.", "Impacto en resultados"],
    ["FC8", "Tengo espacios para compartir buenas prácticas con otros asesores.", "Buenas prácticas"],
  ]),
  ...likertBlock("TECHNICAL_TRAINING", [
    ["FT1", "Recibo capacitación sobre las líneas de producto (aplicaciones, referencias, equivalencias, compatibilidades).", "Líneas de producto"],
    ["FT2", "Me capacitan sobre productos nuevos antes o al momento de su lanzamiento.", "Productos nuevos"],
    ["FT3", "Tengo acceso a información técnica confiable (catálogos, fichas, cruces de referencias).", "Información técnica"],
    ["FT4", "Mi conocimiento técnico me permite asesorar al cliente con seguridad.", "Seguridad al asesorar"],
    ["FT5", "Cuando tengo una duda técnica, sé a quién acudir y recibo una respuesta correcta y a tiempo.", "Soporte técnico"],
    ["FT6", "La formación técnica es dictada por personas con conocimiento real del producto (líder, proveedores, área técnica).", "Formadores idóneos"],
    ["FT7", "La frecuencia de la formación técnica es suficiente para mantenerme actualizado.", "Frecuencia de formación"],
  ]),
  ...likertBlock("METHODOLOGY", [
    ["M1", "Conozco y entiendo la metodología comercial SORES que la empresa espera que aplique.", "Conoce la metodología"],
    ["M2", "Mi líder me explicó la metodología SORES con ejemplos prácticos y no solo en teoría.", "Explicación práctica"],
    ["M3", "Mi líder verifica en campo que estoy aplicando la metodología SORES y me corrige con respeto.", "Verificación en campo"],
    ["M4", "Mi líder me ayuda a planear mi semana (ruta, frecuencia de visita, prioridad de clientes).", "Planeación semanal"],
    ["M5", "Mi líder me ayuda a clasificar mis clientes y definir qué estrategia usar con cada uno.", "Clasificación de clientes"],
    ["M6", "Mi líder me asesora sobre cómo hacer crecer los clientes de mi cartera con plan concreto.", "Plan de crecimiento"],
    ["M7", "La metodología comercial SORES me ayuda a vender mejor y a organizar mi tiempo.", "Utilidad de la metodología"],
    ["M8", "Mi líder aplica y predica con el ejemplo la metodología SORES que exige.", "Predica con el ejemplo"],
  ]),
  {
    id: "PR1",
    block: "PRIORITIES",
    text: "Ordene de 1 a 5 qué aspecto de su líder es más importante para su éxito como asesor.",
    shortLabel: "Ranking de prioridades",
    type: "ranking",
    allowComment: false,
    required: true,
    inResults: false,
  },
  ...(
    [
      ["O1", "¿Qué es lo mejor que hace su líder y debería mantener?", "Lo mejor que hace"],
      ["O2", "¿Qué debería empezar a hacer su líder para ayudarle más?", "Qué debería empezar"],
      ["O3", "¿Qué debería dejar de hacer o hacer diferente?", "Qué debería cambiar"],
      ["O4", "¿Qué apoyo necesita de la empresa que hoy no está recibiendo?", "Apoyo de la empresa"],
    ] as Row[]
  ).map(([id, text, shortLabel]) => ({
    id,
    block: "OPEN" as BlockId,
    text,
    shortLabel,
    type: "open" as QuestionType,
    allowComment: false,
    required: false,
    inResults: false,
  })),
]

export const LIKERT_SCALE = [
  { value: 1, label: "Totalmente en desacuerdo" },
  { value: 2, label: "En desacuerdo" },
  { value: 3, label: "Ni de acuerdo ni en desacuerdo" },
  { value: 4, label: "De acuerdo" },
  { value: 5, label: "Totalmente de acuerdo" },
] as const

export const NOT_APPLICABLE_LABEL = "No aplica"

export const SENIORITY_OPTIONS: { value: Seniority; label: string }[] = [
  { value: "LESS_THAN_1_YEAR", label: "Menos de 1 año" },
  { value: "ONE_TO_THREE_YEARS", label: "1 a 5 años" },
  { value: "MORE_THAN_3_YEARS", label: "Más de 5 años" },
]

/** Valores iniciales; los niveles se pueden ajustar en /admin/configuracion. */
export const DEFAULT_FREQUENCY_OPTIONS: { id: FrequencyOptionId; label: string; level: number }[] = [
  { id: "NEVER", label: "Nunca", level: 0 },
  { id: "LESS_THAN_MONTHLY", label: "Menos de 1 vez al mes", level: 1 },
  { id: "MONTHLY", label: "1 vez al mes", level: 2 },
  { id: "BIWEEKLY", label: "Cada 15 días", level: 3 },
  { id: "WEEKLY", label: "Semanal", level: 4 },
]

/** PR1: dimensión → bloque cuyo desempeño se compara (Resumen, sección 4). */
export const PRIORITY_DIMENSIONS: {
  id: PriorityDimension
  label: string
  key: string
  block: BlockId
}[] = [
  { id: "COMMUNICATION", label: "Comunicación", key: "communication", block: "COMMUNICATION" },
  { id: "DECISIONS", label: "Decisiones ágiles", key: "decisions", block: "DECISIONS" },
  { id: "COMMERCIAL_TRAINING", label: "Formación comercial", key: "commercialTraining", block: "COMMERCIAL_TRAINING" },
  { id: "TECHNICAL_TRAINING", label: "Formación técnica", key: "technicalTraining", block: "TECHNICAL_TRAINING" },
  { id: "METHODOLOGY", label: "Acompañamiento en metodología", key: "methodology", block: "METHODOLOGY" },
]

// ---------- Utilidades de consulta ----------

const questionById = new Map(QUESTIONS.map((q) => [q.id, q]))
const blockById = new Map(BLOCKS.map((b) => [b.id, b]))

export function getQuestion(id: string): SurveyQuestion | undefined {
  return questionById.get(id)
}

export function getBlock(id: BlockId): SurveyBlock {
  const block = blockById.get(id)
  if (!block) throw new Error(`Bloque desconocido: ${id}`)
  return block
}

export function questionsOfBlock(blockId: BlockId): SurveyQuestion[] {
  return QUESTIONS.filter((q) => q.block === blockId)
}

/** Preguntas de la hoja "Resultados" (61: Likert + G1). */
export const RESULT_QUESTIONS = QUESTIONS.filter((q) => q.inResults)

/** Bloques de la sección 1 del "Resumen". */
export const SCORED_BLOCKS = BLOCKS.filter((b) => b.scored)

export const COMMENTABLE_QUESTIONS = QUESTIONS.filter((q) => q.allowComment)

export const OPEN_QUESTIONS = QUESTIONS.filter((q) => q.type === "open")

export function seniorityLabel(value: Seniority): string {
  return SENIORITY_OPTIONS.find((o) => o.value === value)?.label ?? value
}
