import type { Metadata } from "next"
import { Suspense } from "react"
import { AlertsPanel } from "@/components/admin/alerts-panel"
import { BlockResultsTable } from "@/components/admin/block-results-table"
import { ExportButton } from "@/components/admin/export-button"
import { FrequencyGapCard } from "@/components/admin/frequency-gap-card"
import { HiddenLeadersNote, InsufficientData } from "@/components/admin/insufficient-data"
import { KpiGrid } from "@/components/admin/kpi-grid"
import { NpsCard } from "@/components/admin/nps-card"
import { PageHeader, Section } from "@/components/admin/page-header"
import { PriorityTable } from "@/components/admin/priority-table"
import { BlockCharts, LeaderComparison } from "@/components/admin/report-charts"
import { ResultsFilters } from "@/components/admin/results-filters"
import { parseResultsFilters } from "@/lib/data/filters"
import { getReportContext } from "@/lib/data/responses"

export const metadata: Metadata = { title: "Resultados generales" }

export default async function ResultsPage({ searchParams }: PageProps<"/admin/resultados">) {
  const filters = parseResultsFilters(await searchParams)
  const { report, settings, allLeaders } = await getReportContext(filters)
  const hidden = report.leaderSegments.filter((s) => !s.visible).map((s) => s.name)

  return (
    <>
      <PageHeader
        title="Resultados generales"
        description="Indicadores de las hojas Resultados y Resumen, calculados con los filtros seleccionados."
        actions={
          <Suspense>
            <ExportButton />
          </Suspense>
        }
      />
      <Suspense>
        <ResultsFilters leaders={allLeaders} />
      </Suspense>

      <div className="space-y-10">
        <KpiGrid report={report} settings={settings} />

        {report.insufficient ? (
          <InsufficientData count={report.responseCount} min={settings.minResponsesForSegment} />
        ) : (
          <>
            <Section title="Alertas cruzadas" description="Reglas del Excel: combinan bloques y preguntas clave.">
              <AlertsPanel alerts={report.alerts} threshold={settings.alertThreshold} />
            </Section>

            <Section
              id="bloques"
              title="Resultados por bloque"
              description="Promedio del bloque = promedio de los promedios de sus preguntas (igual que el Excel)."
            >
              <BlockResultsTable report={report} />
              <HiddenLeadersNote names={hidden} min={settings.minResponsesForSegment} />
              <BlockCharts report={report} settings={settings} />
              {report.leaders.length >= 2 && <LeaderComparison report={report} allLeaderIds={allLeaders.map((l) => l.id)} />}
            </Section>

            <Section id="nps" title="Recomendación del líder (NPS)" description="Pregunta G2, escala 0 a 10.">
              <NpsCard report={report} />
            </Section>

            <Section id="frecuencia" title="Frecuencia de acompañamiento (virtual, telefónico o campo)" description="Real (G3) vs. deseada (G4).">
              <FrequencyGapCard report={report} threshold={settings.frequencyGapThreshold} />
            </Section>

            <Section id="prioridades" title="Mapa de prioridades" description="Importancia (PR1) vs. desempeño del bloque relacionado.">
              <PriorityTable rows={report.priorities} strengthThreshold={settings.strengthThreshold} />
            </Section>
          </>
        )}
      </div>
    </>
  )
}
