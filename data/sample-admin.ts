import type {
  AdminAttempt,
  AdminGroup,
  AdminQuestion,
  AdminSection,
  AdminTest,
  AdminUser,
} from '~/types/admin'

// ---------------------------------------------------------------------------
// Questions (8 total, q-1 & q-2 have audio)
// ---------------------------------------------------------------------------

export const sampleQuestions: AdminQuestion[] = [
  {
    id: 'q-1',
    text: 'What is the main topic of the conversation?',
    audioUrl: '/audio/sample.mp3',
    options: [
      { id: 'q-1-a', label: 'A', text: 'Planning a weekend trip' },
      { id: 'q-1-b', label: 'B', text: 'Booking a hotel room' },
      { id: 'q-1-c', label: 'C', text: 'Ordering food at a restaurant' },
      { id: 'q-1-d', label: 'D', text: 'Asking for directions' },
    ],
    correctOptionId: 'q-1-a',
  },
  {
    id: 'q-2',
    text: 'According to the speaker, when will the meeting take place?',
    audioUrl: '/audio/sample.mp3',
    options: [
      { id: 'q-2-a', label: 'A', text: 'Monday morning' },
      { id: 'q-2-b', label: 'B', text: 'Tuesday afternoon' },
      { id: 'q-2-c', label: 'C', text: 'Wednesday evening' },
      { id: 'q-2-d', label: 'D', text: 'Friday at noon' },
    ],
    correctOptionId: 'q-2-b',
  },
  {
    id: 'q-3',
    text: 'What does the woman suggest they do next?',
    audioUrl: null,
    options: [
      { id: 'q-3-a', label: 'A', text: 'Call the manager' },
      { id: 'q-3-b', label: 'B', text: 'Check the schedule again' },
      { id: 'q-3-c', label: 'C', text: 'Wait for a confirmation email' },
      { id: 'q-3-d', label: 'D', text: 'Cancel the reservation' },
    ],
    correctOptionId: 'q-3-b',
  },
  {
    id: 'q-4',
    text: 'Why is the man unable to attend the event?',
    audioUrl: null,
    options: [
      { id: 'q-4-a', label: 'A', text: 'He has a prior commitment' },
      { id: 'q-4-b', label: 'B', text: 'He is feeling unwell' },
      { id: 'q-4-c', label: 'C', text: 'He missed the registration deadline' },
      { id: 'q-4-d', label: 'D', text: 'He cannot afford the ticket' },
    ],
    correctOptionId: 'q-4-a',
  },
  {
    id: 'q-5',
    text: 'Choose the correct form: She _____ to the office every day.',
    audioUrl: null,
    options: [
      { id: 'q-5-a', label: 'A', text: 'go' },
      { id: 'q-5-b', label: 'B', text: 'goes' },
      { id: 'q-5-c', label: 'C', text: 'going' },
      { id: 'q-5-d', label: 'D', text: 'gone' },
    ],
    correctOptionId: 'q-5-b',
  },
  {
    id: 'q-6',
    text: 'Which sentence is grammatically correct?',
    audioUrl: null,
    options: [
      { id: 'q-6-a', label: 'A', text: "He don't like coffee." },
      { id: 'q-6-b', label: 'B', text: "He doesn't likes coffee." },
      { id: 'q-6-c', label: 'C', text: "He doesn't like coffee." },
      { id: 'q-6-d', label: 'D', text: 'He not like coffee.' },
    ],
    correctOptionId: 'q-6-c',
  },
  {
    id: 'q-7',
    text: 'Select the best word: If it rains tomorrow, we _____ stay indoors.',
    audioUrl: null,
    options: [
      { id: 'q-7-a', label: 'A', text: 'will' },
      { id: 'q-7-b', label: 'B', text: 'would' },
      { id: 'q-7-c', label: 'C', text: 'have' },
      { id: 'q-7-d', label: 'D', text: 'had' },
    ],
    correctOptionId: 'q-7-a',
  },
  {
    id: 'q-8',
    text: 'Based on the passage, what is the author\'s main argument?',
    audioUrl: null,
    options: [
      { id: 'q-8-a', label: 'A', text: 'Remote work reduces productivity' },
      { id: 'q-8-b', label: 'B', text: 'Flexible schedules improve work-life balance' },
      { id: 'q-8-c', label: 'C', text: 'Offices will disappear within a decade' },
      { id: 'q-8-d', label: 'D', text: 'Commuting is essential for collaboration' },
    ],
    correctOptionId: 'q-8-b',
  },
  {
    id: 'q-9',
    text: 'What does the word "adjacent" most nearly mean in the passage?',
    audioUrl: null,
    options: [
      { id: 'q-9-a', label: 'A', text: 'Distant' },
      { id: 'q-9-b', label: 'B', text: 'Nearby' },
      { id: 'q-9-c', label: 'C', text: 'Opposite' },
      { id: 'q-9-d', label: 'D', text: 'Hidden' },
    ],
    correctOptionId: 'q-9-b',
  },
  {
    id: 'q-10',
    text: 'Which detail best supports the claim that cities are becoming greener?',
    audioUrl: null,
    options: [
      { id: 'q-10-a', label: 'A', text: 'Increased bike lane construction' },
      { id: 'q-10-b', label: 'B', text: 'Higher apartment rents' },
      { id: 'q-10-c', label: 'C', text: 'Longer working hours' },
      { id: 'q-10-d', label: 'D', text: 'Fewer public libraries' },
    ],
    correctOptionId: 'q-10-a',
  },
]

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

