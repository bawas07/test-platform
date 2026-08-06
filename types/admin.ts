export type ScoringMode = 'SUM' | 'LOWEST_SECTION' | 'HIGHEST_SECTION' | 'PERCENTAGE'

export interface AdminQuestionOption {
  id: string
  label: string // A/B/C/D
  text: string
}

export interface AdminQuestion {
  id: string
  text: string
  audioUrl: string | null
  options: AdminQuestionOption[]
  correctOptionId: string
}

export interface ScoreMapRow {
  rawScore: number
  scaledScore: number
}

export interface AdminSection {
  id: string
  sectionKey: string
  displayName: string
  timeLimit: number
  maxScore: number
  randomize: boolean
  questionIds: string[]
  scoreMap: ScoreMapRow[]
}

export interface TestSectionAssignment {
  sectionId: string
  order: number
  weight?: number
}

export interface AdminTest {
  id: string
  name: string
  scoringMode: ScoringMode
  sectionAssignments: TestSectionAssignment[]
}

export interface AdminGroup {
  id: string
  name: string
  testId: string
  startTime: string
  endTime: string
  certificateDelayHours: number
  userIds: string[]
}

export interface AdminUser {
  id: string
  name: string
  testCode: string
  certificateEnabled: boolean
  groupIds: string[]
}

export interface AdminAttemptSectionScore {
  sectionName: string
  score: number
  maxScore: number
}

export interface AdminAttempt {
  id: string
  userId: string
  groupId: string
  status: string
  totalScore: number
  sectionScores: AdminAttemptSectionScore[]
  completedAt: string | null
}
