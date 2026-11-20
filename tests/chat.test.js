import assert from 'node:assert/strict'
import test from 'node:test'

// The chat proxy talks to Gemini over fetch. These tests replace fetch with a fake so nothing leaves the machine.
process.env.GEMINI_API_KEY = 'test-key-not-real'
const { answerWithFallback } = await import('../server/chat.js')

const reply = (answer) => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify({ answer, links: [{ href: '/dates', label: 'Key dates' }, { href: 'https://evil.example/', label: 'x' }] }) }] } }] }), { status: 200 })
const status = (code) => new Response('{}', { status: code })
const contents = [{ role: 'user', parts: [{ text: 'hello' }] }]
const modelOf = (url) => String(url).match(/models\/([^:]+):/)[1]

function fakeFetch(handler) {
  const calls = []
  globalThis.fetch = async (url, init) => {
    const model = modelOf(url)
    calls.push(model)
    return handler(model, init)
  }
  return calls
}

test('the answer comes from whichever of the first two models replies first, and only listed links survive', async () => {
  fakeFetch(async (model) => (model === 'gemini-3.5-flash-lite' ? reply('from lite') : new Promise(() => {}))) // the other never answers
  const out = await answerWithFallback(contents, 'k', 'en', ['gemini-3.5-flash-lite', 'gemini-flash-latest', 'gemini-3.5-flash'])
  assert.equal(out.answer, 'from lite')
  assert.deepEqual(out.links.map((l) => l.href), ['/dates'])
})

test('an overloaded first model does not stop the second from answering', async () => {
  fakeFetch(async (model) => (model === 'gemini-3.5-flash-lite' ? status(503) : reply('from the second')))
  const out = await answerWithFallback(contents, 'k', 'en', ['gemini-3.5-flash-lite', 'gemini-flash-latest', 'gemini-3.5-flash'])
  assert.equal(out.answer, 'from the second')
})

test('when the first two fail the third is tried', async () => {
  const calls = fakeFetch(async (model) => (model === 'gemini-3.5-flash' ? reply('third time lucky') : status(503)))
  const out = await answerWithFallback(contents, 'k', 'en', ['gemini-3.5-flash-lite', 'gemini-flash-latest', 'gemini-3.5-flash'])
  assert.equal(out.answer, 'third time lucky')
  assert.ok(calls.includes('gemini-3.5-flash'))
})

test('a model that rejects thinkingLevel is asked again without it', async () => {
  const bodies = []
  fakeFetch(async (model, init) => {
    const cfg = JSON.parse(init.body).generationConfig
    bodies.push(Boolean(cfg.thinkingConfig))
    return cfg.thinkingConfig ? status(400) : reply('no thinking needed')
  })
  const out = await answerWithFallback(contents, 'k', 'en', ['gemini-flash-latest'])
  assert.equal(out.answer, 'no thinking needed')
  assert.deepEqual(bodies, [true, false])
})

test('when every model fails the error says whether it was rate limiting', async () => {
  fakeFetch(async () => status(429))
  await assert.rejects(answerWithFallback(contents, 'k', 'en', ['a', 'b', 'c']), (e) => e.status === 429)
  fakeFetch(async () => status(503))
  await assert.rejects(answerWithFallback(contents, 'k', 'en', ['a', 'b', 'c']), (e) => e.status === 503)
})

// --- reading the key and telling failures apart (server/geminiKey.js) ---
const { classifyUpstream, cleanKey, safeDetail } = await import('../server/geminiKey.js')

test('a pasted key is cleaned: spaces, quotes, newlines and a Bearer prefix go', () => {
  assert.equal(cleanKey('  AQ.Abc-123_xyz\r\n'), 'AQ.Abc-123_xyz')
  assert.equal(cleanKey('"AQ.Abc-123_xyz"'), 'AQ.Abc-123_xyz')
  assert.equal(cleanKey("'AIzaSyExample'"), 'AIzaSyExample')
  assert.equal(cleanKey('Bearer AIzaSyExample'), 'AIzaSyExample')
  assert.equal(cleanKey(undefined), '')
  assert.equal(cleanKey('   '), '')
})

