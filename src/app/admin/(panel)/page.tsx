import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { AlertsPanel } from "@/components/admin/alerts-panel"
import { InsufficientData } from "@/components/admin/insufficient-data"
import { KpiGrid } from "@/components/admin/kpi-grid"
import { PageHeader, Section } from "@/components/admin/page-header"
import { BlockCharts } from "@/components/admin/report-charts"
import { SurveyStatusCard } from "@/components/admin/survey-status-card"
import { TrafficLightBadge } from "@/components/admin/traffic-light-badge"
import type { QuestionResult } from "@/lib/analytics/types"
import { getReportContext } from "@/lib/data/responses"
import { getPrimarySurvey } from "@/lib/data/surveys"
import { formatAverage } from "@/lib/format"

export const metadata: Metadata = { title: "Inicio" }

function QuestionList({ title, rows }: { title: string; rows: QuestionResult[] }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <p className="font-medium">{title}</p>
      <ul className="mt-3 divide-y">
        {rows.map((r) => (
          <li key={r.question.id} className="flex items-start gap-3 py-2.5">
            <span className="w-9 shrink-0 font-mono text-xs font-medium text-muted-foreground">{r.question.id}</span>
            <span className="min-w-0 flex-1 text-sm">{r.question.shortLabel}</span>
            <span className="text-sm font-medium tabular-nums">{formatAverage(r.average)}</span>
            <TrafficLightBadge value={r.trafficLight} compact />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function AdminHome() {
  const [survey, { report, settings }] = await Promise.all([getPrimarySurvey(), getReportContext({})])
  const ranked = report.questions.filter((q) => q.average !== null).sort((a, b) => (b.average ?? 0) - (a.average ?? 0))

  return (
    <>
      <PageHeader
        title="Inicio"
        description="Vista general de la encuesta de percepción de asesores sobre su liderazgo."
        actions={
          <Link href="/admin/resultados" className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-primary hover:bg-accent">
            Ver resultados completos
            <ArrowRight className="size-4" />
          </Link>
        }
      />
      <div className="space-y-10">
        <KpiGrid report={report} settings={settings} />
        {survey && <SurveyStatusCard surveyId={survey.id} active={survey.active} responses={report.responseCount} />}

        {report.insufficient ? (
          <InsufficientData count={report.responseCount} min={settings.minResponsesForSegment} />
        ) : (
          <>
            <Section title="Alertas cruzadas">
              <AlertsPanel alerts={report.alerts} threshold={settings.alertThreshold} />
            </Section>
            <Section title="Dónde estamos">
              <div className="grid gap-4 lg:grid-cols-2">
                <QuestionList title="Fortalezas: preguntas mejor evaluadas" rows={ranked.slice(0, 5)} />
                <QuestionList title="Puntos críticos: preguntas peor evaluadas" rows={ranked.slice(-5).reverse()} />
              </div>
              <BlockCharts report={report} settings={settings} />
            </Section>
          </>
        )}
      </div>
    </>
  )
}
