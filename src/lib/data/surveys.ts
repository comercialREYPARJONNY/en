import "server-only"
import { prisma } from "./prisma"

/** La aplicación trabaja sobre una encuesta principal (la primera creada por el seed). */
export async function getPrimarySurvey() {
  return prisma.survey.findFirst({ orderBy: { createdAt: "asc" } })
}

export async function getSurvey(id: string) {
  return prisma.survey.findUnique({ where: { id } })
}
