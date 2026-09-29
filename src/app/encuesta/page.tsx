import { ArrowRight, Clock, EyeOff, MessageSquareText } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { getPrimarySurvey } from "@/lib/data/surveys"
import { LIKERT_SCALE, SURVEY_INTRO, SURVEY_TITLE } from "@/lib/survey/questions"
import { cn } from "@/lib/utils"
import { SurveyClosed } from "./survey-closed"

export const metadata: Metadata = { title: "Encuesta" }
export const dynamic = "force-dynamic"

export default async function SurveyIntroPage() {
  const survey = await getPrimarySurvey()
  if (!survey || !survey.active) return <SurveyClosed />

  return (
    <div className="py-10 sm:py-16">
      <p className="text-sm font-medium text-primary">Encuesta anónima</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{SURVEY_TITLE}</h1>
      <p className="mt-4 text-lg leading-relaxed text-pretty text-muted-foreground">{SURVEY_INTRO}</p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { icon: EyeOff, title: "Anónima", text: "No pedimos nombre, correo ni documento." },
          { icon: Clock, title: "10 a 15 minutos", text: "Avance por bloques a su ritmo." },
          { icon: MessageSquareText, title: "Con comentarios", text: "Puede dar contexto a cualquier respuesta." },
        ].map(({ icon: Icon, title, text }) => (
          <li key={title} className="rounded-2xl border bg-card p-4">
            <Icon className="size-5 text-primary" />
            <p className="mt-3 font-medium">{title}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{text}</p>
          </li>
        ))}
      </ul>

      <section className="mt-8 rounded-2xl border bg-card p-5 sm:p-6">
        <h2 className="font-medium">¿Cómo responder?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Indique qué tan de acuerdo está con cada afirmación. Si una pregunta no aplica a su caso, elija N/A.
        </p>
        <dl className="mt-4 grid gap-2">
          {[...LIKERT_SCALE.map((o) => ({ key: String(o.value), label: o.label })), { key: "N/A", label: "No aplica" }].map(
            ({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <dt className="flex h-8 w-11 shrink-0 items-center justify-center rounded-lg border bg-background text-sm font-medium tabular-nums">
                  {key}
                </dt>
                <dd className="text-sm">{label}</dd>
              </div>
            ),
          )}
        </dl>
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link href={`/encuesta/${survey.id}`} className={cn(buttonVariants(), "h-12 px-8 text-base")}>
          Comenzar encuesta
          <ArrowRight />
        </Link>
        <p className="text-sm text-muted-foreground">Sus respuestas solo se guardan al final.</p>
      </div>
    </div>
  )
}
