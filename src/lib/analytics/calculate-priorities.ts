import { getBlock, PRIORITY_DIMENSIONS } from "@/lib/survey/questions"
import type { BlockId } from "@/lib/survey/types"
import { calculateAverage } from "./calculate-average"
import type { AnalyticsResponse, PriorityReading, PriorityRow } from "./types"

/** Número de aspectos que se consideran "los más importantes". */
export const TOP_PRIORITIES = 2

/** Equivalente a RANK(valor, rango, 1): ascendente, los empates comparten posición. */
export function rankAscending(values: ReadonlyArray<number | null>): (number | null)[] {
  const present = values.filter((v): v is number => v !== null)
  return values.map((v) => (v === null ? null : 1 + present.filter((other) => other < v).length))
}

export function interpretPriority(
  position: number | null,
  performance: number | null,
  strengthThreshold: number,
): PriorityReading | null {
  if (position === null || performance === null) return null
  const isTop = position <= TOP_PRIORITIES
  const isStrength = performance >= strengthThreshold
  if (isTop) return isStrength ? "Mantener" : "Invertir primero"
  return isStrength ? "Sin urgencia" : "Mejorar después"
}

/** Sección 4 del "Resumen": importancia (PR1) vs. desempeño del bloque relacionado. */
export function calculatePriorities(
  responses: ReadonlyArray<AnalyticsResponse>,
  blockAverages: Partial<Record<BlockId, number | null>>,
  strengthThreshold: number,
): PriorityRow[] {
  const averageRanks = PRIORITY_DIMENSIONS.map((d) =>
    calculateAverage(responses.map((r) => r.ranking[d.id] ?? null)),
  )
  const positions = rankAscending(averageRanks)

  return PRIORITY_DIMENSIONS.map((d, i) => {
    const performance = blockAverages[d.block] ?? null
    return {
      dimension: d.id,
      label: d.label,
      blockId: d.block,
      blockName: getBlock(d.block).name,
      averageRank: averageRanks[i],
      position: positions[i],
      performance,
      reading: interpretPriority(positions[i], performance, strengthThreshold),
    }
  })
}
