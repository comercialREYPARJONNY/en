import { z } from "zod"
import { PRIORITY_DIMENSIONS, QUESTIONS } from "./questions"
import type { PriorityDimension } from "./types"

export const COMMENT_MAX_LENGTH = 1000
export const OPEN_ANSWER_MAX_LENGTH = 2000

const optionalText = (max: number) =>
  z
    .string()
    .max(max, `Máximo ${max} caracteres`)
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : undefined))

const answerSchema = z.object({
  /** Escala: 1–5, "NA" (No aplica) o 0–10 para G2. */
  value: z.union([z.number().int(), z.literal("NA")]).optional(),
  option: z.string().max(64).optional(),
  text: optionalText(OPEN_ANSWER_MAX_LENGTH),
  comment: optionalText(COMMENT_MAX_LENGTH),
})

export type AnswerInput = z.input<typeof answerSchema>

const dimensionIds = PRIORITY_DIMENSIONS.map((d) => d.id) as [PriorityDimension, ...PriorityDimension[]]

export const submissionSchema = z
  .object({
    responseId: z.uuid(),
    surveyId: z.string().min(1).max(64),
    leaderId: z.string().min(1, "Seleccione su líder directo").max(64),
    seniority: z.enum(["LESS_THAN_1_YEAR", "ONE_TO_THREE_YEARS", "MORE_THAN_3_YEARS"], {
      error: "Seleccione su antigüedad",
    }),
    startedAt: z.iso.datetime().optional(),
    answers: z.record(z.string(), answerSchema),
    ranking: z.record(z.enum(dimensionIds), z.number().int()),
  })
  .superRefine((data, ctx) => {
    const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: "custom", path, message })

    for (const key of Object.keys(data.answers)) {
      if (!QUESTIONS.some((q) => q.id === key)) issue(["answers", key], "Pregunta desconocida")
    }

    for (const q of QUESTIONS) {
      const answer = data.answers[q.id]
      const path = ["answers", q.id]
      if (answer?.comment && !q.allowComment) issue(path, "Esta pregunta no admite comentarios")

      switch (q.type) {
        case "likert":
        case "satisfaction": {
          const v = answer?.value
          if (v === undefined) issue(path, "Seleccione una opción (puede elegir N/A)")
          else if (v !== "NA" && (v < 1 || v > 5)) issue(path, "La nota debe estar entre 1 y 5")
          break
        }
        case "nps": {
          const v = answer?.value
          if (v === undefined || v === "NA") issue(path, "Seleccione un valor de 0 a 10")
          else if (v < 0 || v > 10) issue(path, "El valor debe estar entre 0 y 10")
          break
        }
        case "frequency":
          if (!answer?.option) issue(path, "Seleccione una frecuencia")
          break
        case "ranking": {
          const ranks = dimensionIds.map((d) => data.ranking[d])
          if (ranks.some((r) => r === undefined)) issue(["ranking"], "Ordene todos los aspectos")
          else if (ranks.some((r) => r < 1 || r > dimensionIds.length))
            issue(["ranking"], `Las posiciones deben estar entre 1 y ${dimensionIds.length}`)
          else if (new Set(ranks).size !== ranks.length) issue(["ranking"], "No se permiten posiciones repetidas")
          break
        }
        case "open":
          break
      }
    }
  })

export type SubmissionInput = z.input<typeof submissionSchema>
export type Submission = z.output<typeof submissionSchema>
