import { cn } from "@/lib/utils"

type Props = {
  id: string
  index?: number
  text: string
  error?: string
  children: React.ReactNode
}

export function QuestionCard({ id, index, text, error, children }: Props) {
  return (
    <fieldset
      id={`q-${id}`}
      aria-invalid={Boolean(error)}
      className={cn(
        "scroll-mt-28 space-y-4 rounded-2xl border bg-card p-4 shadow-xs transition-colors sm:p-6",
        error ? "border-critical/50 ring-1 ring-critical/20" : "border-border",
      )}
    >
      <legend className="sr-only">{text}</legend>
      <p className="text-base leading-relaxed font-medium text-foreground sm:text-[1.05rem]" aria-hidden>
        {index !== undefined && <span className="mr-1.5 text-muted-foreground tabular-nums">{index}.</span>}
        {text}
      </p>
      {children}
      {error && (
        <p role="alert" className="text-sm text-critical">
          {error}
        </p>
      )}
    </fieldset>
  )
}
