import { validScores } from "./calculate-average"

/**
 * % favorable = respuestas con nota ≥ favorableMin / respuestas válidas × 100.
 * N/A y vacíos no cuentan en el denominador.
 */
export function calculateFavorability(
  values: ReadonlyArray<number | null | undefined>,
  favorableMin: number,
): number | null {
  const valid = validScores(values)
  if (valid.length === 0) return null
  const favorable = valid.filter((v) => v >= favorableMin).length
  return (favorable / valid.length) * 100
}
