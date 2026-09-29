/**
 * Diferencia entre líderes. Con dos líderes replica "Dif. A − B" del Excel;
 * con más de dos devuelve la brecha máx − mín entre los líderes con datos.
 */
export function calculateLeaderDifference(values: ReadonlyArray<number | null>): number | null {
  if (values.length === 2) {
    const [a, b] = values
    return a === null || b === null ? null : a - b
  }
  const present = values.filter((v): v is number => v !== null)
  return present.length < 2 ? null : Math.max(...present) - Math.min(...present)
}
