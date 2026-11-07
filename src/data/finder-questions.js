// Questions for the course finder (/course-finder) and how much each answer points toward each field of study.
// Field ids are the ids in programmes.js. The weights are our own judgement, not an admissions rule:
// the finder only suggests where to look first, and SRMIST's eligibility criteria decide the rest.

export const QUESTIONS = [
  {
    id: 'self',
    kind: 'multi',
    max: 3,
    prompt: 'Which of these sound like you?',
    hint: 'Pick up to three.',
    options: [
      { id: 'build', label: 'I like building things and solving puzzles', w: { engineering: 3, science: 1, architecture: 1 } },
      { id: 'help', label: 'I want to help people get better', w: { medicine: 3 } },
      { id: 'lead', label: 'I like leading teams and spotting opportunities', w: { management: 3, hotel: 1, law: 1 } },
      { id: 'curious', label: 'I am curious how the world works', w: { science: 3, engineering: 1, agriculture: 1, medicine: 1 } },
      { id: 'debate', label: 'I enjoy debate, reading and fairness', w: { law: 3, management: 1, science: 1 } },
      { id: 'space', label: 'I think in shapes, spaces and design', w: { architecture: 3, engineering: 1 } },
      { id: 'green', label: 'I care about food, farms and the environment', w: { agriculture: 3, science: 1, hotel: 1 } },
      { id: 'host', label: 'I love hosting people and creating experiences', w: { hotel: 3, management: 1 } },
    ],
  },
  {
    id: 'learn',
    kind: 'single',
    prompt: 'How do you like to learn?',
    options: [
      { id: 'hands', label: 'By doing: labs, studios and projects', w: { engineering: 1, architecture: 1, medicine: 1, agriculture: 1, hotel: 1 } },
      { id: 'ideas', label: 'By reading and thinking things through', w: { science: 2, law: 1, management: 1 } },
      { id: 'cases', label: 'By discussing cases and real situations', w: { law: 2, management: 2 } },
      { id: 'field', label: 'Out in the field, with real people and places', w: { agriculture: 2, hotel: 2, medicine: 1 } },
    ],
  },
  {
    id: 'after',
    kind: 'single',
    prompt: 'After graduating, you would most like to…',
    options: [
      { id: 'industry', label: 'Work in industry or technology', w: { engineering: 2, management: 1 } },
      { id: 'profession', label: 'Practise a profession: doctor, lawyer, architect', w: { medicine: 2, law: 2, architecture: 2 } },
      { id: 'research', label: 'Do research or study further', w: { science: 2, engineering: 1, medicine: 1, agriculture: 1 } },
      { id: 'venture', label: 'Start my own venture', w: { management: 2, hotel: 1, engineering: 1, agriculture: 1 } },
      { id: 'society', label: 'Serve society and communities', w: { medicine: 1, law: 1, agriculture: 1, science: 1 } },
    ],
  },
  {
    id: 'school',
    kind: 'multi',
    max: 3,
    prompt: 'Which school subjects do you enjoy most?',
    hint: 'Pick up to three, or skip.',
    optional: true,
    options: [
      { id: 'maths', label: 'Mathematics', w: { engineering: 2, science: 1, management: 1 } },
      { id: 'physics', label: 'Physics', w: { engineering: 2, science: 2, architecture: 1 } },
      { id: 'chemistry', label: 'Chemistry', w: { science: 1, medicine: 1, agriculture: 1, engineering: 1 } },
      { id: 'biology', label: 'Biology', w: { medicine: 3, agriculture: 2, science: 1 } },
      { id: 'computers', label: 'Computer science', w: { engineering: 3, science: 1, management: 1 } },
      { id: 'business', label: 'Economics or business studies', w: { management: 3, hotel: 1, law: 1 } },
      { id: 'languages', label: 'Languages and social science', w: { law: 2, management: 1, hotel: 1, science: 1 } },
      { id: 'art', label: 'Art and drawing', w: { architecture: 3, hotel: 1 } },
    ],
  },
  {
    id: 'level',
    kind: 'single',
    prompt: 'What level are you looking at?',
    options: [
      { id: 'UG', label: 'Undergraduate (after school)', w: {} },
      { id: 'PG', label: 'Postgraduate (after a degree)', w: {} },
      { id: 'Doctoral', label: 'Doctoral (research degree)', w: {} },
    ],
  },
]
