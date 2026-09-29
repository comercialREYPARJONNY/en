import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SurveyWizard } from "@/components/survey/survey-wizard"
import { getActiveLeaders } from "@/lib/data/leaders"
import { getFrequencyOptions } from "@/lib/data/settings"
import { getSurvey } from "@/lib/data/surveys"
import { SurveyClosed } from "../survey-closed"

export const metadata: Metadata = { title: "Encuesta" }
export const dynamic = "force-dynamic"

export default async function SurveyPage({ params }: PageProps<"/encuesta/[surveyId]">) {
  const { surveyId } = await params
  const survey = await getSurvey(surveyId)
  if (!survey) notFound()
  if (!survey.active) return <SurveyClosed />

  const [leaders, frequencyOptions] = await Promise.all([getActiveLeaders(), getFrequencyOptions()])
  if (leaders.length === 0) return <SurveyClosed title="La encuesta aún no está configurada" />

  return <SurveyWizard surveyId={survey.id} leaders={leaders} frequencyOptions={frequencyOptions} />
}
