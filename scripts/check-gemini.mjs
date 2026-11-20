// Run: npm run check:gemini     Tells you whether the Gemini key in .env (or the environment) works, and which of the assistant's models answer.
// It never prints the key. Exit code 0 only when at least one model answers.
import fs from 'node:fs'
import { classifyUpstream, cleanKey, safeDetail } from '../server/geminiKey.js'

const fromFile = () => {
  for (const f of ['.env.local', '.env']) {
    if (!fs.existsSync(f)) continue
    const line = fs.readFileSync(f, 'utf8').split(/\r?\n/).find((l) => l.startsWith('GEMINI_API_KEY='))
    if (line) return line.slice('GEMINI_API_KEY='.length)
  }
  return ''
}
const key = cleanKey(process.env.GEMINI_API_KEY || fromFile())
if (!key) {
  console.log('No GEMINI_API_KEY found in the environment, .env.local or .env. Create one at https://aistudio.google.com/apikey')
  process.exit(1)
}
console.log(`Key found (${key.length} characters, starts with "${key.slice(0, 3)}…").`)

const hint = { key: 'The key is rejected: replace it in Google AI Studio and in the Vercel settings.', quota: 'The quota is used up: wait, or enable billing for the key\'s project.', down: 'Google did not answer properly: try again in a minute.' }
let ok = 0
for (const model of (process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : ['gemini-3.5-flash-lite', 'gemini-flash-latest', 'gemini-3.5-flash'])) {
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Say OK.' }] }], generationConfig: { maxOutputTokens: 20 } }),
      signal: AbortSignal.timeout(20000),
    })
    if (r.ok) {
      ok++
      console.log(`  ${model}: works`)
    } else {
      const detail = safeDetail(await r.text(), key)
      console.log(`  ${model}: HTTP ${r.status} (${classifyUpstream({ status: r.status, detail })}) ${detail}`)
      console.log(`    -> ${hint[classifyUpstream({ status: r.status, detail })]}`)
    }
  } catch (e) {
    console.log(`  ${model}: no answer (${e?.name || 'error'})`)
  }
}
console.log(ok ? `\n${ok} model(s) answer. The assistant will work with this key.` : '\nNo model answered. The assistant will not work with this key.')
process.exit(ok ? 0 : 1)
