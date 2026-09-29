import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { SurveyReport } from "@/lib/analytics/build-report"
import type { BlockResult } from "@/lib/analytics/types"
import { formatAverage, formatPercent, formatSigned } from "@/lib/format"
import { cn } from "@/lib/utils"
import { TrafficLightBadge } from "./traffic-light-badge"

function Row({ result, report, total }: { result: BlockResult; report: SurveyReport; total?: boolean }) {
  const showDiff = report.leaders.length >= 2
  return (
    <TableRow className={cn(total && "border-t-2 bg-muted/40 font-semibold hover:bg-muted/40")}>
      <TableCell className="min-w-44 whitespace-normal">{result.block.name}</TableCell>
      <TableCell className="text-right tabular-nums">{result.questionCount}</TableCell>
      <TableCell className="text-right font-medium tabular-nums">{formatAverage(result.average)}</TableCell>
      {report.leaders.map((l) => (
        <TableCell key={l.id} className="text-right tabular-nums">
          {formatAverage(result.byLeader[l.id]?.average ?? null)}
        </TableCell>
      ))}
      {showDiff && <TableCell className="text-right tabular-nums text-muted-foreground">{formatSigned(result.leaderDifference)}</TableCell>}
      <TableCell className="text-right tabular-nums">{formatPercent(result.favorability)}</TableCell>
      {report.leaders.map((l) => (
        <TableCell key={l.id} className="text-right tabular-nums">
          {formatPercent(result.byLeader[l.id]?.favorability ?? null)}
        </TableCell>
      ))}
      <TableCell>
        <TrafficLightBadge value={result.trafficLight} />
      </TableCell>
      {report.leaders.length > 1 &&
        report.leaders.map((l) => (
          <TableCell key={l.id} className="text-center">
            <TrafficLightBadge value={result.byLeader[l.id]?.trafficLight ?? null} compact />
          </TableCell>
        ))}
    </TableRow>
  )
}

/** Sección 1 del "Resumen": resultados por bloque + PROMEDIO GENERAL. */
export function BlockResultsTable({ report }: { report: SurveyReport }) {
  const leaders = report.leaders
  const diffLabel = leaders.length === 2 ? `Dif. ${leaders[0].name} − ${leaders[1].name}` : "Brecha máx − mín"
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>Bloque</TableHead>
            <TableHead className="text-right">N.º preg.</TableHead>
            <TableHead className="text-right">Prom. total</TableHead>
            {leaders.map((l) => (
              <TableHead key={l.id} className="text-right">
                Prom. {l.name}
              </TableHead>
            ))}
            {leaders.length >= 2 && <TableHead className="text-right">{diffLabel}</TableHead>}
            <TableHead className="text-right">% fav. total</TableHead>
            {leaders.map((l) => (
              <TableHead key={l.id} className="text-right">
                % fav. {l.name}
              </TableHead>
            ))}
            <TableHead>Semáforo</TableHead>
            {leaders.length > 1 &&
              leaders.map((l) => (
                <TableHead key={l.id} className="text-center">
                  {l.name}
                </TableHead>
              ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {report.blocks.map((b) => (
            <Row key={b.block.id} result={b} report={report} />
          ))}
          <Row result={report.general} report={report} total />
        </TableBody>
      </Table>
    </div>
  )
}
