// Which immersive moments each inner page gets, plus its own tint and photo crop.
// Content is never written here: moments name a `source` and the renderer pulls the real data
// (pages.json, src/data/*.js). Library keeps its own page and only uses the hero and the open-now band.

export const MOMENTS = ['story', 'rail', 'corridor', 'facilities', 'iris', 'countband', 'marquee', 'alpha', 'stepper']

/** Moments that pin the page while you scroll (kept to three per page). */
export const PINNED = ['story', 'rail', 'corridor']

const PHOTOS_LAB = ['/srmist/labs.jpg', '/srmist/research.jpg', '/srmist/tech-park.jpg', '/srmist/campus-main-building.jpg', '/srmist/library.jpg']
const PHOTOS_CAMPUS = ['/srmist/sports.jpg', '/srmist/students.jpg', '/srmist/campus-main-building.jpg', '/srmist/tech-park.jpg', '/srmist/hero.webp', '/srmist/admission-india.jpg', '/srmist/library.jpg']

export const KITS = {
  about: { accent: '#3b82f6', crop: '50% 38%', moments: [{ type: 'story', source: 'blocks' }] },
  research: { accent: '#14b8a6', crop: '50% 30%', moments: [{ type: 'facilities' }, { type: 'countband', source: 'stats' }] },
  international: { accent: '#f97316', crop: '50% 25%', moments: [{ type: 'rail', source: 'abroad' }, { type: 'countband', source: 'stats' }] },
  placements: { accent: '#eab308', crop: '50% 35%', moments: [{ type: 'countband', source: 'placementStats' }, { type: 'marquee', source: 'blockItems' }] },
  rankings: { accent: '#8b5cf6', crop: '50% 45%', moments: [{ type: 'story', source: 'rankings' }, { type: 'countband', source: 'rankStats' }] },
  scholarships: { accent: '#22c55e', crop: '50% 30%', moments: [{ type: 'stepper', source: 'blocks' }, { type: 'countband', source: 'stats' }] },
  events: { accent: '#f43f5e', crop: '50% 40%', moments: [{ type: 'rail', source: 'events' }, { type: 'countband', source: 'stats' }] },
  library: { accent: '#06b6d4', crop: '50% 50%', moments: [{ type: 'countband', source: 'stats' }] },
  departments: { accent: '#84cc16', crop: '50% 55%', moments: [{ type: 'alpha', source: 'departments' }] },
  examinations: { accent: '#ef4444', crop: '50% 40%', moments: [{ type: 'stepper', source: 'exams' }] },
  alumni: { accent: '#d946ef', crop: '50% 30%', moments: [{ type: 'rail', source: 'alumni' }, { type: 'countband', source: 'stats' }] },
  'campus-life': { accent: '#f59e0b', crop: '50% 45%', moments: [{ type: 'iris' }, { type: 'countband', source: 'stats' }] },
}

export const SLUGS = Object.keys(KITS)
export const kitFor = (slug) => KITS[slug] ?? null
