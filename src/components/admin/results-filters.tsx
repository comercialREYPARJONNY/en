"use client"

import { FilterX, Loader2 } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SENIORITY_OPTIONS } from "@/lib/survey/questions"

const ALL = "all"

export type ExtraFilter = {
  name: string
  label: string
  options: { value: string; label: string }[]
  /** Parámetros que se limpian al cambiar este filtro (p. ej. pregunta al cambiar bloque). */
  resets?: string[]
}

type Props = {
  leaders: { id: string; name: string }[]
  /** Oculta los filtros de fecha y antigüedad (vista de preguntas abiertas). */
  compact?: boolean
  extra?: ExtraFilter[]
}

/** Filtros en la URL: afectan todos los cálculos y gráficos de la página. */
export function ResultsFilters({ leaders, compact, extra = [] }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()

  const setParams = (changes: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(changes)) {
      if (!value || value === ALL) params.delete(key)
      else params.set(key, value)
    }
    const query = params.toString()
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }))
  }

  const selectFilter = (name: string, label: string, options: { value: string; label: string }[], allLabel: string, resets: string[] = []) => {
    const items = [{ value: ALL, label: allLabel }, ...options]
    return (
      <div key={name} className="grid min-w-0 gap-1.5">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <Select
          items={items}
          value={searchParams.get(name) ?? ALL}
          onValueChange={(value) => setParams({ [name]: value as string, ...Object.fromEntries(resets.map((r) => [r, null])) })}
        >
          <SelectTrigger className="h-9 w-full bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  const active = [...searchParams.keys()].length > 0

  return (
    <div className="no-print mb-6 rounded-2xl border bg-card p-3 sm:p-4">
      <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap [&>*]:lg:w-48">
        {selectFilter("leader", "Líder", leaders.map((l) => ({ value: l.id, label: l.name })), "Todos los líderes")}
        {!compact &&
          selectFilter(
            "seniority",
            "Antigüedad",
            SENIORITY_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
            "Todas",
          )}
        {extra.map((f) => selectFilter(f.name, f.label, f.options, "Todos", f.resets))}
        {!compact && (
          <>
            <div className="grid gap-1.5">
              <Label htmlFor="filter-from" className="text-xs text-muted-foreground">
                Desde
              </Label>
              <Input
                id="filter-from"
                type="date"
                className="h-9 bg-card"
                value={searchParams.get("from") ?? ""}
                max={searchParams.get("to") ?? undefined}
                onChange={(e) => setParams({ from: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="filter-to" className="text-xs text-muted-foreground">
                Hasta
              </Label>
              <Input
                id="filter-to"
                type="date"
                className="h-9 bg-card"
                value={searchParams.get("to") ?? ""}
                min={searchParams.get("from") ?? undefined}
                onChange={(e) => setParams({ to: e.target.value })}
              />
            </div>
          </>
        )}
        <div className="flex h-9 items-center gap-2 lg:w-auto!">
          <Button
            variant="ghost"
            className="h-9"
            disabled={!active || pending}
            onClick={() => startTransition(() => router.replace(pathname, { scroll: false }))}
          >
            <FilterX />
            Limpiar
          </Button>
          {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Actualizando" />}
        </div>
      </div>
    </div>
  )
}
