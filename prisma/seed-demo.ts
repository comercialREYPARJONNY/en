/**
 * Datos DEMO para desarrollo: genera respuestas ficticias. No ejecutar en producción.
 * Uso: npm run db:seed:demo -- 19   (número de respuestas, por defecto 19)
 */
import { randomUUID } from "node:crypto"
import { PRIORITY_DIMENSIONS, QUESTIONS, SENIORITY_OPTIONS } from "../src/lib/survey/questions"
import { createCliClient } from "./client"

const prisma = createCliClient()

if (process.env.NODE_ENV === "production") {
  console.error("seed-demo no se ejecuta con NODE_ENV=production.")
  process.exit(1)
}

const SAMPLE_COMMENTS = [
  "A veces responde después de varias horas.",
  "Por WhatsApp suele ser rápido.",
  "Los fines de semana se demora.",
  "Me gustaría más acompañamiento en clientes grandes.",
  "Muy buena disposición, pero falta tiempo en campo.",
  "Las capacitaciones son muy teóricas.",
]
const SAMPLE_OPEN = [
  "Escucha y da buenas ideas para los clientes difíciles.",
  "Salir más a campo conmigo.",
  "Cambiar las prioridades a mitad de semana.",
  "Catálogos técnicos actualizados y respuesta rápida en crédito.",
]

const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)]
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

async function main() {
  const count = Number(process.argv[2] ?? 19)
  const survey = await prisma.survey.findFirstOrThrow({ orderBy: { createdAt: "asc" } })
  const leaders = await prisma.leader.findMany({ where: { active: true } })
  const frequencies = await prisma.frequencyOption.findMany({ orderBy: { sortOrder: "asc" } })

  for (let i = 0; i < count; i++) {
    const leader = leaders[i % leaders.length]
    const bias = leaders.indexOf(leader) === 0 ? 0.6 : -0.2
    const id = randomUUID()
    const completedAt = new Date(Date.now() - Math.floor(Math.random() * 20) * 86_400_000)
    const answers = QUESTIONS.filter((q) => q.type !== "ranking").map((q) => {
      const base = { questionId: q.id }
      switch (q.type) {
        case "likert":
        case "satisfaction": {
          if (Math.random() < 0.05) return { ...base, isNotApplicable: true }
          const value = clamp(Math.round(3.4 + bias + (Math.random() * 2.4 - 1.2)), 1, 5)
          const comment = Math.random() < 0.12 ? pick(SAMPLE_COMMENTS) : null
          return { ...base, numericValue: value, comment }
        }
        case "nps":
          return { ...base, numericValue: clamp(Math.round(7 + bias * 2 + (Math.random() * 5 - 2.5)), 0, 10) }
        case "frequency": {
          const real = Math.floor(Math.random() * 4)
          const level = q.id === "G3" ? real : clamp(real + Math.floor(Math.random() * 3), 0, 4)
          return { ...base, optionValue: frequencies[level].id }
        }
        case "open":
          return { ...base, textValue: Math.random() < 0.6 ? pick(SAMPLE_OPEN) : null }
        default:
          return base
      }
    })
    const order = [...PRIORITY_DIMENSIONS].sort(() => Math.random() - 0.5)

    await prisma.surveyResponse.create({
      data: {
        id,
        surveyId: survey.id,
        leaderId: leader.id,
        seniority: pick(SENIORITY_OPTIONS).value,
        startedAt: new Date(completedAt.getTime() - 12 * 60_000),
        completedAt,
        answers: { create: answers },
        priorities: { create: order.map((d, index) => ({ dimension: d.id, rank: index + 1 })) },
      },
    })
  }
  console.log(`${count} respuestas demo creadas.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
