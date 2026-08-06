export type SectionStatus = 'not_started' | 'in_progress' | 'completed' | 'auto_closed'
export type SectionCloseReason = 'manual' | 'strike' | 'time_up' | null

export interface QuestionOption {
  id: string
  label: string
  text: string
}

export interface Question {
  id: string
  text: string
  audioUrl: string | null
  options: QuestionOption[]
}

export interface SectionProgress {
  id: string
  displayName: string
  status: SectionStatus
}

export interface SectionAttempt {
  id: string
  sectionId: string
  displayName: string
  status: SectionStatus
  endsAt: string | null
  questionIndex: number
  order: string[]
}

export interface Attempt {
  id: string
  status: 'in_progress' | 'completed'
  studentName: string
  testName: string
  groupName: string
  startTime: string
  endTime: string
  sectionCount: number
  certificateDelayHours: number
  certificateEnabled: boolean
  certificateAvailableAt: string | null
  totalScore: number | null
  sections: SectionProgress[]
}

export interface VerifiedPreview {
  studentName: string
  testName: string
  groupName: string
  startTime: string
  endTime: string
  sectionCount: number
  certificateDelayHours: number
}

export interface CertificateData {
  attemptId: string
  studentName: string
  testName: string
  dateLabel: string
  score: number
  issuer: string
}
