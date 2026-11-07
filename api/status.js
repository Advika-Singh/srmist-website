// Vercel serverless function: live checks of the SRMIST portals (GET /api/status). Same handler as the local server.
import { handleStatus } from '../server/status.js'

export default async function handler(req, res) {
  await handleStatus(req, res)
}
