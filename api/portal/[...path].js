// Vercel function for every /api/portal/* route (login, submissions, approvals, logs). See server/portal/.
import { portalFromEnv } from '../../server/portal/index.js'

export default async function handler(req, res) {
  await portalFromEnv({ ...process.env, TRUST_PROXY: '1' })(req, res)
}
