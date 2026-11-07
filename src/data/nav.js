// Navigation modelled on the official SRMIST site (srmist.edu.in):
//   1. a dark utility strip   2. logo + quick links   3. main menu with large dropdowns.
// Pages we have built use "/…" paths; everything else points at the official site.

const B = 'https://www.srmist.edu.in'
const o = (p) => `${B}${p}`

// Top strip, left side.
export const STRIP = [
  ['Students', '/students'],
  ['Faculty & Staff', '/teach.html'],
  ['Parents', o('/parents/')],
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

// Small links next to the logo.
export const AUX = [
  ['Library', '/library'],
  ['Career Centre', '/placements'],
  ['News', o('/news/')],
  ['Events', '/events'],
  ['Blog', o('/blog')],
  ['Careers', 'https://careers.srmist.edu.in/'],
  ['Contact us', o('/contact-us/')],
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
          ['Engineering & Technology', o('/college/college-of-engineering-technology/')],
          ['Management', o('/college/college-of-management/')],
          ['Science & Humanities', o('/college/college-of-science-and-humanities/')],
          ['Law', o('/college/college-of-law/')],
          ['Agricultural Sciences', o('/college/agriculture-sciences/')],
          ['Medicine & Health Sciences', o('/college/medicine-and-health-sciences/')],
        ],
      },
      {
        title: 'Health sciences',
        links: [
          ['Medicine', 'https://medical.srmist.edu.in/'],
          ['Dentistry', 'https://dental.srmist.edu.in/'],
          ['Pharmacy', o('/department/college-of-pharmacy/')],
          ['Physiotherapy', o('/department/college-of-physiotherapy/')],
          ['Occupational Therapy', o('/department/college-of-occupational-therapy/')],
          ['Nursing', o('/department/college-of-nursing/')],
          ['Public Health', o('/department/school-of-public-health/')],
        ],
      },
      {
        title: 'Explore',
        links: [
          ['Programme Finder', '/programmes'],
          ['Course finder', '/course-finder'],
          ['Departments A–Z', '/departments'],
          ['Faculty & staff', '/teach.html'],
          ['Staff finder', '/staff-finder'],
          ['Library', '/library'],
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
          ['Research Highlights', o('/research/highlights/')],
          ['Publications', o('/research/publications/')],
          ['Patents', o('/research/patents/')],
          ['Recent Projects', o('/research/projects/')],
          ['Sponsored Projects', o('/research/sponsored-projects/')],
          ['Ph.D Awarded', o('/research/ph-d-awarded/')],
        ],
      },
      {
        title: 'Centres & wings',
        links: [
          ['IIISM', o('/research/research-wings/iiism/')],
          ['NRC', o('/research/research-wings/nrc/')],
          ['CACR', o('/research/research-wings/cacr/')],
          ['Division of Medical Research', 'https://medicalresearch.srmist.edu.in/'],
          ['Centre for Statistics', o('/research/research-wings/centre-for-statistics/')],
          ['HPCC', o('/research/hpcc/')],
          ['SCIF', o('/research/scif/')],
        ],
      },
      {
        title: 'Collaborate',
        links: [
          ['MoUs & collaborations', o('/research/collaborations/')],
          ['Industry Connect', o('/research/industry-connect/')],
          ['Innovation & Incubation', o('/research/innovation-incubation/')],
          ['Entrepreneurship & Innovation', 'https://www.srmdei.com/'],
          ['Regulations & Forms', o('/research/research-regulations-and-forms/')],
          ['Awards & Recognition', o('/research/awards-and-recognition/')],
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
          ['Art and Culture', o('/life-at-srm/culture/')],
          ['Sports', o('/life-at-srm/sports/')],
          ['Clubs', '/clubs'],
          ['NCC', o('/national-cadet-corps-ncc/')],
          ['NSS', o('/nss/')],
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
          ['Transport', o('/transport-facility/')],
        ],
      },
      {
        title: 'Community',
        links: [
          ['Student Counselling', o('/life-at-srm/student-counselling-services/')],
          ['Diversity', o('/life-at-srm/student-life/diversity/')],
          ['Public Service', o('/life-at-srm/public-service/')],
          ['SRM Muthucharam', o('/life-at-srm/muthucharam/')],
          ['Religious Life', o('/life-at-srm/student-life/religious-life/')],
          ['Anti-Ragging', o('/life-at-srm/anti-ragging/')],
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
          ['International Advisory Board', o('/ir/international-advisory-board/')],
          ['IAB Members', o('/ir/iab-members/')],
          ['Global Partnership', o('/ir/global-partnerships/')],
          ['International Research Network', o('/research/collaborations/')],
        ],
      },
      {
        title: 'Study abroad',
        links: [
          ['Semester Abroad Program', o('/ir/outward-mobility/semester-abroad-program/')],
          ['Twinning / Transfer', o('/ir/outward-mobility/twining-program/')],
          ['Pathway', o('/ir/outward-mobility/dual-degree/')],
          ['Global Immersion', o('/ir/srm-global-immersion-program/')],
        ],
      },
      {
        title: 'International students',
        links: [
          ['Admissions International', o('/admission-international/')],
          ['Student Services', o('/ir/international-admission-details/')],
          ['Visiting Faculty', o('/ir/international-relations-foreign-visiting-and-adjunct-professors/')],
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
          ['Equal Opportunity Cell', o('/equal-opportunity-cell/')],
          ['Student Counselling', o('/life-at-srm/student-counselling-services/')],
        ],
      },
      {
        title: 'Visiting SRM',
        links: [
          ['Visitors & parents', '/visitors'],
          ['A day at SRM', '/day'],
          ['Library', '/library'],
          ['Transport', o('/transport-facility/')],
          ['Contact us', o('/contact-us/')],
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
          ['History', o('/about-us/history/')],
          ['Accreditations & Rankings', '/rankings'],
          ['QS Ratings', o('/about-us/qs-ratings/')],
          ['Sustainability Impact (SDG)', o('/about-us/the-sustainability-impact-ratings/')],
        ],
      },
      {
        title: 'Leadership',
        links: [
          ['Apex Leadership', o('/about-us/leadership-team/')],
          ['Governance', o('/about-us/governance/')],
          ['Administrative Heads', o('/about-us/administrative-heads/')],
          ['Academic Heads', o('/about-us/academic-heads/')],
        ],
      },
      {
        title: 'Recognition',
        links: [
          ['Awards & Recognition', o('/about-us/awards-recognition/')],
          ['Placements', '/placements'],
          ['Scholarships', '/scholarships'],
          ['News & events', '/events'],
        ],
      },
    ],
  },
]
