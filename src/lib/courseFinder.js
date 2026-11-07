// Turns the course finder's answers into a ranked list of fields of study. Pure logic, no browser APIs.
import { QUESTIONS } from '../data/finder-questions.js'
import { PROGRAMMES } from '../data/programmes.js'

/** answers: { [questionId]: optionId | optionId[] }. Returns up to `limit` fields, best first, each with its reasons. */
export function recommend(answers, limit = 3) {
  const level = answers.level
  const scores = new Map(PROGRAMMES.map((p) => [p.id, { score: 0, reasons: [] }]))

  for (const q of QUESTIONS) {
    const picked = [].concat(answers[q.id] ?? [])
    for (const optId of picked) {
      const opt = q.options.find((o) => o.id === optId)
      if (!opt) continue
      for (const [id, w] of Object.entries(opt.w)) {
        const s = scores.get(id)
        if (!s) continue
        s.score += w
        if (w >= 2) s.reasons.push(opt.label)
      }
    }
  }

  const ranked = PROGRAMMES.filter((p) => !level || p.levels.includes(level))
    .map((p) => ({ ...p, ...scores.get(p.id) }))
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score || a.field.localeCompare(b.field))
    .slice(0, limit)

  const top = ranked[0]?.score ?? 1
  return ranked.map((p, i) => ({
    ...p,
    strength: p.score / top, // 0..1, relative to the best match
    label: i === 0 ? 'Best match' : p.score / top >= 0.7 ? 'Strong match' : 'Worth a look',
    reasons: [...new Set(p.reasons)].slice(0, 3),
  }))
}

/** Which questions still need an answer before the finder can recommend (optional ones never block). */
export const unanswered = (answers) =>
  QUESTIONS.filter((q) => !q.optional && [].concat(answers[q.id] ?? []).length === 0).map((q) => q.id)
