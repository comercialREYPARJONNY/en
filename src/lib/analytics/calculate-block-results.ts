import { SCORED_BLOCKS } from "@/lib/survey/questions"
import type { SurveyBlock } from "@/lib/survey/types"
import { calculateAverage } from "./calculate-average"
import { calculateLeaderDifference } from "./leader-difference"
import { classifyTrafficLight } from "./traffic-light"
import type { AnalyticsSettings, BlockResult, LeaderRef, QuestionResult } from "./types"

/**
 * Agrega filas de "Resultados" como lo hace el Excel (AVERAGEIFS sobre la hoja Resultados):
 * el promedio del bloque es el promedio de los promedios de sus preguntas, y el % favorable
 * del bloque es el promedio de los % favorables de sus preguntas.
 */
function aggregate(
  block: SurveyBlock,
  rows: ReadonlyArray<QuestionResult>,
  leaders: ReadonlyArray<LeaderRef>,
  settings: AnalyticsSettings,
): BlockResult {
  const average = calculateAverage(rows.map((r) => r.average))
  const byLeader: BlockResult["byLeader"] = {}
  for (const leader of leaders) {
    const leaderAverage = calculateAverage(rows.map((r) => r.byLeader[leader.id]?.average ?? null))
    byLeader[leader.id] = {
      average: leaderAverage,
      favorability: calculateAverage(rows.map((r) => r.byLeader[leader.id]?.favorability ?? null)),
      trafficLight: classifyTrafficLight(leaderAverage, settings),
    }
  }
  return {
    block,
    questionCount: rows.length,
    average,
    favorability: calculateAverage(rows.map((r) => r.favorability)),
    trafficLight: classifyTrafficLight(average, settings),
    byLeader,
    leaderDifference: calculateLeaderDifference(leaders.map((l) => byLeader[l.id].average)),
  }
}

/** Sección 1 del "Resumen": un resultado por bloque. */
export function calculateBlockResults(
  questionResults: ReadonlyArray<QuestionResult>,
  leaders: ReadonlyArray<LeaderRef>,
  settings: AnalyticsSettings,
  blocks: ReadonlyArray<SurveyBlock> = SCORED_BLOCKS,
): BlockResult[] {
  return blocks.map((block) =>
    aggregate(
      block,
      questionResults.filter((r) => r.question.block === block.id),
      leaders,
      settings,
    ),
  )
}

/** Fila "PROMEDIO GENERAL": promedio de todas las preguntas de Resultados (sin G2–G4, PR1 ni abiertas). */
export function calculateGeneralResult(
  questionResults: ReadonlyArray<QuestionResult>,
  leaders: ReadonlyArray<LeaderRef>,
  settings: AnalyticsSettings,
): BlockResult {
  return aggregate(
    { id: "GLOBAL", name: "PROMEDIO GENERAL", scored: true },
    questionResults.filter((r) => r.question.inResults),
    leaders,
    settings,
  )
}
