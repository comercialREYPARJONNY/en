"use client"

import { LIKERT_SCALE, NOT_APPLICABLE_LABEL } from "@/lib/survey/questions"
import type { AnswerInput } from "@/lib/survey/submission-schema"
import type { SurveyQuestion } from "@/lib/survey/types"
import { ChoiceButton } from "./choice-button"
import { CommentField } from "./comment-field"
import { QuestionCard } from "./question-card"

type Props = {
  question: SurveyQuestion
  index: number
  answer: AnswerInput | undefined
  error?: string
  onChange: (answer: AnswerInput) => void
}

/** Escala 1–5 + N/A. También se usa para G1 (satisfacción) con sus propios extremos. */
export function LikertQuestion({ question, index, answer, error, onChange }: Props) {
  const minLabel = question.scaleHint?.min ?? LIKERT_SCALE[0].label
  const maxLabel = question.scaleHint?.max ?? LIKERT_SCALE[4].label

  return (
    <QuestionCard id={question.id} index={index} text={question.text} error={error}>
      <div>
        <div role="radiogroup" aria-label={question.text} className="grid grid-cols-6 gap-1.5 sm:gap-2">
          {LIKERT_SCALE.map((option) => (
            <ChoiceButton
              key={option.value}
              selected={answer?.value === option.value}
              onSelect={() => onChange({ ...answer, value: option.value })}
              label={
                question.type === "satisfaction" && option.value === 1
                  ? `1 · ${minLabel}`
                  : question.type === "satisfaction" && option.value === 5
                    ? `5 · ${maxLabel}`
                    : `${option.value} · ${option.label}`
              }
            >
              {option.value}
            </ChoiceButton>
          ))}
          <ChoiceButton
            selected={answer?.value === "NA"}
            onSelect={() => onChange({ ...answer, value: "NA" })}
            label={`N/A · ${NOT_APPLICABLE_LABEL}`}
            className="text-sm sm:text-base"
          >
            N/A
          </ChoiceButton>
        </div>
        <div className="mt-2 grid grid-cols-6 gap-1.5 text-[0.7rem] leading-tight text-muted-foreground sm:gap-2 sm:text-xs">
          <span className="col-span-2">{minLabel}</span>
          <span className="col-span-3 text-right">{maxLabel}</span>
          <span className="text-center">{NOT_APPLICABLE_LABEL}</span>
        </div>
      </div>
      {question.allowComment && (
        <CommentField value={answer?.comment} onChange={(comment) => onChange({ ...answer, comment })} />
      )}
    </QuestionCard>
  )
}
