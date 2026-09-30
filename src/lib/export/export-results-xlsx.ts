import ExcelJS from "exceljs"
import type { SurveyReport } from "@/lib/analytics/build-report"
import { TRAFFIC_LIGHT_LABEL } from "@/lib/analytics/traffic-light"
import type {
  AnalyticsResponse,
  AnalyticsSettings,
  FrequencyLevel,
  LeaderRef,
  TrafficLight,
} from "@/lib/analytics/types"
import { formatDate, isoDate } from "@/lib/format"
import {
  getBlock,
  getQuestion,
  OPEN_QUESTIONS,
  PRIORITY_DIMENSIONS,
  QUESTIONS,
  seniorityLabel,
} from "@/lib/survey/questions"

export type ExportInput = {
  report: SurveyReport
  responses: ReadonlyArray<AnalyticsResponse>
  settings: AnalyticsSettings
  frequencyOptions: ReadonlyArray<FrequencyLevel>
  /** Todos los líderes configurados (para nombres y hoja Configuración). */
  allLeaders: ReadonlyArray<LeaderRef & { active: boolean }>
  /** Descripción legible de los filtros aplicados. */
  filtersDescription: string
  generatedAt: Date
}

const INSUFFICIENT = "No hay suficientes respuestas para mostrar este segmento preservando el anonimato."

const COLORS = {
  header: "FF1F3A68",
  headerText: "FFFFFFFF",
  section: "FF1F3A68",
  muted: "FF667085",
  totalRow: "FFF2F4F7",
  border: "FFE4E7EC",
  light: {
    STRENGTH: { fill: "FFDCF3E6", font: "FF1F7A46" },
    IMPROVE: { fill: "FFFDF1CF", font: "FF8A6100" },
    CRITICAL: { fill: "FFFBE0DE", font: "FFB42318" },
  } satisfies Record<TrafficLight, { fill: string; font: string }>,
}

const NUM = "0.00"
const PCT = "0.0%"
const SIGNED = "+0.00;-0.00;0.00"

export function exportFileName(date: Date): string {
  return `Resultados_Encuesta_Liderazgo_${isoDate(date)}.xlsx`
}

// ---------- utilidades de hoja ----------

type Cell = string | number | Date | null | undefined

function styleHeader(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.header } }
    cell.font = { bold: true, color: { argb: COLORS.headerText } }
    cell.alignment = { vertical: "middle", wrapText: true }
    cell.border = { bottom: { style: "thin", color: { argb: COLORS.border } } }
  })
  row.height = 30
}

function paintLight(cell: ExcelJS.Cell, light: TrafficLight | null) {
  if (!light) return
  cell.value = TRAFFIC_LIGHT_LABEL[light]
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.light[light].fill } }
  cell.font = { bold: true, color: { argb: COLORS.light[light].font } }
}

function sectionTitle(sheet: ExcelJS.Worksheet, text: string) {
  sheet.addRow([])
  const row = sheet.addRow([text])
  row.getCell(1).font = { bold: true, size: 13, color: { argb: COLORS.section } }
}

function note(sheet: ExcelJS.Worksheet, text: string) {
  const row = sheet.addRow([text])
  row.getCell(1).font = { italic: true, size: 9, color: { argb: COLORS.muted } }
}

/** Añade una tabla (encabezado + filas) y aplica formatos por columna. */
function addTable(
  sheet: ExcelJS.Worksheet,
  headers: string[],
  rows: Cell[][],
  formats: (string | undefined)[] = [],
): ExcelJS.Row[] {
  styleHeader(sheet.addRow(headers))
  return rows.map((values) => {
    const row = sheet.addRow(values.map((v) => (v === undefined ? null : v)))
    formats.forEach((fmt, i) => {
      if (fmt) row.getCell(i + 1).numFmt = fmt
    })
    return row
  })
}

const pct = (value: number | null) => (value === null ? null : value / 100)

// ---------- Hoja 1: Resumen ----------

