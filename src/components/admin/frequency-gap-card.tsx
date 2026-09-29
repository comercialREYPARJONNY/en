import { ArrowDown, ArrowUp, Equal } from "lucide-react"
import { FrequencyChart } from "@/components/charts/frequency-chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { SurveyReport } from "@/lib/analytics/build-report"
import type { FrequencyGapResult, FrequencyReading } from "@/lib/analytics/types"
import { EMPTY, formatAverage, formatSigned } from "@/lib/format"
import { cn } from "@/lib/utils"

function Reading({ value }: { value: FrequencyReading | null }) {
  if (!value) return <span className="text-muted-foreground">{EMPTY}</span>
  const Icon = value === "Falta acompañamiento" ? ArrowUp : value === "Sobra acompañamiento" ? ArrowDown : Equal
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        value === "Ajustado" ? "bg-secondary text-secondary-foreground" : "bg-improve-soft text-[oklch(0.5_0.12_70)]",
      )}
    >
      <Icon className="size-3.5" />
      {value}
    </span>
  )
}

/** Sección 3 del "Resumen": frecuencia real (G3) vs. deseada (G4) y brecha. */
export function FrequencyGapCard({ report, threshold }: { report: SurveyReport; threshold: number }) {
  const columns: { id: string; name: string; result: FrequencyGapResult }[] = [
    { id: "total", name: "Total", result: report.frequency.total },
    ...report.leaders.map((l) => ({ id: l.id, name: l.name, result: report.frequency.byLeader[l.id] })),
  ]
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border bg-card p-4 sm:p-5">
        <p className="font-medium">Distribución de respuestas</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Número de asesores por opción</p>
        <div className="mt-4">
          <FrequencyChart
            data={report.frequency.distribution.map((d) => ({ label: d.option.label, real: d.real, desired: d.desired }))}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5">
        <div>
          <p className="font-medium">Brecha de acompañamiento</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Nivel 0 = Nunca … 4 = Semanal. Brecha = deseado − real; significativa si supera ±{formatAverage(threshold)}.
          </p>
        </div>
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Nivel promedio</TableHead>
                {columns.map((c) => (
                  <TableHead key={c.id} className="text-right">
                    {c.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Real (G3)</TableCell>
                {columns.map((c) => (
                  <TableCell key={c.id} className="text-right tabular-nums">
                    {formatAverage(c.result.realAverage)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Deseado (G4)</TableCell>
                {columns.map((c) => (
                  <TableCell key={c.id} className="text-right tabular-nums">
                    {formatAverage(c.result.desiredAverage)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="font-semibold">
                <TableCell>Brecha</TableCell>
                {columns.map((c) => (
                  <TableCell key={c.id} className="text-right tabular-nums">
                    {formatSigned(c.result.gap)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell>Lectura</TableCell>
                {columns.map((c) => (
                  <TableCell key={c.id} className="text-right">
                    <Reading value={c.result.reading} />
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
