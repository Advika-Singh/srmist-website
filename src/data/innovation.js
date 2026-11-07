// Student innovation stories. Every entry is something a primary source states; nothing is added from memory.
// Sources were read on 2026-11-07. `departments` holds department slugs (the last part of the department URL) and is left empty
// when the source does not name a department, rather than guessing one. Add a story by adding an object here with its source.

export const KINDS = ['project', 'lab', 'startup', 'alumnus']
export const KIND_LABEL = { project: 'Project', lab: 'Lab', startup: 'Startup', alumnus: 'Alumni' }

export const STORIES = [
  {
    id: 'srmsat',
    title: 'SRMSat',
    kind: 'project',
    faculty: '',
    departments: [],
    hook: 'SRMSat: a 10.9 kg nanosatellite built by SRM students and faculty to monitor CO2 and water vapour.',
    photo: null,
    source: 'https://www.isro.gov.in/ISRO_EN/SRMSAT.html',
    sourceName: 'ISRO',
    asOf: '2026-11-07',
  },
  {
    id: 'swift-student-challenge',
    title: 'Swift Student Challenge winners',
    kind: 'project',
    faculty: '',
    departments: [],
    hook: 'Seven student developers won Swift Student Challenge places, among the top 350 developers worldwide.',
    photo: null,
    source: 'https://www.srmist.edu.in/app-fair-2025-showcases-student-innovation-at-srmists-ios-development-centre/',
    sourceName: 'SRMIST news, App Fair 2025',
    asOf: '2026-11-07',
  },
  {
    id: 'forge-inspira-daas',
    title: 'Drone-as-a-Service',
    kind: 'startup',
    faculty: 'Management',
    departments: [],
    hook: 'An MBA team’s AI-driven drone logistics idea placed third nationally at IIT Hyderabad’s Forge Inspira Ideathon 2025.',
    photo: null,
    source: 'https://www.srmist.edu.in/srmist-mba-students-excel-at-forge-inspira-ideathon-2025-hosted-by-iit-hyderabad/',
    sourceName: 'SRMIST news, Forge Inspira 2025',
    asOf: '2026-11-07',
  },
  {
    id: 'aman-aviation-best-project',
    title: 'SRM–Aman Aviation Best Project Award',
    kind: 'project',
    faculty: 'Engineering & Technology',
    departments: ['department-of-aerospace-engineering'],
    hook: 'Aerospace Engineering students won first, second and third prizes in the SRM–Aman Aviation Best Project Award, 2024–25.',
    photo: null,
    source: 'https://www.srmist.edu.in/department/department-of-aerospace-engineering/student-achievements/',
    sourceName: 'Department of Aerospace Engineering',
    asOf: '2026-11-07',
  },
]

/** Stories that name this department (slug, the last part of its URL). */
export const storiesForDepartment = (slug) => STORIES.filter((s) => s.departments.includes(slug))
