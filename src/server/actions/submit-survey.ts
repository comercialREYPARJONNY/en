"use server"

import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/data/prisma"
import { getQuestion, PRIORITY_DIMENSIONS } from "@/lib/survey/questions"
import { submissionSchema } from "@/lib/survey/submission-schema"

export type SubmitResult = { ok: true } | { ok: false; error: string }

/**
 * Guarda una encuesta completa en una sola transacción.
 * - Idempotente: el UUID lo genera el cliente al iniciar; un reenvío (doble clic, reintento de red)
 *   no duplica ni modifica la respuesta ya guardada.
 * - Una respuesta completada nunca se actualiza.
 * - No se guarda IP, user-agent ni ningún dato del participante.
 */
export async function submitSurvey(input: unknown): Promise<SubmitResult> {
  const parsed = submissionSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Revise sus respuestas." }
  }
  const data = parsed.data

  const [survey, leader, frequencyOptions] = await Promise.all([
    prisma.survey.findUnique({ where: { id: data.surveyId } }),
    prisma.leader.findUnique({ where: { id: data.leaderId } }),
    prisma.frequencyOption.findMany({ select: { id: true } }),
  ])
  if (!survey) return { ok: false, error: "La encuesta no existe." }
  if (!survey.active) return { ok: false, error: "La encuesta está cerrada y no recibe más respuestas." }
  if (!leader || !leader.active) return { ok: false, error: "El líder seleccionado no es válido." }

  const validOptions = new Set(frequencyOptions.map((o) => o.id))
  for (const [code, answer] of Object.entries(data.answers)) {
    if (getQuestion(code)?.type === "frequency" && !validOptions.has(answer.option ?? "")) {
      return { ok: false, error: `Opción de frecuencia inválida en ${code}.` }
    }
  }

  const now = new Date()
  const startedAt = data.startedAt ? new Date(data.startedAt) : now
  const answers: Prisma.SurveyAnswerCreateManyInput[] = Object.entries(data.answers).flatMap(([code, answer]) => {
    const question = getQuestion(code)!
    const row: Prisma.SurveyAnswerCreateManyInput = {
      responseId: data.responseId,
      questionId: code,
      numericValue: typeof answer.value === "number" ? answer.value : null,
      isNotApplicable: answer.value === "NA",
      optionValue: question.type === "frequency" ? (answer.option ?? null) : null,
      textValue: question.type === "open" ? (answer.text ?? null) : null,
      comment: question.allowComment ? (answer.comment ?? null) : null,
    }
    // Las preguntas abiertas vacías no generan fila.
    return question.type === "open" && !row.textValue ? [] : [row]
  })

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.surveyResponse.findUnique({ where: { id: data.responseId }, select: { id: true } })
      if (existing) return // Ya guardada: no se edita.

      await tx.surveyResponse.create({
        data: {
          id: data.responseId,
          surveyId: survey.id,
          leaderId: leader.id,
          seniority: data.seniority,
          startedAt: startedAt > now ? now : startedAt,
          completedAt: now,
        },
      })
      await tx.surveyAnswer.createMany({ data: answers })
      await tx.priorityRank.createMany({
        data: PRIORITY_DIMENSIONS.map((d) => ({
          responseId: data.responseId,
          dimension: d.id,
          rank: data.ranking[d.id],
        })),
      })
    })
    return { ok: true }
  } catch (error) {
    // Dos envíos simultáneos con el mismo UUID: el segundo choca con la llave primaria.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { ok: true }
    console.error("submitSurvey", error)
    return { ok: false, error: "No pudimos guardar su respuesta. Intente de nuevo en unos segundos." }
  }
}
