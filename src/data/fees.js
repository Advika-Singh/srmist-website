// ILLUSTRATIVE figures only. They exist so the calculator, the chat card and the Admissions page
// behave realistically. Replace every number with the official fee schedule before launch.
export const FEES_ARE_ILLUSTRATIVE = true

// Annual tuition in rupees, programme length in years.
export const FEE_PROGRAMMES = [
  { id: 'engineering', label: 'B.Tech (Engineering & Technology)', tuition: 250000, years: 4 },
  { id: 'medicine', label: 'MBBS (Medicine & Health)', tuition: 1200000, years: 5 },
  { id: 'management', label: 'BBA / MBA (Management)', tuition: 200000, years: 3 },
  { id: 'science', label: 'B.Sc (Science & Humanities)', tuition: 120000, years: 3 },
  { id: 'law', label: 'Integrated LL.B (Law)', tuition: 180000, years: 5 },
  { id: 'architecture', label: 'B.Arch (Architecture)', tuition: 220000, years: 5 },
  { id: 'agriculture', label: 'B.Sc Agriculture (Agricultural Sciences)', tuition: 140000, years: 4 },
  { id: 'hotel', label: 'B.Sc Hotel Management', tuition: 150000, years: 3 },
]

// Annual room rent. Mess is charged on top for every hosteller.
export const HOSTELS = [
  { id: 'none', label: 'Day scholar (no hostel)', rent: 0 },
  { id: 'triple', label: 'Shared room, 3 students', rent: 90000 },
  { id: 'double', label: 'Shared room, 2 students', rent: 120000 },
  { id: 'single', label: 'Single room, air-conditioned', rent: 190000 },
]

export const MESS_PER_YEAR = 60000
export const ONE_TIME_FIRST_YEAR = 25000 // admission, caution deposit, uniform and ID
export const AVERAGE_CTC = 719000 // 7.19 LPA, placements 2023–24 (srmist.edu.in)

export const SCHOLARSHIPS = [
  { id: 0, label: 'None' },
  { id: 10, label: '10% tuition waiver' },
  { id: 25, label: '25% tuition waiver' },
  { id: 50, label: '50% tuition waiver' },
  { id: 100, label: '100% tuition waiver' },
]

export const inr = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(n))

/** Cost breakdown per year plus the total, with tuition and hostel rising by `rise` % a year. */
export function estimate({ programme, hostel, waiver = 0, rise = 5 }) {
  const p = FEE_PROGRAMMES.find((x) => x.id === programme) ?? FEE_PROGRAMMES[0]
  const h = HOSTELS.find((x) => x.id === hostel) ?? HOSTELS[0]
  const years = []
  for (let y = 0; y < p.years; y++) {
    const k = (1 + rise / 100) ** y
    const tuition = p.tuition * k * (1 - waiver / 100)
    const room = h.rent * k
    const mess = h.rent ? MESS_PER_YEAR * k : 0
    const once = y === 0 ? ONE_TIME_FIRST_YEAR : 0
    years.push({ year: y + 1, tuition, room, mess, once, total: tuition + room + mess + once })
  }
  const total = years.reduce((s, y) => s + y.total, 0)
  return { programme: p, hostel: h, years, total, first: years[0].total, payback: total / AVERAGE_CTC }
}