function summarySheet(wb: ExcelJS.Workbook, input: ExportInput) {
  const { report, settings } = input
  const sheet = wb.addWorksheet("Resumen", { views: [{ showGridLines: false }] })
  sheet.getColumn(1).width = 44
  for (let c = 2; c <= 16; c++) sheet.getColumn(c).width = 15

  const title = sheet.addRow(["Resumen de resultados — percepción de asesores sobre su liderazgo"])
  title.getCell(1).font = { bold: true, size: 16, color: { argb: COLORS.section } }
  note(sheet, `Generado: ${formatDate(input.generatedAt, true)} · Filtros: ${input.filtersDescription} · Encuestas: ${report.responseCount}`)

  if (report.insufficient) {
    sheet.addRow([])
    sheet.addRow([INSUFFICIENT]).getCell(1).font = { bold: true }
    return
  }

  const leaders = report.leaders
  const hasDiff = leaders.length >= 2
  const diffLabel = leaders.length === 2 ? `Dif. ${leaders[0].name} − ${leaders[1].name}` : "Brecha máx − mín"

  // 1. Resultados por bloque
  sectionTitle(sheet, "1. Resultados por bloque (promedio de las preguntas del bloque)")
  const blockHeaders = [
    "Bloque",
    "N.º preguntas",
    "Prom. total",
    ...leaders.map((l) => `Prom. ${l.name}`),
    ...(hasDiff ? [diffLabel] : []),
    "% fav. total",
    ...leaders.map((l) => `% fav. ${l.name}`),
    "Semáforo total",
    ...leaders.map((l) => `Semáforo ${l.name}`),
  ]
  const blockFormats = [
    undefined,
    undefined,
    NUM,
    ...leaders.map(() => NUM),
    ...(hasDiff ? [SIGNED] : []),
    PCT,
    ...leaders.map(() => PCT),
  ]
  const lightStart = 3 + leaders.length + (hasDiff ? 1 : 0) + 1 + leaders.length + 1
  const blockRows = [...report.blocks, report.general]
  const rows = addTable(
    sheet,
    blockHeaders,
    blockRows.map((b) => [
      b.block.name,
      b.questionCount,
      b.average,
      ...leaders.map((l) => b.byLeader[l.id]?.average ?? null),
      ...(hasDiff ? [b.leaderDifference] : []),
      pct(b.favorability),
      ...leaders.map((l) => pct(b.byLeader[l.id]?.favorability ?? null)),
    ]),
    blockFormats,
  )
  rows.forEach((row, i) => {
    const b = blockRows[i]
    paintLight(row.getCell(lightStart), b.trafficLight)
    leaders.forEach((l, j) => paintLight(row.getCell(lightStart + 1 + j), b.byLeader[l.id]?.trafficLight ?? null))
  })
  const totalRow = rows.at(-1)!
  totalRow.eachCell((cell, col) => {
    if (col < lightStart) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.totalRow } }
    cell.font = { ...cell.font, bold: true }
  })
  const hidden = report.leaderSegments.filter((s) => !s.visible).map((s) => s.name)
  if (hidden.length) note(sheet, `Sin columna por anonimato (menos de ${settings.minResponsesForSegment} respuestas): ${hidden.join(", ")}.`)
  note(sheet, "PROMEDIO GENERAL no incluye G2, G3, G4, PR1 ni preguntas abiertas.")

  // 2. NPS
  sectionTitle(sheet, "2. Recomendación del líder (G2, escala 0-10) y NPS")
  const npsCols = [{ name: "Total", r: report.nps.total }, ...leaders.map((l) => ({ name: l.name, r: report.nps.byLeader[l.id] }))]
  const npsRows = addTable(sheet, ["Indicador", ...npsCols.map((c) => c.name)], [
    ["Promedio G2 (0-10)", ...npsCols.map((c) => c.r.average)],
    ["% Promotores (9-10)", ...npsCols.map((c) => pct(c.r.promoters))],
    ["% Pasivos (7-8)", ...npsCols.map((c) => pct(c.r.passives))],
    ["% Detractores (0-6)", ...npsCols.map((c) => pct(c.r.detractors))],
    ["NPS (promotores − detractores, −100 a +100)", ...npsCols.map((c) => c.r.nps)],
  ])
  const npsFormats = [NUM, PCT, PCT, PCT, "+0.0;-0.0;0"]
  npsRows.forEach((row, i) => npsCols.forEach((_, j) => (row.getCell(2 + j).numFmt = npsFormats[i])))
  npsRows.at(-1)!.font = { bold: true }

  // 3. Frecuencia
  sectionTitle(sheet, "3. Frecuencia de acompañamiento (virtual, telefónico o campo): real (G3) vs. deseada (G4)")
  addTable(
    sheet,
    ["Opción", "Nivel", "G3 real (n)", "G4 deseado (n)"],
    report.frequency.distribution.map((d) => [d.option.label, d.option.level, d.real, d.desired]),
  )
  sheet.addRow([])
  const freqCols = [
    { name: "Total", r: report.frequency.total },
    ...leaders.map((l) => ({ name: l.name, r: report.frequency.byLeader[l.id] })),
  ]
  const freqRows = addTable(sheet, ["Nivel promedio (0 = Nunca … 4 = Semanal)", ...freqCols.map((c) => c.name)], [
    ["Nivel real (G3)", ...freqCols.map((c) => c.r.realAverage)],
    ["Nivel deseado (G4)", ...freqCols.map((c) => c.r.desiredAverage)],
    ["Brecha (deseado − real)", ...freqCols.map((c) => c.r.gap)],
    ["Lectura", ...freqCols.map((c) => c.r.reading ?? "")],
  ])
  freqRows.slice(0, 3).forEach((row, i) => freqCols.forEach((_, j) => (row.getCell(2 + j).numFmt = i === 2 ? SIGNED : NUM)))
  note(sheet, `Brecha significativa: ±${settings.frequencyGapThreshold}.`)

  // 4. Prioridades
  sectionTitle(sheet, "4. Mapa de prioridades: importancia (PR1) vs. desempeño del bloque")
  addTable(
    sheet,
    ["Aspecto", "Ranking promedio (1 = más importante)", "Posición de importancia", "Desempeño (prom. del bloque)", "Lectura"],
    report.priorities.map((p) => [p.label, p.averageRank, p.position, p.performance, p.reading ?? ""]),
    [undefined, NUM, undefined, NUM],
  )
  note(sheet, "Regla: 'Invertir primero' = está entre los 2 aspectos más importantes y su desempeño es menor al umbral de Fortaleza.")

  // 5. Alertas
  sectionTitle(sheet, "5. Alertas cruzadas")
  const alertRows = addTable(
    sheet,
    ["Alerta", "Indicador 1", "Indicador 2", "Resultado"],
    report.alerts.map((a) => [a.title, a.indicators[0]?.value ?? null, a.indicators[1]?.value ?? null, a.message]),
    [undefined, NUM, NUM],
  )
  alertRows.forEach((row, i) => {
    if (report.alerts[i].status === "ALERT") row.getCell(4).font = { bold: true, color: { argb: COLORS.light.CRITICAL.font } }
  })
  note(sheet, `Umbral de alerta: promedio < ${settings.alertThreshold}. Con datos vacíos aparece 'Sin datos'.`)
}

