import {
  ATTEMPT_ID,
  MAX_STRIKES,
  SAMPLE_PREVIEW,
  SAMPLE_QUESTIONS,
  VALID_CODE,
  buildAttempt,
  buildCertificate,
  buildSectionAttempt,
} from '~/data/sample-test'
import type {
  Attempt,
  CertificateData,
  Question,
  SectionAttempt,
  SectionCloseReason,
  SectionStatus,
  VerifiedPreview,
} from '~/types/test'

export const useTestStore = defineStore('test', () => {
  const verifiedPreview = ref<VerifiedPreview | null>(null)
  const attempt = ref<Attempt | null>(null)
  const currentSection = ref<SectionAttempt | null>(null)
  const currentSectionIndex = ref(0)
  const questions = ref<Question[]>([...SAMPLE_QUESTIONS])
  const answers = ref<Record<string, string>>({})
  const audioPlayed = ref<Record<string, boolean>>({})
  const strikeCount = ref(0)
  const lastCloseReason = ref<SectionCloseReason>(null)
  const codeError = ref<string | null>(null)

  const questionsById = computed(() => {
    const map = new Map<string, Question>()
    for (const question of questions.value) {
      map.set(question.id, question)
    }
    return map
  })

  const currentQuestions = computed(() => {
    if (!currentSection.value) return [] as Question[]
    return currentSection.value.order
      .map((id) => questionsById.value.get(id))
      .filter((question): question is Question => Boolean(question))
  })

  const currentQuestion = computed(() => {
    if (!currentSection.value) return null
    const index = currentSection.value.questionIndex
    return currentQuestions.value[index] ?? null
  })

  const hasMoreSections = computed(() => {
    if (!attempt.value) return false
    return currentSectionIndex.value < attempt.value.sectionCount - 1
  })

  const sectionNumber = computed(() => currentSectionIndex.value + 1)

  async function verifyCode(code: string): Promise<{ ok: boolean }> {
    const trimmed = code.trim()
    codeError.value = null

    if (trimmed !== VALID_CODE) {
      codeError.value = 'Invalid or expired code'
      verifiedPreview.value = null
      return { ok: false }
    }

    verifiedPreview.value = { ...SAMPLE_PREVIEW }
    return { ok: true }
  }

  function syncSectionProgress(status: SectionStatus) {
    if (!attempt.value || !currentSection.value) return

    const sectionId = currentSection.value.sectionId
    attempt.value.sections = attempt.value.sections.map((section) =>
      section.id === sectionId ? { ...section, status } : section,
    )
  }

  function startSectionAt(index: number) {
    if (!attempt.value) {
      throw new Error('Attempt is not initialized')
    }

    currentSectionIndex.value = index
    currentSection.value = buildSectionAttempt(index)
    strikeCount.value = 0
    lastCloseReason.value = null
    syncSectionProgress('in_progress')
  }

  async function startTest(): Promise<void> {
    if (!verifiedPreview.value) {
      throw new Error('Cannot start test without verified preview')
    }

    attempt.value = buildAttempt()
    answers.value = {}
    audioPlayed.value = {}
    startSectionAt(0)
  }

  async function selectAnswer(questionId: string, optionId: string): Promise<void> {
    answers.value = {
      ...answers.value,
      [questionId]: optionId,
    }
  }

  async function markAudioPlayed(questionId: string): Promise<void> {
    audioPlayed.value = {
      ...audioPlayed.value,
      [questionId]: true,
    }
  }

  async function submitSection(
    reason: Exclude<SectionCloseReason, null>,
  ): Promise<void> {
    if (!currentSection.value || !attempt.value) return

    const status: SectionStatus = reason === 'manual' ? 'completed' : 'auto_closed'
    currentSection.value = {
      ...currentSection.value,
      status,
      endsAt: null,
    }
    lastCloseReason.value = reason
    syncSectionProgress(status)

    const allDone = attempt.value.sections.every(
      (section) => section.status === 'completed' || section.status === 'auto_closed',
    )
    if (allDone) {
      attempt.value = {
        ...attempt.value,
        status: 'completed',
        totalScore: buildCertificate().score,
      }
    }
  }

  async function applyStrike(): Promise<{ closed: boolean }> {
    if (!currentSection.value || currentSection.value.status !== 'in_progress') {
      return { closed: false }
    }

    strikeCount.value += 1

    if (strikeCount.value >= MAX_STRIKES) {
      await submitSection('strike')
      return { closed: true }
    }

    return { closed: false }
  }

  async function reportTabSwitch(): Promise<{ closed: boolean }> {
    return applyStrike()
  }

  async function goToQuestion(index: number): Promise<void> {
    if (!currentSection.value) return
    const maxIndex = currentSection.value.order.length - 1
    if (index < 0 || index > maxIndex) return

    currentSection.value = {
      ...currentSection.value,
      questionIndex: index,
    }
  }

  async function nextQuestion(): Promise<void> {
    if (!currentSection.value) return
    await goToQuestion(currentSection.value.questionIndex + 1)
  }

  async function prevQuestion(): Promise<void> {
    if (!currentSection.value) return
    await goToQuestion(currentSection.value.questionIndex - 1)
  }

  async function advanceSection(): Promise<{ done: boolean }> {
    if (!attempt.value) return { done: true }

    if (!hasMoreSections.value) {
      return { done: true }
    }

    startSectionAt(currentSectionIndex.value + 1)
    return { done: false }
  }

  async function getCertificate(): Promise<CertificateData> {
    return buildCertificate()
  }

  function isAttemptMatch(attemptId: string): boolean {
    return attempt.value?.id === attemptId && attemptId === ATTEMPT_ID
  }

  return {
    verifiedPreview,
    attempt,
    currentSection,
    currentSectionIndex,
    questions,
    currentQuestions,
    currentQuestion,
    answers,
    audioPlayed,
    strikeCount,
    lastCloseReason,
    codeError,
    hasMoreSections,
    sectionNumber,
    verifyCode,
    startTest,
    selectAnswer,
    markAudioPlayed,
    applyStrike,
    reportTabSwitch,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    submitSection,
    advanceSection,
    getCertificate,
    isAttemptMatch,
  }
})
