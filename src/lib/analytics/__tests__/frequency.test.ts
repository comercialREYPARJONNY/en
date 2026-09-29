import { describe, expect, it } from "vitest"
import {
  calculateFrequencyDistribution,
  calculateFrequencyGap,
  interpretFrequencyGap,
} from "../calculate-frequency-gap"
import { frequencyOptions, response } from "./fixtures"

describe("brecha de acompañamiento", () => {
  it("brecha = deseado − real con niveles 0–4", () => {
    const responses = [
      response({ options: { G3: "MONTHLY", G4: "WEEKLY" } }), // 2 → 4
      response({ options: { G3: "LESS_THAN_MONTHLY", G4: "BIWEEKLY" } }), // 1 → 3
    ]
    const result = calculateFrequencyGap(responses, frequencyOptions, 0.5)
    expect(result.realAverage).toBe(1.5)
    expect(result.desiredAverage).toBe(3.5)
    expect(result.gap).toBe(2)
    expect(result.reading).toBe("Falta acompañamiento")
  })

  it("interpreta con el umbral configurado (estrictamente mayor / menor)", () => {
    expect(interpretFrequencyGap(0.6, 0.5)).toBe("Falta acompañamiento")
    expect(interpretFrequencyGap(0.5, 0.5)).toBe("Ajustado")
    expect(interpretFrequencyGap(-0.5, 0.5)).toBe("Ajustado")
    expect(interpretFrequencyGap(-0.6, 0.5)).toBe("Sobra acompañamiento")
    expect(interpretFrequencyGap(0.6, 1)).toBe("Ajustado")
    expect(interpretFrequencyGap(null, 0.5)).toBeNull()
  })

  it("usa los niveles configurados", () => {
    const custom = frequencyOptions.map((o) => (o.id === "WEEKLY" ? { ...o, level: 8 } : o))
    const result = calculateFrequencyGap(
      [response({ options: { G3: "WEEKLY", G4: "WEEKLY" } })],
      custom,
      0.5,
    )
    expect(result.realAverage).toBe(8)
    expect(result.reading).toBe("Ajustado")
  })

  it("sin datos no calcula brecha", () => {
    const result = calculateFrequencyGap([response()], frequencyOptions, 0.5)
    expect(result.gap).toBeNull()
    expect(result.reading).toBeNull()
  })

  it("cuenta la distribución real vs. deseada", () => {
    const rows = calculateFrequencyDistribution(
      [
        response({ options: { G3: "NEVER", G4: "WEEKLY" } }),
        response({ options: { G3: "NEVER", G4: "MONTHLY" } }),
      ],
      frequencyOptions,
    )
    expect(rows.find((r) => r.option.id === "NEVER")).toMatchObject({ real: 2, desired: 0 })
    expect(rows.find((r) => r.option.id === "WEEKLY")).toMatchObject({ real: 0, desired: 1 })
  })
})
