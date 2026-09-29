type Props = {
  title: string
  step: number
  totalSteps: number
  percent: number
}

export function SurveyProgress({ title, step, totalSteps, percent }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <p className="min-w-0 truncate font-medium text-foreground">
          {title} <span className="text-muted-foreground">· Paso {step} de {totalSteps}</span>
        </p>
        <p className="shrink-0 text-muted-foreground tabular-nums">{percent}% completado</p>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label="Progreso de la encuesta"
        className="h-1.5 overflow-hidden rounded-full bg-secondary"
      >
        <div className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
