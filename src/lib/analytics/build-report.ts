import type { BlockId } from "@/lib/survey/types"
import { calculateAlerts } from "./calculate-alerts"
import { calculateBlockResults, calculateGeneralResult } from "./calculate-block-results"
import { calculateFrequencyDistribution, calculateFrequencyGap } from "./calculate-frequency-gap"
import { calculateNps } from "./calculate-nps"
import { calculatePriorities } from "./calculate-priorities"
import { calculateQuestionResults } from "./calculate-question-results"
import type {
  AnalyticsResponse,
  AnalyticsSettings,
  BlockResult,
  CrossAlert,
  FrequencyDistributionRow,
  FrequencyGapResult,
  FrequencyLevel,
  LeaderRef,
  NpsResult,
  PriorityRow,
  QuestionResult,
} from "./types"

export type LeaderSegment = LeaderRef & { responses: number; visible: boolean }

export type SurveyReport = {
  responseCount: number
  /** El segmento filtrado no alcanza el mínimo de respuestas: no se muestran resultados. */
  insufficient: boolean
  /** Líderes con suficientes respuestas para compararse (los demás se ocultan). */
  leaders: LeaderRef[]
  leaderSegments: LeaderSegment[]
  kpis: {
    completed: number
    generalAverage: number | null
    generalFavorability: number | null
    nps: number | null
    leadersEvaluated: number
    lastResponseAt: Date | null
  }
  questions: QuestionResult[]
  blocks: BlockResult[]
  general: BlockResult
  nps: { total: NpsResult; byLeader: Record<string, NpsResult> }
  frequency: {
    distribution: FrequencyDistributionRow[]
    total: FrequencyGapResult
    byLeader: Record<string, FrequencyGapResult>
  }
  priorities: PriorityRow[]
  alerts: CrossAlert[]
}

export type BuildReportInput = {
  responses: ReadonlyArray<AnalyticsResponse>
  leaders: ReadonlyArray<LeaderRef>
  settings: AnalyticsSettings
  frequencyOptions: ReadonlyArray<FrequencyLevel>
}

/** Orquesta todos los indicadores de las hojas "Resultados" y "Resumen". */
export function buildSurveyReport({ responses, leaders, settings, frequencyOptions }: BuildReportInput): SurveyReport {
  const min = settings.minResponsesForSegment
  const leaderSegments: LeaderSegment[] = leaders
    .map((leader) => {
      const count = responses.filter((r) => r.leaderId === leader.id).length
      return { ...leader, responses: count, visible: count >= min }
    })
    .filter((segment) => segment.responses > 0)

  const visibleLeaders: LeaderRef[] = leaderSegments
    .filter((s) => s.visible)
    .map(({ id, name }) => ({ id, name }))

  const questions = calculateQuestionResults(responses, visibleLeaders, settings)
  const blocks = calculateBlockResults(questions, visibleLeaders, settings)
  const general = calculateGeneralResult(questions, visibleLeaders, settings)

  const blockAverage = (id: BlockId) => blocks.find((b) => b.block.id === id)?.average ?? null
  const questionAverage = (code: string) => questions.find((q) => q.question.id === code)?.average ?? null

  const g2 = (rs: ReadonlyArray<AnalyticsResponse>) => rs.map((r) => r.scores.G2 ?? null)
  const ofLeader = (id: string) => responses.filter((r) => r.leaderId === id)

  const npsTotal = calculateNps(g2(responses))
  const npsByLeader = Object.fromEntries(visibleLeaders.map((l) => [l.id, calculateNps(g2(ofLeader(l.id)))]))

  const gap = (rs: ReadonlyArray<AnalyticsResponse>) =>
    calculateFrequencyGap(rs, frequencyOptions, settings.frequencyGapThreshold)

  const blockAverages = Object.fromEntries(blocks.map((b) => [b.block.id, b.average])) as Partial<
    Record<BlockId, number | null>
  >

  const lastResponseAt = responses.reduce<Date | null>(
    (latest, r) => (latest === null || r.completedAt > latest ? r.completedAt : latest),
    null,
  )

  return {
    responseCount: responses.length,
    insufficient: responses.length < min,
    leaders: visibleLeaders,
    leaderSegments,
    kpis: {
      completed: responses.length,
      generalAverage: general.average,
      generalFavorability: general.favorability,
      nps: npsTotal.nps,
      leadersEvaluated: new Set(responses.map((r) => r.leaderId)).size,
      lastResponseAt,
    },
    questions,
    blocks,
    general,
    nps: { total: npsTotal, byLeader: npsByLeader },
    frequency: {
      distribution: calculateFrequencyDistribution(responses, frequencyOptions),
      total: gap(responses),
      byLeader: Object.fromEntries(visibleLeaders.map((l) => [l.id, gap(ofLeader(l.id))])),
    },
    priorities: calculatePriorities(responses, blockAverages, settings.strengthThreshold),
    alerts: calculateAlerts(
      {
        technicalTrainingBlock: blockAverage("TECHNICAL_TRAINING"),
        ft5: questionAverage("FT5"),
        decisionsBlock: blockAverage("DECISIONS"),
        d7: questionAverage("D7"),
        m1: questionAverage("M1"),
      },
      settings.alertThreshold,
    ),
  }
}
