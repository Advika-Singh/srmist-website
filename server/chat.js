// Server-side Gemini proxy for the "DAAS" assistant.
// The API key only ever lives here (read from GEMINI_API_KEY in .env); the browser
// talks to POST /api/chat and never sees it.

import { MENUS } from '../src/data/nav.js'
import { EVENTS } from '../src/data/events.js'
import { MIN_AGGREGATE, PHASES } from '../src/data/srmjeee.js'
import { formatRange, upcoming } from '../src/lib/events.js'
import { sameOrigin } from './security.js'

const API = 'https://generativelanguage.googleapis.com/v1beta/models'
const MODELS = process.env.GEMINI_MODEL
  ? [process.env.GEMINI_MODEL]
  : ['gemini-3.5-flash-lite', 'gemini-flash-latest', 'gemini-3.5-flash']

/* ---------- pages the assistant is allowed to link to ---------- */
const PAGES = [
  ['Home', '/'],
  ['About SRMIST', '/about'],
  ['Academics (colleges and fields of study)', '/academics'],
  ['Admissions overview and enquiry form', '/admissions'],
  ['Apply online (application form)', '/apply'],
  ['Research', '/research'],
  ['Campus life', '/campus-life'],
  ['Programme Finder', '/programmes'],
  ['International', '/international'],
  ['Placements', '/placements'],
  ['Rankings and accreditation', '/rankings'],
  ['Scholarships and financial aid', '/scholarships'],
  ['News and events', '/events'],
  ['Library', '/library'],
  ['SRMJEEE 2027: dates, eligibility check and how to register', '/srmjeee'],
  ['Key dates with calendar files', '/dates'],
  ['Events calendar', '/events/calendar'],
  ['Compare programmes side by side', '/compare'],
  ['Course finder', '/course-finder'],
  ['Contact numbers and address', '/contact'],
  ['Departments A–Z', '/departments'],
  ['Examinations', '/examinations'],
  ['Alumni', '/alumni'],
  ['Faculty gateway: leadership and faculty resources', '/teach.html'],
  ['Staff and faculty finder', '/staff-finder'],
  ['Official SRM website', 'https://www.srmist.edu.in/'],
  ['Official online application portal', 'https://applications.srmist.edu.in/'],
  ['NIRF 2025 announcement', 'https://www.srmist.edu.in/srmist-ranked-22nd-overall-and-11th-among-universities-in-nirf-2025/'],
  ['Contact SRMIST (official)', 'https://www.srmist.edu.in/contact-us/'],
]
for (const m of MENUS) for (const c of m.cols) for (const [label, href] of c.links) PAGES.push([label, href])

const ALLOWED = new Map()
for (const [label, href] of PAGES) if (!ALLOWED.has(href)) ALLOWED.set(href, label)

/* ---------- facts built from this site's own data (dates move on by themselves) ---------- */
const SRMJEEE_FACTS = () =>
  `- SRMJEEE 2027 (B.Tech and M.Tech Integrated entrance exam, computer-based): ${PHASES.map((p) => `Phase ${p.n} exam ${p.exam}, apply by ${p.deadlineLabel}`).join('; ')}. All dates are tentative per SRMIST. Application fee 1,400 rupees per phase, non-refundable. Eligibility: Class 12 passed or appearing, at least ${MIN_AGGREGATE}% aggregate in Physics, Mathematics and one more listed subject. Official page: https://applications.srmist.edu.in/btech`
const EVENT_FACTS = () => {
  const list = upcoming(EVENTS).slice(0, 8)
  return list.length ? `- Upcoming events (official events page, read 19 Nov 2026): ${list.map((e) => `${e.title} (${formatRange(e.start, e.end)})`).join('; ')}. The site's events calendar page has all of them.` : '- No upcoming events are listed right now.'
}

