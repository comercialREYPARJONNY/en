import { AlertTriangle, CircleCheck, CircleHelp } from "lucide-react"
import type { CrossAlert } from "@/lib/analytics/types"
import { formatAverage } from "@/lib/format"
import { cn } from "@/lib/utils"

const STATUS = {
  ALERT: { icon: AlertTriangle, className: "border-critical/30 bg-critical-soft/60", iconClass: "text-critical" },
  OK: { icon: CircleCheck, className: "bg-card", iconClass: "text-strength" },
  NO_DATA: { icon: CircleHelp, className: "bg-card", iconClass: "text-muted-foreground" },
} as const

/** Sección 5 del "Resumen": alertas cruzadas. */
export function AlertsPanel({ alerts, threshold }: { alerts: CrossAlert[]; threshold: number }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {alerts.map((alert) => {
        const { icon: Icon, className, iconClass } = STATUS[alert.status]
        return (
          <div key={alert.id} className={cn("flex flex-col rounded-2xl border p-4", className)}>
            <div className="flex items-start gap-2.5">
              <Icon className={cn("mt-0.5 size-5 shrink-0", iconClass)} />
              <div className="min-w-0">
                <p className="text-sm font-medium">{alert.title}</p>
                <p className={cn("mt-1 text-sm", alert.status === "ALERT" ? "font-medium text-critical" : "text-muted-foreground")}>
                  {alert.message}
                </p>
              </div>
            </div>
            <dl className="mt-4 grid gap-1 border-t pt-3 text-sm">
              {alert.indicators.map((indicator) => (
                <div key={indicator.label} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{indicator.label}</dt>
                  <dd className="tabular-nums">{formatAverage(indicator.value)}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-3 text-xs text-muted-foreground">
                <dt>Umbral de alerta</dt>
                <dd className="tabular-nums">&lt; {formatAverage(threshold)}</dd>
              </div>
            </dl>
          </div>
        )
      })}
    </div>
  )
}
