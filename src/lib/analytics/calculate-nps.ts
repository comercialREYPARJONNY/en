import { calculateAverage, validScores } from "./calculate-average"
import type { NpsResult } from "./types"

/** Promotores 9–10, pasivos 7–8, detractores 0–6. NPS = %promotores − %detractores. */
export function calculateNps(values: ReadonlyArray<number | null | undefined>): NpsResult {
  const valid = validScores(values).filter((v) => v >= 0 && v <= 10)
  const n = valid.length
  if (n === 0) {
    return { n: 0, average: null, promoters: null, passives: null, detractors: null, nps: null }
  }
  const pct = (count: number) => (count / n) * 100
  const promoters = pct(valid.filter((v) => v >= 9).length)
  const passives = pct(valid.filter((v) => v >= 7 && v <= 8).length)
  const detractors = pct(valid.filter((v) => v <= 6).length)
  return {
    n,
    average: calculateAverage(valid),
    promoters,
    passives,
    detractors,
    nps: promoters - detractors,
  }
}
