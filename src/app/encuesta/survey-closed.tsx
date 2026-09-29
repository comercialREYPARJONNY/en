import { Lock } from "lucide-react"

export function SurveyClosed({ title = "La encuesta no está disponible" }: { title?: string }) {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Lock className="size-5" />
      </span>
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        En este momento no se están recibiendo respuestas. Si cree que es un error, comuníquese con Gestión Humana.
      </p>
    </div>
  )
}
