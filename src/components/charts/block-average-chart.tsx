"use client"

import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { TRAFFIC_LIGHT_LABEL } from "@/lib/analytics/traffic-light"
import type { TrafficLight } from "@/lib/analytics/types"
import { formatAverage } from "@/lib/format"
import { AXIS, GRID, STATUS_COLOR } from "./colors"
import { Legend, TooltipBox } from "./chart-tooltip"

export type BlockAverageDatum = { name: string; short: string; average: number | null; light: TrafficLight | null }

/** Promedio por bloque (1–5) coloreado por semáforo, con líneas de umbral. */
export function BlockAverageChart({
  data,
  strengthThreshold,
  improveThreshold,
}: {
  data: BlockAverageDatum[]
  strengthThreshold: number
  improveThreshold: number
}) {
  return (
    <div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barCategoryGap="22%">
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="short" {...AXIS} interval={0} angle={-35} textAnchor="end" height={64} />
            <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} {...AXIS} />
            <ReferenceLine y={strengthThreshold} stroke={STATUS_COLOR.STRENGTH} strokeDasharray="4 4" />
            <ReferenceLine y={improveThreshold} stroke={STATUS_COLOR.CRITICAL} strokeDasharray="4 4" />
            <Tooltip
              cursor={{ fill: "rgba(16,24,40,0.04)" }}
              content={({ active, payload }) => {
                const d = payload?.[0]?.payload as BlockAverageDatum | undefined
                if (!active || !d) return null
                return (
                  <TooltipBox
                    title={d.name}
                    items={[
                      { label: "Promedio", value: formatAverage(d.average) },
                      { label: "Semáforo", value: d.light ? TRAFFIC_LIGHT_LABEL[d.light] : "—" },
                    ]}
                  />
                )
              }}
            />
            <Bar dataKey="average" radius={[4, 4, 0, 0]} maxBarSize={36}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.light ? STATUS_COLOR[d.light] : "#d0d5dd"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Legend
        items={[
          { label: `Fortaleza (≥ ${formatAverage(strengthThreshold)})`, color: STATUS_COLOR.STRENGTH },
          { label: "A mejorar", color: STATUS_COLOR.IMPROVE },
          { label: `Crítico (< ${formatAverage(improveThreshold)})`, color: STATUS_COLOR.CRITICAL },
        ]}
      />
    </div>
  )
}
