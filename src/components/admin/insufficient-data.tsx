import { ShieldCheck } from "lucide-react"

export const INSUFFICIENT_MESSAGE =
  "No hay suficientes respuestas para mostrar este segmento preservando el anonimato."

export function InsufficientData({ count, min }: { count: number; min: number }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed bg-card px-6 py-14 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
        <ShieldCheck className="size-5" />
      </span>
      <p className="mt-4 max-w-md font-medium text-pretty">{INSUFFICIENT_MESSAGE}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {count === 0 ? "No hay respuestas con estos filtros." : `Respuestas en el segmento: ${count}.`} Se necesitan al menos{" "}
        {min}. Amplíe los filtros para ver resultados.
      </p>
    </div>
  )
}

export function HiddenLeadersNote({ names, min }: { names: string[]; min: number }) {
  if (names.length === 0) return null
  return (
    <p className="text-xs text-muted-foreground">
      Por anonimato no se muestran columnas de: {names.join(", ")} (menos de {min} respuestas en este segmento). Sus
      respuestas sí cuentan en el total.
    </p>
  )
}
