import { z } from "zod"
import { APP_UTC_OFFSET } from "@/lib/format"

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .catch(undefined)

export const resultsFiltersSchema = z.object({
  leader: z.string().min(1).max(64).optional().catch(undefined),
  seniority: z.enum(["LESS_THAN_1_YEAR", "ONE_TO_THREE_YEARS", "MORE_THAN_3_YEARS"]).optional().catch(undefined),
  from: isoDate,
  to: isoDate,
})

export type ResultsFilters = z.infer<typeof resultsFiltersSchema>

type RawParams = Record<string, string | string[] | undefined> | URLSearchParams

/** Lee filtros desde searchParams (página) o URLSearchParams (route handler). Valores inválidos se ignoran. */
export function parseResultsFilters(params: RawParams): ResultsFilters {
  const get = (key: string) => {
    const value = params instanceof URLSearchParams ? params.get(key) : params[key]
    const single = Array.isArray(value) ? value[0] : value
    return single === "" || single === null ? undefined : single
  }
  return resultsFiltersSchema.parse({
    leader: get("leader"),
    seniority: get("seniority"),
    from: get("from"),
    to: get("to"),
  })
}

export function dateRange(filters: ResultsFilters): { gte?: Date; lte?: Date } | undefined {
  if (!filters.from && !filters.to) return undefined
  return {
    ...(filters.from ? { gte: new Date(`${filters.from}T00:00:00.000${APP_UTC_OFFSET}`) } : {}),
    ...(filters.to ? { lte: new Date(`${filters.to}T23:59:59.999${APP_UTC_OFFSET}`) } : {}),
  }
}

export function filtersToQueryString(filters: ResultsFilters): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value)
  const query = params.toString()
  return query ? `?${query}` : ""
}

export function hasActiveFilters(filters: ResultsFilters): boolean {
  return Object.values(filters).some(Boolean)
}
