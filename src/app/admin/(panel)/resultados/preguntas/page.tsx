import type { Metadata } from "next"
import { Suspense } from "react"
import { ExportButton } from "@/components/admin/export-button"
import { HiddenLeadersNote, InsufficientData } from "@/components/admin/insufficient-data"
import { PageHeader } from "@/components/admin/page-header"
import { QuestionResultsTable } from "@/components/admin/question-results-table"
import { ResultsFilters } from "@/components/admin/results-filters"
import { parseResultsFilters } from "@/lib/data/filters"
import { getReportContext } from "@/lib/data/responses"
import { SCORED_BLOCKS } from "@/lib/survey/questions"

export const metadata: Metadata = { title: "Resultados por pregunta" }

export default async function QuestionResultsPage({ searchParams }: PageProps<"/admin/resultados/preguntas">) {
  const params = await searchParams
  const filters = parseResultsFilters(params)
  const block = typeof params.block === "string" ? params.block : undefined
  const { report, settings, allLeaders } = await getReportContext(filters)
  const rows = block ? report.questions.filter((q) => q.question.block === block) : report.questions
  const hidden = report.leaderSegments.filter((s) => !s.visible).map((s) => s.name)

  return (
    <>
      <PageHeader
        title="Resultados por pregunta"
        description={`Equivalente a la hoja Resultados: promedio (1–5), % favorable (notas ≥ ${settings.favorableMin}) y semáforo. N/A y vacíos no cuentan.`}
        actions={
          <Suspense>
            <ExportButton />
          </Suspense>
        }
      />
      <Suspense>
        <ResultsFilters
          leaders={allLeaders}
          extra={[{ name: "block", label: "Bloque", options: SCORED_BLOCKS.map((b) => ({ value: b.id, label: b.name })) }]}
        />
      </Suspense>
      {report.insufficient ? (
        <InsufficientData count={report.responseCount} min={settings.minResponsesForSegment} />
      ) : (
        <div className="space-y-3">
          <QuestionResultsTable rows={rows} leaders={report.leaders} />
          <HiddenLeadersNote names={hidden} min={settings.minResponsesForSegment} />
        </div>
      )}
    </>
  )
}
