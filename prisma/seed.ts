/**
 * Seed de producción: encuesta, líderes, bloques, preguntas, frecuencias, configuración y
 * administrador inicial. NO crea respuestas (para datos de prueba use `npm run db:seed:demo`).
 * Es idempotente: se puede ejecutar varias veces.
 */
import bcrypt from "bcryptjs"
import { BLOCKS, DEFAULT_FREQUENCY_OPTIONS, QUESTIONS, SURVEY_TITLE, SURVEY_INTRO } from "../src/lib/survey/questions"
import type { QuestionType } from "../src/lib/survey/types"
import { createCliClient } from "./client"

const prisma = createCliClient()

const QUESTION_TYPE: Record<QuestionType, "LIKERT" | "SATISFACTION" | "NPS" | "FREQUENCY" | "RANKING" | "OPEN"> = {
  likert: "LIKERT",
  satisfaction: "SATISFACTION",
  nps: "NPS",
  frequency: "FREQUENCY",
  ranking: "RANKING",
  open: "OPEN",
}

async function main() {
  // Encuesta
  const existingSurvey = await prisma.survey.findFirst({ orderBy: { createdAt: "asc" } })
  const survey =
    existingSurvey ??
    (await prisma.survey.create({ data: { name: SURVEY_TITLE, description: SURVEY_INTRO, active: true } }))

  // Líderes iniciales (solo si no hay ninguno configurado)
  if ((await prisma.leader.count()) === 0) {
    await prisma.leader.createMany({
      data: [
        { name: "Paul Salazar", sortOrder: 1 },
        { name: "Diana Correa", sortOrder: 2 },
      ],
    })
  }

  // Catálogo de bloques y preguntas (se sincroniza con src/lib/survey/questions.ts)
  for (const [index, block] of BLOCKS.entries()) {
    await prisma.surveyBlock.upsert({
      where: { id: block.id },
      update: { name: block.name, sortOrder: index + 1, scored: block.scored },
      create: { id: block.id, name: block.name, sortOrder: index + 1, scored: block.scored },
    })
  }
  for (const [index, q] of QUESTIONS.entries()) {
    const data = {
      blockId: q.block,
      text: q.text,
      shortLabel: q.shortLabel,
      type: QUESTION_TYPE[q.type],
      allowComment: q.allowComment,
      required: q.required,
      inResults: q.inResults,
      sortOrder: index + 1,
    }
    await prisma.question.upsert({ where: { id: q.id }, update: data, create: { id: q.id, ...data } })
  }

  // Opciones de frecuencia (se respetan niveles ya editados por el administrador)
  for (const [index, option] of DEFAULT_FREQUENCY_OPTIONS.entries()) {
    await prisma.frequencyOption.upsert({
      where: { id: option.id },
      update: { label: option.label, sortOrder: index + 1 },
      create: { id: option.id, label: option.label, level: option.level, sortOrder: index + 1 },
    })
  }

  // Configuración predeterminada (fila única)
  await prisma.appSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } })

  // Administrador inicial
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  if (email && password) {
    const exists = await prisma.adminUser.findUnique({ where: { email } })
    if (!exists) {
      await prisma.adminUser.create({
        data: { email, name: "Administrador", passwordHash: await bcrypt.hash(password, 12) },
      })
      console.log(`Administrador creado: ${email}`)
    }
  } else {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD no definidos: no se creó administrador.")
  }

  console.log(`Seed completo. Encuesta: ${survey.id} · ${QUESTIONS.length} preguntas · ${BLOCKS.length} bloques`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