// ---------- Hoja 2: Resultados por pregunta ----------

function questionsSheet(wb: ExcelJS.Workbook, input: ExportInput) {
  const { report } = input
  const sheet = wb.addWorksheet("Resultados por pregunta", { views: [{ state: "frozen", ySplit: 1, xSplit: 1 }] })
  if (report.insufficient) {
    sheet.addRow([INSUFFICIENT])
    return
  }
  const leaders = report.leaders
  const hasDiff = leaders.length >= 2
  const headers = [
    "Código",
    "Bloque",
    "Pregunta",
    "N° respuestas",
    "Promedio total",
    ...leaders.map((l) => `Promedio ${l.name}`),
    ...(hasDiff ? [leaders.length === 2 ? `Diferencia ${leaders[0].name} − ${leaders[1].name}` : "Diferencia máx − mín"] : []),
    "% favorable total",
    ...leaders.map((l) => `% favorable ${l.name}`),
    "Semáforo total",
    ...leaders.map((l) => `Semáforo ${l.name}`),
  ]
  const formats = [undefined, undefined, undefined, undefined, NUM, ...leaders.map(() => NUM), ...(hasDiff ? [SIGNED] : []), PCT, ...leaders.map(() => PCT)]
  const lightStart = formats.length + 1
  const rows = addTable(
    sheet,
    headers,
    report.questions.map((q) => [
      q.question.id,
      q.blockName,
      q.question.text,
      q.n,
      q.average,
      ...leaders.map((l) => q.byLeader[l.id]?.average ?? null),
      ...(hasDiff ? [q.leaderDifference] : []),
      pct(q.favorability),
      ...leaders.map((l) => pct(q.byLeader[l.id]?.favorability ?? null)),
    ]),
    formats,
  )
  rows.forEach((row, i) => {
    const q = report.questions[i]
    paintLight(row.getCell(lightStart), q.trafficLight)
    leaders.forEach((l, j) => paintLight(row.getCell(lightStart + 1 + j), q.byLeader[l.id]?.trafficLight ?? null))
    row.getCell(3).alignment = { wrapText: true, vertical: "top" }
  })
  sheet.columns.forEach((col, i) => (col.width = i === 2 ? 70 : i === 1 ? 28 : 14))
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: headers.length } }
}

