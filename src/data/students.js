// What students need, gathered from the official Students page: https://www.srmist.edu.in/students/ (read 2026-11-06).
// Every link goes to the official site or portal. Add or change links here and the page follows.

const S = 'https://www.srmist.edu.in'
const P = 'https://webstor.srmist.edu.in/web_assets/downloads/'
const site = (p) => S + p
const pdf = (p) => P + p

/** Portals and everyday tools. `own: true` means a page on this site. */
export const TOOLS = [
  { name: 'Academia', note: 'Attendance, marks and timetable for 2nd, 3rd and final-year B.Tech students (Engineering & Technology).', href: 'https://academia.srmist.edu.in/' },
  { name: 'Student Portal', note: 'Fee payment, hostel and transport. For students from the 2025 batch onwards.', href: 'https://sp.srmist.edu.in/' },
  { name: 'Student Connect', note: 'The web portal linked from the official Students page.', href: 'https://studentconnect.srmist.edu.in/' },
  { name: 'Student mobile app', note: 'Android and iPhone / iPad.', href: 'https://play.google.com/store/apps/details?id=com.gems', extra: [['iPhone / iPad', 'https://apps.apple.com/us/app/juno-campus-student/id1431652107'], ['User manual', pdf('2025/srmist-msl-student-mobile-app-user-manual-v1-0.pdf')]] },
  { name: 'NetID password reset', note: 'Reset your NetID password.', href: 'https://ssp.srmist.edu.in/' },
  { name: 'ITKM Service Desk', note: 'Log an IT problem with the university’s own help desk.', href: 'https://sd.srmist.edu.in/' },
  { name: 'Student mail', note: 'Your @srmist.edu.in mailbox.', href: 'https://accounts.google.com/signin/v2/identifier?continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&hd=srmist.edu.in&service=mail' },
]

/** Tools we built on this site. */
export const OWN_TOOLS = [
  ['Service status', 'Are the portals up right now?', '/status'],
  ['Report or track an issue', 'Get a reference number and follow it.', '/support'],
  ['Hostels', 'Blocks, rooms, mess timings and contacts.', '/hostels'],
  ['Library', 'Opening hours, librarian and contacts.', '/library'],
  ['Accessible campus map', 'Step-free routes, ramps and lifts.', '/access-map'],
]

export const FEES = [
  ['Pay tuition / exam fees online', 'https://sp.srmist.edu.in/'],
  ['Vidya Lakshmi educational loans', 'https://www.vidyalakshmi.co.in/Students/'],
  ['SRMIST scholarship categories', pdf('2026/srmist-scholarship-categories.pdf')],
  ['AICTE scholarship / fellowship schemes', 'https://www.aicte.gov.in/schemes/students-development-schemes'],
  ['Scholarships for international students', site('/admission-international/scholarships/')],
]

export const EXAMS = [
  {
    title: 'Results & schedules',
    links: [
      ['Results', site('/?p=54801')],
      ['Time tables', site('/controller-of-examinations/examination-time-tables/')],
      ['Exam instructions', site('/controller-of-examinations/examination-instructions/')],
      ['Online hall ticket', 'https://sp.srmist.edu.in/srmiststudentportal/students/loginManager/youLogin.jsp'],
      ['Application forms', site('/controller-of-examinations/#application-form-exams')],
      ['Permissible calculators', 'https://webstor.srmist.edu.in/web_assets/srm_mainsite/files/2019/calculators-list.pdf'],
      ['Online (full time) university examination', 'https://srmist.codetantra.com/login.jsp'],
      ['Online examination manual (Directorate of Online Education)', pdf('2023/srm-online-end-sem-exam-manual.pdf')],
      ['Nature of malpractice & punishments', pdf('2024/malpractice-and-punishments.pdf')],
    ],
  },
  {
    title: 'Certificates & degrees',
    links: [
      ['Convocation', site('/convocation/')],
      ['Certificate request portal', 'https://evarsity.srmist.edu.in/srmcrp/'],
      ['Online certificate application manual', 'https://webstor.srmist.edu.in/web_assets/srm_mainsite/files/2018/User-manual-Online-Certificate-Application.pdf'],
      ['E-Sanad (national certificate portal)', 'https://esanad.nic.in/'],
      ['E-Sanad application manual', pdf('2020/e-sanad-online-certificate-application-user-manual.pdf')],
      ['Photograph for degree certificate (final year)', site('/controller-of-examinations/degree-certificate-photo-instructions-for-final-year-students/')],
      ['Photo upload user manual', 'http://webstor.srmist.edu.in/web_assets/srm_mainsite/files/2018/final-year-photo-upload-user-manual.pdf'],
      ['Degree certificate in absentia', 'https://evarsity.srmuniv.ac.in/srmwebonline/exam/convocationRegistration.jsp'],
      ['Degree certificate collection application', pdf('2020/degree-certificate-collection-application-form-srmist.pdf')],
      ['Procedure for certificate verification', pdf('2022/cvp-2022.pdf')],
      ['Application for certificate verification', 'https://webstor.srmist.edu.in/web_assets/srm_mainsite/files/2017/srm_all_certs_verification_form.pdf'],
      ['Degree certificate verification (online)', 'https://evarsity.srmist.edu.in/certverify/'],
      ['VFS Global Docswallet', 'https://srmist.directverify.in/'],
      ['Rule of conversion: CGPA into percentage', site('/controller-of-examinations/rule-of-conversion-cgpa-into-percentage/')],
      ['Medium of instruction / communication', 'https://webstor.srmist.edu.in/web_assets/srm_mainsite/files/2019/medium-of-instruction-format.pdf'],
    ],
  },
  {
    title: 'Academic Bank of Credits',
    links: [
      ['Academic Bank of Credits (ABC): ID creation is mandatory for all students', 'https://www.abc.gov.in/'],
      ['ABC ID creation and DigiLocker user manual', pdf('2023/abc-id-creation-digilocker-user-manual.pdf')],
      ['NAD – DigiLocker', 'https://nad.digilocker.gov.in/'],
    ],
  },
]