/* ---------- facts the assistant may state (from srmist.edu.in) ---------- */
const FACTS = () => `
- SRM Institute of Science and Technology (SRMIST) is a university based at Kattankulathur, Chennai, Tamil Nadu 603203. Motto: Learn. Leap. Lead.
- Campuses: Kattankulathur, Ramapuram and Vadapalani (Chennai); Tiruchirappalli; Delhi-NCR; Baburayanpettai (Acharapakkam, Chengalpattu). Group universities: SRM University AP (Andhra Pradesh), SRM University Haryana, SRM University Sikkim.
- Colleges: Engineering & Technology; Medicine & Health Sciences (Medicine, Dentistry, Pharmacy, Physiotherapy, Occupational Therapy, Nursing, Public Health); Management; Science & Humanities; Law; Agricultural Sciences; Architecture; Hotel Management; plus Distance and Online Education. Programmes at undergraduate, postgraduate and doctoral level.
- Accreditation: NAAC A++ (4th cycle, valid 16 Jun 2024 to 15 Jun 2031).
- NIRF 2025: 22nd overall, 11th in the University category; Engineering 14, Pharmacy 10, Medical 18, Dental (Ramapuram) 8, Architecture 18, Law 25, Agriculture 33, Management 56, Research 25, SDG 4.
- Other rankings on the official site: ARIIA 2nd among private universities; Nature Index 2nd among private universities.
- Placements, 2025 batch (as on 12 June 2026): 10,190+ offers, 4,346+ high-paying offers, 1,448+ roles, highest CTC 61 LPA, average CTC 6.5 LPA.
- Research: 1,100+ patents, 58,000+ publications, 660+ externally funded projects worth 294+ crore rupees.
- Global: more than 200 students sponsored every year to over 35 foreign universities (including MIT, Carnegie Mellon, UC Davis, Warwick, University of Western Australia); International Advisory Board constituted in 2003; Semester Abroad Programme.
- Admissions 2027 is open for enquiry. Separate application portals exist for India and international applicants. Admissions phone: +91 70 2645 2645 (Engineering, Agriculture, Architecture) and +91 70 2647 2647 (Liberal Arts and Business Studies, Law, Management, Medical and Allied Health Sciences, Hotel Management). University enquiries: +91 44 2741 7000 or +91 44 2741 7777.
${EVENT_FACTS()}
${SRMJEEE_FACTS()}
- Recent news: 22nd Convocation; a student recognised at Apple's Swift Student Challenge 2026; Team Camber Racing won a national title at Formula Bharat 2026.
`.trim()

const LANG_RULE = {
  ta: `
- The visitor chose Tamil for this website: write the answer and the link reasons in Tamil unless they write in another language.`,
  hi: `
- The visitor chose Hindi for this website: write the answer and the link reasons in Hindi unless they write in another language.`,
}

const SYSTEM = (lang) => `You are SRM Guide, the website assistant for SRM Institute of Science and Technology (SRMIST). You help prospective students, parents, current students and visitors find information and the right page on this website.

RULES
- Use ONLY the FACTS and PAGES below. If something is not covered (fees, cut-offs, exact dates, eligibility details, people's names), say you don't have that detail and point to the admissions phone numbers or the official website. Never invent numbers, dates, names, phone numbers or URLs.
- Be warm, concrete and brief: under 110 words, plain text. No headings. If you use bullets, put EACH bullet on its own line (separated with a newline character) starting with "- ".
- Stay on topic (SRMIST and studying/working there). Politely decline anything unrelated.
- For admissions, fees and deadlines, remind the user to confirm details with the admissions team or the official site.
- Reply in the language the user writes in (English by default).${LANG_RULE[lang] ?? ''}
- In "links", give 1 to 3 pages that best help next. Each "href" must be copied EXACTLY from the PAGES list, with a short "reason" (max 8 words).
- Today's date is ${new Date().toISOString().slice(0, 10)}.

FACTS
${FACTS()}

PAGES (label: href)
${[...ALLOWED].map(([href, label]) => `- ${label}: ${href}`).join('\n')}`

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    answer: { type: 'STRING' },
    links: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { label: { type: 'STRING' }, href: { type: 'STRING' }, reason: { type: 'STRING' } },
        required: ['label', 'href'],
      },
    },
  },
  required: ['answer'],
}

/* ---------- tiny per-IP rate limit ---------- */
const hits = new Map()
function limited(ip) {
  const now = Date.now()
  if (hits.size > 5000) for (const [k, v] of hits) if (now - v[v.length - 1] > 60_000) hits.delete(k) // keep memory bounded
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60_000)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > 20
}

function readBody(req, max = 16_000) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (c) => {
      size += c.length
      if (size > max) {
        reject(Object.assign(new Error('Request too large'), { status: 413 }))
        req.destroy()
      } else chunks.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

const send = (res, status, body) => {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(body))
}

// Gemini is sometimes slow or overloaded (a model can sit for 25 s and then answer 503). Vercel stops this function at 30 s, so
// each attempt gets a short timeout, and the first two models are asked at once: whichever answers first wins.
const ATTEMPT_MS = 11_000
const DEADLINE_MS = 26_000

