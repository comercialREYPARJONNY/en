import { getBlock, RESULT_QUESTIONS } from "@/lib/survey/questions"
import type { SurveyQuestion } from "@/lib/survey/types"
import { calculateAverage, validScores } from "./calculate-average"
import { calculateFavorability } from "./calculate-favorability"
import { calculateLeaderDifference } from "./leader-difference"
import { classifyTrafficLight } from "./traffic-light"
import type { AnalyticsResponse, AnalyticsSettings, LeaderRef, Metric, QuestionResult } from "./types"

export function calculateMetric(
  values: ReadonlyArray<number | null | undefined>,
  settings: AnalyticsSettings,
): Metric {
  const average = calculateAverage(values)
  return {
    n: validScores(values).length,
    average,
    favorability: calculateFavorability(values, settings.favorableMin),
    trafficLight: classifyTrafficLight(average, settings),
  }
}

/** Equivalente a la hoja "Resultados": una fila por pregunta 1–5. */
export function calculateQuestionResults(
  responses: ReadonlyArray<AnalyticsResponse>,
  leaders: ReadonlyArray<LeaderRef>,
  settings: AnalyticsSettings,
  questions: ReadonlyArray<SurveyQuestion> = RESULT_QUESTIONS,
): QuestionResult[] {
  return questions.map((question) => {
    const scoresOf = (rs: ReadonlyArray<AnalyticsResponse>) => rs.map((r) => r.scores[question.id] ?? null)
    const total = calculateMetric(scoresOf(responses), settings)

    const byLeader: Record<string, Metric> = {}
    for (const leader of leaders) {
      byLeader[leader.id] = calculateMetric(
        scoresOf(responses.filter((r) => r.leaderId === leader.id)),
        settings,
      )
    }

    return {
      ...total,
      question,
      blockName: getBlock(question.block).name,
      byLeader,
      leaderDifference: calculateLeaderDifference(leaders.map((l) => byLeader[l.id].average)),
    }
  })
}
