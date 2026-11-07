// Vercel serverless function for the enquiry forms (POST /api/enquiry). Same handler as the local server.
import { handleEnquiry } from '../server/enquiry.js'

export default async function handler(req, res) {
  await handleEnquiry(req, res, { ...process.env, TRUST_PROXY: '1' })
}
