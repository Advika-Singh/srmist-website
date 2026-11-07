// Hostels at the Kattankulathur campus.
// Source: the Directorate of Hostels pages on srmist.edu.in (read 2026-11-06): https://www.srmist.edu.in/srm-hostels/
// Anything the official pages do not give is left as null, and the page shows a placeholder describing what belongs there.
// Distances are straight-line metres between building centres on OpenStreetMap (rounded to 10 m), not walking distances.

const IMG = 'https://www.srmist.edu.in/wp-content/uploads/'
const PDF = 'https://webstor.srmist.edu.in/web_assets/downloads/'
export const OFFICIAL = 'https://www.srmist.edu.in/srm-hostels/'

export const TARGETS = [
  ['ub', 'University Building (UB)'],
  ['tech', 'SRM Tech Park'],
  ['main', 'Main Block'],
  ['java', 'Java Green food court'],
]

const email = (slug) => `warden.${slug}.ktr@srmist.edu.in`

// Only photos whose file name names the hostel are used; the others are left to a placeholder instead of risking a wrong picture.
export const HOSTELS = [
  // ---- men ----
  { id: 'paari', group: 'men', name: 'Paari', floors: 'G+9', facing: 'West', ac: 'Non-AC', sharing: '4 and 5 sharing', washroom: 'Common washrooms', features: ['Well furnished', 'Four and five sharing rooms'], email: email('paari'), phone: '8056016611', photo: null, plan: PDF + '2025/paari-floor-plan-boys-hostel.pdf', dist: { ub: 170, tech: 300, main: 550, java: 140 } },
  { id: 'kaari', group: 'men', name: 'Kaari', floors: 'G+9', facing: 'West', ac: 'Non-AC', sharing: '4 and 5 sharing', washroom: 'Common washrooms', features: ['Well furnished', 'Four and five sharing rooms'], email: email('kaari'), phone: '8056016612', photo: null, plan: PDF + '2025/kaari-floor-plan-boys-hostel.pdf', dist: { ub: 190, tech: 340, main: 530, java: 170 } },
  { id: 'oori', group: 'men', name: 'Oori', floors: 'G+9', facing: 'West', ac: 'AC', sharing: '4 and 5 sharing', washroom: 'Common washrooms', features: ['All rooms air-conditioned', 'Study hall', 'Indoor games: carrom, chess, table tennis and more', 'Centrally located'], email: email('oori'), phone: '8056016613', photo: null, plan: PDF + '2025/oori-floor-plan-boys-hostel.pdf', dist: { ub: 230, tech: 360, main: 530, java: 200 } },
  { id: 'adhiyaman', group: 'men', name: 'Adhiyaman', floors: 'G+9', facing: 'East', ac: 'AC and Non-AC', sharing: 'AC: 2, 3 and 4 sharing · Non-AC: 3 and 4 sharing', washroom: 'Attached washrooms', features: ['AC and Non-AC options', 'Attached washrooms'], email: email('adhiyaman'), phone: '8056016614', photo: null, plan: PDF + '2025/adhiyaman-floor-plan-boys-hostel.pdf', dist: { ub: 260, tech: 400, main: 510, java: 240 } },
  { id: 'nelson-mandela', group: 'men', name: 'Nelson Mandela', floors: 'G+9', facing: 'West', ac: 'AC', sharing: '3 sharing', washroom: 'Attached washrooms', features: ['All rooms air-conditioned', 'Attached washrooms'], email: email('nelsonmandela'), phone: '8056016615', photo: IMG + '2023/04/Nelson-Mandela-2-copy-1024x952.jpg', plan: PDF + '2025/nelson-mandela-floor-plan-boys-hostel.pdf', dist: { ub: 300, tech: 440, main: 510, java: 280 } },
  { id: 'manoranjitham', group: 'men', name: 'Manoranjitham', floors: 'G+9', facing: 'North', ac: 'Non-AC', sharing: '3 sharing', washroom: 'Common washrooms', features: ['Well furnished', 'Three sharing rooms'], email: email('manoranjitham'), phone: '8056016634', photo: IMG + '2022/04/Building_Hostel_ManoRanjitha-Custom-1.jpeg', plan: PDF + '2025/manoranjitham-floor-plan-boys-hostel.pdf', dist: { ub: 380, tech: 500, main: 540, java: 330 } },
  { id: 'sannasi-a', group: 'men', name: 'Sannasi A', floors: 'G+5', facing: 'West', ac: 'AC and Non-AC', sharing: '3 sharing', washroom: 'Attached washrooms', features: ['AC and Non-AC options', 'Attached washrooms'], email: email('sannasia'), phone: '8056016605', photo: IMG + '2022/04/sannasi-A.jpg', plan: PDF + '2025/sannasi-a-floor-plan-boys-hostel.pdf', dist: null },
  { id: 'agasthiyar', group: 'men', name: 'Agasthiyar', floors: '10 floors', facing: 'North', ac: 'AC and Non-AC', sharing: '4 sharing', washroom: 'Attached washrooms', features: ['AC and Non-AC options', 'Attached washrooms'], email: email('agasithiyar'), phone: '8056016616', photo: null, plan: PDF + '2025/agasthiyar-floor-plan-boys-hostel.pdf', dist: { ub: 340, tech: 480, main: 500, java: 320 } },
  { id: 'began', group: 'men', name: 'Began', floors: 'G+4', facing: null, ac: 'Non-AC', sharing: '2 and 3 sharing', washroom: 'Attached or common washrooms', features: ['Close to the Java Green food court'], email: email('began'), phone: '8056016609', photo: IMG + '2022/04/Began.jpg', plan: PDF + '2025/began-floor-plan-boys-hostel.pdf', dist: null },
  { id: 'n-block', group: 'men', name: 'N Block', floors: 'G+19', facing: 'North', ac: 'AC', sharing: '2 and 3 sharing', washroom: 'Attached washrooms', features: ['All rooms air-conditioned', 'Attached washrooms', 'Modern, fully furnished'], email: email('nblock'), phone: '7824055768', photo: null, plan: PDF + '2026/n-block-floor-plan.pdf', dist: { ub: 560, tech: 470, main: 820, java: 380 } },
  // ---- women ----
  { id: 'kopperundevi', group: 'women', name: 'Kopperundevi (M Block)', floors: 'G+15', facing: 'North', ac: 'AC and Non-AC', sharing: '2 sharing', washroom: 'Attached washrooms', features: ['Formerly Sister Nivedita block', 'AC and Non-AC options', 'Attached washrooms'], email: email('kopperundevi'), phone: '8056016627', photo: IMG + '2024/07/Kopperundevi-M-Block-scaled.jpg', plan: PDF + '2026/kopperundevi-floor-plan.pdf', dist: { ub: 510, tech: 460, main: 760, java: 350 } },
  { id: 'senbagam', group: 'women', name: 'Senbagam', floors: 'G+5', facing: 'North', ac: 'Non-AC', sharing: '3 and 6 sharing', washroom: 'Common washrooms', features: ['Safe, comfortable and supportive'], email: email('senbagam'), phone: '8056016638', photo: IMG + '2024/07/Senbagam-Block-Girls-Hostel-scaled.jpg', plan: PDF + '2025/senbagam-floor-plan-girls-hostel.pdf', dist: null },
  { id: 'esq-a', group: 'women', name: 'ESQ A', floors: 'G+9', facing: 'West', ac: 'Non-AC', sharing: '2, 3 and 4 sharing', washroom: 'Attached washrooms', features: ['30 flats', 'Flat-style living', 'Attached washrooms'], email: email('esqa'), phone: '8056016636', photo: IMG + '2024/07/ESQ-A-Block-scaled.jpg', plan: PDF + '2025/esq-a-floor-plan-girls-hostel.pdf', dist: null },
  { id: 'esq-b', group: 'women', name: 'ESQ B', floors: 'G+9', facing: 'East', ac: 'Non-AC', sharing: '2 and 3 sharing', washroom: 'Attached washrooms', features: ['40 flats', 'Flat-style living', 'Attached washrooms'], email: email('esqb'), phone: '8056016637', photo: IMG + '2024/07/ESQ-B-Block-684x1024.jpg', plan: PDF + '2025/esq-b-floor-plan-girls-hostel.pdf', dist: null },
  { id: 'kalpana-chawla', group: 'women', name: 'Kalpana Chawla', floors: 'G+5', facing: 'North', ac: 'AC', sharing: '2 and 4 sharing', washroom: 'Attached washrooms', features: ['AC rooms', 'Attached washrooms'], email: email('kalpananchawla'), phone: '8056016618', photo: IMG + '2023/04/Kalpana-Chawla-Hostel-1-copy-scaled.jpg', plan: PDF + '2026/kalpana-chawla-floor-plan-girls-hostel.pdf', dist: { ub: 480, tech: 480, main: 690, java: 350 } },
  { id: 'meenakshi', group: 'women', name: 'Meenakshi', floors: 'G+4', facing: 'East', ac: 'AC and Non-AC', sharing: 'AC: 4 sharing with bunker cots · Non-AC: 3 sharing', washroom: 'Attached washrooms', features: ['AC and Non-AC options', 'Attached washrooms'], email: email('meenakshi'), phone: '8056016617', photo: IMG + '2023/04/Meenakshi-Hostel-SRMIST.jpg', plan: PDF + '2025/meenakshi-floor-plan-girls-hostel.pdf', dist: { ub: 120, tech: 410, main: 420, java: 260 } },
  { id: 'malligai', group: 'women', name: 'Malligai', floors: 'G+6', facing: 'North', ac: 'Non-AC', sharing: '2 sharing', washroom: 'Common washrooms', features: ['Well furnished', 'Two sharing rooms'], email: email('malligai'), phone: '8056016634', photo: IMG + '2023/04/Malligai-Hostel-1-scaled.jpg', plan: PDF + '2025/malligai-floor-plan-girls-hostel.pdf', dist: null },
  { id: 'thamarai', group: 'women', name: 'Thamarai', floors: 'G+6', facing: 'North', ac: 'Non-AC', sharing: '2 sharing', washroom: 'Common washrooms', features: ['Well furnished', 'Two sharing rooms'], email: email('thamarai'), phone: '8056016633', photo: IMG + '2023/04/Thamarai-Hostel-1-scaled.jpg', plan: PDF + '2025/thamarai-floor-plan-girls-hostel.pdf', dist: null },
  { id: 'sannasi-c', group: 'women', name: 'Sannasi C', floors: 'G+5', facing: 'West', ac: 'AC and Non-AC', sharing: '3 sharing', washroom: 'Attached washrooms', features: ['AC and Non-AC options', 'Attached washrooms'], email: email('sannasic'), phone: '8056016631', photo: null, plan: PDF + '2026/sannasi-c-block-floor-plan.pdf', dist: { ub: 260, tech: 330, main: 590, java: 170 } },
  { id: 'mullai', group: 'women', name: 'Mullai', floors: 'G+6', facing: 'East', ac: 'Non-AC', sharing: '3 sharing', washroom: 'Common washrooms', features: ['Well furnished', 'Three sharing rooms'], email: email('mullai'), phone: '8056016632', photo: IMG + '2023/04/Mullai-Hostel-1-1024x952.jpg', plan: PDF + '2026/mullai-floor-plan-girls-hostel.pdf', dist: null },
  // ---- international ----
  { id: 'nri-premium', group: 'international', name: 'NRI Premium International Hostel', floors: null, facing: null, ac: 'AC', sharing: '3 sharing', washroom: null, features: ['All rooms air-conditioned', 'Separate accommodation for men and women students'], email: 'nripremium.hostel.ktr@srmist.edu.in', phone: '8056016622', photo: null, plan: null, dist: null },
  { id: 'green-pearl', group: 'international', name: 'Green Pearl International Hostel', floors: null, facing: null, ac: null, sharing: null, washroom: null, features: ['Service-apartment style', 'About a 10 minute walk from the campus', 'Shuttle buses to the campus', 'Multi-cuisine dining: Thai, Chinese and Indian'], email: 'warden.gpb.ktr@srmist.edu.in', phone: '9384051220', phone2: '8056016639', photo: null, plan: null, dist: null },
]