// ---------- Hoja 3: Respuestas ----------

function responsesSheet(wb: ExcelJS.Workbook, input: ExportInput) {
  const sheet = wb.addWorksheet("Respuestas", { views: [{ state: "frozen", ySplit: 1, xSplit: 1 }] })
  if (input.report.insufficient) {
    sheet.addRow([INSUFFICIENT])
    return
  }
  const leaderName = new Map(input.allLeaders.map((l) => [l.id, l.name]))
  const optionLabel = new Map(input.frequencyOptions.map((o) => [o.id, o.label]))

  const columns: { header: string; value: (r: AnalyticsResponse) => Cell; width?: number }[] = [
    { header: "ID anónimo", value: (r) => r.id, width: 38 },
    { header: "Fecha", value: (r) => r.completedAt, width: 18 },
    { header: "Líder", value: (r) => leaderName.get(r.leaderId) ?? "", width: 16 },
    { header: "Antigüedad", value: (r) => seniorityLabel(r.seniority), width: 16 },
  ]
  for (const q of QUESTIONS) {
    switch (q.type) {
      case "likert":
      case "satisfaction":
      case "nps":
        columns.push({ header: q.id, value: (r) => (q.id in r.scores ? (r.scores[q.id] ?? "N/A") : null), width: 7 })
        break
      case "frequency":
        columns.push({ header: q.id, value: (r) => optionLabel.get(r.options[q.id] ?? "") ?? r.options[q.id], width: 20 })
        columns.push({
          header: `${q.id}_nivel`,
          value: (r) => input.frequencyOptions.find((o) => o.id === r.options[q.id])?.level ?? null,
          width: 9,
        })
        break
      case "ranking":
        for (const d of PRIORITY_DIMENSIONS) {
          columns.push({ header: `PR1_${d.key}`, value: (r) => r.ranking[d.id] ?? null, width: 12 })
        }
        break
      case "open":
        columns.push({ header: q.id, value: (r) => r.texts[q.id] ?? null, width: 40 })
        break
    }
    if (q.allowComment) columns.push({ header: `${q.id}_com`, value: (r) => r.comments[q.id] ?? null, width: 24 })
  }

  addTable(
    sheet,
    columns.map((c) => c.header),
    input.responses.map((r) => columns.map((c) => c.value(r))),
  ).forEach((row) => (row.getCell(2).numFmt = "yyyy-mm-dd hh:mm"))
  columns.forEach((c, i) => (sheet.getColumn(i + 1).width = c.width ?? 10))
}

// ---------- Hojas 4 y 5: Comentarios y abiertas ----------

function textRows(input: ExportInput, source: "comments" | "texts") {
  const leaderName = new Map(input.allLeaders.map((l) => [l.id, l.name]))
  const visible = new Set(input.report.leaders.map((l) => l.id))
  const rows: { date: Date; leader: string; seniority: string; code: string; text: string }[] = []
  for (const r of input.responses) {
    for (const [code, text] of Object.entries(r[source])) {
      rows.push({
        date: r.completedAt,
        leader: visible.has(r.leaderId) ? (leaderName.get(r.leaderId) ?? "") : "Otros líderes (segmento reducido)",
        seniority: seniorityLabel(r.seniority),
        code,
        text,
      })
    }
  }
  const order = new Map(QUESTIONS.map((q, i) => [q.id, i]))
  return rows.sort((a, b) => (order.get(a.code) ?? 0) - (order.get(b.code) ?? 0) || a.date.getTime() - b.date.getTime())
}

