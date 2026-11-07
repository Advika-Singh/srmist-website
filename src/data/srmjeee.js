// SRMJEEE 2027 (B.Tech and M.Tech Integrated), as published by SRMIST. Every fact here is copied from
//   https://applications.srmist.edu.in/btech        (the online application page)
//   https://www.srmist.edu.in/admission-india/      (admissions for India, with the exam manuals)
// Checked 2026-11-06. SRMIST marks the dates tentative and subject to change, so the page says so and links the source.

export const OFFICIAL = {
  apply: 'https://applications.srmist.edu.in/btech',
  portal: 'https://applications.srmist.edu.in/',
  admissions: 'https://www.srmist.edu.in/admission-india/',
  engineering: 'https://www.srmist.edu.in/admission-india/engineering/',
  dates: 'https://webstor.srmist.edu.in/web_assets/downloads/2027/important-dates-for-srmjeee-ug-2027.pdf',
  international: 'https://intlapplications.srmist.edu.in/international-application-form-2027',
}

export const PHASES = [
  { n: 1, exam: '17–18 April 2027', examStart: '2027-04-17', deadline: '2027-04-02', deadlineLabel: '2 April 2027' },
  { n: 2, exam: '19–20 June 2027', examStart: '2027-06-19', deadline: '2027-06-04', deadlineLabel: '4 June 2027' },
]

export const FACTS = [
  ['Exam', 'SRMJEEE, a computer-based test (CBT) taken at centres across India'],
  ['Phases', '2. You can take more than one, filling a separate form for each'],
  ['Application fee', '₹1,400 for each phase, non-refundable'],
  ['For', 'B.Tech and M.Tech (Integrated) at SRMIST Chennai campuses (Kattankulathur, Ramapuram, Vadapalani, Delhi-NCR Ghaziabad, Tiruchirappalli, Baburayanpettai), SRM University Sonepat, SRM University AP and SRM University Sikkim'],
  ['NRI, PIO and OCI', 'Apply through the international application form only'],
]

export const STEPS = [
  ['Register', 'Create your account with an email address you will keep: it cannot be changed later, and SRMIST writes to it until enrolment.'],
  ['Verify by email', 'Confirm the address from the message SRMIST sends.'],
  ['Fill the application', 'Complete the online form. Have your 10th mark statement ready for your registration number and details.'],
  ['Upload documents', 'Upload the documents the form asks for.'],
  ['Pay the fee', '₹1,400 for the phase you are applying for.'],
]

export const NOTES = [
  'Programme preference on the form is collected for statistics only. You choose your campus, programme and specialisation at counselling.',
  'Seat allotment in Phase 2 may change depending on seats available across the campuses.',
  'All dates are tentative and may change. Check the official dates before you plan around them.',
]

// Eligibility, as published for B.Tech: 10+2 (passed or appearing this year), at least 60% aggregate in three subjects,
// Physics and Mathematics compulsory plus one more from this list.
export const THIRD_SUBJECT = ['Chemistry', 'Biotechnology', 'Biology', 'Computer Science', 'Information Technology', 'Informatics Practices', 'Artificial Intelligence', 'Engineering Graphics', 'Botany and Zoology']
export const MIN_AGGREGATE = 60

export const OTHER_EXAMS = [
  ['SRMJEEM', 'MBA'],
  ['SRMJEEH', 'Health Science (UG and PG)'],
  ['SRMJEEL', 'Law (UG)'],
]
