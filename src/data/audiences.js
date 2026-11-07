// Who is looking at the home page? Each audience gets its own section order and four quick links.
// Plain data and pure functions only (no React, no browser APIs) so Node can test it.

/** Home sections in the order today's page shows them (this is also the applicant order). */
export const SECTION_KEYS = ['about', 'triplet', 'rankings', 'fields', 'research', 'news']

const O = (...keys) => keys // section keys, first to last

export const AUDIENCES = [
  {
    id: 'applicant',
    label: 'Applicant',
    sections: O('about', 'triplet', 'rankings', 'fields', 'research', 'news'),
    links: [
      ['Start your application', '/apply'],
      ['Fee & ROI calculator', '/admissions#fees'],
      ['Programme finder', '/programmes'],
      ['Scholarships', '/scholarships'],
    ],
  },
  {
    id: 'parent',
    label: 'Parent',
    sections: O('about', 'rankings', 'triplet', 'fields', 'research', 'news'),
    links: [
      ['Fees & scholarships', '/scholarships'],
      ['Hostels', '/hostels'],
      ['Visit the campus', '/visitors'],
      ['Counselling & anti-ragging', 'https://www.srmist.edu.in/life-at-srm/anti-ragging/'],
    ],
  },
  {
    id: 'student',
    label: 'Current student',
    sections: O('research', 'about', 'triplet', 'fields', 'rankings', 'news'),
    links: [
      ['Service status', '/status'],
      ['Report an issue', '/support'],
      ['Library', '/library'],
      ['Academia portal', 'https://academia.srmist.edu.in/'],
    ],
  },
  {
    id: 'visitor',
    label: 'Visitor',
    sections: O('about', 'triplet', 'rankings', 'fields', 'research', 'news'),
    links: [
      ['Visit the campus', '/visitors'],
      ['Campus map', '/visitors#layout'],
      ['Accessible routes', '/access-map'],
      ['Contact us', 'https://www.srmist.edu.in/contact-us/'],
    ],
  },
]

export const DEFAULT_AUDIENCE = 'applicant'

export const isAudience = (v) => AUDIENCES.some((a) => a.id === v)

/** A valid audience id: ?for= in the URL wins, then the saved value, then the default. */
export function parseAudience(search, stored) {
  const fromUrl = new URLSearchParams(search || '').get('for')
  if (isAudience(fromUrl)) return fromUrl
  if (isAudience(stored)) return stored
  return DEFAULT_AUDIENCE
}

/** 0-based position of a section for an audience (CSS `order`). Unknown audiences use the default order. */
export function orderFor(audience, key) {
  const a = AUDIENCES.find((x) => x.id === audience) ?? AUDIENCES[0]
  return a.sections.indexOf(key)
}

/** The sections directly before and after `key` for an audience (null at the ends). Lets a section blend into its neighbours. */
export function neighbours(audience, key) {
  const a = AUDIENCES.find((x) => x.id === audience) ?? AUDIENCES[0]
  const i = a.sections.indexOf(key)
  return { prev: i > 0 ? a.sections[i - 1] : null, next: i >= 0 && i < a.sections.length - 1 ? a.sections[i + 1] : null }
}
