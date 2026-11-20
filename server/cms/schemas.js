// The headless CMS's content types, written as data. Adding a type (or a field) means adding it here: the API, the editor form
// and the validation all read this one description. Everything is plain text: no HTML is ever stored, so nothing a person types
// can run as a script. Pure functions, tested in tests/cms.test.js.

export const TYPES = {
  news: {
    label: 'News story',
    plural: 'News',
    slugFrom: 'title',
    fields: [
      { key: 'title', label: 'Headline', kind: 'string', required: true, min: 3, max: 140 },
      { key: 'summary', label: 'Summary', kind: 'text', required: true, min: 10, max: 300, hint: 'One or two sentences shown in lists.' },
      { key: 'body', label: 'Story', kind: 'text', max: 6000, hint: 'Separate paragraphs with a blank line.' },
      { key: 'image', label: 'Image address', kind: 'image', max: 300, hint: 'A photo already on the site (/srmist/…) or an https address on srmist.edu.in.' },
      { key: 'image_alt', label: 'Image description', kind: 'string', max: 160, requiredWith: 'image', hint: 'Describe the photo for people who cannot see it.' },
      { key: 'link', label: 'Read more link', kind: 'url', max: 500 },
      { key: 'date', label: 'Date', kind: 'date', required: true },
    ],
  },
  faq: {
    label: 'Question and answer',
    plural: 'FAQ',
    slugFrom: 'question',
    fields: [
      { key: 'question', label: 'Question', kind: 'string', required: true, min: 5, max: 200 },
      { key: 'answer', label: 'Answer', kind: 'text', required: true, min: 10, max: 1500 },
      { key: 'topic', label: 'Topic', kind: 'enum', required: true, options: ['admissions', 'fees', 'campus', 'placements', 'other'] },
    ],
  },
  snippet: {
    label: 'Site text',
    plural: 'Site text',
    slugFrom: 'key',
    fields: [
      { key: 'key', label: 'Where it is used', kind: 'slug', required: true, max: 60, hint: 'Lower-case letters, numbers, dots and hyphens, for example announcements.intro. Cannot be changed later.' },
      { key: 'text', label: 'Text', kind: 'text', required: true, min: 1, max: 600 },
      { key: 'note', label: 'Note for editors', kind: 'string', max: 200 },
    ],
  },
}

export const STATUSES = ['draft', 'pending', 'rejected', 'published', 'archived']

/** What the editor needs to draw a form for each type (no functions, safe to send to the browser). */
export const typeList = () => Object.entries(TYPES).map(([id, t]) => ({ id, label: t.label, plural: t.plural, fields: t.fields }))

// ---- cleaners: every one returns the cleaned value, or null when the input is not acceptable ----
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g
const stripTags = (s) => s.replace(/<[^>]*>/g, ' ').replace(/[<>]/g, '')

export const cleanString = (v, max) => (typeof v === 'string' ? stripTags(v.replace(CONTROL, '')).replace(/\s+/g, ' ').trim().slice(0, max + 1) : null)
export const cleanText = (v, max) =>
  typeof v === 'string'
    ? stripTags(v.replace(CONTROL, '').replace(/\r\n?/g, '\n'))
        .replace(/[ \t]+/g, ' ')
        .replace(/ *\n */g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
        .slice(0, max + 1)
    : null

export function cleanUrl(v, max) {
  const s = cleanString(v, max)
  if (s === null) return null
  if (!s) return ''
  try {
    const u = new URL(s)
    if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password) return null
    return s.length <= max ? u.toString() : null
  } catch {
    return null
  }
}

// images must be allowed by the site's content security policy: its own /srmist photos, srmist.edu.in, or Unsplash
const OWN_IMAGE = /^\/srmist\/[A-Za-z0-9._-]+\.(webp|jpe?g|png|svg)$/
const IMAGE_HOSTS = new Set(['www.srmist.edu.in', 'images.unsplash.com'])
export function cleanImage(v, max) {
  const s = cleanString(v, max)
  if (s === null) return null
  if (!s) return ''
  if (OWN_IMAGE.test(s) && !s.includes('..')) return s
  const u = cleanUrl(s, max)
  if (!u) return null
  const parsed = new URL(u)
  return parsed.protocol === 'https:' && IMAGE_HOSTS.has(parsed.hostname) ? u : null
}

export const validDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s)
const SLUG = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/

const MESSAGE = {
  url: 'Use a full web address starting with http:// or https://.',
  image: 'Use a /srmist/… photo or an https address on srmist.edu.in.',
  date: 'Use a real date as YYYY-MM-DD.',
  enum: 'Pick one of the listed options.',
  slug: 'Lower-case letters, numbers, dots and hyphens only.',
}

/** { ok: true, value } with only the type's own fields, cleaned; or { ok: false, errors: { field: message } }. */
export function validateContent(type, data) {
  const t = TYPES[type]
  if (!t) return { ok: false, errors: { type: 'Unknown content type.' } }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { ok: false, errors: { data: 'Send the fields as an object.' } }
  const errors = {}
  const value = {}
  const known = new Set(t.fields.map((f) => f.key))
  for (const k of Object.keys(data)) if (!known.has(k)) errors[k] = 'This field does not exist for this type.'
  for (const f of t.fields) {
    const raw = data[f.key]
    if (raw === undefined || raw === null || raw === '') {
      if (f.required) errors[f.key] = 'Required.'
      continue
    }
    let v
    if (f.kind === 'string') v = cleanString(raw, f.max)
    else if (f.kind === 'text') v = cleanText(raw, f.max)
    else if (f.kind === 'url') v = cleanUrl(raw, f.max)
    else if (f.kind === 'image') v = cleanImage(raw, f.max)
    else if (f.kind === 'date') v = validDate(raw) ? raw : null
    else if (f.kind === 'enum') v = f.options.includes(raw) ? raw : null
    else if (f.kind === 'slug') v = typeof raw === 'string' && raw.length <= f.max && SLUG.test(raw) ? raw : null
    if (v === null) {
      errors[f.key] = MESSAGE[f.kind] ?? 'This value is not allowed.'
      continue
    }
    if (v === '') {
      if (f.required) errors[f.key] = 'Required.'
    } else if (typeof v === 'string' && f.max && v.length > f.max) errors[f.key] = `At most ${f.max} characters.`
    else if (typeof v === 'string' && f.min && v.length < f.min) errors[f.key] = `At least ${f.min} characters.`
    else value[f.key] = v
  }
  for (const f of t.fields) {
    if (f.requiredWith && value[f.requiredWith] && !value[f.key] && !errors[f.key]) errors[f.key] = 'Describe the image: it is needed for screen readers.'
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value }
}

export const slugify = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '')

/** The address-friendly name of an item, from the field the type names. Snippets use their key as it is. */
export function slugFor(type, value) {
  const t = TYPES[type]
  const raw = value?.[t.slugFrom]
  return type === 'snippet' ? String(raw ?? '') : slugify(raw ?? '') || type
}
