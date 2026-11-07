// Vercel serverless function for search and assistant metrics (POST /api/search-log). Same handler as the local server.
import { handleSearchLog } from '../server/searchlog.js'

export default async function handler(req, res) {
  await handleSearchLog(req, res, { ...process.env, TRUST_PROXY: '1' })
}
