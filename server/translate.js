// Server-side translation for the language switcher (POST /api/translate).
// The browser sends the visible English text of a page in small batches; Gemini returns Tamil or Hindi.
// The key stays here (GEMINI_API_KEY), results are cached in memory, and each browser also caches what it has seen.

import { sameOrigin } from './security.js'
import { clean, makeLimiter, readJson, send } from './util.js'

const API = 'https://generativelanguage.googleapis.com/v1beta/models'
const MODELS = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest']

export const TARGETS = { ta: 'Tamil', hi: 'Hindi' }
export const MAX_ITEMS = 60
export const MAX_ITEM_CHARS = 500

const limited = makeLimiter(40, 60_000)
const cache = new Map() // `${lang}\u0000${english}` -> translation
const remember = (k, v) => {
  if (cache.size > 30_000) cache.delete(cache.keys().next().value)
  cache.set(k, v)
}

const SCHEMA = { type: 'OBJECT', properties: { translations: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['translations'] }

const SYSTEM = (language) => `You translate the visible text of a university website (SRM Institute of Science and Technology, Chennai) from English into ${language}.

RULES
- Return exactly one translation per input string, in the same order. The array length must match the input.
- Natural, simple ${language} that a student or parent would read; keep the tone of the original (headings stay short).
- Keep unchanged: proper names and acronyms (SRM, SRMIST, NAAC, NIRF, JEE, NEET, LMS, TECHNOBLIZZ, DAAS, names of people and places), numbers, dates, currency amounts, emails, phone numbers, URLs, code, and symbols such as arrows or bullets.
- Keep leading and trailing punctuation. Do not add explanations, notes or quotation marks.
- If a string is only a name, number or symbol, return it unchanged.`

async function callGemini(model, key, language, texts, withThinking) {
  const generationConfig = { temperature: 0.2, maxOutputTokens: 8192, responseMimeType: 'application/json', responseSchema: SCHEMA }
  if (withThinking) generationConfig.thinkingConfig = { thinkingLevel: 'minimal' }
  return fetch(`${API}/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM(language) }] },
      contents: [{ role: 'user', parts: [{ text: JSON.stringify(texts) }] }],
      generationConfig,
    }),
    signal: AbortSignal.timeout(28_000),
  })
}

// Models sometimes slip into a neighbouring Indic script (for example Bengali inside Hindi). Catch that and retry once.
const WRONG_SCRIPT = {
  ta: /[ऀ-୿ఀ-෿]/, // anything Indic that is not Tamil (Tamil is ஀-௿)
  hi: /[ঀ-෿]/, // anything Indic that is not Devanagari
}
const wrongScript = (lang, s) => WRONG_SCRIPT[lang].test(s)

async function translateBatch(key, lang, texts) {
  const first = await translateOnce(key, lang, texts)
  if (!first) return null
  const bad = first.map((s, i) => (wrongScript(lang, s) ? i : -1)).filter((i) => i >= 0)
  if (bad.length) {
    const again = await translateOnce(key, lang, bad.map((i) => texts[i]))
    bad.forEach((i, k) => {
      const fixed = again?.[k]
      first[i] = fixed && !wrongScript(lang, fixed) ? fixed : texts[i] // still wrong: keep the English rather than show a wrong script
    })
  }
  return first
}

async function translateOnce(key, lang, texts) {
  const language = TARGETS[lang]
  for (const model of MODELS) {
    for (const withThinking of [true, false]) {
      try {
        const r = await callGemini(model, key, language, texts, withThinking)
        if (r.status === 400 && withThinking) continue
        if (!r.ok) break
        const data = await r.json()
        const parts = data?.candidates?.[0]?.content?.parts || []
        const raw = [...parts].reverse().find((p) => typeof p.text === 'string')?.text
        const out = JSON.parse(raw || '{}').translations
        if (Array.isArray(out) && out.length === texts.length && out.every((s) => typeof s === 'string')) return out
        break
      } catch {
        break
      }
    }
  }
  return null
}

export async function handleTranslate(req, res, env = process.env) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST.' })
  if (!sameOrigin(req)) return send(res, 403, { error: 'Forbidden.' })
  const key = env.GEMINI_API_KEY
  if (!key) return send(res, 503, { error: 'Translation is not configured.' })
  const ip = (env.TRUST_PROXY === '1' && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket?.remoteAddress || 'local'
  if (limited(ip)) return send(res, 429, { error: 'Too many requests.' })

  let body
  try {
    body = await readJson(req, 60_000)
  } catch (e) {
    return send(res, e.status || 400, { error: e.message || 'Invalid request.' })
  }
  const lang = String(body.lang || '')
  if (!TARGETS[lang]) return send(res, 400, { error: 'Unsupported language.' })
  if (!Array.isArray(body.texts) || body.texts.length === 0 || body.texts.length > MAX_ITEMS) return send(res, 400, { error: 'Send between 1 and 60 strings.' })
  const texts = body.texts.map((t) => clean(t, MAX_ITEM_CHARS))

  const out = new Array(texts.length)
  const missing = []
  texts.forEach((t, i) => {
    const hit = cache.get(`${lang}\u0000${t}`)
    if (hit !== undefined) out[i] = hit
    else if (!t) out[i] = ''
    else missing.push(i)
  })
  if (missing.length) {
    const unique = [...new Set(missing.map((i) => texts[i]))]
    const got = await translateBatch(key, lang, unique)
    if (!got) return send(res, 502, { error: 'Translation is unavailable right now.' })
    const map = new Map(unique.map((t, i) => [t, got[i]]))
    for (const [t, v] of map) remember(`${lang}\u0000${t}`, v)
    for (const i of missing) out[i] = map.get(texts[i])
  }
  return send(res, 200, { translations: out })
}
