import type {
  Attempt,
  CertificateData,
  Question,
  SectionAttempt,
  VerifiedPreview,
} from '~/types/test'

export const VALID_CODE = 'DEMO2026'
export const ATTEMPT_ID = 'sample-attempt-1'
export const SECTION_DURATION_MS = 5 * 60 * 1000
export const MAX_STRIKES = 2
export const CERTIFICATE_SCORE = 87

export const SAMPLE_PREVIEW: VerifiedPreview = {
  studentName: 'Budi Santoso',
  testName: 'English Proficiency Test',
  groupName: 'Batch Agustus 2026',
  startTime: '2026-08-05T08:00:00+07:00',
  endTime: '2026-08-05T10:00:00+07:00',
  sectionCount: 3,
  certificateDelayHours: 24,
}

export const SAMPLE_SECTIONS: Array<{
  id: string
  name: string
  displayName: string
  questionIds: string[]
}> = [
  {
    id: 'section-listening',
    name: 'Listening',
    displayName: 'Listening',
    questionIds: ['q-l-1', 'q-l-2', 'q-l-3', 'q-l-4'],
  },
  {
    id: 'section-grammar',
    name: 'Grammar',
    displayName: 'Grammar',
    questionIds: ['q-g-1', 'q-g-2', 'q-g-3', 'q-g-4'],
  },
  {
    id: 'section-reading',
    name: 'Reading',
    displayName: 'Reading',
    questionIds: ['q-r-1', 'q-r-2', 'q-r-3', 'q-r-4'],
  },
]

export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 'q-l-1',
    text: 'What is the main topic of the conversation?',
    audioUrl: '/audio/sample.mp3',
    options: [
      { id: 'q-l-1-a', label: 'A', text: 'Planning a weekend trip' },
      { id: 'q-l-1-b', label: 'B', text: 'Booking a hotel room' },
      { id: 'q-l-1-c', label: 'C', text: 'Ordering food at a restaurant' },
      { id: 'q-l-1-d', label: 'D', text: 'Asking for directions' },
    ],
  },
  {
    id: 'q-l-2',
    text: 'According to the speaker, when will the meeting take place?',
    audioUrl: null,
    options: [
      { id: 'q-l-2-a', label: 'A', text: 'Monday morning' },
      { id: 'q-l-2-b', label: 'B', text: 'Tuesday afternoon' },
      { id: 'q-l-2-c', label: 'C', text: 'Wednesday evening' },
      { id: 'q-l-2-d', label: 'D', text: 'Friday at noon' },
    ],
  },
  {
    id: 'q-l-3',
    text: 'What does the woman suggest they do next?',
    audioUrl: null,
    options: [
      { id: 'q-l-3-a', label: 'A', text: 'Call the manager' },
      { id: 'q-l-3-b', label: 'B', text: 'Check the schedule again' },
      { id: 'q-l-3-c', label: 'C', text: 'Wait for a confirmation email' },
      { id: 'q-l-3-d', label: 'D', text: 'Cancel the reservation' },
    ],
  },
  {
    id: 'q-l-4',
    text: 'Why is the man unable to attend the event?',
    audioUrl: null,
    options: [
      { id: 'q-l-4-a', label: 'A', text: 'He has a prior commitment' },
      { id: 'q-l-4-b', label: 'B', text: 'He is feeling unwell' },
      { id: 'q-l-4-c', label: 'C', text: 'He missed the registration deadline' },
      { id: 'q-l-4-d', label: 'D', text: 'He cannot afford the ticket' },
    ],
  },
  {
    id: 'q-g-1',
    text: 'Choose the correct form: She _____ to the office every day.',
    audioUrl: null,
    options: [
      { id: 'q-g-1-a', label: 'A', text: 'go' },
      { id: 'q-g-1-b', label: 'B', text: 'goes' },
      { id: 'q-g-1-c', label: 'C', text: 'going' },
      { id: 'q-g-1-d', label: 'D', text: 'gone' },
    ],
  },
  {
    id: 'q-g-2',
    text: 'Which sentence is grammatically correct?',
    audioUrl: null,
    options: [
      { id: 'q-g-2-a', label: 'A', text: 'He don\'t like coffee.' },
      { id: 'q-g-2-b', label: 'B', text: 'He doesn\'t likes coffee.' },
      { id: 'q-g-2-c', label: 'C', text: 'He doesn\'t like coffee.' },
      { id: 'q-g-2-d', label: 'D', text: 'He not like coffee.' },
    ],
  },
  {
    id: 'q-g-3',
    text: 'Select the best word: If it rains tomorrow, we _____ stay indoors.',
    audioUrl: null,
    options: [
      { id: 'q-g-3-a', label: 'A', text: 'will' },
      { id: 'q-g-3-b', label: 'B', text: 'would' },
      { id: 'q-g-3-c', label: 'C', text: 'have' },
      { id: 'q-g-3-d', label: 'D', text: 'had' },
    ],
  },
  {
    id: 'q-g-4',
    text: 'Identify the error: "Neither of the students have finished their homework."',
    audioUrl: null,
    options: [
      { id: 'q-g-4-a', label: 'A', text: '"Neither" should be "None"' },
      { id: 'q-g-4-b', label: 'B', text: '"have" should be "has"' },
      { id: 'q-g-4-c', label: 'C', text: '"their" should be "his"' },
      { id: 'q-g-4-d', label: 'D', text: 'No error' },
    ],
  },
  {
    id: 'q-r-1',
    text: 'Based on the passage, what is the author\'s main argument?',
    audioUrl: null,
    options: [
      { id: 'q-r-1-a', label: 'A', text: 'Remote work reduces productivity' },
      { id: 'q-r-1-b', label: 'B', text: 'Flexible schedules improve work-life balance' },
      { id: 'q-r-1-c', label: 'C', text: 'Offices will disappear within a decade' },
      { id: 'q-r-1-d', label: 'D', text: 'Commuting is essential for collaboration' },
    ],
  },
  {
    id: 'q-r-2',
    text: 'What does the word "adjacent" most nearly mean in the passage?',
    audioUrl: null,
    options: [
      { id: 'q-r-2-a', label: 'A', text: 'Distant' },
      { id: 'q-r-2-b', label: 'B', text: 'Nearby' },
      { id: 'q-r-2-c', label: 'C', text: 'Opposite' },
      { id: 'q-r-2-d', label: 'D', text: 'Hidden' },
    ],
  },
  {
    id: 'q-r-3',
    text: 'Which detail best supports the claim that cities are becoming greener?',
    audioUrl: null,
    options: [
      { id: 'q-r-3-a', label: 'A', text: 'Increased bike lane construction' },
      { id: 'q-r-3-b', label: 'B', text: 'Higher apartment rents' },
      { id: 'q-r-3-c', label: 'C', text: 'Longer working hours' },
      { id: 'q-r-3-d', label: 'D', text: 'Fewer public libraries' },
    ],
  },
  {
    id: 'q-r-4',
    text: 'What can be inferred about the company\'s future plans?',
    audioUrl: null,
    options: [
      { id: 'q-r-4-a', label: 'A', text: 'It will close overseas offices' },
      { id: 'q-r-4-b', label: 'B', text: 'It intends to expand into new markets' },
      { id: 'q-r-4-c', label: 'C', text: 'It plans to reduce its workforce' },
      { id: 'q-r-4-d', label: 'D', text: 'It will stop all product development' },
    ],
  },
]

