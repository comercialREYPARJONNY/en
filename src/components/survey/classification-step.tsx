"use client"

import { Check } from "lucide-react"
import { SENIORITY_OPTIONS } from "@/lib/survey/questions"
import type { Seniority } from "@/lib/survey/types"
import { cn } from "@/lib/utils"
import { QuestionCard } from "./question-card"

type Props = {
  leaders: { id: string; name: string }[]
  leaderId?: string
  seniority?: Seniority
  errors: Record<string, string>
  onLeader: (id: string) => void
  onSeniority: (value: Seniority) => void
}

function OptionCard({ selected, onSelect, children }: { selected: boolean; onSelect: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex min-h-12 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-base transition-all sm:text-sm",
        "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        selected
          ? "border-primary bg-primary/5 font-medium text-primary ring-1 ring-primary"
          : "border-border bg-card hover:border-primary/40 hover:bg-accent",
      )}
    >
      {children}
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-input",
        )}
      >
        {selected && <Check className="size-3.5" />}
      </span>
    </button>
  )
}

export function ClassificationStep({ leaders, leaderId, seniority, errors, onLeader, onSeniority }: Props) {
  return (
    <div className="space-y-4">
      <QuestionCard id="leaderId" text="Mi líder directo es" error={errors.leaderId}>
        <div role="radiogroup" aria-label="Mi líder directo es" className="grid gap-2 sm:grid-cols-2">
          {leaders.map((leader) => (
            <OptionCard key={leader.id} selected={leaderId === leader.id} onSelect={() => onLeader(leader.id)}>
              {leader.name}
            </OptionCard>
          ))}
        </div>
      </QuestionCard>
      <QuestionCard id="seniority" text="Mi antigüedad en la empresa es" error={errors.seniority}>
        <div role="radiogroup" aria-label="Mi antigüedad en la empresa es" className="grid gap-2 sm:grid-cols-3">
          {SENIORITY_OPTIONS.map((option) => (
            <OptionCard key={option.value} selected={seniority === option.value} onSelect={() => onSeniority(option.value)}>
              {option.label}
            </OptionCard>
          ))}
        </div>
      </QuestionCard>
    </div>
  )
}
