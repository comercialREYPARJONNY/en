import { BlockAverageChart } from "@/components/charts/block-average-chart"
import { BlockFavorabilityChart } from "@/components/charts/block-favorability-chart"
import { ChartCard } from "@/components/charts/chart-tooltip"
import { leaderColor } from "@/components/charts/colors"
import { LeaderComparisonChart } from "@/components/charts/leader-comparison-chart"
import type { SurveyReport } from "@/lib/analytics/build-report"
import type { AnalyticsSettings } from "@/lib/analytics/types"
import type { BlockId } from "@/lib/survey/types"

export const SHORT_BLOCK_NAME: Partial<Record<BlockId, string>> = {
  LEADERSHIP: "Liderazgo",
  FOLLOW_UP: "Seguimiento",
  CONTROL: "Control",
  SUPPORT: "Acompañamiento",
  ADDED_VALUE: "Valor agregado",
  GLOBAL: "Eval. global",
  COMMUNICATION: "Comunicación",
  DECISIONS: "Decisiones",
  COMMERCIAL_TRAINING: "Form. comercial",
  TECHNICAL_TRAINING: "Form. técnica",
  METHODOLOGY: "Metodología",
}

export function BlockCharts({ report, settings }: { report: SurveyReport; settings: AnalyticsSettings }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ChartCard title="Promedio por bloque" description="Escala 1–5 · líneas: umbrales de Fortaleza y Crítico">
        <BlockAverageChart
          data={report.blocks.map((b) => ({
            name: b.block.name,
            short: SHORT_BLOCK_NAME[b.block.id] ?? b.block.name,
            average: b.average,
            light: b.trafficLight,
          }))}
          strengthThreshold={settings.strengthThreshold}
          improveThreshold={settings.improveThreshold}
        />
      </ChartCard>
      <ChartCard title="Favorabilidad por bloque" description={`% de respuestas ≥ ${settings.favorableMin}`}>
        <BlockFavorabilityChart data={report.blocks.map((b) => ({ name: b.block.name, favorability: b.favorability }))} />
      </ChartCard>
    </div>
  )
}

export function LeaderComparison({ report, allLeaderIds }: { report: SurveyReport; allLeaderIds: string[] }) {
  const leaders = report.leaders.map((l) => ({ ...l, color: leaderColor(allLeaderIds, l.id) }))
  const data = report.blocks.map((b) => ({
    name: b.block.name,
    short: SHORT_BLOCK_NAME[b.block.id] ?? b.block.name,
    ...Object.fromEntries(report.leaders.map((l) => [l.id, b.byLeader[l.id]?.average ?? null])),
  }))
  return (
    <ChartCard title="Comparación de líderes" description="Promedio por bloque (1–5)">
      <LeaderComparisonChart data={data} leaders={leaders} />
    </ChartCard>
  )
}
