import "server-only"
import { buildSurveyReport, type SurveyReport } from "@/lib/analytics/build-report"
import type { AnalyticsResponse, AnalyticsSettings, FrequencyLevel, LeaderRef } from "@/lib/analytics/types"
import type { PriorityDimension } from "@/lib/survey/types"
import { dateRange, type ResultsFilters } from "./filters"
import { getLeaders, type LeaderRow } from "./leaders"
import { prisma } from "./prisma"
import { getFrequencyOptions, getSettings } from "./settings"
import { getPrimarySurvey } from "./surveys"

export async function getAnalyticsResponses(surveyId: string, filters: ResultsFilters): Promise<AnalyticsResponse[]> {
  const rows = await prisma.surveyResponse.findMany({
    where: {
      surveyId,
      ...(filters.leader ? { leaderId: filters.leader } : {}),
      ...(filters.seniority ? { seniority: filters.seniority } : {}),
      ...(dateRange(filters) ? { completedAt: dateRange(filters) } : {}),
    },
    orderBy: { completedAt: "asc" },
    include: { answers: true, priorities: true },
  })

  return rows.map((row) => {
    const response: AnalyticsResponse = {
      id: row.id,
      leaderId: row.leaderId,
      seniority: row.seniority,
      completedAt: row.completedAt,
      scores: {},
      options: {},
      ranking: {},
      comments: {},
      texts: {},
    }
    for (const answer of row.answers) {
      if (answer.numericValue !== null || answer.isNotApplicable) {
        response.scores[answer.questionId] = answer.isNotApplicable ? null : answer.numericValue
      }
      if (answer.optionValue) response.options[answer.questionId] = answer.optionValue
      if (answer.textValue?.trim()) response.texts[answer.questionId] = answer.textValue.trim()
      if (answer.comment?.trim()) response.comments[answer.questionId] = answer.comment.trim()
    }
    for (const p of row.priorities) response.ranking[p.dimension as PriorityDimension] = p.rank
    return response
  })
}

export type ReportContext = {
  surveyId: string | null
  filters: ResultsFilters
  settings: AnalyticsSettings
  frequencyOptions: FrequencyLevel[]
  /** Todos los líderes configurados (para filtros). */
  allLeaders: LeaderRow[]
  responses: AnalyticsResponse[]
  report: SurveyReport
}

/** Carga todo lo necesario para las vistas de resultados y la exportación. */
export async function getReportContext(filters: ResultsFilters): Promise<ReportContext> {
  const [survey, settings, frequencyOptions, allLeaders] = await Promise.all([
    getPrimarySurvey(),
    getSettings(),
    getFrequencyOptions(),
    getLeaders(),
  ])
  const responses = survey ? await getAnalyticsResponses(survey.id, filters) : []
  const leaders: LeaderRef[] = allLeaders.map(({ id, name }) => ({ id, name }))
  return {
    surveyId: survey?.id ?? null,
    filters,
    settings,
    frequencyOptions,
    allLeaders,
    responses,
    report: buildSurveyReport({ responses, leaders, settings, frequencyOptions }),
  }
}
