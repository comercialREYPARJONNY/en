/** Deja solo notas numéricas válidas (excluye N/A, vacíos y valores no finitos). */
export function validScores(values: ReadonlyArray<number | null | undefined>): number[] {
  return values.filter((v): v is number => typeof v === "number" && Number.isFinite(v))
}

/** promedio = suma de respuestas válidas / cantidad de respuestas válidas */
export function calculateAverage(values: ReadonlyArray<number | null | undefined>): number | null {
  const valid = validScores(values)
  if (valid.length === 0) return null
  return valid.reduce((sum, v) => sum + v, 0) / valid.length
}
