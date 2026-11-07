// Tamil and Hindi for the parts of the site most people see first: the header and menus, the hero,
// the "I'm a…" bar, Learn · Leap · Lead, the recognition band and the field-of-study list.
// Pages further in, forms and the dropdown links stay in English for now.
// Plain data and one pure function, so Node can test it. Add a pair here and wrap the text with t() in the component.

export const LANGS = [
  ['en', 'English'],
  ['ta', 'தமிழ்'],
  ['hi', 'हिन्दी'],
]

const E = (ta, hi) => ({ ta, hi })

export const DICT = {
  // header strip and quick links
  Students: E('மாணவர்கள்', 'छात्र'),
  'Faculty & Staff': E('ஆசிரியர் & பணியாளர்', 'शिक्षक एवं कर्मचारी'),
  Parents: E('பெற்றோர்', 'अभिभावक'),
  Visitors: E('பார்வையாளர்கள்', 'आगंतुक'),
  Alumni: E('முன்னாள் மாணவர்கள்', 'पूर्व छात्र'),
  Examinations: E('தேர்வுகள்', 'परीक्षाएँ'),
  Campuses: E('வளாகங்கள்', 'परिसर'),
  Search: E('தேடு', 'खोजें'),
  'Admissions 2027': E('சேர்க்கை 2027', 'प्रवेश 2027'),
  Admissions: E('சேர்க்கை', 'प्रवेश'),
  Library: E('நூலகம்', 'पुस्तकालय'),
  'Career Centre': E('தொழில் மையம்', 'करियर केंद्र'),
  News: E('செய்திகள்', 'समाचार'),
  Events: E('நிகழ்வுகள்', 'कार्यक्रम'),
  Blog: E('வலைப்பதிவு', 'ब्लॉग'),
  Careers: E('வேலைவாய்ப்பு', 'करियर'),
  'Contact us': E('தொடர்புக்கு', 'संपर्क करें'),
  // main menu
  Academics: E('கல்வி', 'शैक्षणिक'),
  Research: E('ஆராய்ச்சி', 'अनुसंधान'),
  'Campus life': E('வளாக வாழ்க்கை', 'परिसर जीवन'),
  International: E('சர்வதேசம்', 'अंतर्राष्ट्रीय'),
  Services: E('சேவைகள்', 'सेवाएँ'),
  About: E('எங்களைப் பற்றி', 'हमारे बारे में'),
  // display settings
  Dark: E('இருள்', 'डार्क'),
  Light: E('ஒளி', 'लाइट'),
  // hero
  'NAAC A++ · NIRF 2025 · Chennai, India': E('NAAC A++ · NIRF 2025 · சென்னை, இந்தியா', 'NAAC A++ · NIRF 2025 · चेन्नई, भारत'),
  'A university.': E('ஒரு பல்கலைக்கழகம்.', 'एक विश्वविद्यालय।'),
  'A city of ideas.': E('எண்ணங்களின் நகரம்.', 'विचारों का शहर।'),
  'Enter SRMIST': E('SRMIST-க்குள் நுழையுங்கள்', 'SRMIST में प्रवेश करें'),
  Engineering: E('பொறியியல்', 'इंजीनियरिंग'),
  Medicine: E('மருத்துவம்', 'चिकित्सा'),
  Dentistry: E('பல் மருத்துவம்', 'दंत चिकित्सा'),
  Pharmacy: E('மருந்தியல்', 'फार्मेसी'),
  Nursing: E('செவிலியம்', 'नर्सिंग'),
  Physiotherapy: E('இயன்முறை மருத்துவம்', 'फिजियोथेरेपी'),
  'Public Health': E('பொது சுகாதாரம்', 'जन स्वास्थ्य'),
  Management: E('மேலாண்மை', 'प्रबंधन'),
  Law: E('சட்டம்', 'विधि'),
  Architecture: E('கட்டடக்கலை', 'वास्तुकला'),
  'Science & Humanities': E('அறிவியல் & மனிதவியல்', 'विज्ञान एवं मानविकी'),
  'Agricultural Sciences': E('வேளாண் அறிவியல்', 'कृषि विज्ञान'),
  'Hotel Management': E('விருந்தோம்பல் மேலாண்மை', 'होटल प्रबंधन'),
  // "I'm a…" bar
  'I’m a': E('நான் ஒரு', 'मैं हूँ'),
  Applicant: E('விண்ணப்பதாரர்', 'आवेदक'),
  Parent: E('பெற்றோர்', 'अभिभावक'),
  'Current student': E('தற்போதைய மாணவர்', 'वर्तमान छात्र'),
  Visitor: E('பார்வையாளர்', 'आगंतुक'),
  'Start your application': E('விண்ணப்பத்தைத் தொடங்குங்கள்', 'आवेदन शुरू करें'),
  'Fee & ROI calculator': E('கட்டணம் & பலன் கணிப்பான்', 'शुल्क और ROI कैलकुलेटर'),
  'Programme finder': E('படிப்புகளைத் தேடுங்கள்', 'कार्यक्रम खोजें'),
  Scholarships: E('உதவித்தொகைகள்', 'छात्रवृत्तियाँ'),
  'Fees & scholarships': E('கட்டணம் & உதவித்தொகை', 'शुल्क और छात्रवृत्ति'),
  Hostels: E('விடுதிகள்', 'छात्रावास'),
  'Visit the campus': E('வளாகத்தைப் பார்வையிடுங்கள்', 'परिसर देखें'),
  'Counselling & anti-ragging': E('ஆலோசனை & ராகிங் எதிர்ப்பு', 'परामर्श एवं रैगिंग-रोधी'),
  'Service status': E('சேவை நிலை', 'सेवा स्थिति'),
  'Report an issue': E('சிக்கலைப் புகாரளிக்க', 'समस्या दर्ज करें'),
  'Academia portal': E('அகாடமியா தளம்', 'एकेडेमिया पोर्टल'),
  'Campus map': E('வளாக வரைபடம்', 'परिसर का नक्शा'),
  'Accessible routes': E('அணுகக்கூடிய வழிகள்', 'सुगम मार्ग'),
  // Learn · Leap · Lead
  Learn: E('கற்க', 'सीखें'),
  Leap: E('பாய்க', 'छलांग'),
  Lead: E('வழிநடத்து', 'नेतृत्व'),
  'Learn across every discipline.': E('ஒவ்வொரு துறையிலும் கற்றுக்கொள்ளுங்கள்.', 'हर विषय में सीखें।'),
  'Leap beyond the classroom.': E('வகுப்பறைக்கு அப்பால் பாயுங்கள்.', 'कक्षा से आगे छलांग लगाएँ।'),
  'Lead what comes next.': E('அடுத்ததை வழிநடத்துங்கள்.', 'आगे का नेतृत्व करें।'),
  'Engineering, medicine, law, management, science, agriculture, architecture and hotel management: eight fields of study on six campuses.': E(
    'பொறியியல், மருத்துவம், சட்டம், மேலாண்மை, அறிவியல், வேளாண்மை, கட்டடக்கலை மற்றும் விருந்தோம்பல் மேலாண்மை: ஆறு வளாகங்களில் எட்டு துறைகள்.',
    'इंजीनियरिंग, चिकित्सा, विधि, प्रबंधन, विज्ञान, कृषि, वास्तुकला और होटल प्रबंधन: छह परिसरों में आठ अध्ययन क्षेत्र।',
  ),
  'More than 200 students are sponsored abroad every year to 35+ partner universities, with a semester abroad programme and a global immersion programme.': E(
    'ஆண்டுதோறும் 200-க்கும் மேற்பட்ட மாணவர்கள் 35-க்கும் மேற்பட்ட கூட்டாளி பல்கலைக்கழகங்களுக்கு வெளிநாடு அனுப்பப்படுகிறார்கள்; செமஸ்டர் அப்ராட் மற்றும் உலகளாவிய அனுபவத் திட்டங்களும் உள்ளன.',
    'हर वर्ष 200 से अधिक छात्रों को 35+ साझेदार विश्वविद्यालयों में विदेश भेजा जाता है, साथ ही सेमेस्टर अब्रॉड और ग्लोबल इमर्शन कार्यक्रम भी हैं।',
  ),
  '980+ companies visited in 2023–24 with a highest package of 52 LPA, and research that has produced 920+ patents and 47,000+ publications.': E(
    '2023–24-ல் 980-க்கும் மேற்பட்ட நிறுவனங்கள் வருகை தந்தன; அதிகபட்ச சம்பளம் 52 LPA; ஆராய்ச்சியில் 920-க்கும் மேற்பட்ட காப்புரிமைகள் மற்றும் 47,000-க்கும் மேற்பட்ட வெளியீடுகள்.',
    '2023–24 में 980+ कंपनियाँ आईं, सर्वाधिक पैकेज 52 LPA रहा, और शोध से 920+ पेटेंट व 47,000+ प्रकाशन हुए।',
  ),
  'Explore academics': E('கல்வியை அறிக', 'शैक्षणिक देखें'),
  'Go global': E('உலகை நோக்கி', 'वैश्विक बनें'),
  'See the outcomes': E('விளைவுகளைப் பாருங்கள்', 'परिणाम देखें'),
  // a day on the map
  'A day at SRM': E('SRM-ல் ஒரு நாள்', 'SRM में एक दिन'),
  // recognition band
  Recognition: E('அங்கீகாரம்', 'मान्यता'),
  'Among India’s best, by every measure that matters.': E('முக்கியமான ஒவ்வொரு அளவீட்டிலும் இந்தியாவின் சிறந்தவற்றில் ஒன்று.', 'हर अहम पैमाने पर भारत के श्रेष्ठ संस्थानों में।'),
  'National recognition, global partnerships and outcomes built on four decades of work.': E(
    'நான்கு தசாப்த கால உழைப்பில் உருவான தேசிய அங்கீகாரம், உலகளாவிய கூட்டாண்மைகள் மற்றும் சாதனைகள்.',
    'चार दशकों के कार्य से बनी राष्ट्रीय मान्यता, वैश्विक साझेदारियाँ और उपलब्धियाँ।',
  ),
  Overall: E('ஒட்டுமொத்தம்', 'समग्र'),
  Medical: E('மருத்துவம்', 'चिकित्सा'),
  'Explore our impact': E('எங்கள் தாக்கத்தை அறிக', 'हमारा प्रभाव देखें'),
  // field-of-study list
  'Find your direction': E('உங்கள் திசையைக் கண்டறியுங்கள்', 'अपनी दिशा खोजें'),
  'What do you want to study?': E('நீங்கள் என்ன படிக்க விரும்புகிறீர்கள்?', 'आप क्या पढ़ना चाहते हैं?'),
  'Search a field of study': E('படிப்புத் துறையைத் தேடுங்கள்', 'अध्ययन क्षेत्र खोजें'),
  Explore: E('அறிக', 'देखें'),
  'Engineering & Technology': E('பொறியியல் & தொழில்நுட்பம்', 'इंजीनियरिंग एवं प्रौद्योगिकी'),
  'Medicine & Health': E('மருத்துவம் & சுகாதாரம்', 'चिकित्सा एवं स्वास्थ्य'),
}

/** The text in the chosen language, or the English text when there is no translation. */
export function translate(lang, text) {
  if (lang === 'en') return text
  return DICT[text]?.[lang] ?? text
}
