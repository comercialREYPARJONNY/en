import { Quote } from "lucide-react"
import type { QuestionComments } from "@/lib/analytics/collect-comments"
import { getBlock, getQuestion } from "@/lib/survey/questions"

/** Lista de comentarios por pregunta y líder. Nunca muestra UUID, fecha ni datos del participante. */
export function CommentsList({ items, showQuestionText }: { items: QuestionComments[]; showQuestionText?: boolean }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-card px-6 py-14 text-center text-sm text-muted-foreground">
        No hay comentarios con estos filtros.
      </div>
    )
  }
  return (
    <div className="space-y-4">
      {items.map(({ questionId, groups, total }) => {
        const question = getQuestion(questionId)
        return (
          <article key={questionId} className="rounded-2xl border bg-card p-4 sm:p-5">
            <header className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-medium">
                  <span className="font-mono text-sm text-primary">{questionId}</span> — {question?.shortLabel}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {question && getBlock(question.block).name}
                  {showQuestionText && question ? ` · ${question.text}` : ""}
                </p>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {total} {total === 1 ? "comentario" : "comentarios"}
              </span>
            </header>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {groups.map((group) => (
                <div key={group.leader}>
                  <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">{group.leader}</p>
                  <ul className="space-y-2">
                    {group.texts.map((text, i) => (
                      <li key={i} className="flex gap-2 rounded-xl bg-muted/50 px-3 py-2.5 text-sm leading-relaxed">
                        <Quote className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/60" />
                        <span className="text-pretty whitespace-pre-line">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </article>
        )
      })}
    </div>
  )
}
