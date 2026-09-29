import { CalendarClock, ClipboardCheck, Gauge, ThumbsUp, TrendingUp, Users } from "lucide-react"
import type { SurveyReport } from "@/lib/analytics/build-report"
import { classifyTrafficLight } from "@/lib/analytics/traffic-light"
import type { AnalyticsSettings } from "@/lib/analytics/types"
import { formatAverage, formatDate, formatNps, formatPercent } from "@/lib/format"
import { MetricCard } from "./metric-card"
import { TrafficLightBadge } from "./traffic-light-badge"

export function KpiGrid({ report, settings, hideScores }: { report: SurveyReport; settings: AnalyticsSettings; hideScores?: boolean }) {
  const { kpis } = report
  const masked = hideScores || report.insufficient
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <MetricCard label="Encuestas completadas" value={kpis.completed} icon={ClipboardCheck} />
      <MetricCard
        label="Promedio general"
        value={masked ? "—" : formatAverage(kpis.generalAverage)}
        hint={masked ? "Escala 1–5" : <TrafficLightBadge value={classifyTrafficLight(kpis.generalAverage, settings)} />}
        icon={TrendingUp}
      />
      <MetricCard
        label="% favorable general"
        value={masked ? "—" : formatPercent(kpis.generalFavorability)}
        hint={`Notas ≥ ${settings.favorableMin}`}
        icon={ThumbsUp}
      />
      <MetricCard label="NPS" value={masked ? "—" : formatNps(kpis.nps)} hint="Escala −100 a +100" icon={Gauge} />
      <MetricCard label="Líderes evaluados" value={kpis.leadersEvaluated} icon={Users} />
      <MetricCard label="Última respuesta" value={<span className="text-lg sm:text-xl">{formatDate(kpis.lastResponseAt)}</span>} icon={CalendarClock} />
    </div>
  )
}
