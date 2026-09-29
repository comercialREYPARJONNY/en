import { describe, expect, it } from "vitest"
import { collectComments, MASKED_LEADER_LABEL } from "../collect-comments"
import { response } from "./fixtures"

describe("comentarios", () => {
  const responses = [
    response({ leaderId: "A", comments: { CO4: "Por WhatsApp suele ser rápido." } }),
    response({ leaderId: "A", comments: { CO4: "A veces responde después de varias horas." } }),
    response({ leaderId: "B", comments: { CO4: "Los fines de semana se demora." } }),
    response({ leaderId: "A", comments: {} }),
  ]

  it("agrupa por pregunta y líder, ordenado alfabéticamente", () => {
    const [co4] = collectComments(responses, {
      source: "comments",
      questionIds: ["CO4", "L1"],
      leaderNames: { A: "Líder A", B: "Líder B" },
      visibleLeaderIds: new Set(["A", "B"]),
    })
    expect(co4.total).toBe(3)
    expect(co4.groups[0]).toEqual({
      leader: "Líder A",
      texts: ["A veces responde después de varias horas.", "Por WhatsApp suele ser rápido."],
    })
  })

  it("oculta el nombre de líderes con segmento pequeño", () => {
    const [co4] = collectComments(responses, {
      source: "comments",
      questionIds: ["CO4"],
      leaderNames: { A: "Líder A", B: "Líder B" },
      visibleLeaderIds: new Set(["A"]),
    })
    expect(co4.groups.map((g) => g.leader)).toEqual(["Líder A", MASKED_LEADER_LABEL])
  })
})
