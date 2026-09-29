import { describe, expect, it } from "vitest"
import { calculateNps } from "../calculate-nps"

describe("NPS", () => {
  it("clasifica promotores, pasivos y detractores", () => {
    // 10, 9, 8, 6 → 50% / 25% / 25% → NPS 25
    const result = calculateNps([10, 9, 8, 6])
    expect(result.promoters).toBe(50)
    expect(result.passives).toBe(25)
    expect(result.detractors).toBe(25)
    expect(result.nps).toBe(25)
    expect(result.average).toBe(8.25)
    expect(result.n).toBe(4)
  })

  it("cubre los extremos −100 y +100", () => {
    expect(calculateNps([0, 3, 6]).nps).toBe(-100)
    expect(calculateNps([9, 10]).nps).toBe(100)
  })

  it("trata 7 y 8 como pasivos", () => {
    expect(calculateNps([7, 8]).nps).toBe(0)
  })

  it("ignora vacíos y valores fuera de 0–10", () => {
    const result = calculateNps([null, 10, 11, -1])
    expect(result.n).toBe(1)
    expect(result.nps).toBe(100)
  })

  it("sin datos devuelve nulos", () => {
    expect(calculateNps([]).nps).toBeNull()
  })
})
