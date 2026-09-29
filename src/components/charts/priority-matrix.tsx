"use client"

import {
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { PriorityReading } from "@/lib/analytics/types"
import { formatAverage } from "@/lib/format"
import { AXIS, GRID, STATUS_COLOR } from "./colors"
import { Legend, TooltipBox } from "./chart-tooltip"

export type PriorityPoint = {
  label: string
  /** Posición de importancia (1 = más importante), usada como etiqueta del punto. */
  position: number
  /** Importancia = 6 − ranking promedio (5 = más importante). */
  importance: number
  averageRank: number
  performance: number
  reading: PriorityReading | null
}

export const READING_COLOR: Record<PriorityReading, string> = {
  "Invertir primero": STATUS_COLOR.CRITICAL,
  "Mejorar después": STATUS_COLOR.IMPROVE,
  Mantener: STATUS_COLOR.STRENGTH,
  "Sin urgencia": "#98a2b3",
}

const pad = (min: number, max: number, step: number, floor: number, ceil: number) => [
  Math.max(floor, Math.floor((min - step / 2) / step) * step),
  Math.min(ceil, Math.ceil((max + step / 2) / step) * step),
]

/** Matriz importancia (PR1) vs. desempeño del bloque. El color es la lectura del Excel. */
export function PriorityMatrix({ data, strengthThreshold }: { data: PriorityPoint[]; strengthThreshold: number }) {
  if (data.length === 0) return <p className="py-10 text-center text-sm text-muted-foreground">Sin datos de PR1.</p>

  const xDomain = pad(Math.min(...data.map((d) => d.importance)), Math.max(...data.map((d) => d.importance)), 0.5, 1, 5)
  const yDomain = pad(
    Math.min(strengthThreshold, ...data.map((d) => d.performance)),
    Math.max(strengthThreshold, ...data.map((d) => d.performance)),
    0.5,
    1,
    5,
  )
  const ticks = (domain: number[]) => {
    const values: number[] = []
    for (let v = domain[0]; v <= domain[1] + 1e-9; v += 0.5) values.push(v)
    return values
  }
  const used = [...new Set(data.map((d) => d.reading).filter(Boolean))] as PriorityReading[]

  return (
    <div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 24, left: -8, bottom: 16 }}>
            <CartesianGrid stroke={GRID} />
            <XAxis
              type="number"
              dataKey="importance"
              domain={xDomain}
              ticks={ticks(xDomain)}
              {...AXIS}
              tickFormatter={(v) => formatAverage(v)}
              label={{ value: "Importancia →", position: "insideBottomRight", offset: -8, fill: "#667085", fontSize: 12 }}
            />
            <YAxis
              type="number"
              dataKey="performance"
              domain={yDomain}
              ticks={ticks(yDomain)}
              {...AXIS}
              tickFormatter={(v) => formatAverage(v)}
              label={{ value: "Desempeño", angle: -90, position: "insideLeft", offset: 20, fill: "#667085", fontSize: 12 }}
            />
            <ReferenceLine
              y={strengthThreshold}
              stroke={STATUS_COLOR.STRENGTH}
              strokeDasharray="4 4"
              label={{ value: "Fortaleza", position: "insideTopRight", fill: "#667085", fontSize: 11 }}
            />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                const d = payload?.[0]?.payload as PriorityPoint | undefined
                if (!active || !d) return null
                return (
                  <TooltipBox
                    title={`${d.position}. ${d.label}`}
                    items={[
                      { label: "Ranking promedio", value: formatAverage(d.averageRank) },
                      { label: "Desempeño", value: formatAverage(d.performance) },
                      { label: "Lectura", value: d.reading ?? "—" },
                    ]}
                  />
                )
              }}
            />
            <Scatter data={data} stroke="#fff" strokeWidth={2} shape="circle">
              {data.map((d) => (
                <Cell key={d.label} fill={d.reading ? READING_COLOR[d.reading] : "#98a2b3"} />
              ))}
              <LabelList dataKey="position" position="top" offset={8} style={{ fill: "#344054", fontSize: 12, fontWeight: 600 }} />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <Legend items={used.map((r) => ({ label: r, color: READING_COLOR[r] }))} />
    </div>
  )
}
