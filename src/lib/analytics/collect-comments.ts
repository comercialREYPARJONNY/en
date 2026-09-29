import type { AnalyticsResponse } from "./types"

export const MASKED_LEADER_LABEL = "Otros líderes (segmento reducido)"

export type CommentGroup = { leader: string; texts: string[] }
export type QuestionComments = { questionId: string; groups: CommentGroup[]; total: number }

/**
 * Agrupa textos libres por pregunta y por líder, sin ningún dato del participante.
 * - Los textos se ordenan alfabéticamente para no revelar el orden de llegada.
 * - Los líderes con menos respuestas que el mínimo se agrupan sin nombre.
 */
export function collectComments(
  responses: ReadonlyArray<AnalyticsResponse>,
  options: {
    source: "comments" | "texts"
    questionIds: ReadonlyArray<string>
    leaderNames: Record<string, string>
    visibleLeaderIds: ReadonlySet<string>
  },
): QuestionComments[] {
  const collator = new Intl.Collator("es")
  return options.questionIds
    .map((questionId) => {
      const byLeader = new Map<string, string[]>()
      for (const r of responses) {
        const text = r[options.source][questionId]
        if (!text) continue
        const label = options.visibleLeaderIds.has(r.leaderId)
          ? (options.leaderNames[r.leaderId] ?? MASKED_LEADER_LABEL)
          : MASKED_LEADER_LABEL
        byLeader.set(label, [...(byLeader.get(label) ?? []), text])
      }
      const groups = [...byLeader.entries()]
        .map(([leader, texts]) => ({ leader, texts: texts.sort(collator.compare) }))
        .sort((a, b) =>
          a.leader === MASKED_LEADER_LABEL ? 1 : b.leader === MASKED_LEADER_LABEL ? -1 : collator.compare(a.leader, b.leader),
        )
      return { questionId, groups, total: groups.reduce((n, g) => n + g.texts.length, 0) }
    })
    .filter((q) => q.total > 0)
}
