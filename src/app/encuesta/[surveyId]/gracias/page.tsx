import { CheckCircle2 } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Gracias" }

export default function ThanksPage() {
  return (
    <div className="flex flex-col items-center py-20 text-center sm:py-28">
      <span className="flex size-14 items-center justify-center rounded-full bg-strength-soft text-strength">
        <CheckCircle2 className="size-7" />
      </span>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">¡Gracias por responder!</h1>
      <p className="mt-3 max-w-md text-pretty text-muted-foreground">
        Sus respuestas se guardaron de forma anónima. Los resultados se analizarán de manera agregada para mejorar el
        acompañamiento que recibe el equipo comercial.
      </p>
      <p className="mt-8 text-sm text-muted-foreground">Ya puede cerrar esta ventana.</p>
    </div>
  )
}
