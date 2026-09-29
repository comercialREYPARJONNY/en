import type { BlockId, PriorityDimension, Seniority, SurveyBlock, SurveyQuestion } from "@/lib/survey/types"

/** Respuesta ya normalizada para análisis. No contiene datos personales. */
export type AnalyticsResponse = {
  id: string
  leaderId: string
  seniority: Seniority
  completedAt: Date
  /** Notas numéricas por código de pregunta. `null` = N/A o vacío. */
  scores: Record<string, number | null>
  /** Opciones seleccionadas (G3, G4) por código de pregunta. */
  options: Record<string, string | null>
  /** PR1: posición por dimensión (1 = más importante). */
  ranking: Partial<Record<PriorityDimension, number>>
  /** Comentarios por código de pregunta. */
  comments: Record<string, string>
  /** Respuestas abiertas (O1–O4). */
  texts: Record<string, string>
}

export type AnalyticsSettings = {
  strengthThreshold: number
  improveThreshold: number
  alertThreshold: number
  favorableMin: number
  frequencyGapThreshold: number
  minResponsesForSegment: number
}

export type LeaderRef = { id: string; name: string }

export type FrequencyLevel = { id: string; label: string; level: number }

export type TrafficLight = "STRENGTH" | "IMPROVE" | "CRITICAL"

export type Metric = {
  n: number
  average: number | null
  /** 0–100 */
  favorability: number | null
  trafficLight: TrafficLight | null
}

export type QuestionResult = Metric & {
  question: SurveyQuestion
  blockName: string
  byLeader: Record<string, Metric>
  /** Dos líderes: A − B (como el Excel). Más de dos: máx − mín. */
  leaderDifference: number | null
}

export type BlockResult = {
  block: SurveyBlock
  questionCount: number
  average: number | null
  favorability: number | null
  trafficLight: TrafficLight | null
  byLeader: Record<string, Omit<Metric, "n">>
  leaderDifference: number | null
}

export type NpsResult = {
  n: number
  average: number | null
  promoters: number | null
  passives: number | null
  detractors: number | null
  nps: number | null
}

export type FrequencyReading = "Falta acompañamiento" | "Sobra acompañamiento" | "Ajustado"

export type FrequencyGapResult = {
  realAverage: number | null
  desiredAverage: number | null
  gap: number | null
  reading: FrequencyReading | null
}

export type FrequencyDistributionRow = {
  option: FrequencyLevel
  real: number
  desired: number
}

export type PriorityReading = "Invertir primero" | "Mantener" | "Mejorar después" | "Sin urgencia"

export type PriorityRow = {
  dimension: PriorityDimension
  label: string
  blockId: BlockId
  blockName: string
  averageRank: number | null
  position: number | null
  performance: number | null
  reading: PriorityReading | null
}

export type AlertStatus = "ALERT" | "OK" | "NO_DATA"

export type CrossAlert = {
  id: "TECHNICAL_SUPPORT" | "LOST_SALES" | "METHODOLOGY"
  title: string
  indicators: { label: string; value: number | null }[]
  status: AlertStatus
  message: string
}
