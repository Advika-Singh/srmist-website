// Content for the Parents, Alumni chapters and Recruiters pages. Every fact was read on 2026-11-08 from the official pages named
// in `source`; links go back to them. Nothing here is invented: where the official page shows live counters, we link rather than copy.

const B = 'https://www.srmist.edu.in'

export const PARENTS = {
  source: `${B}/parents/`,
  portal: {
    title: 'Parent Portal',
    lede: 'See your ward’s academic activities, hostel, transport and financial details.',
    note: 'Applies from the 2025 batch onwards, for Faculty of Medicine and Health Sciences, Law, Management and Science & Humanities students only. Ph.D students are excluded.',
    links: [
      ['Open the web portal', 'https://parentconnect.srmist.edu.in/'],
      ['Android app', 'https://play.google.com/store/apps/details?id=com.gems'],
      ['iPhone / iPad app', 'https://apps.apple.com/us/app/juno-campus-student/id1431652107'],
      ['Web portal manual (PDF)', 'https://webstor.srmist.edu.in/web_assets/downloads/2025/srmist-msl-parent-web-portal-user-manual-v1.pdf'],
      ['Mobile app manual (PDF)', 'https://webstor.srmist.edu.in/web_assets/downloads/2025/srmist-msl-parent-mobile-app-user-manual-v1.pdf'],
    ],
  },
  other: ['Other students', 'Parents of other students use the parent login on the student portal.', 'https://sp.srmist.edu.in/srmiststudentportal/students/loginManager/parentLogin.jsp'],
  groups: [
    {
      title: 'Before they join',
      items: [
        ['Admission, India', `${B}/admission-india/`, 'Eligibility, process and dates'],
        ['Admission, international', `${B}/admission-international/`, 'For students from abroad'],
        ['Twinning and dual degree', `${B}/ir/outward-mobility/`, 'Study part of the degree abroad'],
        ['Fee and ROI calculator', '/admissions', 'An estimate on this site (illustrative figures)'],
        ['SRMJEEE 2027 dates', '/srmjeee', 'Deadlines and phases'],
      ],
    },
    {
      title: 'Money and support',
      items: [
        ['Scholarships on this site', '/scholarships', 'What is on offer'],
        ['Vidya Lakshmi education loans', 'https://www.vidyalakshmi.co.in/', 'The government portal to view, apply for and track bank loans'],
        ['International scholarships', `${B}/admission-international/scholarships/`, 'For international students'],
      ],
    },
    {
      title: 'Safety and wellbeing',
      items: [
        ['Anti-ragging and anti-discrimination', `${B}/life-at-srm/anti-discrimination/`, 'Policy and how to report'],
        ['e-Samadhaan (UGC)', 'https://samadhaan.ugc.ac.in/', 'The UGC’s grievance portal'],
        ['Student counselling', `${B}/life-at-srm/student-counselling-services/`, 'Support for students'],
        ['Report an issue on this site', '/support', 'Get a reference number and track it'],
      ],
    },
    {
      title: 'Campus and living',
      items: [
        ['Hostels and mess', '/hostels', 'Blocks, timings and who to call'],
        ['Visit the campus', '/visitors', 'Where to stay and eat nearby'],
        ['Walk the campus', '/campus-walk', 'Five stops with real distances'],
        ['Transport', `${B}/transport-facility/`, 'Official transport page'],
        ['360° virtual tour', 'https://webstor.srmist.edu.in/web_assets/srmist-virtual-tour-vo/index.htm', 'Opens on srmist.edu.in'],
      ],
    },
    {
      title: 'Keep up with their progress',
      items: [
        ['Examinations', `${B}/controller-of-examinations/`, 'Controller of Examinations'],
        ['Academic calendar', `${B}/students/#ac`, 'On the students page'],
        ['Student achievements', `${B}/news/jsf/jet-engine/tax/category:348/`, 'News about students'],
        ['News', `${B}/news/`, 'University news'],
        ['Events', '/events', 'Upcoming events'],
      ],
    },
  ],
  feedback: ['Parent feedback', `${B}/parents/#feedback`, 'The university collects feedback and suggestions from parents on its parents page.'],
}

export const ALUMNI = {
  source: `${B}/alumni-affairs/`,
  portal: 'https://alumni.srmist.edu.in/',
  intro: 'The Directorate of Alumni Affairs was established in September 2017 for the whole university. Before that, the SRMEC Alumni Office had worked since 1996.',
  aims: [
    ['Coordination', 'Better links between the university and its alumni.'],
    ['Students and faculty', 'More interaction between alumni, students and faculty members.'],
    ['Chapters', 'Alumni chapters in India and abroad.'],
    ['Database', 'A maintained record of alumni, and looking after their interests.'],
  ],
  vision: 'Develop a fully connected, strong, SRM alumni community.',
  // The most recent chapter meetups listed on the official page, newest first as shown there.
  chapters: [
    ['Mumbai alumni chapter meet, 2026', `${B}/srmist-mumbai-alumni-chapter-meet-2026/`],
    ['Delhi alumni chapter meet, 2026', `${B}/srmist-delhi-alumni-chapter-meet-2026/`],
    ['Bangalore chapter meetup, October 2025', `${B}/bangalore-chapter-alumni-meetup-october-2025/`],
    ['Kerala chapter launched, Trivandrum and Calicut', `${B}/srmist-kerala-alumni-chapter-launched-with-enthusiastic-meetups-in-trivandrum-and-calicut/`],
    ['Kolkata chapter meetup, February 2025', `${B}/kolkata-chapter-alumni-meetup-feb-2025/`],
    ['Cochin chapter meetup, June 2024', `${B}/cochin-chapter-alumni-meetup-june-2024/`],
    ['Puducherry chapter meetup, May 2024', null],
    ['Pune chapter meetup, April 2024', null],
    ['Bangalore chapter meetup, April 2024', null],
    ['Trichy chapter meetup, March 2024', `${B}/trichy-alumni-chapter-meetup/`],
  ],
  links: [
    ['Alumni portal', 'https://alumni.srmist.edu.in/', 'Connect with classmates, post jobs and share memories'],
    ['Alumni Affairs', `${B}/alumni-affairs/`, 'The directorate’s official page, team and contacts'],
    ['Newsletter', `${B}/alumni-affairs/newsletter/`, 'Updates from the directorate'],
    ['All chapter news', `${B}/news/jsf/jet-engine/tax/category:379/`, 'Every chapter story on the official site'],
  ],
}

export const RECRUITERS = {
  sources: ['https://www.srmist.edu.in/career-centre/', 'https://www.srmist.edu.in/placements/'],
  steps: [
    ['Get in touch', 'Write to the Placement Office. The Career Centre brings together the Placement Office and the Career Development Centre and serves every faculty.'],
    ['Plan the visit', 'Pre-placement talks, written tests, group discussions and interviews run on campus, in rooms the university sets aside for recruiters.'],
    ['Meet students', 'Interviews run with the recruiting organisations. Students prepare through training, mock interviews and practice assessments.'],
  ],
  links: [
    ['Placement statistics', 'https://www.srmist.edu.in/placements/placement-statistics/', 'Live counters for the latest batch'],
    ['Industry collaborations', 'https://www.srmist.edu.in/placements/industry-collaborations/', 'Where the university works with industry'],
    ['Placement activities', 'https://www.srmist.edu.in/placements/activities/', 'Training and events through the year'],
    ['Meet the team', 'https://www.srmist.edu.in/placements/meet-our-staff/', 'The Career Centre staff'],
  ],
}
