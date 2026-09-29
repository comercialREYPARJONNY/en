"use client"

import type { FrequencyLevel } from "@/lib/analytics/types"
import type { AnswerInput } from "@/lib/survey/submission-schema"
import type { PriorityDimension, SurveyQuestion } from "@/lib/survey/types"
import type { SurveyDraft } from "@/lib/survey/wizard"
import { FrequencyQuestion } from "./frequency-question"
import { LikertQuestion } from "./likert-question"
import { NpsQuestion } from "./nps-question"
import { OpenQuestion } from "./open-question"
import { RankingQuestion } from "./ranking-question"

type SectionProps = {
  title: string
  description?: string
  eyebrow: string
  children: React.ReactNode
}

export function SurveySection({ title, description, eyebrow, children }: SectionProps) {
  return (
    <section aria-labelledby="step-title" className="space-y-5">
      <header className="space-y-1.5">
        <p className="text-xs font-medium tracking-wide text-primary uppercase">{eyebrow}</p>
        <h2 id="step-title" className="text-2xl font-semibold tracking-tight text-balance">
          {title}
        </h2>
        {description && <p className="text-pretty text-muted-foreground">{description}</p>}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

type QuestionProps = {
  question: SurveyQuestion
  index: number
  draft: SurveyDraft
  frequencyOptions: FrequencyLevel[]
  error?: string
  onAnswer: (code: string, answer: AnswerInput) => void
  onRanking: (order: PriorityDimension[], confirmed: boolean) => void
}

/** Elige el componente según el tipo definido en la configuración central. */
function SurveyQuestionRenderer({ question, index, draft, frequencyOptions, error, onAnswer, onRanking }: QuestionProps) {
  const answer = draft.answers[question.id]
  const onChange = (next: AnswerInput) => onAnswer(question.id, next)

  switch (question.type) {
    case "likert":
    case "satisfaction":
      return <LikertQuestion question={question} index={index} answer={answer} error={error} onChange={onChange} />
    case "nps":
      return <NpsQuestion question={question} index={index} answer={answer} error={error} onChange={onChange} />
    case "frequency":
      return (
        <FrequencyQuestion
          question={question}
          index={index}
          options={frequencyOptions}
          answer={answer}
          error={error}
          onChange={onChange}
        />
      )
    case "ranking":
      return (
        <RankingQuestion
          question={question}
          order={draft.rankingOrder}
          confirmed={draft.rankingConfirmed}
          error={error}
          onChange={onRanking}
        />
      )
    case "open":
      return <OpenQuestion question={question} index={index} answer={answer} onChange={onChange} />
  }
}

SurveySection.Question = SurveyQuestionRenderer
