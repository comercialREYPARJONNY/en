import type { AnalyticsResponse, AnalyticsSettings, FrequencyLevel } from "../types"

export const settings: AnalyticsSettings = {
  strengthThreshold: 4,
  improveThreshold: 3,
  alertThreshold: 3.5,
  favorableMin: 4,
  frequencyGapThreshold: 0.5,
  minResponsesForSegment: 3,
}

export const frequencyOptions: FrequencyLevel[] = [
  { id: "NEVER", label: "Nunca", level: 0 },
  { id: "LESS_THAN_MONTHLY", label: "Menos de 1 vez al mes", level: 1 },
  { id: "MONTHLY", label: "1 vez al mes", level: 2 },
  { id: "BIWEEKLY", label: "Cada 15 días", level: 3 },
  { id: "WEEKLY", label: "Semanal", level: 4 },
]

let seq = 0
export function response(partial: Partial<AnalyticsResponse> = {}): AnalyticsResponse {
  seq += 1
  return {
    id: `r${seq}`,
    leaderId: "A",
    seniority: "ONE_TO_THREE_YEARS",
    completedAt: new Date("2026-09-01T12:00:00Z"),
    scores: {},
    options: {},
    ranking: {},
    comments: {},
    texts: {},
    ...partial,
  }
}
