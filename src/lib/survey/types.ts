export type QuestionType =
  | "likert"
  | "satisfaction"
  | "nps"
  | "frequency"
  | "ranking"
  | "open"

export type BlockId =
  | "LEADERSHIP"
  | "FOLLOW_UP"
  | "CONTROL"
  | "SUPPORT"
  | "ADDED_VALUE"
  | "GLOBAL"
  | "COMMUNICATION"
  | "DECISIONS"
  | "COMMERCIAL_TRAINING"
  | "TECHNICAL_TRAINING"
  | "METHODOLOGY"
  | "PRIORITIES"
  | "OPEN"

export type SurveyBlock = {
  id: BlockId
  name: string
  /** Participa en resultados por bloque y en el promedio general 1–5. */
  scored: boolean
  description?: string
}

export type SurveyQuestion = {
  /** Código usado en análisis, cálculo y exportación. No cambiar. */
  id: string
  block: BlockId
  text: string
  /** Etiqueta corta para listados (p. ej. vista de comentarios). */
  shortLabel: string
  type: QuestionType
  allowComment: boolean
  required: boolean
  /** Entra en la hoja "Resultados" (preguntas 1–5: Likert + G1). */
  inResults: boolean
  scaleHint?: { min: string; max: string }
}

export type Seniority = "LESS_THAN_1_YEAR" | "ONE_TO_THREE_YEARS" | "MORE_THAN_3_YEARS"

export type PriorityDimension =
  | "COMMUNICATION"
  | "DECISIONS"
  | "COMMERCIAL_TRAINING"
  | "TECHNICAL_TRAINING"
  | "METHODOLOGY"

export type FrequencyOptionId =
  | "NEVER"
  | "LESS_THAN_MONTHLY"
  | "MONTHLY"
  | "BIWEEKLY"
  | "WEEKLY"
