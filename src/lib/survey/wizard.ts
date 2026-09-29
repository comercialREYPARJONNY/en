import { BLOCKS, PRIORITY_DIMENSIONS, QUESTIONS, questionsOfBlock } from "./questions"
import type { AnswerInput, SubmissionInput } from "./submission-schema"
import type { PriorityDimension, Seniority, SurveyQuestion } from "./types"

export type WizardStep =
  | { id: "classification"; kind: "classification"; title: string; description: string }
  | { id: string; kind: "questions" | "ranking" | "open"; title: string; description?: string; questions: SurveyQuestion[] }

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: "classification",
    kind: "classification",
    title: "Sobre usted",
    description: "Solo usamos estos dos datos para agrupar los resultados. No pedimos su nombre.",
  },
  ...BLOCKS.map((block) => ({
    id: block.id,
    kind: (block.id === "PRIORITIES" ? "ranking" : block.id === "OPEN" ? "open" : "questions") as
      | "questions"
      | "ranking"
      | "open",
    title: block.name,
    description: block.description,
    questions: questionsOfBlock(block.id),
  })),
]

export type SurveyDraft = {
  responseId: string
  startedAt: string
  step: number
  leaderId?: string
  seniority?: Seniority
  answers: Record<string, AnswerInput>
  rankingOrder: PriorityDimension[]
  rankingConfirmed: boolean
}

export function createDraft(): SurveyDraft {
  return {
    responseId: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    step: 0,
    answers: {},
    rankingOrder: PRIORITY_DIMENSIONS.map((d) => d.id),
    rankingConfirmed: false,
  }
}

function isAnswered(question: SurveyQuestion, answer: AnswerInput | undefined, draft: SurveyDraft): boolean {
  switch (question.type) {
    case "likert":
    case "satisfaction":
    case "nps":
      return answer?.value !== undefined
    case "frequency":
      return Boolean(answer?.option)
    case "ranking":
      return draft.rankingConfirmed
    case "open":
      return Boolean(answer?.text?.trim())
  }
}

/** Errores del paso actual (clave = código de pregunta o campo). Vacío = puede continuar. */
export function validateStep(step: WizardStep, draft: SurveyDraft): Record<string, string> {
  const errors: Record<string, string> = {}
  if (step.kind === "classification") {
    if (!draft.leaderId) errors.leaderId = "Seleccione su líder directo."
    if (!draft.seniority) errors.seniority = "Seleccione su antigüedad."
    return errors
  }
  for (const question of step.questions) {
    if (!question.required || isAnswered(question, draft.answers[question.id], draft)) continue
    errors[question.id] =
      question.type === "ranking"
        ? "Ordene los aspectos (arrastrando o con las flechas) o confirme el orden actual."
        : question.type === "frequency"
          ? "Seleccione una opción."
          : question.type === "nps"
            ? "Seleccione un valor de 0 a 10."
            : "Seleccione una opción. Si no aplica a su caso, elija N/A."
  }
  return errors
}

const REQUIRED_ITEMS = 2 + QUESTIONS.filter((q) => q.required).length

/** % de avance según preguntas obligatorias respondidas (incluye clasificación). */
export function completionPercent(draft: SurveyDraft): number {
  const answered =
    (draft.leaderId ? 1 : 0) +
    (draft.seniority ? 1 : 0) +
    QUESTIONS.filter((q) => q.required && isAnswered(q, draft.answers[q.id], draft)).length
  return Math.round((answered / REQUIRED_ITEMS) * 100)
}

export function toSubmission(draft: SurveyDraft, surveyId: string): SubmissionInput {
  return {
    responseId: draft.responseId,
    surveyId,
    leaderId: draft.leaderId ?? "",
    seniority: draft.seniority as Seniority,
    startedAt: draft.startedAt,
    answers: draft.answers,
    ranking: Object.fromEntries(draft.rankingOrder.map((dimension, index) => [dimension, index + 1])) as Record<
      PriorityDimension,
      number
    >,
  }
}
