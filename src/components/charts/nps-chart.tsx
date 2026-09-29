"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { formatNps, formatPercent } from "@/lib/format"
import { AXIS, GRID, NPS_COLORS } from "./colors"
import { Legend, TooltipBox } from "./chart-tooltip"

export type NpsDatum = {
  name: string
  detractors: number | null
  passives: number | null
  promoters: number | null
  nps: number | null
  n: number
}

/** Composición promotores / pasivos / detractores (barras apiladas al 100%). */
export function NpsChart({ data }: { data: NpsDatum[] }) {
  return (
    <div>
      <div style={{ height: data.length * 52 + 36 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid horizontal={false} stroke={GRID} />
            <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} {...AXIS} />
            <YAxis type="category" dataKey="name" width={90} {...AXIS} tick={{ fill: "#475467", fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: "rgba(16,24,40,0.04)" }}
              content={({ active, payload }) => {
                const d = payload?.[0]?.payload as NpsDatum | undefined
                if (!active || !d) return null
                return (
                  <TooltipBox
                    title={`${d.name} · NPS ${formatNps(d.nps)}`}
                    items={[
                      { label: "Promotores (9–10)", value: formatPercent(d.promoters), color: NPS_COLORS.promoters },
                      { label: "Pasivos (7–8)", value: formatPercent(d.passives), color: NPS_COLORS.passives },
                      { label: "Detractores (0–6)", value: formatPercent(d.detractors), color: NPS_COLORS.detractors },
                      { label: "Respuestas", value: String(d.n) },
                    ]}
                  />
                )
              }}
            />
            <Bar dataKey="detractors" stackId="nps" fill={NPS_COLORS.detractors} stroke="#fff" strokeWidth={2} maxBarSize={26} />
            <Bar dataKey="passives" stackId="nps" fill={NPS_COLORS.passives} stroke="#fff" strokeWidth={2} maxBarSize={26} />
            <Bar dataKey="promoters" stackId="nps" fill={NPS_COLORS.promoters} stroke="#fff" strokeWidth={2} radius={[0, 4, 4, 0]} maxBarSize={26} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Legend
        items={[
          { label: "Detractores (0–6)", color: NPS_COLORS.detractors },
          { label: "Pasivos (7–8)", color: NPS_COLORS.passives },
          { label: "Promotores (9–10)", color: NPS_COLORS.promoters },
        ]}
      />
    </div>
  )
}

/** Indicador NPS en escala −100 a +100. */
export function NpsGauge({ value }: { value: number | null }) {
  const position = value === null ? null : ((value + 100) / 200) * 100
  return (
    <div className="space-y-2">
      <p className="text-4xl font-semibold tracking-tight tabular-nums">{formatNps(value)}</p>
      <div className="relative h-2 rounded-full bg-gradient-to-r from-[#d6453d]/25 via-[#b6bcc6]/40 to-[#1f9254]/30">
        <span className="absolute top-1/2 left-1/2 h-3 w-px -translate-y-1/2 bg-muted-foreground/50" aria-hidden />
        {position !== null && (
          <span
            className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-foreground shadow"
            style={{ left: `${position}%` }}
            aria-hidden
          />
        )}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
        <span>−100</span>
        <span>0</span>
        <span>+100</span>
      </div>
    </div>
  )
}
