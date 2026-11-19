// Navigation modelled on the official SRMIST site (srmist.edu.in):
//   1. a dark utility strip   2. logo + quick links   3. main menu with large dropdowns.
// Pages we have built use "/…" paths; everything else points at the official site.

const B = 'https://www.srmist.edu.in'
const o = (p) => `${B}${p}`

// Top strip, left side.
export const STRIP = [
  ['Students', '/students'],
  ['Faculty & Staff', '/teach.html'],
  ['Parents', '/parents'],
  ['Visitors', '/visitors'],
  ['Alumni', '/alumni'],
  ['Examinations', '/examinations'],
]

// "Campuses" dropdown in the strip.
export const CAMPUSES = [
  ['Kattankulathur · Chennai', o('/')],
  ['Ramapuram · Chennai', 'https://srmrmp.edu.in/ramapuram-campus/'],
  ['Vadapalani · Chennai', 'https://www.srmistvdp.edu.in/'],
  ['Tiruchirappalli', 'https://srmtrichy.edu.in/'],
  ['Delhi – NCR', 'https://www.srmimt.net/'],
  ['Baburayanpettai · Acharapakkam', o('/baburayanpettai-campus/')],
]

// Gold button, top right of the strip.
export const ADMIT = ['Admissions 2027', '/admissions']

// Outlined button next to it: the SRMJEEE page.
export const SRMJEEE_LINK = ['SRMJEEE', '/srmjeee']

// Small links next to the logo.
export const AUX = [
  ['Library', '/library'],
  ['Career Centre', '/placements'],
  ['News', o('/news/')],
  ['Events', '/events'],
  ['Blog', o('/blog')],
  ['Careers', 'https://careers.srmist.edu.in/'],
  ['Contact us', '/contact'],
]

