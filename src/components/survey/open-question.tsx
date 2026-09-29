"use client"

import { Textarea } from "@/components/ui/textarea"
import { OPEN_ANSWER_MAX_LENGTH } from "@/lib/survey/submission-schema"
import type { AnswerInput } from "@/lib/survey/submission-schema"
import type { SurveyQuestion } from "@/lib/survey/types"
import { QuestionCard } from "./question-card"

type Props = {
  question: SurveyQuestion
  index: number
  answer: AnswerInput | undefined
  onChange: (answer: AnswerInput) => void
}

export function OpenQuestion({ question, index, answer, onChange }: Props) {
  const length = answer?.text?.length ?? 0
  return (
    <QuestionCard id={question.id} index={index} text={question.text}>
      <Textarea
        aria-label={question.text}
        value={answer?.text ?? ""}
        maxLength={OPEN_ANSWER_MAX_LENGTH}
        onChange={(e) => onChange({ text: e.target.value })}
        placeholder="Escriba aquí (opcional)"
        className="min-h-28 resize-y text-base md:text-sm"
      />
      {length > OPEN_ANSWER_MAX_LENGTH * 0.8 && (
        <p className="text-right text-xs text-muted-foreground tabular-nums">
          {length} / {OPEN_ANSWER_MAX_LENGTH}
        </p>
      )}
    </QuestionCard>
  )
}
