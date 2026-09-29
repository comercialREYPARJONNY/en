"use client"

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

const VALUES = Array.from({ length: 11 }, (_, i) => i)

/** G2: escala 0–10 para NPS. */
export function NpsQuestion({ question, index, answer, error, onChange }: Props) {
  return (
    <QuestionCard id={question.id} index={index} text={question.text} error={error}>
      <div>
        <div role="radiogroup" aria-label={question.text} className="grid grid-cols-6 gap-1.5 sm:grid-cols-11 sm:gap-1.5">
          {VALUES.map((value) => (
            <ChoiceButton
              key={value}
              selected={answer?.value === value}
              onSelect={() => onChange({ ...answer, value })}
              label={String(value)}
              className="h-11 sm:h-12 sm:text-base"
            >
              {value}
            </ChoiceButton>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>0 = {question.scaleHint?.min}</span>
          <span>10 = {question.scaleHint?.max}</span>
        </div>
      </div>
      {question.allowComment && (
        <CommentField value={answer?.comment} onChange={(comment) => onChange({ ...answer, comment })} />
      )}
    </QuestionCard>
  )
}
