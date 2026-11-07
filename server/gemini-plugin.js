import { handleChat } from './chat.js'
import { handleComplaints } from './complaints.js'
import { handleEnquiry } from './enquiry.js'
import { applySecurityHeaders } from './security.js'
import { handleStatus } from './status.js'
import { handleTranslate } from './translate.js'

/**
 * Serves POST /api/chat in `vite` (dev) and `vite preview`, and adds the security headers.
 * The key never reaches the client bundle. The strict script policy is applied to `preview`
 * (the built site); the dev server needs inline scripts for hot reloading, so it gets the other headers only.
 */
export function geminiProxy(env) {
  const attach = (server, csp) => {
    server.middlewares.use((req, res, next) => {
      applySecurityHeaders(req, res, { csp })
      next()
    })
    server.middlewares.use('/api/chat', (req, res) => {
      handleChat(req, res, env).catch(() => {
        res.statusCode = 500
        res.end(JSON.stringify({ error: 'Something went wrong.' }))
      })
    })
    server.middlewares.use('/api/translate', (req, res) => {
      handleTranslate(req, res, env).catch(() => {
        res.statusCode = 500
        res.end(JSON.stringify({ error: 'Something went wrong.' }))
      })
    })
    server.middlewares.use('/api/enquiry', (req, res) => {
      handleEnquiry(req, res, env).catch(() => {
        res.statusCode = 500
        res.end(JSON.stringify({ error: 'Something went wrong.' }))
      })
    })
    server.middlewares.use('/api/status', (req, res) => {
      handleStatus(req, res)
    })
    server.middlewares.use('/api/complaints', (req, res) => {
      handleComplaints(req, res, env).catch(() => {
        res.statusCode = 500
        res.end(JSON.stringify({ error: 'Something went wrong.' }))
      })
    })
  }
  return {
    name: 'srm-gemini-proxy',
    configureServer: (server) => attach(server, false),
    configurePreview: (server) => attach(server, true),
  }
}
