"use client"

import { Check, Copy, ExternalLink } from "lucide-react"
import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { setSurveyActive } from "@/server/actions/admin"

type Props = { surveyId: string; active: boolean; responses: number }

/** Estado de la encuesta: abrir/cerrar recepción y compartir el enlace. */
export function SurveyStatusCard({ surveyId, active, responses }: Props) {
  const [pending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState("")
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin)
  }, [])
  const link = `${origin}/encuesta`

  const toggle = (next: boolean) =>
    startTransition(async () => {
      const result = await setSurveyActive(surveyId, next)
      if (result.ok) toast.success(next ? "Encuesta abierta: ya recibe respuestas." : "Encuesta cerrada.")
      else toast.error(result.error)
    })

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("No se pudo copiar. Copie el enlace manualmente.")
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">Estado de la encuesta</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {active ? "Abierta: los asesores pueden responder." : "Cerrada: no se reciben respuestas nuevas."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={active ? "text-sm font-medium text-strength" : "text-sm text-muted-foreground"}>
            {active ? "Activa" : "Inactiva"}
          </span>
          <Switch checked={active} onCheckedChange={toggle} disabled={pending} aria-label="Activar o desactivar la encuesta" />
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 rounded-xl bg-muted/60 p-3 sm:flex-row sm:items-center">
        <code className="min-w-0 flex-1 truncate text-sm">{link || "/encuesta"}</code>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copy} className="h-8">
            {copied ? <Check /> : <Copy />}
            {copied ? "Copiado" : "Copiar enlace"}
          </Button>
          <a href="/encuesta" target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-sm hover:bg-muted">
            <ExternalLink className="size-3.5" />
            Abrir
          </a>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Respuestas recibidas: <span className="font-medium text-foreground tabular-nums">{responses}</span>
      </p>
    </div>
  )
}
