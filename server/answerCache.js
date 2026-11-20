// A small in-memory memory of recent single-question answers, so the same question from many visitors costs one Gemini call.
// Only a question asked on its own (no earlier turns) is cached: a follow-up depends on the conversation, so it never is.

const normalise = (s) => String(s).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim()

export function createAnswerCache({ max = 300, ttlMs = 6 * 3_600_000, now = () => Date.now() } = {}) {
  const store = new Map()
  /** The cache key for a conversation, or null when it must not be cached. */
  const keyFor = (contents, lang) => {
    if (!Array.isArray(contents) || contents.length !== 1 || contents[0]?.role !== 'user') return null
    const text = normalise(contents[0]?.parts?.[0]?.text ?? '')
    return text.length >= 3 ? `${lang || 'en'}|${text}` : null
  }
  return {
    keyFor,
    get(key) {
      const hit = key ? store.get(key) : null
      if (!hit) return null
      if (now() - hit.at > ttlMs) {
        store.delete(key)
        return null
      }
      store.delete(key) // re-insert so the most recently used entries live longest
      store.set(key, hit)
      return hit.reply
    },
    set(key, reply) {
      if (!key || !reply?.answer) return
      store.delete(key)
      store.set(key, { at: now(), reply })
      while (store.size > max) store.delete(store.keys().next().value) // drop the least recently used
    },
    get size() {
      return store.size
    },
  }
}
