import { getAdminSession } from "@/lib/auth-guard"
import { parseResultsFilters, type ResultsFilters } from "@/lib/data/filters"
import { getReportContext } from "@/lib/data/responses"
import { exportFileName, exportResultsXlsx } from "@/lib/export/export-results-xlsx"
import { seniorityLabel } from "@/lib/survey/questions"

export const dynamic = "force-dynamic"

function describeFilters(filters: ResultsFilters, leaderNames: Map<string, string>): string {
  const parts = [
    filters.leader ? `Líder: ${leaderNames.get(filters.leader) ?? "—"}` : null,
    filters.seniority ? `Antigüedad: ${seniorityLabel(filters.seniority)}` : null,
    filters.from ? `Desde ${filters.from}` : null,
    filters.to ? `Hasta ${filters.to}` : null,
  ].filter(Boolean)
  return parts.length ? parts.join(" · ") : "Ninguno (todas las respuestas)"
}

/** GET /api/export/resultados?leader=&seniority=&from=&to= → .xlsx con los mismos filtros del dashboard. */
export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return Response.json({ error: "No autorizado" }, { status: 401 })
  }

  const filters = parseResultsFilters(new URL(request.url).searchParams)
  const context = await getReportContext(filters)
  const generatedAt = new Date()

  const buffer = await exportResultsXlsx({
    report: context.report,
    responses: context.responses,
    settings: context.settings,
    frequencyOptions: context.frequencyOptions,
    allLeaders: context.allLeaders,
    filtersDescription: describeFilters(filters, new Map(context.allLeaders.map((l) => [l.id, l.name]))),
    generatedAt,
  })

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${exportFileName(generatedAt)}"`,
      "Cache-Control": "no-store",
    },
  })
}