async function callGemini(model, key, contents, withThinking, lang, signal) {
  const generationConfig = {
    temperature: 0.4,
    maxOutputTokens: 1024,
    responseMimeType: 'application/json',
    responseSchema: SCHEMA,
  }
  if (withThinking) generationConfig.thinkingConfig = { thinkingLevel: 'minimal' }
  return fetch(`${API}/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM(lang) }] }, contents, generationConfig }),
    signal: AbortSignal.any([signal, AbortSignal.timeout(ATTEMPT_MS)]),
  })
}

/** One model, start to finish: resolves with { answer, links } or rejects with an error carrying the HTTP status. */
async function askModel(model, key, contents, lang, signal) {
  for (const withThinking of [true, false]) {
    const r = await callGemini(model, key, contents, withThinking, lang, signal)
    if (r.status === 400 && withThinking) continue // this model may not accept thinkingLevel: ask again without it
    if (!r.ok) throw Object.assign(new Error('Gemini error'), { status: r.status })
    const data = await r.json()
    const parts = data?.candidates?.[0]?.content?.parts || []
    const text = [...parts].reverse().find((p) => typeof p.text === 'string')?.text
    if (!text) throw Object.assign(new Error('Empty answer'), { status: 502 })
    let out
    try {
      out = JSON.parse(text)
    } catch {
      out = { answer: text }
    }
    const links = (Array.isArray(out.links) ? out.links : [])
      .filter((l) => l && ALLOWED.has(l.href))
      .slice(0, 3)
      .map((l) => ({ label: String(l.label || ALLOWED.get(l.href)).slice(0, 60), reason: String(l.reason || '').slice(0, 60), href: l.href }))
    return { answer: String(out.answer || '').trim() || 'Sorry, I could not find an answer to that.', links }
  }
  throw Object.assign(new Error('Bad request'), { status: 400 })
}

/** The first two models race; if both fail, the rest are tried one at a time until the deadline. */
export async function answerWithFallback(contents, key, lang, models = MODELS) {
  const all = new AbortController()
  const deadline = AbortSignal.any([all.signal, AbortSignal.timeout(DEADLINE_MS)])
  let status = 502
  const note = (e) => {
    status = e?.status === 429 || status === 429 ? 429 : (e?.status ?? 504)
    throw e
  }
  try {
    return await Promise.any(models.slice(0, 2).map((m) => askModel(m, key, contents, lang, deadline).catch(note)))
  } catch {
    for (const m of models.slice(2)) {
      if (deadline.aborted) break
      try {
        return await askModel(m, key, contents, lang, deadline)
      } catch (e) {
        note2(e)
      }
    }
    throw Object.assign(new Error('All models failed'), { status })
  } finally {
    all.abort() // stop whichever request lost the race
  }
  function note2(e) {
    status = e?.status === 429 || status === 429 ? 429 : (e?.status ?? 504)
  }
}

export async function handleChat(req, res, env = process.env) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST.' })
  // Only our own pages may call this endpoint, and only with JSON.
  if (!sameOrigin(req)) return send(res, 403, { error: 'Forbidden.' })
  if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) return send(res, 415, { error: 'Send JSON.' })
  const key = env.GEMINI_API_KEY
  if (!key) return send(res, 503, { error: 'The assistant is not configured yet (missing GEMINI_API_KEY).' })
  const forwarded = env.TRUST_PROXY === '1' ? String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() : ''
  if (limited(forwarded || req.socket?.remoteAddress || 'local')) return send(res, 429, { error: 'Too many questions — please wait a moment.' })

  let messages
  let lang = 'en'
  try {
    // On Vercel the body arrives already parsed (req.body); elsewhere we read the stream ourselves.
    const raw = req.body !== undefined ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body)) : await readBody(req)
    if (raw.length > 16_000) throw Object.assign(new Error('Request too large'), { status: 413 })
    const parsed = JSON.parse(raw)
    messages = parsed.messages
    if (parsed.lang === 'ta' || parsed.lang === 'hi') lang = parsed.lang
  } catch (e) {
    return send(res, e.status || 400, { error: 'Invalid request.' })
  }
  if (!Array.isArray(messages) || messages.length === 0) return send(res, 400, { error: 'No question provided.' })

  // Keep the last few turns; cap each message so nobody can burn the quota with one giant prompt.
  const contents = messages
    .slice(-10)
    .filter((m) => m && typeof m.text === 'string' && m.text.trim())
    .map((m) => ({ role: m.role === 'bot' ? 'model' : 'user', parts: [{ text: m.text.trim().slice(0, 800) }] }))
  if (!contents.length || contents[contents.length - 1].role !== 'user') return send(res, 400, { error: 'No question provided.' })

  try {
    return send(res, 200, await answerWithFallback(contents, key, lang))
  } catch (e) {
    return send(res, 502, { error: e?.status === 429 ? 'SRM Guide is getting a lot of questions — try again in a moment.' : 'SRM Guide is unavailable right now. Please try again.' })
  }
}
