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
