"use client"

import { cn } from "@/lib/utils"

type Props = {
  selected: boolean
  onSelect: () => void
  children: React.ReactNode
  label?: string
  className?: string
}

/** Botón grande tipo radio para escalas (1–5, N/A, 0–10). */
export function ChoiceButton({ selected, onSelect, children, label, className }: Props) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      title={label}
      onClick={onSelect}
      className={cn(
        "flex h-12 min-w-0 items-center justify-center rounded-xl border text-base font-medium tabular-nums transition-all select-none sm:h-14 sm:text-lg",
        "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        selected
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent active:scale-[0.97]",
        className,
      )}
    >
      {children}
    </button>
  )
}
