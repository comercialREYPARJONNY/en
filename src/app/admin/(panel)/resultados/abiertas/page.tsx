import type { Metadata } from "next"
import { Suspense } from "react"
import { CommentsList } from "@/components/admin/comments-list"
import { InsufficientData } from "@/components/admin/insufficient-data"
import { PageHeader } from "@/components/admin/page-header"
import { ResultsFilters } from "@/components/admin/results-filters"
import { collectComments } from "@/lib/analytics/collect-comments"
import { parseResultsFilters } from "@/lib/data/filters"
import { getReportContext } from "@/lib/data/responses"
import { OPEN_QUESTIONS } from "@/lib/survey/questions"

export const metadata: Metadata = { title: "Preguntas abiertas" }

export default async function OpenAnswersPage({ searchParams }: PageProps<"/admin/resultados/abiertas">) {
  const params = await searchParams
  // Esta vista solo filtra por líder.
  const filters = { leader: parseResultsFilters(params).leader }
  const { report, settings, allLeaders, responses } = await getReportContext(filters)

  const items = collectComments(responses, {
    source: "texts",
    questionIds: OPEN_QUESTIONS.map((q) => q.id),
    leaderNames: Object.fromEntries(allLeaders.map((l) => [l.id, l.name])),
    visibleLeaderIds: new Set(report.leaders.map((l) => l.id)),
  })

  return (
    <>
      <PageHeader title="Preguntas abiertas" description="Respuestas a O1–O4, sin información del participante." />
      <Suspense>
        <ResultsFilters leaders={allLeaders} compact />
      </Suspense>
      {report.insufficient ? (
        <InsufficientData count={report.responseCount} min={settings.minResponsesForSegment} />
      ) : (
        <CommentsList items={items} showQuestionText />
      )}
    </>
  )
}
