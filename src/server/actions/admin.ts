"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { Prisma } from "@/generated/prisma/client"
import { requireAdmin } from "@/lib/auth-guard"
import { settingsSchema } from "@/lib/admin/settings-schema"
import { prisma } from "@/lib/data/prisma"

export type ActionResult = { ok: true } | { ok: false; error: string }

function refresh() {
  revalidatePath("/admin", "layout")
  revalidatePath("/encuesta", "layout")
}

function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Datos inválidos."
}

// ---------- Parámetros ----------

export async function updateSettings(input: z.input<typeof settingsSchema>): Promise<ActionResult> {
  await requireAdmin()
  const parsed = settingsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) }
  await prisma.appSettings.upsert({ where: { id: 1 }, update: parsed.data, create: { id: 1, ...parsed.data } })
  refresh()
  return { ok: true }
}

const frequencySchema = z.array(z.object({ id: z.string().min(1), level: z.number().int().min(0).max(10) })).min(1)

export async function updateFrequencyLevels(input: z.input<typeof frequencySchema>): Promise<ActionResult> {
  await requireAdmin()
  const parsed = frequencySchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) }
  await prisma.$transaction(
    parsed.data.map(({ id, level }) => prisma.frequencyOption.update({ where: { id }, data: { level } })),
  )
  refresh()
  return { ok: true }
}

// ---------- Líderes ----------

const leaderName = z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres.").max(80)

function uniqueNameError(error: unknown): ActionResult | null {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return { ok: false, error: "Ya existe un líder con ese nombre." }
  }
  return null
}

export async function createLeader(name: string): Promise<ActionResult> {
  await requireAdmin()
  const parsed = leaderName.safeParse(name)
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) }
  try {
    const last = await prisma.leader.aggregate({ _max: { sortOrder: true } })
    await prisma.leader.create({ data: { name: parsed.data, sortOrder: (last._max.sortOrder ?? 0) + 1 } })
  } catch (error) {
    const known = uniqueNameError(error)
    if (known) return known
    throw error
  }
  refresh()
  return { ok: true }
}

export async function renameLeader(id: string, name: string): Promise<ActionResult> {
  await requireAdmin()
  const parsed = leaderName.safeParse(name)
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) }
  try {
    await prisma.leader.update({ where: { id }, data: { name: parsed.data } })
  } catch (error) {
    const known = uniqueNameError(error)
    if (known) return known
    throw error
  }
  refresh()
  return { ok: true }
}

/** Los líderes no se borran (tienen respuestas asociadas): se desactivan. */
export async function setLeaderActive(id: string, active: boolean): Promise<ActionResult> {
  await requireAdmin()
  if (!active) {
    const remaining = await prisma.leader.count({ where: { active: true, NOT: { id } } })
    if (remaining === 0) return { ok: false, error: "Debe quedar al menos un líder activo." }
  }
  await prisma.leader.update({ where: { id }, data: { active } })
  refresh()
  return { ok: true }
}

// ---------- Encuesta ----------

export async function setSurveyActive(id: string, active: boolean): Promise<ActionResult> {
  await requireAdmin()
  await prisma.survey.update({ where: { id }, data: { active } })
  refresh()
  return { ok: true }
}
