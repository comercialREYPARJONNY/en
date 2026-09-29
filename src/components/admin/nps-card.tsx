import { NpsChart, NpsGauge, type NpsDatum } from "@/components/charts/nps-chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { SurveyReport } from "@/lib/analytics/build-report"
import type { NpsResult } from "@/lib/analytics/types"
import { formatAverage, formatNps, formatPercent } from "@/lib/format"

/** Sección 2 del "Resumen": recomendación del líder (G2) y NPS. */
export function NpsCard({ report }: { report: SurveyReport }) {
  const columns: { id: string; name: string; result: NpsResult }[] = [
    { id: "total", name: "Total", result: report.nps.total },
    ...report.leaders.map((l) => ({ id: l.id, name: l.name, result: report.nps.byLeader[l.id] })),
  ]
  const chartData: NpsDatum[] = columns.map(({ name, result }) => ({ name, ...result }))
  const rows: { label: string; value: (r: NpsResult) => string }[] = [
    { label: "Promedio G2 (0–10)", value: (r) => formatAverage(r.average) },
    { label: "% Promotores (9–10)", value: (r) => formatPercent(r.promoters, 1) },
    { label: "% Pasivos (7–8)", value: (r) => formatPercent(r.passives, 1) },
    { label: "% Detractores (0–6)", value: (r) => formatPercent(r.detractors, 1) },
    { label: "NPS (−100 a +100)", value: (r) => formatNps(r.nps) },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
      <div className="rounded-2xl border bg-card p-5">
        <p className="text-sm text-muted-foreground">NPS del líder</p>
        <div className="mt-3">
          <NpsGauge value={report.nps.total.nps} />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          % promotores − % detractores sobre {report.nps.total.n} respuestas a G2.
        </p>
      </div>
      <div className="grid min-w-0 gap-4 rounded-2xl border bg-card p-4 sm:p-5">
        <NpsChart data={chartData} />
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Indicador</TableHead>
                {columns.map((c) => (
                  <TableHead key={c.id} className="text-right">
                    {c.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={row.label} className={i === rows.length - 1 ? "font-semibold" : undefined}>
                  <TableCell>{row.label}</TableCell>
                  {columns.map((c) => (
                    <TableCell key={c.id} className="text-right tabular-nums">
                      {row.value(c.result)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
