/** Colombia no tiene horario de verano: UTC−5 fijo. */
export const APP_TIME_ZONE = "America/Bogota"
export const APP_UTC_OFFSET = "-05:00"

const decimal = new Intl.NumberFormat("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const oneDecimal = new Intl.NumberFormat("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const integer = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 })

export const EMPTY = "—"

export function formatAverage(value: number | null | undefined): string {
  return value === null || value === undefined ? EMPTY : decimal.format(value)
}

export function formatPercent(value: number | null | undefined, digits: 0 | 1 = 0): string {
  if (value === null || value === undefined) return EMPTY
  return `${(digits === 1 ? oneDecimal : integer).format(value)}%`
}

export function formatSigned(value: number | null | undefined): string {
  if (value === null || value === undefined) return EMPTY
  const formatted = decimal.format(Math.abs(value))
  if (Math.abs(value) < 0.005) return decimal.format(0)
  return value > 0 ? `+${formatted}` : `−${formatted}`
}

export function formatNps(value: number | null | undefined): string {
  if (value === null || value === undefined) return EMPTY
  const rounded = Math.round(value)
  return rounded > 0 ? `+${rounded}` : rounded < 0 ? `−${Math.abs(rounded)}` : "0"
}

export function formatDate(value: Date | null | undefined, withTime = false): string {
  if (!value) return EMPTY
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: APP_TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(value)
}

/** YYYY-MM-DD en la zona horaria de la aplicación. */
export function isoDate(value: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIME_ZONE }).format(value)
}
