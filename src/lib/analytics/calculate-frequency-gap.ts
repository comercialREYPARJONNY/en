import { calculateAverage } from "./calculate-average"
import type {
  AnalyticsResponse,
  FrequencyDistributionRow,
  FrequencyGapResult,
  FrequencyLevel,
  FrequencyReading,
} from "./types"

export const REAL_FREQUENCY_QUESTION = "G3"
export const DESIRED_FREQUENCY_QUESTION = "G4"

/** Tabla "Frecuencia | Real G3 | Deseado G4". */
export function calculateFrequencyDistribution(
  responses: ReadonlyArray<AnalyticsResponse>,
  options: ReadonlyArray<FrequencyLevel>,
): FrequencyDistributionRow[] {
  return options.map((option) => ({
    option,
    real: responses.filter((r) => r.options[REAL_FREQUENCY_QUESTION] === option.id).length,
    desired: responses.filter((r) => r.options[DESIRED_FREQUENCY_QUESTION] === option.id).length,
  }))
}

export function interpretFrequencyGap(gap: number | null, threshold: number): FrequencyReading | null {
  if (gap === null) return null
  if (gap > threshold) return "Falta acompañamiento"
  if (gap < -threshold) return "Sobra acompañamiento"
  return "Ajustado"
}

/** brecha = nivel deseado promedio − nivel real promedio. */
export function calculateFrequencyGap(
  responses: ReadonlyArray<AnalyticsResponse>,
  options: ReadonlyArray<FrequencyLevel>,
  threshold: number,
): FrequencyGapResult {
  const levelOf = new Map(options.map((o) => [o.id, o.level]))
  const levels = (questionId: string) =>
    responses.map((r) => {
      const option = r.options[questionId]
      return option ? (levelOf.get(option) ?? null) : null
    })

  const realAverage = calculateAverage(levels(REAL_FREQUENCY_QUESTION))
  const desiredAverage = calculateAverage(levels(DESIRED_FREQUENCY_QUESTION))
  const gap = realAverage === null || desiredAverage === null ? null : desiredAverage - realAverage
  return { realAverage, desiredAverage, gap, reading: interpretFrequencyGap(gap, threshold) }
}
