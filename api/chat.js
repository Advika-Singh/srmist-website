// Vercel serverless function for the "DAAS" assistant (POST /api/chat).
// Same handler as the local server: it holds the Gemini key (GEMINI_API_KEY, set in the Vercel
// project's environment variables) so the browser never sees it.
import { handleChat } from '../server/chat.js'

export default async function handler(req, res) {
  // Behind Vercel's proxy the real client address is in x-forwarded-for.
  await handleChat(req, res, { ...process.env, TRUST_PROXY: '1' })
}
