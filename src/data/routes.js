// Small route table so the main bundle doesn't need the full page content (pages.json loads with the sub-pages).
export const SLUGS = ["about", "academics", "admissions", "research", "campus-life", "programmes", "international", "placements", "rankings", "scholarships", "events", "library", "departments", "examinations", "alumni"]

// Addresses of the section pages (data/sections.js holds their content). A test keeps this list in step with that file.
export const SECTION_PATHS = ['/colleges', '/research/centres', '/research/initiatives', '/research/partners', '/campus-life/student-life', '/campus-life/living', '/campus-life/wellbeing', '/international/global', '/international/pathways', '/about/history', '/about/leadership', '/about/recognition', '/about/offices', '/contact']

export const EYEBROWS = {
  "about": "About SRMIST",
  "academics": "Academics at SRMIST",
  "admissions": "Admissions 2027",
  "research": "Research & innovation",
  "campus-life": "Life at SRMIST",
  "programmes": "Programme finder",
  "international": "International at SRMIST",
  "placements": "Careers & placements",
  "rankings": "Rankings & accreditation",
  "scholarships": "Scholarships & aid",
  "events": "News & events",
  "library": "University library",
  "departments": "Departments A–Z",
  "examinations": "Examinations",
  "alumni": "SRMIST alumni"
}
