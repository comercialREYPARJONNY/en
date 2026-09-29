import "server-only"
import type { AnalyticsSettings, FrequencyLevel } from "@/lib/analytics/types"
import { prisma } from "./prisma"

export async function getSettings(): Promise<AnalyticsSettings> {
  const row = await prisma.appSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } })
  return {
    strengthThreshold: row.strengthThreshold,
    improveThreshold: row.improveThreshold,
    alertThreshold: row.alertThreshold,
    favorableMin: row.favorableMin,
    frequencyGapThreshold: row.frequencyGapThreshold,
    minResponsesForSegment: row.minResponsesForSegment,
  }
}

export async function getFrequencyOptions(): Promise<FrequencyLevel[]> {
  const rows = await prisma.frequencyOption.findMany({ orderBy: { sortOrder: "asc" } })
  return rows.map(({ id, label, level }) => ({ id, label, level }))
}
