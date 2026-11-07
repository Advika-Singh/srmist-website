// "Ask a current student": short answers tagged by topic and department.
// Rule: an answer appears only if the student agreed (`consent: true`) or it is summarised from a public page and links to it (`source`).
// Nothing here is invented. The first entries are summarised from SRMIST's own Career Centre page (read 2026-11-06); other topics
// stay empty until students agree to answer, and the page says so.

export const TOPICS = [
  ['placements', 'Placements'],
  ['hostel', 'Hostel life'],
  ['workload', 'Workload'],
  ['clubs', 'Clubs'],
]

const CENTRE = 'https://www.srmist.edu.in/career-centre/'
const Q = 'What helped you get placed?'

export const VOICES = [
  { id: 'madhu', topic: 'placements', department: 'Computer Science and Engineering', q: Q, a: 'Structured training that built technical, problem-solving and aptitude skills.', who: 'Madhu Shree Aravindan, B.Tech. CSE, placed at Google', consent: false, source: CENTRE },
  { id: 'shreyansh', topic: 'placements', department: 'Computer Science and Engineering', q: Q, a: 'Mock interviews, practice assessments and continuous feedback.', who: 'Shreyansh Rajesh Kumbhare, B.Tech. CSE, placed at Amazon', consent: false, source: CENTRE },
  { id: 'ujjwal', topic: 'placements', department: 'Computer Applications', q: Q, a: 'Practical learning made the difference, ending in a Super Dream Offer.', who: 'Ujjwal Kumar Singh, BCA (Delhi-NCR), placed at D. E. Shaw India', consent: false, source: CENTRE },
  { id: 'aleena', topic: 'placements', department: 'Computer Science and Engineering', q: Q, a: 'Steady guidance from the department and the Directorate of Career Centre.', who: 'Aleena Sara Mathews, B.Tech. CSE, placed at GE Vernova', consent: false, source: CENTRE },
  { id: 'chenna', topic: 'placements', department: 'Computer Science and Engineering', q: Q, a: 'A supportive academic environment and well-structured placement support.', who: 'Chenna Vanshika, B.Tech. CSE, placed at Oracle Financial Software Services', consent: false, source: CENTRE },
]

/** Voices matching the topic and/or department; an empty filter returns all of them. */
export const filterVoices = (voices, { topic = '', department = '' } = {}) =>
  voices.filter((v) => (!topic || v.topic === topic) && (!department || v.department === department))