export const sampleSections: AdminSection[] = [
  {
    id: 'section-1',
    sectionKey: 'listening-part-a',
    displayName: 'Listening',
    timeLimit: 10,
    maxScore: 40,
    randomize: false,
    questionIds: ['q-1', 'q-2', 'q-3', 'q-4'],
    scoreMap: [
      { rawScore: 0, scaledScore: 0 },
      { rawScore: 1, scaledScore: 10 },
      { rawScore: 2, scaledScore: 20 },
      { rawScore: 3, scaledScore: 30 },
      { rawScore: 4, scaledScore: 40 },
    ],
  },
  {
    id: 'section-2',
    sectionKey: 'grammar',
    displayName: 'Grammar',
    timeLimit: 10,
    maxScore: 30,
    randomize: true,
    questionIds: ['q-5', 'q-6', 'q-7'],
    scoreMap: [],
  },
  {
    id: 'section-3',
    sectionKey: 'reading',
    displayName: 'Reading',
    timeLimit: 15,
    maxScore: 30,
    randomize: false,
    questionIds: ['q-8', 'q-9', 'q-10'],
    scoreMap: [],
  },
]

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

export const sampleTests: AdminTest[] = [
  {
    id: 'test-1',
    name: 'English Proficiency Test',
    scoringMode: 'PERCENTAGE',
    sectionAssignments: [
      { sectionId: 'section-1', order: 1, weight: 40 },
      { sectionId: 'section-2', order: 2, weight: 30 },
      { sectionId: 'section-3', order: 3, weight: 30 },
    ],
  },
  {
    id: 'test-2',
    name: 'Quick Quiz',
    scoringMode: 'SUM',
    sectionAssignments: [
      { sectionId: 'section-1', order: 1, weight: 50 },
      { sectionId: 'section-2', order: 2, weight: 50 },
    ],
  },
]

// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------

