import { AlertTriangle, CircleCheck, CircleDot } from "lucide-react"
import { TRAFFIC_LIGHT_LABEL } from "@/lib/analytics/traffic-light"
import type { TrafficLight } from "@/lib/analytics/types"
import { EMPTY } from "@/lib/format"
import { cn } from "@/lib/utils"

const STYLES: Record<TrafficLight, { className: string; icon: typeof CircleCheck }> = {
  STRENGTH: { className: "bg-strength-soft text-strength", icon: CircleCheck },
  IMPROVE: { className: "bg-improve-soft text-[oklch(0.5_0.12_70)]", icon: CircleDot },
  CRITICAL: { className: "bg-critical-soft text-critical", icon: AlertTriangle },
}

/** Semáforo con icono + texto: nunca depende solo del color. */
export function TrafficLightBadge({ value, compact }: { value: TrafficLight | null; compact?: boolean }) {
  if (!value) return <span className="text-muted-foreground">{EMPTY}</span>
  const { className, icon: Icon } = STYLES[value]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        className,
      )}
    >
      <Icon className="size-3.5" />
      {compact ? null : TRAFFIC_LIGHT_LABEL[value]}
      {compact && <span className="sr-only">{TRAFFIC_LIGHT_LABEL[value]}</span>}
    </span>
  )
}

/** Promedio con un punto de color del semáforo (para celdas de tablas densas). */
export function ScoreCell({ value, light, format }: { value: number | null; light: TrafficLight | null; format: (v: number | null) => string }) {
  return (
    <span className="inline-flex items-center justify-end gap-1.5 tabular-nums">
      {light && (
        <span
          aria-hidden
          className={cn(
            "size-2 rounded-full",
            light === "STRENGTH" ? "bg-strength" : light === "IMPROVE" ? "bg-improve" : "bg-critical",
          )}
        />
      )}
      {format(value)}
    </span>
  )
}
