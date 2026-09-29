import { describe, expect, it } from "vitest"
import { calculateAverage } from "../calculate-average"
import { calculateFavorability } from "../calculate-favorability"
import { calculateLeaderDifference } from "../leader-difference"
import { classifyTrafficLight } from "../traffic-light"
import { settings } from "./fixtures"

describe("promedio", () => {
  it("calcula sobre respuestas válidas y excluye N/A", () => {
    // Notas: 5, 4, 3, N/A → promedio 4
    expect(calculateAverage([5, 4, 3, null])).toBe(4)
  })

  it("excluye vacíos y valores no numéricos", () => {
    expect(calculateAverage([undefined, null, 2, Number.NaN, 4])).toBe(3)
  })

  it("devuelve null cuando no hay respuestas válidas", () => {
    expect(calculateAverage([null, null])).toBeNull()
    expect(calculateAverage([])).toBeNull()
  })
})

describe("favorabilidad", () => {
  it("cuenta notas ≥ 4 sobre las válidas, sin N/A", () => {
    // 5, 4, 3, N/A → 2/3 = 66.67%
    expect(calculateFavorability([5, 4, 3, null], 4)).toBeCloseTo(66.67, 2)
  })

  it("respeta la nota mínima configurada", () => {
    expect(calculateFavorability([5, 4, 3], 5)).toBeCloseTo(33.33, 2)
    expect(calculateFavorability([5, 4, 3], 3)).toBe(100)
  })

  it("devuelve null sin respuestas válidas", () => {
    expect(calculateFavorability([null], 4)).toBeNull()
  })
})

describe("semáforo", () => {
  it("clasifica con los umbrales configurados", () => {
    expect(classifyTrafficLight(4.0, settings)).toBe("STRENGTH")
    expect(classifyTrafficLight(4.6, settings)).toBe("STRENGTH")
    expect(classifyTrafficLight(3.99, settings)).toBe("IMPROVE")
    expect(classifyTrafficLight(3.0, settings)).toBe("IMPROVE")
    expect(classifyTrafficLight(2.99, settings)).toBe("CRITICAL")
    expect(classifyTrafficLight(null, settings)).toBeNull()
  })

  it("usa umbrales distintos cuando cambian en configuración", () => {
    const custom = { strengthThreshold: 4.5, improveThreshold: 3.5 }
    expect(classifyTrafficLight(4.2, custom)).toBe("IMPROVE")
    expect(classifyTrafficLight(3.2, custom)).toBe("CRITICAL")
  })
})

describe("diferencia entre líderes", () => {
  it("con dos líderes es A − B", () => {
    expect(calculateLeaderDifference([3.5, 4])).toBeCloseTo(-0.5)
    expect(calculateLeaderDifference([3.5, null])).toBeNull()
  })

  it("con más de dos líderes es máx − mín", () => {
    expect(calculateLeaderDifference([3, 4.5, 4])).toBeCloseTo(1.5)
  })
})
