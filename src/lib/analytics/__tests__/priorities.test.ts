import { describe, expect, it } from "vitest"
import { calculatePriorities, interpretPriority, rankAscending } from "../calculate-priorities"
import { response } from "./fixtures"

describe("ranking de prioridades", () => {
  it("RANK ascendente con empates compartidos (como Excel)", () => {
    expect(rankAscending([2.5, 1.0, 2.5, 4, null])).toEqual([2, 1, 2, 4, null])
  })

  it("aplica la regla de lectura del Excel", () => {
    expect(interpretPriority(1, 3.8, 4)).toBe("Invertir primero")
    expect(interpretPriority(2, 4.2, 4)).toBe("Mantener")
    expect(interpretPriority(3, 3.2, 4)).toBe("Mejorar después")
    expect(interpretPriority(5, 4.5, 4)).toBe("Sin urgencia")
    expect(interpretPriority(null, 4.5, 4)).toBeNull()
    expect(interpretPriority(1, null, 4)).toBeNull()
  })

  it("promedia posiciones y relaciona cada aspecto con su bloque", () => {
    const responses = [
      response({
        ranking: { COMMUNICATION: 1, DECISIONS: 2, COMMERCIAL_TRAINING: 3, TECHNICAL_TRAINING: 4, METHODOLOGY: 5 },
      }),
      response({
        ranking: { COMMUNICATION: 2, DECISIONS: 1, COMMERCIAL_TRAINING: 5, TECHNICAL_TRAINING: 3, METHODOLOGY: 4 },
      }),
    ]
    const rows = calculatePriorities(
      responses,
      { COMMUNICATION: 3.6, DECISIONS: 4.3, COMMERCIAL_TRAINING: 3.1, TECHNICAL_TRAINING: 4.1, METHODOLOGY: 4.5 },
      4,
    )
    const byDim = Object.fromEntries(rows.map((r) => [r.dimension, r]))

    expect(byDim.COMMUNICATION).toMatchObject({ averageRank: 1.5, position: 1, reading: "Invertir primero" })
    expect(byDim.DECISIONS).toMatchObject({ averageRank: 1.5, position: 1, reading: "Mantener" })
    expect(byDim.TECHNICAL_TRAINING).toMatchObject({ averageRank: 3.5, position: 3, reading: "Sin urgencia" })
    expect(byDim.COMMERCIAL_TRAINING).toMatchObject({ averageRank: 4, position: 4, reading: "Mejorar después" })
    expect(byDim.METHODOLOGY).toMatchObject({ averageRank: 4.5, position: 5, blockName: "Metodología comercial" })
  })
})
