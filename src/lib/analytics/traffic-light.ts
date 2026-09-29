import type { AnalyticsSettings, TrafficLight } from "./types"

export const TRAFFIC_LIGHT_LABEL: Record<TrafficLight, string> = {
  STRENGTH: "Fortaleza",
  IMPROVE: "A mejorar",
  CRITICAL: "Crítico",
}

/** promedio ≥ fortaleza → Fortaleza; ≥ aMejorar → A mejorar; resto → Crítico. */
export function classifyTrafficLight(
  average: number | null,
  thresholds: Pick<AnalyticsSettings, "strengthThreshold" | "improveThreshold">,
): TrafficLight | null {
  if (average === null) return null
  if (average >= thresholds.strengthThreshold) return "STRENGTH"
  if (average >= thresholds.improveThreshold) return "IMPROVE"
  return "CRITICAL"
}
