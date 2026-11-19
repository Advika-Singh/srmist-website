// Vercel function for /api/public/* (approved announcements and events only).
import { portalFromEnv } from '../../server/portal/index.js'

export default async function handler(req, res) {
  await portalFromEnv({ ...process.env, TRUST_PROXY: '1' })(req, res)
}