// Main menu. `to` is our own page for the menu; each column lists its dropdown links.
export const MENUS = [
  {
    label: 'Academics',
    to: '/academics',
    blurb: 'Colleges, programmes and the people who teach them.',
    cols: [
      {
        title: 'Colleges',
        links: [
          ['Engineering & Technology', '/colleges#engineering'],
          ['Management', '/colleges#management'],
          ['Science & Humanities', '/colleges#liberal'],
          ['Law', 'https://law.srmist.edu.in/'],
          ['Agricultural Sciences', '/colleges#agri'],
          ['Medicine & Health Sciences', '/colleges#medicine-hs'],
        ],
      },
      {
        title: 'Health sciences',
        links: [
          ['Medicine', 'https://medical.srmist.edu.in/'],
          ['Dentistry', 'https://dental.srmist.edu.in/'],
          ['Pharmacy', '/colleges#pharmacy'],
          ['Physiotherapy', '/colleges#physio'],
          ['Occupational Therapy', '/colleges#ot'],
          ['Nursing', '/colleges#nursing'],
          ['Public Health', '/colleges#public-health'],
        ],
      },
      {
        title: 'Explore',
        links: [
          ['Programme Finder', '/programmes'],
          ['Course finder', '/course-finder'],
          ['Compare programmes', '/compare'],
          ['Key dates', '/dates'],
          ['Departments A–Z', '/departments'],
          ['Faculty & staff', '/teach.html'],
          ['Staff finder', '/staff-finder'],
          ['Library', '/library'],
          ['Publications', '/research/initiatives#publications'],
          ['Faculty achievements', '/about/recognition#achievements'],
          ['Visiting foreign faculty', '/international/global#visiting'],
          ['Distance Education', 'https://srmistdistanceeducation.in/'],
          ['Online Education', 'https://www.srmonline.in/'],
        ],
      },
    ],
  },
  {
    label: 'Research',
    to: '/research',
    blurb: 'Laboratories, centres and an incubation ecosystem for ambitious ideas.',
    cols: [
      {
        title: 'Research',
        links: [
          ['Directorate of Research', '/research'],
          ['Research Highlights', '/research/initiatives#highlights'],
          ['Publications', '/research/initiatives#publications'],
          ['Patents', '/research/initiatives#patents'],
          ['Recent Projects', '/research/initiatives#projects'],
          ['Sponsored Projects', '/research/initiatives#sponsored'],
          ['Ph.D Awarded', '/research/initiatives#phd'],
          ['Research Council', '/research/initiatives#council'],
          ['RDC', '/research/initiatives#rdc'],
          ['Research Day', '/research/initiatives#research-day'],
          ['DPRC', '/research/initiatives#dprc'],
          ['SERI', '/research/initiatives#seri'],
          ['Thrust areas (PDF)', 'https://webstor.srmist.edu.in/web_assets/downloads/2023/thrust-area-of-research.pdf'],
        ],
      },
      {
        title: 'Centres & wings',
        links: [
          ['IIISM', '/research/centres#iiism'],
          ['NRC', '/research/centres#nrc'],
          ['CACR', '/research/centres#cacr'],
          ['Division of Medical Research', 'https://medicalresearch.srmist.edu.in/'],
          ['Centre for Statistics', '/research/centres#statistics'],
          ['HPCC', '/research/centres#hpcc'],
          ['SCIF', '/research/centres#scif'],
          ['SRM DBT Platform', '/research/centres#dbt'],
          ['Earthquake Research Cell', '/research/centres#eqrc'],
        ],
      },
      {
        title: 'Collaborate',
        links: [
          ['MoUs & collaborations', '/research/partners#collaborations'],
          ['Industry Connect', '/research/partners#industry'],
          ['Student innovation', '/innovation'],
          ['Innovation & Incubation', '/research/partners#incubation'],
          ['Entrepreneurship & Innovation', 'https://www.srmdei.com/'],
          ['Regulations & Forms', '/research/initiatives#regulations'],
          ['Awards & Recognition', '/research/initiatives#awards'],
          ['Multi-disciplinary Research', '/research/partners#multidisciplinary'],
          ['FAB LAB', 'https://fablab.srmiiec.com/'],
          ['Call for Proposals', '/research/initiatives#call'],
        ],
      },
    ],
  },
  {
    label: 'Campus life',
    to: '/campus-life',
    blurb: 'Clubs, sport, culture and a home away from home.',
    cols: [
      {
        title: 'Student life',
        links: [
          ['Overview', '/campus-life'],
          ['Art and Culture', '/campus-life/student-life#culture'],
          ['Sports', '/campus-life/student-life#sports'],
          ['Clubs', '/clubs'],
          ['NCC', '/campus-life/student-life#ncc'],
          ['NSS', '/campus-life/student-life#nss'],
          ['Tamil Perayam', '/campus-life/student-life#tamil'],
          ['Student Affairs', '/clubs#dsa'],
        ],
      },
      {
        title: 'Living on campus',
        links: [
          ['Hostels', '/hostels'],
          ['Girls Hostels', '/hostels#women'],
          ['Boys Hostels', '/hostels#men'],
          ['International Hostels', '/hostels#international'],
          ['Mess & Dining', '/hostels#mess'],
          ['Transport', '/campus-life/living#transport'],
          ['Facilities & Operations', '/campus-life/living#facilities'],
          ['Safety & Security', '/campus-life/living#safety'],
        ],
      },
      {
        title: 'Community',
        links: [
          ['Ask a current student', '/ask-a-student'],
          ['Student Counselling', '/campus-life/wellbeing#counselling'],
          ['Diversity', '/campus-life/living#diversity'],
          ['Public Service', '/campus-life/student-life#public-service'],
          ['SRM Muthucharam', '/campus-life/living#muthucharam'],
          ['Religious Life', '/campus-life/living#religious'],
          ['Anti-Ragging', '/campus-life/wellbeing#ragging'],
          ['Anti-Discrimination', '/campus-life/wellbeing#discrimination'],
          ['Community Centers', '/campus-life/student-life#community'],
          ['Milan (annual fest)', '/campus-life/student-life#milan'],
          ['Grievance Redressal', '/campus-life/wellbeing#womens'],
        ],
      },
    ],
  },
  {
    label: 'International',
    to: '/international',
    blurb: 'Global partners, exchange programmes and support for students from abroad.',
    cols: [
      {
        title: 'Global SRM',
        links: [
          ['About us', '/international'],
          ['International Advisory Board', '/international/global#iab'],
          ['IAB Members', '/international/global#members'],
          ['Global Partnership', '/international/global#partnerships'],
          ['International Research Network', '/research/partners#collaborations'],
          ['International Alumni Network', 'https://alumni.srmist.edu.in/'],
        ],
      },
      {
        title: 'Study abroad',
        links: [
          ['Semester Abroad Program', '/international/pathways#semester-abroad'],
          ['Twinning / Transfer', '/international/pathways#twinning'],
          ['Pathway', '/international/pathways#dual-degree'],
          ['Global Immersion', '/international/pathways#immersion'],
        ],
      },
      {
        title: 'International students',
        links: [
          ['Admissions International', '/international/pathways#admissions'],
          ['Student Services', '/international/pathways#services'],
          ['Visiting Faculty', '/international/global#adjunct'],
          ['Study in India', 'https://studyinindia.gov.in'],
        ],
      },
    ],
  },
  {
    label: 'Services',
    to: '/status',
    blurb: 'Live portal status, an issue tracker with reference numbers, and a map of step-free routes.',
    cols: [
      {
        title: 'Student services',
        links: [
          ['Service status', '/status'],
          ['Report or track an issue', '/support'],
          ['Academia (student portal)', 'https://academia.srmist.edu.in/'],
          ['Fees & student information', 'https://sp.srmist.edu.in/'],
          ['LMS', 'https://lms.srmist.edu.in/'],
          ['ITKM Service Desk', 'https://sd.srmist.edu.in/'],
        ],
      },
      {
        title: 'Accessibility',
        links: [
          ['Accessible campus map', '/access-map'],
          ['Report an accessibility barrier', '/support?category=Accessibility%20barrier'],
          ['Equal Opportunity Cell', '/campus-life/wellbeing#eoc'],
          ['Student Counselling', '/campus-life/wellbeing#counselling'],
        ],
      },
      {
        title: 'Visiting SRM',
        links: [
          ['Visitors & parents', '/visitors'],
          ['A day at SRM', '/day'],
          ['Walk the campus', '/campus-walk'],
          ['Library', '/library'],
          ['Transport', '/campus-life/living#transport'],
          ['Contact us', '/contact'],
        ],
      },
    ],
  },
  {
    label: 'About',
    to: '/about',
    blurb: 'Four decades of learning, leadership and recognition.',
    cols: [
      {
        title: 'The university',
        links: [
          ['Overview', '/about'],
          ['History', '/about/history'],
          ['Accreditations & Rankings', '/rankings'],
          ['QS Ratings', '/about/recognition#qs'],
          ['Sustainability Impact (SDG)', '/about/recognition#the-impact'],
          ['Virtual tour 360°', 'https://webstor.srmist.edu.in/web_assets/srmist-virtual-tour-vo/index.htm'],
        ],
      },
      {
        title: 'Leadership & offices',
        links: [
          ['Apex Leadership', '/about/leadership'],
          ['Governance', '/about/leadership#governance'],
          ['Administrative Heads', '/about/offices#directorates'],
          ['Academic Heads', '/about/leadership#governance'],
          ['IQAC', '/about/offices#iqac'],
          ['ITKM', '/about/offices#itkm'],
          ['Learning & Development', 'https://dld.srmist.edu.in/'],
          ['Online & Distance Education (DODE)', '/about/offices#dode'],
          ['Communications', '/about/offices#communications'],
          ['Alumni chapters', '/alumni/chapters'],
          ['Alumni Affairs', '/about/offices#alumni-affairs'],
        ],
      },
      {
        title: 'Recognition',
        links: [
          ['Awards & Recognition', '/about/recognition#awards'],
          ['Placements', '/placements'],
          ['Hire from SRMIST', '/recruiters'],
          ['Scholarships', '/scholarships'],
          ['News & events', '/events'],
          ['Student achievements', '/about/recognition#achievements'],
          ['Announcements', '/about/recognition#achievements'],
        ],
      },
    ],
  },
]
