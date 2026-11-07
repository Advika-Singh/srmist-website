// Fields of study with typical programme lengths. Durations are the national norm for each degree;
// the programme's own page on srmist.edu.in is the source of truth for exact programme lists.
export const PROGRAMMES = [
  { id: 'engineering', field: 'Engineering & Technology', levels: 'UG · PG · Doctoral', duration: 'B.Tech 4 yrs · M.Tech 2 yrs', examples: 'Computer Science, Electronics, Mechanical, Civil, Biotechnology', words: 'engineering btech b.tech cse computer ai it software mechanical civil electronics' },
  { id: 'medicine', field: 'Medicine & Health', levels: 'UG · PG · Doctoral', duration: 'MBBS 5.5 yrs · BDS 5 yrs · B.Pharm 4 yrs', examples: 'Medicine, Dentistry, Pharmacy, Nursing, Physiotherapy', words: 'medicine medical mbbs neet dental bds pharmacy nursing physiotherapy health doctor' },
  { id: 'management', field: 'Management', levels: 'UG · PG · Doctoral', duration: 'BBA 3 yrs · MBA 2 yrs', examples: 'Business Administration, Finance, Marketing, Analytics', words: 'management mba bba business finance marketing commerce' },
  { id: 'science', field: 'Science & Humanities', levels: 'UG · PG · Doctoral', duration: 'B.Sc 3 yrs · M.Sc 2 yrs', examples: 'Physics, Chemistry, Mathematics, Data Science, Liberal Arts', words: 'science humanities bsc b.sc msc physics chemistry maths mathematics arts' },
  { id: 'law', field: 'Law', levels: 'UG · PG', duration: 'Integrated LL.B 5 yrs · LL.M 1 yr', examples: 'B.A. LL.B, B.B.A. LL.B, LL.M', words: 'law llb llm legal lawyer' },
  { id: 'architecture', field: 'Architecture', levels: 'UG · PG', duration: 'B.Arch 5 yrs · M.Arch 2 yrs', examples: 'Architecture, Urban Design, Interior Design', words: 'architecture barch design architect' },
  { id: 'agriculture', field: 'Agricultural Sciences', levels: 'UG · PG · Doctoral', duration: 'B.Sc (Hons) 4 yrs · M.Sc 2 yrs', examples: 'Agriculture, Horticulture, Agri-business', words: 'agriculture agri farming horticulture' },
  { id: 'hotel', field: 'Hotel Management', levels: 'UG · PG', duration: 'B.Sc / BHM 3–4 yrs', examples: 'Hospitality, Culinary Arts, Hotel Operations', words: 'hotel hospitality management culinary chef tourism' },
]

export const programmeById = (id) => PROGRAMMES.find((p) => p.id === id)
export const applyHref = (id) => `/apply/programme?field=${encodeURIComponent(programmeById(id)?.field ?? '')}`
