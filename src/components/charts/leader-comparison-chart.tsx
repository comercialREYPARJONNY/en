"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { formatAverage } from "@/lib/format"
import { AXIS, GRID } from "./colors"
import { Legend, TooltipBox } from "./chart-tooltip"

export type LeaderSeries = { id: string; name: string; color: string }
export type LeaderComparisonDatum = { name: string; short: string } & Record<string, number | string | null>

/** Promedio por bloque agrupado por líder. */
export function LeaderComparisonChart({ data, leaders }: { data: LeaderComparisonDatum[]; leaders: LeaderSeries[] }) {
  return (
    <div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barGap={2} barCategoryGap="20%">
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="short" {...AXIS} interval={0} angle={-35} textAnchor="end" height={64} />
            <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} {...AXIS} />
            <Tooltip
              cursor={{ fill: "rgba(16,24,40,0.04)" }}
              content={({ active, payload }) => {
                const d = payload?.[0]?.payload as LeaderComparisonDatum | undefined
                if (!active || !d) return null
                return (
                  <TooltipBox
                    title={d.name}
                    items={leaders.map((l) => ({
                      label: l.name,
                      value: formatAverage((d[l.id] as number | null) ?? null),
                      color: l.color,
                    }))}
                  />
                )
              }}
            />
            {leaders.map((l) => (
              <Bar key={l.id} dataKey={l.id} name={l.name} fill={l.color} radius={[4, 4, 0, 0]} maxBarSize={22} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Legend items={leaders.map((l) => ({ label: l.name, color: l.color }))} />
    </div>
  )
}
