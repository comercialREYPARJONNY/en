"use client"

import { ArrowLeft, ArrowRight, Loader2, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { FrequencyLevel } from "@/lib/analytics/types"
import type { AnswerInput } from "@/lib/survey/submission-schema"
import {
  completionPercent,
  createDraft,
  toSubmission,
  validateStep,
  WIZARD_STEPS,
  type SurveyDraft,
} from "@/lib/survey/wizard"
import { submitSurvey } from "@/server/actions/submit-survey"
import { ClassificationStep } from "./classification-step"
import { SurveyProgress } from "./survey-progress"
import { SurveySection } from "./survey-section"

type Props = {
  surveyId: string
  leaders: { id: string; name: string }[]
  frequencyOptions: FrequencyLevel[]
}

const TOTAL_STEPS = WIZARD_STEPS.length

const omit = (errors: Record<string, string>, keys: string[]) =>
  Object.fromEntries(Object.entries(errors).filter(([k]) => !keys.includes(k)))

/**
 * El borrador vive solo en sessionStorage de este navegador para no perder respuestas si se
 * recarga la página. Nada se envía al servidor hasta que la persona pulsa "Enviar".
 */
function loadDraft(key: string, leaders: Props["leaders"]): SurveyDraft {
  try {
    const raw = window.sessionStorage.getItem(key)
    if (raw) {
      const draft = JSON.parse(raw) as SurveyDraft
      if (draft?.responseId && draft.answers && Array.isArray(draft.rankingOrder)) {
        if (draft.leaderId && !leaders.some((l) => l.id === draft.leaderId)) draft.leaderId = undefined
        draft.step = Math.min(Math.max(0, draft.step ?? 0), TOTAL_STEPS - 1)
        return draft
      }
    }
  } catch {
    // Almacenamiento no disponible (modo privado, bloqueado): se trabaja solo en memoria.
  }
  return createDraft()
}

function saveDraft(key: string, draft: SurveyDraft | null) {
  try {
    if (draft) window.sessionStorage.setItem(key, JSON.stringify(draft))
    else window.sessionStorage.removeItem(key)
  } catch {
    // Ignorado: ver loadDraft.
  }
}

export function SurveyWizard({ surveyId, leaders, frequencyOptions }: Props) {
  const router = useRouter()
  const storageKey = `reypar-encuesta:${surveyId}`
  const [draft, setDraft] = useState<SurveyDraft | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, startSubmit] = useTransition()
  const submittingRef = useRef(false)
  const topRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // El borrador depende de sessionStorage y crypto.randomUUID: solo existe en el cliente.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(loadDraft(storageKey, leaders))
  }, [storageKey, leaders])

  useEffect(() => {
    if (draft) saveDraft(storageKey, draft)
  }, [draft, storageKey])

  if (!draft) {
    return (
      <div className="space-y-4" aria-busy>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    )
  }

  const step = WIZARD_STEPS[draft.step]
  const isLast = draft.step === TOTAL_STEPS - 1
  const percent = completionPercent(draft)

  const update = (patch: Partial<SurveyDraft>) => {
    setDraft((current) => (current ? { ...current, ...patch } : current))
    const keys = Object.keys(patch)
    if (keys.some((k) => errors[k])) setErrors((e) => omit(e, keys))
  }

  const setAnswer = (code: string, answer: AnswerInput) => {
    setDraft((current) => (current ? { ...current, answers: { ...current.answers, [code]: answer } } : current))
    if (errors[code]) setErrors((e) => omit(e, [code]))
  }

  const goTo = (index: number) => {
    setErrors({})
    setSubmitError(null)
    update({ step: index })
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }))
  }

  const showErrors = (stepErrors: Record<string, string>) => {
    setErrors(stepErrors)
    const first = Object.keys(stepErrors)[0]
    requestAnimationFrame(() =>
      document.getElementById(`q-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" }),
    )
  }

  const handleContinue = () => {
    const stepErrors = validateStep(step, draft)
    if (Object.keys(stepErrors).length > 0) return showErrors(stepErrors)
    goTo(draft.step + 1)
  }

  const handleSubmit = () => {
    if (submittingRef.current) return
    // Revalida todos los pasos por si el borrador se restauró incompleto.
    for (const [index, s] of WIZARD_STEPS.entries()) {
      const stepErrors = validateStep(s, draft)
      if (Object.keys(stepErrors).length > 0) {
        if (index !== draft.step) update({ step: index })
        return showErrors(stepErrors)
      }
    }

    submittingRef.current = true
    setSubmitError(null)
    startSubmit(async () => {
      try {
        const result = await submitSurvey(toSubmission(draft, surveyId))
        if (result.ok) {
          saveDraft(storageKey, null)
          router.replace(`/encuesta/${surveyId}/gracias`)
          return // se mantiene bloqueado: la página cambia
        }
        setSubmitError(result.error)
      } catch {
        setSubmitError("No hay conexión con el servidor. Sus respuestas siguen guardadas en este dispositivo; intente de nuevo.")
      }
      submittingRef.current = false
    })
  }

  let questionNumber = 0

  return (
    <div ref={topRef} className="scroll-mt-4">
      <div className="sticky top-0 z-20 -mx-4 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/75 sm:-mx-6 sm:px-6">
        <SurveyProgress title={step.title} step={draft.step + 1} totalSteps={TOTAL_STEPS} percent={percent} />
      </div>

      <div className="py-6">
        <SurveySection
          title={step.title}
          description={step.description}
          eyebrow={draft.step === 0 ? "Antes de empezar" : `Bloque ${draft.step} de ${TOTAL_STEPS - 1}`}
        >
          {step.kind === "classification" ? (
            <ClassificationStep
              leaders={leaders}
              leaderId={draft.leaderId}
              seniority={draft.seniority}
              errors={errors}
              onLeader={(leaderId) => update({ leaderId })}
              onSeniority={(seniority) => update({ seniority })}
            />
          ) : (
            step.questions.map((question) => {
              if (question.type !== "ranking") questionNumber += 1
              return (
                <SurveySection.Question
                  key={question.id}
                  question={question}
                  index={questionNumber}
                  draft={draft}
                  frequencyOptions={frequencyOptions}
                  error={errors[question.id]}
                  onAnswer={setAnswer}
                  onRanking={(rankingOrder, rankingConfirmed) => {
                    update({ rankingOrder, rankingConfirmed })
                    if (errors.PR1) setErrors((e) => omit(e, ["PR1"]))
                  }}
                />
              )
            })
          )}
        </SurveySection>

        {submitError && (
          <Alert variant="destructive" className="mt-6">
            <AlertTitle>No se pudo enviar</AlertTitle>
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
      </div>

      <nav className="sticky bottom-0 z-20 -mx-4 border-t border-border/60 bg-background/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur supports-backdrop-filter:bg-background/75 sm:-mx-6 sm:px-6">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-12 flex-1 text-base sm:flex-none sm:px-6"
            onClick={() => goTo(draft.step - 1)}
            disabled={draft.step === 0 || isSubmitting}
          >
            <ArrowLeft />
            Anterior
          </Button>
          {isLast ? (
            <Button
              type="button"
              className="h-12 flex-[2] text-base sm:ml-auto sm:flex-none sm:px-8"
              onClick={handleSubmit}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
              {isSubmitting ? "Enviando…" : "Enviar respuestas"}
            </Button>
          ) : (
            <Button
              type="button"
              className="h-12 flex-[2] text-base sm:ml-auto sm:flex-none sm:px-8"
              onClick={handleContinue}
            >
              Continuar
              <ArrowRight />
            </Button>
          )}
        </div>
      </nav>
    </div>
  )
}
