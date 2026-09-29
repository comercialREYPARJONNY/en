"use client"

import { Check, Pencil, Plus, X } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { LeaderRow } from "@/lib/data/leaders"
import { createLeader, renameLeader, setLeaderActive, type ActionResult } from "@/server/actions/admin"

function useAction() {
  const [pending, startTransition] = useTransition()
  const run = (fn: () => Promise<ActionResult>, success: string, onOk?: () => void) =>
    startTransition(async () => {
      const result = await fn()
      if (result.ok) {
        toast.success(success)
        onOk?.()
      } else toast.error(result.error)
    })
  return { pending, run }
}

function LeaderItem({ leader }: { leader: LeaderRow }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(leader.name)
  const { pending, run } = useAction()

  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      {editing ? (
        <form
          className="flex min-w-0 flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            run(() => renameLeader(leader.id, name), "Nombre actualizado.", () => setEditing(false))
          }}
        >
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9" autoFocus aria-label="Nombre del líder" />
          <Button type="submit" size="icon" className="size-9" disabled={pending} aria-label="Guardar">
            <Check />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-9"
            onClick={() => {
              setName(leader.name)
              setEditing(false)
            }}
            aria-label="Cancelar"
          >
            <X />
          </Button>
        </form>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className={leader.active ? "font-medium" : "text-muted-foreground line-through"}>{leader.name}</span>
          <Button variant="ghost" size="icon-sm" onClick={() => setEditing(true)} aria-label={`Editar ${leader.name}`}>
            <Pencil />
          </Button>
        </div>
      )}
      <span className="text-sm text-muted-foreground tabular-nums">{leader.responses} resp.</span>
      <label className="flex items-center gap-2 text-sm">
        <Switch
          checked={leader.active}
          disabled={pending}
          onCheckedChange={(active) =>
            run(() => setLeaderActive(leader.id, active), active ? "Líder activado." : "Líder desactivado.")
          }
          aria-label={`${leader.active ? "Desactivar" : "Activar"} ${leader.name}`}
        />
        <span className="w-14 text-muted-foreground">{leader.active ? "Activo" : "Inactivo"}</span>
      </label>
    </li>
  )
}

export function LeadersManager({ leaders }: { leaders: LeaderRow[] }) {
  const [name, setName] = useState("")
  const { pending, run } = useAction()
  return (
    <div className="rounded-2xl border bg-card p-5">
      <ul className="divide-y">
        {leaders.map((leader) => (
          <LeaderItem key={`${leader.id}-${leader.name}-${leader.active}`} leader={leader} />
        ))}
      </ul>
      <form
        className="mt-4 flex gap-2 border-t pt-4"
        onSubmit={(e) => {
          e.preventDefault()
          run(() => createLeader(name), "Líder agregado.", () => setName(""))
        }}
      >
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del nuevo líder" className="h-9" aria-label="Nombre del nuevo líder" />
        <Button type="submit" className="h-9" disabled={pending || name.trim().length < 2}>
          <Plus />
          Agregar
        </Button>
      </form>
      <p className="mt-3 text-xs text-muted-foreground">
        Los líderes inactivos no aparecen en la encuesta, pero sus respuestas históricas se conservan en los resultados.
      </p>
    </div>
  )
}
