import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  icon?: LucideIcon
  className?: string
}

export function MetricCard({ label, value, hint, icon: Icon, className }: Props) {
  return (
    <div className={cn("rounded-2xl border bg-card p-4 sm:p-5", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        {Icon && <Icon className="size-4 text-muted-foreground/70" />}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  )
}
