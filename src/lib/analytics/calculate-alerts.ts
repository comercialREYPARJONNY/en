import type { AlertStatus, CrossAlert } from "./types"

export type AlertInputs = {
  technicalTrainingBlock: number | null
  ft5: number | null
  decisionsBlock: number | null
  d7: number | null
  m1: number | null
}

function evaluate(values: (number | null)[], threshold: number): AlertStatus {
  if (values.some((v) => v === null)) return "NO_DATA"
  return values.every((v) => (v as number) < threshold) ? "ALERT" : "OK"
}

function message(status: AlertStatus, alertText: string): string {
  if (status === "NO_DATA") return "Sin datos"
  return status === "ALERT" ? alertText : "Sin alerta"
}

/** Sección 5 del "Resumen": alertas cruzadas. */
export function calculateAlerts(inputs: AlertInputs, alertThreshold: number): CrossAlert[] {
  const technical = evaluate([inputs.technicalTrainingBlock, inputs.ft5], alertThreshold)
  const decisions = evaluate([inputs.decisionsBlock, inputs.d7], alertThreshold)
  const methodology = evaluate([inputs.m1], alertThreshold)

  return [
    {
      id: "TECHNICAL_SUPPORT",
      title: "Formación técnica (bloque) y FT5 bajas",
      indicators: [
        { label: "Formación técnica (bloque)", value: inputs.technicalTrainingBlock },
        { label: "FT5", value: inputs.ft5 },
      ],
      status: technical,
      message: message(technical, "ALERTA: problema de soporte técnico, no solo del líder"),
    },
    {
      id: "LOST_SALES",
      title: "Decisiones (bloque) y D7 bajas",
      indicators: [
        { label: "Calidad y agilidad en decisiones (bloque)", value: inputs.decisionsBlock },
        { label: "D7", value: inputs.d7 },
      ],
      status: decisions,
      message: message(decisions, "ALERTA: hay ventas perdidas por demoras; impacto económico medible"),
    },
    {
      id: "METHODOLOGY",
      title: "Metodología: M1 baja (no la conocen)",
      indicators: [{ label: "M1", value: inputs.m1 }],
      status: methodology,
      message: message(methodology, "ALERTA: la metodología no se está comunicando bien"),
    },
  ]
}
