import { describe, expect, it } from "vitest"
import { buildSurveyReport } from "../build-report"
import { RESULT_QUESTIONS } from "@/lib/survey/questions"
import { frequencyOptions, response, settings } from "./fixtures"

const leaders = [
  { id: "A", name: "Líder A" },
  { id: "B", name: "Líder B" },
]

function allScores(value: number | null): Record<string, number | null> {
  return Object.fromEntries(RESULT_QUESTIONS.map((q) => [q.id, value]))
}

describe("reporte completo", () => {
  it("la hoja Resultados tiene 61 preguntas (Likert + G1)", () => {
    expect(RESULT_QUESTIONS).toHaveLength(61)
    expect(RESULT_QUESTIONS.map((q) => q.id)).toContain("G1")
    expect(RESULT_QUESTIONS.map((q) => q.id)).not.toContain("G2")
  })

  it("promedio de bloque = promedio de promedios por pregunta (como el Excel)", () => {
    // L1 lo responden 3 personas (5,5,5) y L2 solo 1 (1). Pooled = 4; Excel = (5 + 1) / 2 = 3.
    const responses = [
      response({ scores: { L1: 5, L2: 1 } }),
      response({ scores: { L1: 5, L2: null } }),
      response({ scores: { L1: 5, L2: null } }),
    ]
    const report = buildSurveyReport({ responses, leaders, settings, frequencyOptions })
    const leadership = report.blocks.find((b) => b.block.id === "LEADERSHIP")!
    expect(leadership.questionCount).toBe(5)
    expect(leadership.average).toBe(3)
    expect(leadership.favorability).toBe(50)
    expect(leadership.trafficLight).toBe("IMPROVE")
  })

  it("compara líderes, oculta segmentos pequeños y calcula KPIs", () => {
    const responses = [
      response({ leaderId: "A", scores: { ...allScores(5), G2: 10 } }),
      response({ leaderId: "A", scores: { ...allScores(4), G2: 9 } }),
      response({ leaderId: "A", scores: { ...allScores(3), G2: 6 } }),
      response({ leaderId: "B", scores: { ...allScores(2), G2: 3 }, completedAt: new Date("2026-09-10T00:00:00Z") }),
    ]
    const report = buildSurveyReport({ responses, leaders, settings, frequencyOptions })

    expect(report.insufficient).toBe(false)
    expect(report.leaders.map((l) => l.id)).toEqual(["A"]) // B tiene 1 respuesta < 3
    expect(report.leaderSegments.find((s) => s.id === "B")?.visible).toBe(false)
    expect(report.kpis.completed).toBe(4)
    expect(report.kpis.leadersEvaluated).toBe(2)
    expect(report.kpis.generalAverage).toBe(3.5)
    expect(report.kpis.lastResponseAt?.toISOString()).toBe("2026-09-10T00:00:00.000Z")
    expect(report.nps.total.nps).toBe(0) // 2 promotores, 2 detractores
    expect(report.nps.byLeader.A.nps).toBeCloseTo(33.33, 2)
    expect(report.nps.byLeader.B).toBeUndefined()
    expect(report.blocks[0].byLeader.A.average).toBe(4)
  })

  it("marca el segmento como insuficiente bajo el mínimo de respuestas", () => {
    const report = buildSurveyReport({
      responses: [response(), response()],
      leaders,
      settings,
      frequencyOptions,
    })
    expect(report.insufficient).toBe(true)
  })

  it("dispara alertas a partir de los resultados calculados", () => {
    const low = { ...allScores(4), FT1: 3, FT2: 3, FT3: 3, FT4: 3, FT5: 3, FT6: 3, FT7: 3, M1: 2 }
    const responses = [response({ scores: low }), response({ scores: low }), response({ scores: low })]
    const report = buildSurveyReport({ responses, leaders, settings, frequencyOptions })
    expect(report.alerts.map((a) => a.status)).toEqual(["ALERT", "OK", "ALERT"])
  })
})
