import { describe, expect, it } from "vitest"
import { calculateAlerts } from "../calculate-alerts"

const base = { technicalTrainingBlock: 4, ft5: 4, decisionsBlock: 4, d7: 4, m1: 4 }

describe("alertas cruzadas", () => {
  it("sin alertas cuando los indicadores superan el umbral", () => {
    const alerts = calculateAlerts(base, 3.5)
    expect(alerts.map((a) => a.status)).toEqual(["OK", "OK", "OK"])
    expect(alerts[0].message).toBe("Sin alerta")
  })

  it("alerta 1: bloque formación técnica y FT5 bajo el umbral", () => {
    const [technical] = calculateAlerts({ ...base, technicalTrainingBlock: 3.2, ft5: 3.0 }, 3.5)
    expect(technical.status).toBe("ALERT")
    expect(technical.message).toBe("ALERTA: problema de soporte técnico, no solo del líder")
  })

  it("alerta 1 requiere que ambos indicadores estén bajos", () => {
    const [technical] = calculateAlerts({ ...base, technicalTrainingBlock: 3.2, ft5: 3.6 }, 3.5)
    expect(technical.status).toBe("OK")
  })

  it("alerta 2: decisiones y D7 bajas (D7 no se invierte)", () => {
    const [, lostSales] = calculateAlerts({ ...base, decisionsBlock: 3.4, d7: 2.5 }, 3.5)
    expect(lostSales.status).toBe("ALERT")
    expect(lostSales.message).toBe("ALERTA: hay ventas perdidas por demoras; impacto económico medible")
  })

  it("alerta 3: M1 bajo el umbral", () => {
    const [, , methodology] = calculateAlerts({ ...base, m1: 3.49 }, 3.5)
    expect(methodology.status).toBe("ALERT")
    expect(methodology.message).toBe("ALERTA: la metodología no se está comunicando bien")
  })

  it("el umbral es estricto (valor igual no alerta)", () => {
    const [, , methodology] = calculateAlerts({ ...base, m1: 3.5 }, 3.5)
    expect(methodology.status).toBe("OK")
  })

  it("sin datos muestra 'Sin datos'", () => {
    const alerts = calculateAlerts({ ...base, ft5: null, d7: null, m1: null }, 3.5)
    expect(alerts.map((a) => a.message)).toEqual(["Sin datos", "Sin datos", "Sin datos"])
  })
})
