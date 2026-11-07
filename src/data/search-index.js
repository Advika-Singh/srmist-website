import { MENUS } from './nav.js'
import { PROGRAMMES } from './programmes.js'

// type: 'action' (does something), 'page' (opens a page), 'programme'.
// `words` are extra terms people type that never appear in the title: synonyms, abbreviations, misspellings.
const BASE = [
  { type: 'action', title: 'Start your application', hint: 'Apply online in about 10 minutes', href: '/apply', words: 'apply application admission join register enrol enroll form' },
  { type: 'action', title: 'Admissions portal', hint: 'Pathways, fees, dates and enquiry', href: '/admissions', words: 'admission admissions portal eligibility how to join' },
  { type: 'action', title: 'Fee & ROI calculator', hint: 'Estimate the total cost of a degree', href: '/admissions#fees', words: 'fee fees cost tuition price afford calculator roi hostel expense budget' },
  { type: 'action', title: 'Ask DAAS', hint: 'AI assistant with cards, links and forms', href: '#ask', words: 'chat help assistant ai bot question support' },
  { type: 'action', title: 'Request a call back', hint: 'A counsellor calls you', href: '#callback', words: 'call callback counsellor counselor phone contact talk' },
  { type: 'page', title: 'Service status', hint: 'Are Academia, fees, results and the LMS up?', href: '/status', words: 'status down up outage portal academia lms results fees login not working' },
  { type: 'page', title: 'Report or track an issue', hint: 'Get a reference number and follow it', href: '/support', words: 'complaint complaints feedback issue grievance report track reference ticket problem' },
  { type: 'page', title: 'Accessible campus map', hint: 'Ramps, lifts and step-free routes', href: '/access-map', words: 'accessible accessibility wheelchair ramp lift elevator step free disabled disability map barrier' },
  { type: 'page', title: 'Visitors & parents', hint: 'Campus layout, hotels and places to eat', href: '/visitors', words: 'visitor visitors parents visit hotel stay food eat restaurant map layout guest' },
  { type: 'page', title: 'Hostels', hint: 'Every block, rooms, mess timings, distances and contacts', href: '/hostels', words: 'hostel hostels accommodation room rooms stay mess food dining warden boys girls international ac non-ac floor plan' },
  { type: 'page', title: 'Students', hint: 'Portals, fees, exams, academic calendars and student life', href: '/students', words: 'student students portal academia fees exam results timetable calendar schedule hall ticket certificate degree convocation loan scholarship abc digilocker mail netid' },
  { type: 'page', title: 'Clubs and DSA', hint: 'Fifteen student clubs under the Directorate of Student Affairs', href: '/clubs', words: 'clubs dsa student affairs music dance fashion quiz gaming astrophilia rotaract literature sports festival houses' },
  { type: 'page', title: 'A day at SRM', hint: 'Follow a student across the real campus from dawn to night', href: '/day', words: 'day life student campus map walk hostel library sports tour experience scroll story' },
  { type: 'page', title: 'Course finder', hint: 'Answer five questions and get fields of study to look at first', href: '/course-finder', words: 'recommend recommendation suggest quiz which course what to study confused unsure choose career match' },
  { type: 'page', title: 'Programme Finder', hint: 'Every course, by field', href: '/programmes', words: 'course courses degree programme program branch btech mba' },
  { type: 'page', title: 'Scholarships & financial aid', hint: 'Eligibility and deadlines', href: '/scholarships', words: 'scholarship scholarships aid funding loan waiver merit' },
  { type: 'page', title: 'Placements', hint: '980+ companies · 7.19 LPA average CTC', href: '/placements', words: 'placement placements job jobs recruit salary package ctc career' },
  { type: 'page', title: 'Rankings & accreditation', hint: 'NAAC A++ · NIRF 2025', href: '/rankings', words: 'ranking rankings nirf naac accreditation rank' },
  { type: 'page', title: 'Campus life', hint: 'Hostels, clubs, sport', href: '/campus-life', words: 'hostel hostels accommodation clubs sport sports food mess life' },
  { type: 'page', title: 'Research & innovation', hint: 'Labs, patents, incubation', href: '/research', words: 'research phd patents lab labs incubator innovation' },
  { type: 'page', title: 'International', hint: 'Semester abroad, visas, arrival', href: '/international', words: 'international abroad foreign visa overseas nri exchange' },
  { type: 'page', title: 'About SRMIST', hint: 'Deemed to be University since 1985', href: '/about', words: 'about history deemed university ugc vision mission' },
  { type: 'page', title: 'Library', href: '/library', hint: 'Books, journals, study spaces', words: 'library books journals study' },
  { type: 'page', title: 'Examinations', href: '/examinations', hint: 'Schedules and results', words: 'exam exams examination results timetable hall ticket' },
  { type: 'page', title: 'Departments A–Z', href: '/departments', hint: 'Academic directory', words: 'department departments directory faculty' },
  { type: 'page', title: 'Alumni', href: '/alumni', hint: 'Lifelong community', words: 'alumni alumnus graduates network' },
  { type: 'page', title: 'News & events', href: '/events', hint: 'TECHNOBLIZZ 2026 · Alumni Day', words: 'news events technoblizz fest convocation' },
  { type: 'page', title: 'Faculty & staff gateway', href: '/teach.html', hint: 'Resources for teaching staff', words: 'faculty staff teacher professor employee teach' },
  { type: 'page', title: 'SRMJEEE 2027', hint: 'Dates, eligibility check and how to register for the B.Tech entrance exam', href: '/srmjeee', words: 'srmjeee srmjee jee engineering entrance exam btech registration register apply dates deadline eligibility cbt phase' },
  { type: 'page', title: 'Staff finder', href: '/staff-finder', hint: 'Search every faculty and staff profile, with photos', words: 'staff finder directory contact person' },
]

const PROG = PROGRAMMES.map((p) => ({
  type: 'programme',
  title: p.field,
  hint: p.duration,
  href: `/apply/programme?field=${encodeURIComponent(p.field)}`,
  words: p.words,
}))

const FROM_MENUS = []
for (const m of MENUS) for (const c of m.cols) for (const [title, href] of c.links) FROM_MENUS.push({ type: 'page', title, hint: m.label, href, words: '' })

const seen = new Set()
export const INDEX = [...BASE, ...PROG, ...FROM_MENUS].filter((e) => {
  const key = e.title + e.href
  if (seen.has(key)) return false
  seen.add(key)
  return true
})
