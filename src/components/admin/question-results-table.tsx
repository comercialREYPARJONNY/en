import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { LeaderRef, QuestionResult } from "@/lib/analytics/types"
import { formatAverage, formatPercent, formatSigned } from "@/lib/format"
import { ScoreCell, TrafficLightBadge } from "./traffic-light-badge"

/** Equivalente a la hoja "Resultados". Soporta N líderes (columnas dinámicas). */
export function QuestionResultsTable({ rows, leaders }: { rows: QuestionResult[]; leaders: LeaderRef[] }) {
  const diffLabel = leaders.length === 2 ? `Dif. ${leaders[0].name} − ${leaders[1].name}` : "Brecha máx − mín"
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>Código</TableHead>
            <TableHead>Bloque</TableHead>
            <TableHead>Pregunta</TableHead>
            <TableHead className="text-right">N.º resp.</TableHead>
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.question.id}>
              <TableCell className="font-mono text-xs font-medium">{r.question.id}</TableCell>
              <TableCell className="text-muted-foreground">{r.blockName}</TableCell>
              <TableCell className="max-w-md min-w-72 whitespace-normal">{r.question.text}</TableCell>
              <TableCell className="text-right tabular-nums">{r.n}</TableCell>
              <TableCell className="text-right font-medium">
                <ScoreCell value={r.average} light={r.trafficLight} format={formatAverage} />
              </TableCell>
              {leaders.map((l) => (
                <TableCell key={l.id} className="text-right">
                  <ScoreCell value={r.byLeader[l.id]?.average ?? null} light={r.byLeader[l.id]?.trafficLight ?? null} format={formatAverage} />
                </TableCell>
              ))}
              {leaders.length >= 2 && (
                <TableCell className="text-right tabular-nums text-muted-foreground">{formatSigned(r.leaderDifference)}</TableCell>
              )}
              <TableCell className="text-right tabular-nums">{formatPercent(r.favorability)}</TableCell>
              {leaders.map((l) => (
                <TableCell key={l.id} className="text-right tabular-nums">
                  {formatPercent(r.byLeader[l.id]?.favorability ?? null)}
                </TableCell>
              ))}
              <TableCell>
                <TrafficLightBadge value={r.trafficLight} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
