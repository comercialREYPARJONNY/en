import type { TrafficLight } from "@/lib/analytics/types"

/** Paleta categórica validada (orden fijo). El color sigue al líder, nunca a su posición. */
export const CATEGORICAL = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"]

/** Asigna color por orden de configuración del líder (estable ante filtros). */
export function leaderColor(allLeaderIds: string[], leaderId: string): string {
  const index = allLeaderIds.indexOf(leaderId)
  return CATEGORICAL[(index < 0 ? 0 : index) % CATEGORICAL.length]
}

export const TOTAL_COLOR = "#475467"

export const STATUS_COLOR: Record<TrafficLight, string> = {
  STRENGTH: "#1f9254",
  IMPROVE: "#d99a06",
  CRITICAL: "#d6453d",
}

export const NPS_COLORS = { detractors: "#d6453d", passives: "#b6bcc6", promoters: "#1f9254" }

export const AXIS = { stroke: "#98a2b3", fontSize: 12, tickLine: false as const, axisLine: false as const }
export const GRID = "#eaecf0"
