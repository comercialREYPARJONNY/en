import { PriorityMatrix } from "@/components/charts/priority-matrix"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { PriorityReading, PriorityRow } from "@/lib/analytics/types"
import { EMPTY, formatAverage } from "@/lib/format"
import { cn } from "@/lib/utils"

const READING_STYLE: Record<PriorityReading, string> = {
  "Invertir primero": "bg-critical-soft text-critical",
  Mantener: "bg-strength-soft text-strength",
  "Mejorar después": "bg-improve-soft text-[oklch(0.5_0.12_70)]",
  "Sin urgencia": "bg-secondary text-secondary-foreground",
}

/** Sección 4 del "Resumen": importancia (PR1) vs. desempeño del bloque. */
export function PriorityTable({ rows, strengthThreshold }: { rows: PriorityRow[]; strengthThreshold: number }) {
  const points = rows
    .filter((r) => r.averageRank !== null && r.performance !== null && r.position !== null)
    .map((r) => ({
      label: r.label,
      position: r.position as number,
      importance: 6 - (r.averageRank as number),
      averageRank: r.averageRank as number,
      performance: r.performance as number,
      reading: r.reading,
    }))
  const sorted = [...rows].sort((a, b) => (a.position ?? 99) - (b.position ?? 99))

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_26rem]">
      <div className="overflow-hidden rounded-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Aspecto</TableHead>
              <TableHead className="text-right">Ranking promedio</TableHead>
              <TableHead className="text-right">Posición</TableHead>
              <TableHead className="text-right">Desempeño</TableHead>
              <TableHead>Lectura</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((r) => (
              <TableRow key={r.dimension}>
                <TableCell className="whitespace-normal">
                  <p className="font-medium">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.blockName}</p>
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatAverage(r.averageRank)}</TableCell>
                <TableCell className="text-right tabular-nums">{r.position ?? EMPTY}</TableCell>
                <TableCell className="text-right tabular-nums">{formatAverage(r.performance)}</TableCell>
                <TableCell>
                  {r.reading ? (
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", READING_STYLE[r.reading])}>
                      {r.reading}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">{EMPTY}</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="border-t px-4 py-3 text-xs text-muted-foreground">
          Invertir primero = está entre los 2 aspectos más importantes y su desempeño es menor al umbral de Fortaleza (
          {formatAverage(strengthThreshold)}). Ranking: 1 = más importante.
        </p>
      </div>
      <div className="rounded-2xl border bg-card p-4 sm:p-5">
        <p className="font-medium">Importancia vs. desempeño</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Cada punto muestra su posición de importancia (ver tabla). Importancia = 6 − ranking promedio; color = lectura.
        </p>
        <PriorityMatrix data={points} strengthThreshold={strengthThreshold} />
      </div>
    </div>
  )
}