test('a failed Gemini call is classified as a key problem, a quota problem or just down', () => {
  assert.equal(classifyUpstream({ status: 403, detail: '' }), 'key')
  assert.equal(classifyUpstream({ status: 400, detail: 'INVALID_ARGUMENT API key not valid. Please pass a valid API key.' }), 'key')
  assert.equal(classifyUpstream({ status: 400, detail: 'API_KEY_INVALID' }), 'key')
  assert.equal(classifyUpstream({ status: 429, detail: '' }), 'quota')
  assert.equal(classifyUpstream({ status: 400, detail: 'RESOURCE_EXHAUSTED' }), 'quota')
  assert.equal(classifyUpstream({ status: 504, detail: '' }), 'down')
  assert.equal(classifyUpstream({ status: 400, detail: 'INVALID_ARGUMENT thinkingLevel unsupported' }), 'down')
  assert.equal(classifyUpstream(undefined), 'down')
})

test('the error text kept for the log never contains the key', () => {
  const body = JSON.stringify({ error: { status: 'INVALID_ARGUMENT', message: 'API key not valid: SECRET-KEY-123' } })
  const out = safeDetail(body, 'SECRET-KEY-123')
  assert.ok(!out.includes('SECRET-KEY-123'))
  assert.match(out, /API key not valid/)
  assert.equal(safeDetail('<html>boom</html>', 'k').startsWith('<html>'), true)
})

test('a bad key answers the visitor kindly and says so in the log, not "a lot of questions"', async () => {
  const prev = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify({ error: { status: 'INVALID_ARGUMENT', message: 'API key not valid. Please pass a valid API key.' } }), { status: 400 })
  try {
    await assert.rejects(() => answerWithFallback(contents, 'bad', 'en', ['m1']), (e) => classifyUpstream(e) === 'key')
  } finally {
    globalThis.fetch = prev
  }
})

// --- the answer cache (server/answerCache.js) ---
const { createAnswerCache } = await import('../server/answerCache.js')
const one = (text) => [{ role: 'user', parts: [{ text }] }]

test('the same single question, written differently, hits the same cache entry', () => {
  const c = createAnswerCache()
  const k = c.keyFor(one('What is the NAAC grade?'), 'en')
  assert.equal(k, c.keyFor(one('  what IS the naac   grade '), 'en'))
  c.set(k, { answer: 'A++', links: [] })
  assert.deepEqual(c.get(c.keyFor(one('what is the NAAC grade'), 'en')), { answer: 'A++', links: [] })
})

test('a follow-up, an empty question and another language are never mixed up', () => {
  const c = createAnswerCache()
  assert.equal(c.keyFor([...one('hi there'), { role: 'model', parts: [{ text: 'hello' }] }, ...one('and fees?')], 'en'), null)
  assert.equal(c.keyFor(one('  '), 'en'), null)
  assert.notEqual(c.keyFor(one('fees'), 'en'), c.keyFor(one('fees'), 'ta'))
})

test('entries expire, and the oldest are dropped when full', () => {
  let t = 0
  const c = createAnswerCache({ max: 2, ttlMs: 1000, now: () => t })
  c.set('a', { answer: '1' }); c.set('b', { answer: '2' }); c.set('c', { answer: '3' })
  assert.equal(c.get('a'), null) // pushed out
  assert.equal(c.get('c').answer, '3')
  t = 5000
  assert.equal(c.get('c'), null) // expired
  assert.equal(c.get('b'), null) // expired too
  c.set('', { answer: 'x' })
  c.set('z', {}) // no answer text, nothing worth remembering
  assert.equal(c.size, 0)
})
