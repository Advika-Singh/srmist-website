// Vercel serverless function for the issue tracker (/api/complaints). Same handler as the local server.
// Vercel's file system is temporary, so issues only survive for a short while there. Set COMPLAINTS_WEBHOOK_URL
// (or swap the store for a database) before relying on it in production.
import { handleComplaints } from '../server/complaints.js'

export default async function handler(req, res) {
  await handleComplaints(req, res, { ...process.env, TRUST_PROXY: '1' })
}
