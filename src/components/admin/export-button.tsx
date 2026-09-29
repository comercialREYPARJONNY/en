"use client"

import { Download } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Descarga el .xlsx con los mismos filtros de la vista actual. */
export function ExportButton() {
  const searchParams = useSearchParams()
  const params = new URLSearchParams()
  for (const key of ["leader", "seniority", "from", "to"]) {
    const value = searchParams.get(key)
    if (value) params.set(key, value)
  }
  const query = params.toString()
  return (
    <a href={`/api/export/resultados${query ? `?${query}` : ""}`} className={cn(buttonVariants(), "h-9 px-3")} download>
      <Download />
      Exportar resultados
    </a>
  )
}
