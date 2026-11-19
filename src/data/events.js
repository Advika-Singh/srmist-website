// Events listed on SRMIST's official events page, https://www.srmist.edu.in/events/, with each event's own page read
// on 2026-11-19 (the site returns 403 to scripts, so the browser pane was used). Dates are the first and last day as the
// official page lists them. A time is included only where the page gives one. Venues are left to the official pages.
// Past events disappear from the calendar by themselves (see lib/events.js).

export const EVENTS_READ_ON = '19 November 2026'
export const EVENTS_SOURCE = 'https://www.srmist.edu.in/events/'
const o = (slug) => `https://www.srmist.edu.in/events/${slug}/`

export const EVENTS = [
  { id: 'technoblizz-2026', title: 'TECHNOBLIZZ 2026 (12th edition)', start: '2026-11-12', end: '2026-11-13', time: '9:30 AM – 4:30 PM', href: o('technoblizz-2026-12th-edition'), featured: true },
  { id: 'pdp-network-information-theory', title: 'Six-day Professional Development Programme on Network Information Theory: Challenges and Opportunities', start: '2026-11-23', end: '2026-11-28', time: '9:30 AM – 3:30 PM', href: o('six-day-professional-development-programme-pdp-on-network-information-theory-challenges-and-opportunities') },
  { id: 'robotics-automation-healthcare', title: 'AI-Driven Intelligent Robotics in Industrial Automation and Healthcare Systems', start: '2026-11-23', end: '2026-11-27', href: o('ai-driven-intelligent-robotics-in-industrial-automation-and-healthcare-systems') },
  { id: 'hackathon-cybersecurity', title: 'Two-Day Hackathon on Cybersecurity', start: '2026-11-24', end: '2026-11-25', time: '10:00 AM – 4:00 PM', href: o('two-day-hackathon-on-cybersecurity') },
  { id: 'workshop-drosophila', title: 'Workshop on Drosophila as a Model for Education, Research and AI Applications', start: '2026-11-25', end: '2026-11-27', href: o('workshop-on-drosophila-as-a-model-for-education-research-and-ai-applications') },
  { id: 'workshop-karyotyping', title: 'Workshop on Karyotyping', start: '2026-11-25', end: '2026-11-26', href: o('workshop-on-karyotyping') },
  { id: 'workshop-ai-ml-dft', title: 'Three Days International Workshop on Artificial Intelligence, Machine Learning, and Density Functional Theory in Chemical Engineering', start: '2026-12-02', end: '2026-12-04', href: o('three-days-international-workshop-on-artificial-intelligence-machine-learning-and-density-functional-theory-in-chemical-engineering') },
  { id: 'icsdg-2026', title: '5th International Conference on Higher Education Institute Challenges Solutions for Sustainable Development Goals 2026', start: '2026-12-03', end: '2026-12-03', href: o('icsdg-2026') },
  { id: 'winter-school-2026', title: 'Winter School 2026: Sustainable Energy and Environment', start: '2026-12-07', end: '2026-12-18', href: o('winter-school-2026-sustainable-energy-and-environment') },
  { id: 'cecam-summer-school', title: 'CECAM International Summer School on Non-Covalent Interaction: From Molecules to Materials', start: '2026-12-07', end: '2026-12-11', href: o('nimm-2026') },
  { id: 'faculty-ros2', title: 'Six-Day Faculty Development Programme on ROS 2 Mastery', start: '2026-12-07', end: '2026-12-12', href: o('six-day-faculty-development-programme-on-ros-2-mastery') },
  { id: 'responsible-ai-water', title: 'Responsible AI for Water Security and Public Health', start: '2026-12-09', end: '2026-12-09', href: o('responsible-ai-for-water-security-and-public-health') },
  { id: 'icpc-chennai-2026', title: 'International Collegiate Programming Contest (ICPC) – Chennai Regional 2026', start: '2026-12-10', end: '2026-12-11', href: o('international-collegiate-programming-contest-icpc-chennai-regional-2026') },
  { id: 'alumni-day-2026', title: 'Alumni Day 2026', start: '2026-12-19', end: '2026-12-19', href: o('alumni-day-2026'), featured: true },
  { id: 'ncbet-2027', title: 'NCBET 2027', start: '2027-03-18', end: '2027-03-19', href: o('ncbet-2027') },
  { id: 'mosaic-2027', title: 'MOSAIC 2027', start: '2027-04-01', end: '2027-04-02', href: o('mosaic-2027') },
  { id: 'raeeucci-2027', title: '6th International Conference on Recent Advances in Electrical, Electronics, Ubiquitous Communication, and Computational Intelligence', start: '2027-04-21', end: '2027-04-23', href: o('raeeucci-2027') },
  { id: 'icdsbs-2027', title: '4th International Conference on Data Science and Business Systems', start: '2027-04-22', end: '2027-04-23', href: o('icdsbs-2027') },
  { id: 'coacons-2027', title: 'CoaCoNS 2027', start: '2027-05-03', end: '2027-05-04', href: o('coacons-2027') },
  { id: 'ai-sge-2027', title: 'AI-SGE 2027', start: '2027-05-18', end: '2027-05-19', href: o('ai-sge-2027') },
  { id: 'paccas-2027', title: 'PACCAS 2027', start: '2027-09-01', end: '2027-09-03', href: o('paccas-2027') },
  { id: 'icfcit-2027', title: 'ICFCIT 2027', start: '2027-09-21', end: '2027-09-23', href: o('icfcit-2027') },
]
