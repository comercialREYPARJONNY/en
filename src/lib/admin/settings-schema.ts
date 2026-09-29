import { z } from "zod"

export const settingsSchema = z
  .object({
    strengthThreshold: z.number({ error: "Ingrese un número" }).min(1, "Mínimo 1").max(5, "Máximo 5"),
    improveThreshold: z.number({ error: "Ingrese un número" }).min(1, "Mínimo 1").max(5, "Máximo 5"),
    alertThreshold: z.number({ error: "Ingrese un número" }).min(1, "Mínimo 1").max(5, "Máximo 5"),
    favorableMin: z.number({ error: "Ingrese un número" }).int("Debe ser entero").min(1, "Mínimo 1").max(5, "Máximo 5"),
    frequencyGapThreshold: z.number({ error: "Ingrese un número" }).min(0, "Mínimo 0").max(4, "Máximo 4"),
    minResponsesForSegment: z.number({ error: "Ingrese un número" }).int("Debe ser entero").min(1, "Mínimo 1").max(50, "Máximo 50"),
  })
  .refine((s) => s.improveThreshold < s.strengthThreshold, {
    message: "Debe ser menor que el umbral de Fortaleza.",
    path: ["improveThreshold"],
  })

export type SettingsInput = z.infer<typeof settingsSchema>
