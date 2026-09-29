"use client"

import { Loader2, Save } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { FrequencyLevel } from "@/lib/analytics/types"
import { updateFrequencyLevels } from "@/server/actions/admin"

export function FrequencyLevelsForm({ options }: { options: FrequencyLevel[] }) {
  const [levels, setLevels] = useState(() => Object.fromEntries(options.map((o) => [o.id, String(o.level)])))
  const [pending, startTransition] = useTransition()
  const dirty = options.some((o) => levels[o.id] !== String(o.level))

  const save = () =>
    startTransition(async () => {
      const result = await updateFrequencyLevels(options.map((o) => ({ id: o.id, level: Number(levels[o.id]) })))
      if (result.ok) toast.success("Niveles de frecuencia actualizados.")
      else toast.error(result.error)
    })

  return (
    <div className="rounded-2xl border bg-card p-5">
      <ul className="divide-y">
        {options.map((option) => (
          <li key={option.id} className="flex items-center justify-between gap-4 py-2.5">
            <label htmlFor={`level-${option.id}`} className="text-sm">
              {option.label}
            </label>
            <Input
              id={`level-${option.id}`}
              type="number"
              min={0}
              max={10}
              step={1}
              value={levels[option.id]}
              onChange={(e) => setLevels((l) => ({ ...l, [option.id]: e.target.value }))}
              className="h-9 w-20 text-right tabular-nums"
            />
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-end border-t pt-4">
        <Button onClick={save} disabled={pending || !dirty}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />}
          Guardar niveles
        </Button>
      </div>
    </div>
  )
}
