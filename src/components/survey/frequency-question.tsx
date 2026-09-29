"use client"

import { Check } from "lucide-react"
import type { FrequencyLevel } from "@/lib/analytics/types"
import type { AnswerInput } from "@/lib/survey/submission-schema"
import type { SurveyQuestion } from "@/lib/survey/types"
import { cn } from "@/lib/utils"
import { QuestionCard } from "./question-card"

type Props = {
  question: SurveyQuestion
  index: number
  options: FrequencyLevel[]
  answer: AnswerInput | undefined
  error?: string
  onChange: (answer: AnswerInput) => void
}

/** G3 / G4: frecuencia de acompañamiento en campo. */
export function FrequencyQuestion({ question, index, options, answer, error, onChange }: Props) {
  return (
    <QuestionCard id={question.id} index={index} text={question.text} error={error}>
      <div role="radiogroup" aria-label={question.text} className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const selected = answer?.option === option.id
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange({ option: option.id })}
              className={cn(
                "flex min-h-12 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-base transition-all sm:text-sm",
                "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                selected
                  ? "border-primary bg-primary/5 font-medium text-primary ring-1 ring-primary"
                  : "border-border bg-card hover:border-primary/40 hover:bg-accent",
              )}
            >
              {option.label}
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
        })}
      </div>
    </QuestionCard>
  )
}
