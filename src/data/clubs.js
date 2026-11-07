// Clubs under the Directorate of Student Affairs (DSA), SRMIST Kattankulathur.
// Names, counts, events and contacts come from the official pages:
//   https://www.srmist.edu.in/directorate-of-student-affairs/
//   https://www.srmist.edu.in/life-at-srm/student-life/clubs/
// The one-line descriptions and the four groupings are ours (the official page only lists the names), so they stay general.

const U = 'https://www.srmist.edu.in/wp-content/uploads/'
const c = (id, name, group, line, full, thumb) => ({ id, name, group, line, img: U + full, thumb: U + thumb })

export const GROUPS = [
  ['all', 'All clubs'],
  ['arts', 'Arts & culture'],
  ['sport', 'Sport & wellbeing'],
  ['society', 'Society & service'],
  ['curious', 'Curious minds'],
]

export const CLUBS = [
  c('music', 'Music', 'arts', 'Bands, voices and instruments, on stage and off it.', '2022/04/Music.png', '2022/04/Music-300x207.png'),
  c('dance', 'Dance Club', 'arts', 'Practice, choreography and performances from classical to contemporary.', '2022/04/Dance.png', '2022/04/Dance-300x207.png'),
  c('fashion', 'Fashion', 'arts', 'Styling, ramp and the people behind the look.', '2022/04/Fashion.png', '2022/04/Fashion-300x207.png'),
  c('movies', 'Movies and Dramatics', 'arts', 'Theatre, short films and everything between action and cut.', '2022/04/Movie_Dramatics.png', '2022/04/Movie_Dramatics-300x207.png'),
  c('literature', 'Literature Club', 'arts', 'Reading, writing, debate and the spoken word.', '2022/04/Literature.png', '2022/04/Literature-300x207.png'),
  c('creative', 'Creative Arts & Media', 'arts', 'Design, photography, video and storytelling for the campus.', '2023/03/Creativity-Arts-and-Media-300x207-1.png', '2023/03/Creativity-Arts-and-Media-300x207-1.png'),
  c('festival', 'Festival', 'arts', 'The crew that helps plan the big fests of the year.', '2022/04/Festival.png', '2022/04/Festival-300x207.png'),
  c('sports', 'Sports', 'sport', 'Teams, training and tournaments across the grounds.', '2023/04/sport-club.jpg', '2023/04/sport-club-300x126.jpg'),
  c('defence', 'Self Defense Club', 'sport', 'Practical skills and confidence for everyone on campus.', '2023/03/Self-Defence-300x207-1.png', '2023/03/Self-Defence-300x207-1.png'),
  c('rotaract', 'Rotaract Club', 'society', 'Service projects and leadership through community work.', '2023/03/unnamed-1.jpg', '2023/03/unnamed-1.jpg'),
  c('social', 'Social Club', 'society', 'Drives and outreach beyond the campus gates.', '2022/04/Social-Club.png', '2022/04/Social-Club-300x207.png'),
  c('women', 'Women Empowerment', 'society', 'Conversations, workshops and support, led by students.', '2023/03/woment-empowerment-300x207-1.png', '2023/03/woment-empowerment-300x207-1.png'),
  c('astro', 'Astrophilia', 'curious', 'Skywatching, space talks and curiosity about the universe.', '2022/04/Astrophilia.png', '2022/04/Astrophilia-300x207.png'),
  c('gaming', 'Gaming', 'curious', 'Casual and competitive play, together.', '2022/04/Gaming.png', '2022/04/Gaming-300x207.png'),
  c('quiz', 'Quiz', 'curious', 'Quick minds, buzzers and trivia nights.', '2022/04/Rectangle-31.png', '2022/04/Rectangle-31-300x207.png'),
]

export const DSA = {
  name: 'Directorate of Student Affairs',
  short: 'DSA',
  tag: 'Of the students, by the students and for the students',
  about:
    'DSA is the student body for everything beyond the classroom: clubs, houses, cultural events, counselling and welfare. It is guided by the Director and staff, and run by students. It serves the university motto: Learn. Leap. Lead.',
  stats: [
    ['15', 'Clubs under DSA'],
    ['8', 'Houses across SRMIST'],
    ['70+', 'Student club convenors'],
    ['100+', 'Events each year'],
  ],
  pillars: [
    ['Clubs', '15 student-run clubs with 1000s of members.', '/life-at-srm/student-life/clubs/'],
    ['Houses', '8 houses for inter-house activities and talent.', '/directorate-of-student-affairs/'],
    ['Student counselling', '24/7 support from trained, qualified counsellors.', '/directorate-of-student-affairs/'],
    ['Anti-ragging', 'An institution-wide team that keeps freshers safe.', '/directorate-of-student-affairs/'],
  ],
  events: [
    ['ACE', 'SRM sports club event'],
    ['Jhalak', 'Inter-house cultural competition'],
    ['Khel', 'National-level sports festival'],
    ['Josh', 'Cultural and sports event for faculty'],
    ['Butterflies', 'Cultural and sports event for government school students'],
    ['Rendezvous', 'A fest of dance, music and fashion'],
    ['Shuru', 'Cultural fest'],
    ['Tarana', 'Cultural fest'],
    ['Milan', 'Cultural fest'],
  ],
  people: [
    ['Dr. Prince Kalyanasundaram', 'Deputy Director', 'dydirector.sa@srmist.edu.in'],
    ['Dr. S. Pradeep', 'Assistant Director', 'asstdirector.sa@srmist.edu.in'],
  ],
  official: 'https://www.srmist.edu.in/directorate-of-student-affairs/',
  clubsOfficial: 'https://www.srmist.edu.in/life-at-srm/student-life/clubs/',
}
