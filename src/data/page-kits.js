// Which immersive moments each inner page gets, plus its own tint and photo crop.
// Content is never written here: moments name a `source` and the renderer pulls the real data
// (pages.json, src/data/*.js). Library keeps its own page and only uses the hero and the open-now band.

export const MOMENTS = ['story', 'rail', 'corridor', 'facilities', 'iris', 'countband', 'marquee', 'alpha', 'stepper']

/** Moments that pin the page while you scroll (kept to three per page). */
export const PINNED = ['story', 'rail', 'corridor']

const PHOTOS_LAB = ['/srmist/labs.webp', '/srmist/research.webp', '/srmist/tech-park.webp', '/srmist/campus-main-building.webp', '/srmist/library.webp']
const PHOTOS_CAMPUS = ['/srmist/sports.webp', '/srmist/students.webp', '/srmist/campus-main-building.webp', '/srmist/tech-park.webp', '/srmist/hero.webp', '/srmist/admission-india.webp', '/srmist/library.webp']

// One accent for every page (docs/DESIGN-RULES.md): the brand blue. The eyebrow is gold on every hero.
export const KITS = {
  academics: { accent: '#3b82f6', crop: '50% 35%', moments: [{ type: 'countband', source: 'stats' }] },
  programmes: { accent: '#3b82f6', crop: '50% 35%', moments: [{ type: 'countband', source: 'stats' }] },
  about: { accent: '#3b82f6', crop: '50% 38%', moments: [{ type: 'story', source: 'blocks' }] },
  research: { accent: '#3b82f6', crop: '50% 30%', moments: [{ type: 'facilities' }, { type: 'countband', source: 'stats' }] },
  international: { accent: '#3b82f6', crop: '50% 25%', moments: [{ type: 'rail', source: 'abroad' }, { type: 'countband', source: 'stats' }] },
  placements: { accent: '#3b82f6', crop: '50% 35%', moments: [{ type: 'countband', source: 'placementStats' }, { type: 'marquee', source: 'blockItems' }] },
  rankings: { accent: '#3b82f6', crop: '50% 45%', moments: [{ type: 'story', source: 'rankings' }, { type: 'countband', source: 'rankStats' }] },
  scholarships: { accent: '#3b82f6', crop: '50% 30%', moments: [{ type: 'stepper', source: 'blocks' }, { type: 'countband', source: 'stats' }] },
  events: { accent: '#3b82f6', crop: '50% 40%', moments: [{ type: 'rail', source: 'events' }, { type: 'countband', source: 'stats' }] },
  library: { accent: '#3b82f6', crop: '50% 50%', moments: [{ type: 'countband', source: 'stats' }] },
  departments: { accent: '#3b82f6', crop: '50% 55%', moments: [{ type: 'alpha', source: 'departments' }] },
  examinations: { accent: '#3b82f6', crop: '50% 40%', moments: [{ type: 'stepper', source: 'exams' }] },
  alumni: { accent: '#3b82f6', crop: '50% 30%', moments: [{ type: 'rail', source: 'alumni' }, { type: 'countband', source: 'stats' }] },
  'campus-life': { accent: '#3b82f6', crop: '50% 45%', moments: [{ type: 'iris' }, { type: 'countband', source: 'stats' }] },
}

export const SLUGS = Object.keys(KITS)
export const kitFor = (slug) => KITS[slug] ?? null
