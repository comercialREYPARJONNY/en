import { describe, expect, it } from "vitest"
import { QUESTIONS } from "../questions"
import { submissionSchema } from "../submission-schema"
import { completionPercent, createDraft, toSubmission, validateStep, WIZARD_STEPS, type SurveyDraft } from "../wizard"

function completeDraft(): SurveyDraft {
  const draft = createDraft()
  draft.leaderId = "leader-1"
  draft.seniority = "ONE_TO_THREE_YEARS"
  draft.rankingConfirmed = true
  for (const q of QUESTIONS) {
    if (q.type === "likert" || q.type === "satisfaction") draft.answers[q.id] = { value: 4 }
    if (q.type === "nps") draft.answers[q.id] = { value: 9 }
    if (q.type === "frequency") draft.answers[q.id] = { option: "MONTHLY" }
  }
  return draft
}

describe("wizard de la encuesta", () => {
  it("tiene clasificación + 11 bloques + prioridades + abiertas", () => {
    expect(WIZARD_STEPS).toHaveLength(14)
    expect(WIZARD_STEPS[1].title).toBe("Liderazgo")
  })

  it("exige selección en escalas pero acepta N/A", () => {
    const draft = createDraft()
    const leadership = WIZARD_STEPS[1]
    expect(Object.keys(validateStep(leadership, draft))).toEqual(["L1", "L2", "L3", "L4", "L5"])
    for (const code of ["L1", "L2", "L3", "L4"]) draft.answers[code] = { value: 5 }
    draft.answers.L5 = { value: "NA" }
    expect(validateStep(leadership, draft)).toEqual({})
  })

  it("las preguntas abiertas son opcionales", () => {
    const open = WIZARD_STEPS.at(-1)!
    expect(validateStep(open, createDraft())).toEqual({})
  })

  it("el ranking requiere confirmación", () => {
    const ranking = WIZARD_STEPS.find((s) => s.kind === "ranking")!
    expect(validateStep(ranking, createDraft())).toHaveProperty("PR1")
  })

  it("un borrador completo produce un envío válido", () => {
    const draft = completeDraft()
    expect(completionPercent(draft)).toBe(100)
    const parsed = submissionSchema.safeParse(toSubmission(draft, "survey-1"))
    expect(parsed.success).toBe(true)
  })
})

describe("validación de envío", () => {
  const valid = () => toSubmission(completeDraft(), "survey-1")

  it("rechaza notas fuera de rango", () => {
    const input = valid()
    input.answers.L1 = { value: 6 }
    expect(submissionSchema.safeParse(input).success).toBe(false)
  })

  it("G2 solo acepta 0–10 y no admite N/A", () => {
    const input = valid()
    input.answers.G2 = { value: 11 }
    expect(submissionSchema.safeParse(input).success).toBe(false)
    input.answers.G2 = { value: "NA" }
    expect(submissionSchema.safeParse(input).success).toBe(false)
    input.answers.G2 = { value: 0 }
    expect(submissionSchema.safeParse(input).success).toBe(true)
  })

  it("PR1 no admite posiciones repetidas", () => {
    const input = valid()
    input.ranking = { ...input.ranking, COMMUNICATION: 1, DECISIONS: 1 }
    const result = submissionSchema.safeParse(input)
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe("No se permiten posiciones repetidas")
  })

  it("exige líder, antigüedad y UUID válido", () => {
    expect(submissionSchema.safeParse({ ...valid(), leaderId: "" }).success).toBe(false)
    expect(submissionSchema.safeParse({ ...valid(), seniority: "X" }).success).toBe(false)
    expect(submissionSchema.safeParse({ ...valid(), responseId: "abc" }).success).toBe(false)
  })

  it("comentarios y abiertas vacíos son válidos y se normalizan", () => {
    const input = valid()
    input.answers.L1 = { value: 3, comment: "   " }
    input.answers.O1 = { text: "" }
    const result = submissionSchema.safeParse(input)
    expect(result.success).toBe(true)
    expect(result.data?.answers.L1.comment).toBeUndefined()
  })

  it("rechaza comentarios en preguntas que no los admiten", () => {
    const input = valid()
    input.answers.G3 = { option: "MONTHLY", comment: "hola" }
    expect(submissionSchema.safeParse(input).success).toBe(false)
  })
})
