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
  { type: 'page', title: 'Colleges and schools', hint: 'Engineering, management, health sciences, agriculture', href: '/colleges', words: 'college colleges school faculty engineering management medicine pharmacy nursing physiotherapy dentistry law agriculture public health technology liberal arts business studies agricultural sciences occupational therapy' },
  { type: 'page', title: 'Research centres', hint: 'Nanotechnology, computing, instrumentation and more', href: '/research/centres', words: 'centre center lab labs facility nanotechnology hpcc computing earthquake instrumentation concrete statistics iiism nrc cacr for scif srm dbt platform research cell division medical' },
  { type: 'page', title: 'Research output and funding', hint: 'Publications, patents, projects, Ph.D awards, funding calls', href: '/research/initiatives', words: 'research publications patents projects phd doctoral funding grant seri rdc colloquium regulations highlights recent sponsored awarded university council and development cell day paarivendhar selective excellence initiative call for proposals forms awards recognition' },
  { type: 'page', title: 'Research partners and innovation', hint: 'Collaborations, industry, incubation, FAB LAB', href: '/research/partners', words: 'collaboration industry incubator incubation startup entrepreneurship innovation fablab partners collaborations connect and multidisciplinary research fab lab' },
  { type: 'page', title: 'Student life', hint: 'Culture, sports, NCC, NSS, Milan, community service', href: '/campus-life/student-life', words: 'culture arts sports ncc nss milan tamil community service festival and perayam centres public student clubs' },
  { type: 'page', title: 'Living on campus', hint: 'Transport, safety, religious life, community radio', href: '/campus-life/living', words: 'transport bus safety security facilities religious temple radio muthucharam diversity and operations getting around staying safe life community' },
  { type: 'page', title: 'Support, safety and inclusion', hint: 'Counselling, anti-ragging, grievance and inclusion', href: '/campus-life/wellbeing', words: 'counselling counseling mental health ragging discrimination grievance women inclusion equal opportunity help support student anti redressal committee cell accessible campus map report track issue' },
  { type: 'page', title: 'Global SRM', hint: 'Advisory board, partner universities, visiting faculty', href: '/international/global', words: 'international advisory board iab partnerships visiting faculty alumni abroad members global foreign and adjunct professors network' },
  { type: 'page', title: 'Study abroad and international admissions', hint: 'Semester abroad, twinning, dual degrees, international admissions', href: '/international/pathways', words: 'study abroad semester twinning dual degree pathway immersion international admission nri foreign program and transfer global admissions student services india' },
  { type: 'page', title: 'History', hint: 'The timeline from 1969 to 2018', href: '/about/history', words: 'history timeline founder founded 1968 deemed university milestones' },
  { type: 'page', title: 'Leadership and governance', hint: 'Founder Chancellor, Pro-Chancellors and governance', href: '/about/leadership', words: 'leadership chancellor pro-chancellor governance council management heads paarivendhar ravi pachamuthu sathyanarayanan shivakumar administrative academic' },
  { type: 'page', title: 'Recognition', hint: 'NAAC A++, QS I-GAUGE, THE Impact Rankings, awards', href: '/about/recognition', words: 'recognition naac accreditation gauge rating impact ranking sdg awards achievements announcements 2026 the rankings green university award 2021 national 2018 year 2019 faculty student nirf and more' },
  { type: 'page', title: 'Offices and directorates', hint: 'IQAC, ITKM, online education, communications, alumni affairs', href: '/about/offices', words: 'iqac quality itkm online distance education dode communications alumni affairs directorate offices internal assurance cell information technology and knowledge management directorates administrative heads' },
  { type: 'page', title: 'Contact', hint: 'Address and phone numbers', href: '/contact', words: 'contact phone number address call enquiry reach helpline admissions information centre main numbers engineering agriculture and architecture liberal arts business studies law management medical allied health sciences hotel' },
  { type: 'page', title: 'Compare programmes', hint: 'Up to three fields side by side, and a saved shortlist', href: '/compare', words: 'compare comparison versus vs difference side by side shortlist save saved favourite choose between' },
  { type: 'page', title: 'Key dates', hint: 'SRMJEEE deadlines and exam days, with a calendar file', href: '/dates', words: 'dates date deadline deadlines calendar ics reminder when last date exam schedule important' },
  { type: 'page', title: 'Programme Finder', hint: 'Every course, by field', href: '/programmes', words: 'course courses degree programme program branch btech mba' },
  { type: 'page', title: 'Scholarships & financial aid', hint: 'Eligibility and deadlines', href: '/scholarships', words: 'scholarship scholarships aid funding loan waiver merit' },
  { type: 'page', title: 'Placements', hint: 'Companies, packages and the Career Centre', href: '/placements', words: 'placement placements job jobs recruit salary package ctc career' },
  { type: 'page', title: 'Rankings & accreditation', hint: 'NAAC A++ · NIRF 2025', href: '/rankings', words: 'ranking rankings nirf naac accreditation rank' },
  { type: 'page', title: 'Walk the campus', hint: 'Five stops with real walking distances, plus the 360° tour', href: '/campus-walk', words: 'walk tour campus route visit 360 virtual map distance minutes' },
  { type: 'page', title: 'Campus life', hint: 'Hostels, clubs, sport', href: '/campus-life', words: 'hostel hostels accommodation clubs sport sports food mess life' },
  { type: 'page', title: 'Research & innovation', hint: 'Labs, patents, incubation', href: '/research', words: 'research phd patents lab labs incubator innovation' },
  { type: 'page', title: 'International', hint: 'Semester abroad, visas, arrival', href: '/international', words: 'international abroad foreign visa overseas nri exchange' },
  { type: 'page', title: 'About SRMIST', hint: 'History, vision and leadership', href: '/about', words: 'about history deemed university ugc vision mission' },
  { type: 'page', title: 'Library', href: '/library', hint: 'Books, journals, study spaces', words: 'library books journals study' },
  { type: 'page', title: 'Examinations', href: '/examinations', hint: 'Schedules and results', words: 'exam exams examination results timetable hall ticket' },
  { type: 'page', title: 'Departments A–Z', href: '/departments', hint: 'Academic directory', words: 'department departments directory faculty' },
  { type: 'page', title: 'Parents', hint: 'Parent portal, fees, loans, safety', href: '/parents', words: 'parents parent portal guardian fees loan safety hostel ward' },
  { type: 'page', title: 'Alumni chapters', hint: 'Meetups across India and the alumni portal', href: '/alumni/chapters', words: 'alumni chapters meetup portal network reunion' },
  { type: 'page', title: 'Hire from SRMIST', hint: 'Campus recruitment and the Career Centre', href: '/recruiters', words: 'recruiters recruit hire hiring employers companies campus placement industry' },
  { type: 'page', title: 'Alumni', href: '/alumni', hint: 'Lifelong community', words: 'alumni alumnus graduates network' },
  { type: 'page', title: 'News & events', href: '/events', hint: 'Events, news and announcements', words: 'news events technoblizz fest convocation' },
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
