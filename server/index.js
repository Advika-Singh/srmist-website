// Production server: serves the built site from ./dist with compression, long-lived caching for
// fingerprinted files, security headers, and the /api/chat Gemini proxy.
//   npm run build && npm start        (PORT, HOST, GEMINI_API_KEY via environment or .env)

import http from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { extname, join, resolve, sep } from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { handleChat } from './chat.js'
import { handleTranslate } from './translate.js'
import { handleComplaints } from './complaints.js'
import { handleEnquiry } from './enquiry.js'
import { handleStatus, startStatusSampler } from './status.js'
import { applySecurityHeaders } from './security.js'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
try {
  process.loadEnvFile?.(join(ROOT, '.env'))
} catch {
  /* no .env: the key may be provided by the environment instead */
}
const DIST = join(ROOT, 'dist')
const PORT = Number(process.env.PORT) || 4173
const HOST = process.env.HOST || '0.0.0.0'

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
}
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.json', '.svg', '.txt', '.xml'])

// compressed copies are made once and kept in memory
const cache = new Map()
function load(path, ext, stat) {
  const key = `${path}:${stat.mtimeMs}`
  let hit = cache.get(key)
  if (hit) return hit
  const raw = readFileSync(path)
  hit = { raw, etag: `W/"${stat.size.toString(16)}-${Math.round(stat.mtimeMs).toString(16)}"` }
  if (COMPRESSIBLE.has(ext) && raw.length > 512) {
    hit.br = zlib.brotliCompressSync(raw, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 9 } })
    hit.gz = zlib.gzipSync(raw, { level: 9 })
  }
  cache.set(key, hit)
  return hit
}

function cacheControl(url, ext) {
  if (ext === '.html') return 'no-cache' // always revalidate (cheap 304 with the ETag)
  if (url.startsWith('/assets/')) return 'public, max-age=31536000, immutable' // file names contain a content hash
  return 'public, max-age=2592000' // fonts, logos, favicon: 30 days
}

function serveFile(req, res, file, urlPath) {
  const ext = extname(file)
  const stat = statSync(file)
  const f = load(file, ext, stat)
  const accept = String(req.headers['accept-encoding'] || '')
  let body = f.raw
  let encoding = null
  if (f.br && /\bbr\b/.test(accept)) [body, encoding] = [f.br, 'br']
  else if (f.gz && /\bgzip\b/.test(accept)) [body, encoding] = [f.gz, 'gzip']
  res.setHeader('Content-Type', TYPES[ext] || 'application/octet-stream')
  res.setHeader('Cache-Control', cacheControl(urlPath, ext))
  res.setHeader('ETag', f.etag)
  res.setHeader('Vary', 'Accept-Encoding')
  if (encoding) res.setHeader('Content-Encoding', encoding)
  if (req.headers['if-none-match'] === f.etag) {
    res.statusCode = 304
    return res.end()
  }
  res.setHeader('Content-Length', body.length)
  res.statusCode = 200
  res.end(req.method === 'HEAD' ? undefined : body)
}

const server = http.createServer((req, res) => {
  applySecurityHeaders(req, res)
  const url = new URL(req.url, 'http://x')
  let pathname
  try {
    pathname = decodeURIComponent(url.pathname)
  } catch {
    res.statusCode = 400
    return res.end('Bad request')
  }

  if (pathname === '/api/chat') {
    return handleChat(req, res, process.env).catch(() => {
      res.statusCode = 500
      res.end('{"error":"Something went wrong."}')
    })
  }
  if (pathname === '/api/translate') {
    return handleTranslate(req, res, process.env).catch(() => {
      res.statusCode = 500
      res.end('{"error":"Something went wrong."}')
    })
  }
  if (pathname === '/api/enquiry') {
    return handleEnquiry(req, res, process.env).catch(() => {
      res.statusCode = 500
      res.end('{"error":"Something went wrong."}')
    })
  }
  if (pathname === '/api/status') return handleStatus(req, res)
  if (pathname === '/api/complaints') {
    return handleComplaints(req, res, process.env).catch(() => {
      res.statusCode = 500
      res.end('{"error":"Something went wrong."}')
    })
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405
    return res.end('Method not allowed')
  }

  // dotfiles (.env, .git …) are never served; /.well-known/ is the one exception
  if (pathname.split('/').some((seg) => seg.startsWith('.') && seg !== '.well-known' && seg !== '')) {
    res.statusCode = 404
    return res.end('Not found')
  }

  // never leave the dist folder
  const file = resolve(DIST, '.' + pathname)
  if (file !== DIST && !file.startsWith(DIST + sep)) {
    res.statusCode = 403
    return res.end('Forbidden')
  }
  if (existsSync(file) && statSync(file).isFile()) return serveFile(req, res, file, pathname)

  // pages like /about are handled by the React router: hand back the app shell
  if (!extname(pathname)) return serveFile(req, res, join(DIST, 'index.html'), '/index.html')

  res.statusCode = 404
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.end('Not found')
})

server.listen(PORT, HOST, () => {
  console.log(`SRMIST site on http://localhost:${PORT} (${HOST})`)
  startStatusSampler() // builds the service-status history even when nobody has the page open
})
