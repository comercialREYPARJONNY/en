"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { AXIS, CATEGORICAL, GRID } from "./colors"
import { Legend, TooltipBox } from "./chart-tooltip"

export type FrequencyDatum = { label: string; real: number; desired: number }

const REAL = CATEGORICAL[0]
const DESIRED = CATEGORICAL[1]

/** Acompañamiento real (G3) vs. deseado (G4): número de respuestas por opción. */
export function FrequencyChart({ data }: { data: FrequencyDatum[] }) {
  return (
    <div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }} barGap={2} barCategoryGap="24%">
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="label" {...AXIS} interval={0} tick={{ fill: "#667085", fontSize: 11 }} />
            <YAxis allowDecimals={false} {...AXIS} />
            <Tooltip
              cursor={{ fill: "rgba(16,24,40,0.04)" }}
              content={({ active, payload }) => {
                const d = payload?.[0]?.payload as FrequencyDatum | undefined
                if (!active || !d) return null
                return (
                  <TooltipBox
                    title={d.label}
                    items={[
                      { label: "Real (G3)", value: String(d.real), color: REAL },
                      { label: "Deseado (G4)", value: String(d.desired), color: DESIRED },
                    ]}
                  />
                )
              }}
            />
            <Bar dataKey="real" name="Real (G3)" fill={REAL} radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="desired" name="Deseado (G4)" fill={DESIRED} radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <Legend
        items={[
          { label: "Real (G3)", color: REAL },
          { label: "Deseado (G4)", color: DESIRED },
        ]}
      />
    </div>
  )
}
