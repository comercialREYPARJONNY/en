import type { Metadata } from "next"
import { Suspense } from "react"
import { CommentsList } from "@/components/admin/comments-list"
import { InsufficientData } from "@/components/admin/insufficient-data"
import { PageHeader } from "@/components/admin/page-header"
import { ResultsFilters } from "@/components/admin/results-filters"
import { collectComments } from "@/lib/analytics/collect-comments"
import { parseResultsFilters } from "@/lib/data/filters"
import { getReportContext } from "@/lib/data/responses"
import { BLOCKS, COMMENTABLE_QUESTIONS } from "@/lib/survey/questions"

export const metadata: Metadata = { title: "Comentarios" }

export default async function CommentsPage({ searchParams }: PageProps<"/admin/resultados/comentarios">) {
  const params = await searchParams
  const filters = parseResultsFilters(params)
  const block = typeof params.block === "string" ? params.block : undefined
  const question = typeof params.question === "string" ? params.question : undefined
  const { report, settings, allLeaders, responses } = await getReportContext(filters)

  const blocksWithComments = BLOCKS.filter((b) => COMMENTABLE_QUESTIONS.some((q) => q.block === b.id))
  const questionOptions = COMMENTABLE_QUESTIONS.filter((q) => !block || q.block === block)
  const questionIds = questionOptions.filter((q) => !question || q.id === question).map((q) => q.id)

  const items = collectComments(responses, {
    source: "comments",
    questionIds,
    leaderNames: Object.fromEntries(allLeaders.map((l) => [l.id, l.name])),
    visibleLeaderIds: new Set(report.leaders.map((l) => l.id)),
  })

  return (
    <>
      <PageHeader
        title="Comentarios"
        description="Comentarios opcionales que acompañan las respuestas de escala. Se muestran sin información del participante y en orden alfabético."
      />
      <Suspense>
        <ResultsFilters
          leaders={allLeaders}
          extra={[
            {
              name: "block",
              label: "Bloque",
              options: blocksWithComments.map((b) => ({ value: b.id, label: b.name })),
              resets: ["question"],
            },
            {
              name: "question",
              label: "Pregunta",
              options: questionOptions.map((q) => ({ value: q.id, label: `${q.id} — ${q.shortLabel}` })),
            },
          ]}
        />
      </Suspense>
      {report.insufficient ? (
        <InsufficientData count={report.responseCount} min={settings.minResponsesForSegment} />
      ) : (
        <CommentsList items={items} />
      )}
    </>
  )
}
