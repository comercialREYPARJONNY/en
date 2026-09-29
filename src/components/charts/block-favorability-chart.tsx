"use client"

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { formatPercent } from "@/lib/format"
import { AXIS, CATEGORICAL, GRID } from "./colors"
import { TooltipBox } from "./chart-tooltip"

export type FavorabilityDatum = { name: string; favorability: number | null }

/** % favorable por bloque (barras horizontales, ordenadas de mayor a menor). */
export function BlockFavorabilityChart({ data }: { data: FavorabilityDatum[] }) {
  const sorted = [...data].sort((a, b) => (b.favorability ?? -1) - (a.favorability ?? -1))
  return (
    <div style={{ height: Math.max(240, sorted.length * 30 + 20) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 44, left: 0, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid horizontal={false} stroke={GRID} />
          <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} {...AXIS} />
          <YAxis type="category" dataKey="name" width={170} {...AXIS} tick={{ fill: "#475467", fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: "rgba(16,24,40,0.04)" }}
            content={({ active, payload }) => {
              const d = payload?.[0]?.payload as FavorabilityDatum | undefined
              if (!active || !d) return null
              return <TooltipBox title={d.name} items={[{ label: "% favorable", value: formatPercent(d.favorability, 1) }]} />
            }}
          />
          <Bar dataKey="favorability" fill={CATEGORICAL[0]} radius={[0, 4, 4, 0]} maxBarSize={18}>
            <LabelList
              dataKey="favorability"
              position="right"
              formatter={(v: unknown) => formatPercent(typeof v === "number" ? v : null)}
              style={{ fill: "#475467", fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
