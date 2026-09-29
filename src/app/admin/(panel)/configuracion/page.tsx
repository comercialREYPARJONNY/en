import type { Metadata } from "next"
import { FrequencyLevelsForm } from "@/components/admin/frequency-levels-form"
import { LeadersManager } from "@/components/admin/leaders-manager"
import { PageHeader, Section } from "@/components/admin/page-header"
import { SettingsForm } from "@/components/admin/settings-form"
import { SurveyStatusCard } from "@/components/admin/survey-status-card"
import { getLeaders } from "@/lib/data/leaders"
import { prisma } from "@/lib/data/prisma"
import { getFrequencyOptions, getSettings } from "@/lib/data/settings"
import { getPrimarySurvey } from "@/lib/data/surveys"

export const metadata: Metadata = { title: "Configuración" }

export default async function SettingsPage() {
  const [survey, leaders, settings, frequencyOptions] = await Promise.all([
    getPrimarySurvey(),
    getLeaders(),
    getSettings(),
    getFrequencyOptions(),
  ])
  const responses = survey ? await prisma.surveyResponse.count({ where: { surveyId: survey.id } }) : 0

  return (
    <>
      <PageHeader title="Configuración" description="Parámetros de la encuesta y del análisis. Los cambios se aplican de inmediato en todos los cálculos." />
      <div className="grid gap-10 xl:grid-cols-2">
        <div className="space-y-10">
          {survey && (
            <Section title="Encuesta">
              <SurveyStatusCard surveyId={survey.id} active={survey.active} responses={responses} />
            </Section>
          )}
          <Section title="Líderes" description="Opciones de 'Mi líder directo es' en la encuesta.">
            <LeadersManager leaders={leaders} />
          </Section>
        </div>
        <div className="space-y-10">
          <Section title="Semáforo y análisis">
            <SettingsForm defaults={settings} />
          </Section>
          <Section title="Niveles de frecuencia (G3 y G4)" description="Valor numérico usado para calcular la brecha de acompañamiento.">
            <FrequencyLevelsForm options={frequencyOptions} />
          </Section>
        </div>
      </div>
    </>
  )
}