export const GROUPS = [
  ['all', 'All hostels'],
  ['men', 'Men'],
  ['women', 'Women'],
  ['international', 'International'],
]

// What the official pages say applies across the hostels.
export const COMMON_AMENITIES = [
  'Fully furnished rooms',
  'Purified drinking water',
  '24×7 CCTV surveillance and security guards',
  'Round-the-clock Wi-Fi',
  'Indoor and outdoor games, gym and playground',
  'Power backup',
  'Biometric attendance',
  'Supermarkets, eateries and photocopy shops on the premises',
]
export const AMENITIES_NOTE = 'Listed on the official page for the girls’ hostels. Gym, playground and indoor games are stated for all students; confirm the rest for each boys’ block.'

export const MESS_TIMINGS = [
  ['Breakfast', '7:00 AM – 9:00 AM', '7:30 AM – 9:30 AM'],
  ['Lunch', '11:30 AM – 1:30 PM', '12:00 noon – 1:30 PM'],
  ['Tea / snacks', '4:30 PM – 5:30 PM', '4:30 PM – 5:30 PM'],
  ['Dinner', '7:30 PM – 9:00 PM', '7:30 PM – 9:00 PM'],
]

export const MESS_FACTS = [
  'Every hostel has its own mess for breakfast, lunch and dinner.',
  'North Indian or South Indian menus, in dining halls that sit side by side.',
  'Multi-cuisine dining (Thai, Chinese and continental) for international students.',
  'Unlimited food except for special items; self-service in every mess.',
  'Bring your ID card and mess card to dine. Food is not served in rooms.',
  'Parents can dine as guests with prior notice: breakfast ₹80, veg lunch ₹100, tea/snacks ₹40, dinner ₹100, special lunch or dinner ₹150.',
  'Wasting food is fined ₹500 for a first offence.',
]

export const EATERIES = [
  ['Java Green Food Court', 'Near the clock tower · 7:30 AM – 8:00 PM', 'A mini food street with around 20 stalls.'],
  ['Canteen, University Building', 'Ground floor of the UB · 7:00 AM – 5:00 PM', 'Breakfast, lunch, snacks and cold drinks.'],
  ['Canteen, old campus', 'Near gate 4, opposite Potheri railway station · 7:00 AM – 5:00 PM', 'Food joint, fast food and a supermarket.'],
]

export const DIRECTOR = {
  name: 'Dr. E. Poovammal',
  role: 'Professor and Director (Hostels), Directorate of Hostels, SRMIST-KTR Campus',
  email: 'director.hostels@srmist.edu.in',
  phone: '+91 9940036021',
}

export const phoneHref = (p) => `tel:+91${String(p).replace(/\D/g, '').slice(-10)}`
