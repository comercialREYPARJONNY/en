"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Save } from "lucide-react"
import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { settingsSchema, type SettingsInput } from "@/lib/admin/settings-schema"
import { updateSettings } from "@/server/actions/admin"

const FIELDS: { name: keyof SettingsInput; label: string; help: string; step: string }[] = [
  { name: "strengthThreshold", label: "Umbral Fortaleza", help: "Promedio ≥ este valor se marca en verde.", step: "0.1" },
  { name: "improveThreshold", label: "Umbral A mejorar", help: "Promedio ≥ este valor y < Fortaleza: amarillo. Menor: Crítico.", step: "0.1" },
  { name: "alertThreshold", label: "Umbral de alerta", help: "Las alertas cruzadas se disparan con promedios menores a este valor.", step: "0.1" },
  { name: "favorableMin", label: "Nota mínima favorable", help: "Una respuesta es favorable si la nota es ≥ este valor.", step: "1" },
  { name: "frequencyGapThreshold", label: "Brecha significativa de acompañamiento", help: "Niveles 0–4. Brecha mayor: 'Falta'; menor al negativo: 'Sobra'.", step: "0.1" },
  { name: "minResponsesForSegment", label: "Mínimo de respuestas por segmento", help: "Por debajo de este número no se muestran resultados (anonimato).", step: "1" },
]

export function SettingsForm({ defaults }: { defaults: SettingsInput }) {
  const [pending, startTransition] = useTransition()
  const form = useForm<SettingsInput>({ resolver: zodResolver(settingsSchema), defaultValues: defaults })

  const onSubmit = form.handleSubmit((values) =>
    startTransition(async () => {
      const result = await updateSettings(values)
      if (result.ok) {
        toast.success("Parámetros guardados. Los resultados se recalculan con los nuevos valores.")
        form.reset(values)
      } else toast.error(result.error)
    }),
  )

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border bg-card p-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {FIELDS.map((field) => {
          const error = form.formState.errors[field.name]?.message
          return (
            <div key={field.name} className="grid gap-1.5">
              <Label htmlFor={field.name}>{field.label}</Label>
              <Input
                id={field.name}
                type="number"
                inputMode="decimal"
                step={field.step}
                className="h-9 max-w-40 tabular-nums"
                aria-invalid={Boolean(error)}
                {...form.register(field.name, { valueAsNumber: true })}
              />
              <p className={error ? "text-xs text-critical" : "text-xs text-muted-foreground"}>{error ?? field.help}</p>
            </div>
          )
        })}
      </div>
      <div className="mt-6 flex justify-end border-t pt-4">
        <Button type="submit" disabled={pending || !form.formState.isDirty}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />}
          Guardar parámetros
        </Button>
      </div>
    </form>
  )
}
