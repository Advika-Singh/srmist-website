// Reading the Gemini key safely and telling the three ways a Gemini call fails apart.
// Used by the chat assistant and the translator. Nothing here ever returns or logs the key itself.

/** A key as people paste it: stray spaces, quotes, a trailing newline or a "Bearer " prefix are removed. */
export function cleanKey(raw) {
  let k = String(raw ?? '').trim()
  const quoted = k.match(/^(['"`])(.*)\1$/s)
  if (quoted) k = quoted[2].trim()
  return k.replace(/^Bearer\s+/i, '').replace(/\s+/g, '')
}

/**
 * What went wrong with an upstream call, from its HTTP status and the error text Google sent:
 *   'key'   the key is missing, invalid, expired or has no permission: only the owner can fix it
 *   'quota' the free quota or rate limit is used up: it clears by itself, or needs billing
 *   'down'  anything else (timeouts, Google having a bad moment)
 */
export function classifyUpstream({ status, detail = '' } = {}) {
  const text = String(detail)
  if (status === 401 || status === 403 || /API[_ ]KEY[_ ]INVALID|api key (not valid|expired)|PERMISSION_DENIED|key.*(revoked|suspended)/i.test(text)) return 'key'
  if (status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(text)) return 'quota'
  return 'down'
}

/** The error text Google sent, shortened, with the key removed, safe to put in a log. */
export function safeDetail(body, key = '') {
  let msg = ''
  try {
    const j = JSON.parse(body)
    msg = `${j?.error?.status ?? ''} ${j?.error?.message ?? ''}`.trim()
  } catch {
    msg = String(body || '')
  }
  if (key) msg = msg.split(key).join('…')
  return msg.replace(/key=[^&\s]+/g, 'key=…').slice(0, 240)
}