export function buildAttempt(): Attempt {
  return {
    id: ATTEMPT_ID,
    status: 'in_progress',
    studentName: SAMPLE_PREVIEW.studentName,
    testName: SAMPLE_PREVIEW.testName,
    groupName: SAMPLE_PREVIEW.groupName,
    startTime: SAMPLE_PREVIEW.startTime,
    endTime: SAMPLE_PREVIEW.endTime,
    sectionCount: SAMPLE_PREVIEW.sectionCount,
    certificateDelayHours: SAMPLE_PREVIEW.certificateDelayHours,
    certificateEnabled: true,
    certificateAvailableAt: new Date().toISOString(),
    totalScore: null,
    sections: SAMPLE_SECTIONS.map((section) => ({
      id: section.id,
      displayName: section.displayName,
      status: 'not_started' as const,
    })),
  }
}

export function buildSectionAttempt(sectionIndex: number): SectionAttempt {
  const section = SAMPLE_SECTIONS[sectionIndex]
  if (!section) {
    throw new Error(`Unknown section index: ${sectionIndex}`)
  }

  return {
    id: `attempt-${section.id}`,
    sectionId: section.id,
    displayName: section.displayName,
    status: 'in_progress',
    endsAt: new Date(Date.now() + SECTION_DURATION_MS).toISOString(),
    questionIndex: 0,
    order: [...section.questionIds],
  }
}

export function buildCertificate(): CertificateData {
  return {
    attemptId: ATTEMPT_ID,
    studentName: SAMPLE_PREVIEW.studentName,
    testName: SAMPLE_PREVIEW.testName,
    dateLabel: '5 August 2026',
    score: CERTIFICATE_SCORE,
    issuer: 'Test Platform Academy',
  }
}