function commentsSheet(wb: ExcelJS.Workbook, input: ExportInput) {
  const sheet = wb.addWorksheet("Comentarios", { views: [{ state: "frozen", ySplit: 1 }] })
  if (input.report.insufficient) {
    sheet.addRow([INSUFFICIENT])
    return
  }
  addTable(
    sheet,
    ["Fecha", "Líder", "Antigüedad", "Código pregunta", "Bloque", "Pregunta", "Comentario"],
    textRows(input, "comments").map((row) => {
      const q = getQuestion(row.code)
      return [row.date, row.leader, row.seniority, row.code, q ? getBlock(q.block).name : "", q?.text ?? "", row.text]
    }),
    ["yyyy-mm-dd"],
  ).forEach((row) => {
    row.getCell(6).alignment = { wrapText: true, vertical: "top" }
    row.getCell(7).alignment = { wrapText: true, vertical: "top" }
  })
  ;[12, 16, 16, 10, 26, 50, 60].forEach((w, i) => (sheet.getColumn(i + 1).width = w))
}

function openSheet(wb: ExcelJS.Workbook, input: ExportInput) {
  const sheet = wb.addWorksheet("Preguntas abiertas", { views: [{ state: "frozen", ySplit: 1 }] })
  if (input.report.insufficient) {
    sheet.addRow([INSUFFICIENT])
    return
  }
  const openIds = new Set(OPEN_QUESTIONS.map((q) => q.id))
  addTable(
    sheet,
    ["Fecha", "Líder", "Antigüedad", "Código", "Pregunta", "Respuesta"],
    textRows(input, "texts")
      .filter((row) => openIds.has(row.code))
      .map((row) => [row.date, row.leader, row.seniority, row.code, getQuestion(row.code)?.text ?? "", row.text]),
    ["yyyy-mm-dd"],
  ).forEach((row) => {
    row.getCell(5).alignment = { wrapText: true, vertical: "top" }
    row.getCell(6).alignment = { wrapText: true, vertical: "top" }
  })
  ;[12, 16, 16, 9, 50, 70].forEach((w, i) => (sheet.getColumn(i + 1).width = w))
}

// ---------- Hoja 6: Configuración ----------

function configSheet(wb: ExcelJS.Workbook, input: ExportInput) {
  const { settings } = input
  const sheet = wb.addWorksheet("Configuración", { views: [{ showGridLines: false }] })
  sheet.getColumn(1).width = 56
  sheet.getColumn(2).width = 18
  const title = sheet.addRow(["Parámetros usados al generar el reporte"])
  title.getCell(1).font = { bold: true, size: 14, color: { argb: COLORS.section } }
  note(sheet, `Generado: ${formatDate(input.generatedAt, true)} · Filtros: ${input.filtersDescription}`)

  sectionTitle(sheet, "Líderes")
  addTable(sheet, ["Nombre", "Estado"], input.allLeaders.map((l) => [l.name, l.active ? "Activo" : "Inactivo"]))

  sectionTitle(sheet, "Umbrales")
  addTable(sheet, ["Parámetro", "Valor"], [
    ["Semáforo: promedio ≥ = Fortaleza", settings.strengthThreshold],
    ["Semáforo: promedio ≥ = A mejorar (menos = Crítico)", settings.improveThreshold],
    ["Umbral de alerta cruzada (promedio <)", settings.alertThreshold],
    ["Nota mínima considerada 'favorable'", settings.favorableMin],
    ["Brecha de acompañamiento significativa (niveles)", settings.frequencyGapThreshold],
    ["Mínimo de respuestas por segmento (anonimato)", settings.minResponsesForSegment],
  ])

  sectionTitle(sheet, "Frecuencia de acompañamiento (G3 y G4)")
  addTable(sheet, ["Opción", "Nivel"], input.frequencyOptions.map((o) => [o.label, o.level]))
}

export function buildResultsWorkbook(input: ExportInput): ExcelJS.Workbook {
  const wb = new ExcelJS.Workbook()
  wb.creator = "Diagnóstico de liderazgo · Reypar"
  wb.created = input.generatedAt
  summarySheet(wb, input)
  questionsSheet(wb, input)
  responsesSheet(wb, input)
  commentsSheet(wb, input)
  openSheet(wb, input)
  configSheet(wb, input)
  return wb
}

export async function exportResultsXlsx(input: ExportInput): Promise<Buffer> {
  const buffer = await buildResultsWorkbook(input).xlsx.writeBuffer()
  return Buffer.from(buffer)
}