export const sampleGroups: AdminGroup[] = [
  {
    id: 'group-1',
    name: 'Batch Agustus 2026',
    testId: 'test-1',
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    certificateDelayHours: 48,
    userIds: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5', 'user-6'],
  },
  {
    id: 'group-2',
    name: 'Batch Juli 2026',
    testId: 'test-1',
    startTime: '2026-07-01T08:00:00+07:00',
    endTime: '2026-07-03T17:00:00+07:00',
    certificateDelayHours: 24,
    userIds: ['user-1', 'user-7'],
  },
]

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const sampleUsers: AdminUser[] = [
  {
    id: 'user-1',
    name: 'Budi Santoso',
    testCode: 'USER-AB12',
    certificateEnabled: true,
    groupIds: ['group-1', 'group-2'],
  },
  {
    id: 'user-2',
    name: 'Siti Nurhaliza',
    testCode: 'USER-CD34',
    certificateEnabled: true,
    groupIds: ['group-1'],
  },
  {
    id: 'user-3',
    name: 'Ahmad Fauzi',
    testCode: 'USER-EF56',
    certificateEnabled: false,
    groupIds: ['group-1'],
  },
  {
    id: 'user-4',
    name: 'Dewi Lestari',
    testCode: 'USER-GH78',
    certificateEnabled: true,
    groupIds: ['group-1'],
  },
  {
    id: 'user-5',
    name: 'Rudi Hartono',
    testCode: 'USER-IJ90',
    certificateEnabled: false,
    groupIds: ['group-1'],
  },
  {
    id: 'user-6',
    name: 'Fitri Amelia',
    testCode: 'USER-KL12',
    certificateEnabled: true,
    groupIds: ['group-1'],
  },
  {
    id: 'user-7',
    name: 'Dimas Saputra',
    testCode: 'USER-MN34',
    certificateEnabled: false,
    groupIds: ['group-2'],
  },
]

// ---------------------------------------------------------------------------
// Attempts
// ---------------------------------------------------------------------------

export const sampleAttempts: AdminAttempt[] = [
  {
    id: 'attempt-1',
    userId: 'user-1',
    groupId: 'group-1',
    status: 'completed',
    totalScore: 88,
    sectionScores: [
      { sectionName: 'Listening', score: 35, maxScore: 40 },
      { sectionName: 'Grammar', score: 25, maxScore: 30 },
      { sectionName: 'Reading', score: 28, maxScore: 30 },
    ],
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'attempt-2',
    userId: 'user-2',
    groupId: 'group-1',
    status: 'in_progress',
    totalScore: 0,
    sectionScores: [],
    completedAt: null,
  },
  {
    id: 'attempt-3',
    userId: 'user-1',
    groupId: 'group-2',
    status: 'completed',
    totalScore: 78,
    sectionScores: [
      { sectionName: 'Listening', score: 30, maxScore: 40 },
      { sectionName: 'Grammar', score: 28, maxScore: 30 },
      { sectionName: 'Reading', score: 20, maxScore: 30 },
    ],
    completedAt: '2026-07-02T10:30:00+07:00',
  },
  {
    id: 'attempt-4',
    userId: 'user-7',
    groupId: 'group-2',
    status: 'completed',
    totalScore: 72,
    sectionScores: [
      { sectionName: 'Listening', score: 28, maxScore: 40 },
      { sectionName: 'Grammar', score: 24, maxScore: 30 },
      { sectionName: 'Reading', score: 20, maxScore: 30 },
    ],
    completedAt: '2026-07-03T14:15:00+07:00',
  },
]

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

function buildLookup<T extends { id: string }>(items: T[]): Record<string, T> {
  const map: Record<string, T> = {}
  for (const item of items) {
    map[item.id] = item
  }
  return map
}

const questionsById = buildLookup(sampleQuestions)
const sectionsById = buildLookup(sampleSections)
const testsById = buildLookup(sampleTests)
const groupsById = buildLookup(sampleGroups)
const usersById = buildLookup(sampleUsers)

export function getQuestionById(id: string): AdminQuestion | undefined {
  return questionsById[id]
}

export function getSectionById(id: string): AdminSection | undefined {
  return sectionsById[id]
}

export function getTestById(id: string): AdminTest | undefined {
  return testsById[id]
}

export function getGroupById(id: string): AdminGroup | undefined {
  return groupsById[id]
}

export function getUserById(id: string): AdminUser | undefined {
  return usersById[id]
}