export const ACADEMIC_LINKS = [
  ['Circular: registration for compensatory courses, odd semester 2026–27', pdf('2026/cicular-registration-for-compensatory-courses-odd-2026-27.pdf')],
  ['Compensatory courses, even semester 2021–22 (phase two)', pdf('2022/compensatory-courses-even-semester-2021-2022-phase-two.pdf')],
  ['Plagiarism policy', 'https://webstor.srmist.edu.in/web_assets/srm_mainsite/files/2016/srm_university_plagiarism_policy_2017.pdf'],
  ['LaTeX template for B.Tech / M.Tech project, dissertation and thesis reports', site('/students/latex-template-for-b-tech-m-tech-project-preparation-dissertation-thesis-report/')],
  ['Centre for Statistics: a revisit', pdf('2022/centre-for-statistics.pdf')],
]

/** Academic calendars and schedules, newest first, by faculty. */
export const CALENDARS = [
  { faculty: 'Engineering & Technology', links: [
    ['Handbook 2026–2027', pdf('2026/hand-book-2026-27.pdf')],
    ['Academic schedule 2026–2027 (UG & PG)', site('/students/cet-academic-schedule-2026-2027-ug-pg/')],
    ['SAID academic schedule 2026–27 (UG & PG)', site('/students/said-academic-schedule-2026-27-ug-pg/')],
    ['Academic schedule 2025–2026 (UG & PG)', pdf('2025/overall-academic-schedule-for-cet-odd-sem-25-even-sem-25-26-r2.4.pdf')],
    ['Academic schedule 2024–2025 (UG)', pdf('2024/btech-m.tech-int-academic-schedule-2024-25.pdf')],
    ['Academic schedule 2024–2025 (PG)', pdf('2024/pg-m.tech-int-academic-schedule-2024-25.pdf')],
    ['Academic schedule 2023–2024', pdf('2024/academic-calendar-academic-year-2023-2024-ent.pdf')],
  ] },
  { faculty: 'Management', links: [
    ['Academic calendar 2026–2027', site('/students/faculty-of-management-academic-calendar-2026-2027/')],
    ['Academic calendar 2025–2026, even semester', pdf('2026/management-academic-calendar-2025-2026-even.pdf')],
    ['Academic calendar 2025–2026, odd semester', pdf('2025/academic-calendar-2025-2026-odd-semester-2025-2026.pdf')],
    ['Academic calendar 2024–2025', pdf('2024/day-wise-academic-schedule-2024-25.pdf')],
    ['Academic calendar 2023–2024', pdf('2025/academic-calendar-year-2023-2024-management.pdf')],
  ] },
  { faculty: 'Science & Humanities', links: [
    ['Academic calendar 2026–2027', site('/students/science-and-humanities-academic-calendar-2026-2027/')],
    ['Academic calendar 2025–2026', pdf('2025/academic-calendar-2025-2026-fsh.pdf')],
    ['Academic calendar 2024–2025', pdf('2024/academic-calendar-academic-year-24-25-sh.pdf')],
    ['Academic calendar 2023–2024', pdf('2025/academic-calendar-academic-year-23-24-sh.pdf')],
  ] },
  { faculty: 'Law', links: [
    ['Academic calendar 2026–2027 (UG)', site('/students/law-academic-calendar-ug-2026-2027/')],
    ['Academic calendar 2026–2027 (PG)', site('/students/law-academic-calendar-pg-2026-2027/')],
    ['Academic calendar 2025–2026 (UG & PG)', pdf('2025/academic-calendar-2025-2026-even-and-odd-semester-ug-pg.pdf')],
    ['LL.M academic calendar 2024–25', pdf('2024/llm-academic-calendar-2024-25.pdf')],
    ['5-year and 3-year academic calendar 2024–25', pdf('2024/5-years-3-years-academic-calendar-2024-25.pdf')],
    ['Academic calendar 2024–25 (UG)', pdf('2025/academic-calendar-2024-25-ug.pdf')],
    ['Academic calendar 2024–2025 (PG)', pdf('2025/academic-calendar-2024-2025-pg.pdf')],
  ] },
  { faculty: 'Agricultural Sciences', links: [
    ['Academic calendar 2026–2027 (UG, PG & PhD)', site('/students/agricultural-sciences-academic-schedule-2026-27-ug-pg-ph-d/')],
    ['Academic calendar 2025–2026 (UG, PG & PhD)', pdf('2025/ug-pg-phd-academic-calendar-2025-26-srm-agri.pdf')],
    ['Academic calendar 2024–2025 (UG)', pdf('2024/academic-year-2024-2025-agricultural.pdf')],
    ['Academic calendar 2024–2025 (PG)', pdf('2025/pg-academic-calendar-2024-25-srm-agri.pdf')],
  ] },
  { faculty: 'Medicine & Health Sciences', links: [
    ['Academic calendar 2026–2027', site('/students/medicine-health-sciences-academic-calendar-2026-2027/')],
    ['Academic calendar 2025–2026: Medicine', pdf('2025/academic-calendar-year-2025-2026-medicine.pdf')],
    ['Academic calendar 2025–2026: Health Sciences', pdf('2025/academic-calendar-year-2025-2026-health-sciences.pdf')],
    ['Academic calendar 2023–2024', pdf('2024/academic-calendar-year-2023-2024-medical.pdf')],
  ] },
  { faculty: 'Dental', links: [
    ['Academic calendar 2026–2027', site('/students/dental-academic-calendar-2026-2027/')],
    ['Academic calendar 2025–2026', pdf('2025/academic-calendar-2025-2026-dental.pdf')],
    ['Academic schedule 2024–2025', pdf('2024/academic-schedule-year-2024-2025-dental.pdf')],
  ] },
  { faculty: 'Pharmacy', links: [
    ['Academic schedule 2026–2027', site('/students/pharmacy-academic-calendar-2026-2027/')],
    ['Academic schedule 2025–2026', pdf('2025/academic-schedule-2025-2026.pdf')],
    ['Academic schedule 2024–2025', pdf('2025/academic-schedule-2024-2025.pdf')],
  ] },
  { faculty: 'Physiotherapy', links: [
    ['Academic calendar 2026–2027', site('/students/physiotherapy-academic-calendar-2026-2027/')],
    ['Academic calendar 2025–2026 (UG & PG)', pdf('2025/academic-calendar-ug-25-26-physiotherapy.pdf')],
    ['Academic calendar 2024–2025 (UG)', pdf('2024/academic-calendar-ug-24-25-physiotherapy.pdf')],
    ['Academic calendar 2024–2025 (PG)', pdf('2024/academic-calendar-pg-24-25-physiotherapy.pdf')],
  ] },
  { faculty: 'Occupational Therapy', links: [
    ['Academic calendar 2026–2027', site('/students/occupational-therapy-academic-calendar-2026-2027/')],
    ['Academic calendar 2025–2026', pdf('2025/ot-academic-calender-2025-26.pdf')],
    ['Academic calendar 2024–2025', pdf('2025/ot-academic-calender-2024-25.pdf')],
  ] },
  { faculty: 'Nursing', links: [
    ['Academic calendar 2026–2027', site('/students/nursing-academic-calendar-2026-2027/')],
    ['Academic calendar 2025–2026', pdf('2025/academic-calendar-nursing-25-26.pdf')],
    ['Academic calendar 2024–2025', pdf('2025/academic-calendar-nursing-24-25.pdf')],
  ] },
  { faculty: 'Public Health', links: [
    ['Academic calendar 2026–2027 (UG & PG)', pdf('2026/academic-calendar-academic-year-26-27-public-health.pdf')],
    ['Academic calendar 2025–2026 (UG & PG)', pdf('2025/academic-calendar-academic-year-25-26-public-health.pdf')],
    ['Academic calendar 2024–2025 (UG & PG)', pdf('2024/academic-calendar-academic-year-24-25-public-health.pdf')],
  ] },
]

export const ABROAD = [
  ['Twinning degree', site('/ir/outward-mobility/twining-program/')],
  ['Dual degree', site('/ir/outward-mobility/dual-degree/')],
  ['Semester abroad programme', site('/ir/outward-mobility/semester-abroad-program/')],
]

export const CAREER = [
  ['Placements', site('/career-centre/')],
  ['Career Development Centre (CET)', site('/department/cet-cdc/')],
  ['Career Development Centre (CSH)', site('/department/cdc-csh/')],
  ['National Apprenticeship Training Scheme', 'https://nats.education.gov.in/'],
]

export const LIFE = [
  ['Clubs', site('/life-at-srm/student-life/clubs/')],
  ['Sports', site('/sports/')],
  ['NCC', site('/national-cadet-corps-ncc/')],
  ['NSS', site('/nss/')],
  ['Student affairs', site('/directorate-of-student-affairs/')],
  ['Equal Opportunity Cell', site('/equal-opportunity-cell/')],
  ['Student counselling', site('/life-at-srm/student-counselling-services/')],
  ['Anti-ragging', site('/life-at-srm/anti-ragging/')],
]
