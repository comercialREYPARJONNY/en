import "server-only"
import { prisma } from "./prisma"

export type LeaderRow = { id: string; name: string; active: boolean; responses: number }

export async function getLeaders(): Promise<LeaderRow[]> {
  const rows = await prisma.leader.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { responses: true } } },
  })
  return rows.map((l) => ({ id: l.id, name: l.name, active: l.active, responses: l._count.responses }))
}

export async function getActiveLeaders(): Promise<{ id: string; name: string }[]> {
  return prisma.leader.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  })
}
