// Vercel serverless function for the language switcher (POST /api/translate). Same handler as the local server.
import { handleTranslate } from '../server/translate.js'

export default async function handler(req, res) {
  await handleTranslate(req, res, { ...process.env, TRUST_PROXY: '1' })
}
