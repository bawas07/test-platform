<script setup lang="ts">
definePageMeta({
  layout: 'student',
})

const route = useRoute()
const config = useRuntimeConfig()
const testStore = useTestStore()

const attemptId = computed(() => String(route.params.attemptId))

if (!testStore.isAttemptMatch(attemptId.value)) {
  await navigateTo('/')
}

const gatePassed = ref(false)
const gateError = ref<string | null>(null)
const isSubmittingSection = ref(false)
const isHandlingStrike = ref(false)
const fullscreenFailed = ref(false)
const STRIKE_COOLDOWN_MS = 800
let lastStrikeAt = 0

const { enter, onExit } = useFullscreen()

const endsAt = computed(() => testStore.currentSection?.endsAt ?? null)
const { secondsLeft } = useTimer(endsAt)

const currentQuestion = computed(() => testStore.currentQuestion)
const questionIndex = computed(() => testStore.currentSection?.questionIndex ?? 0)
const questionTotal = computed(() => testStore.currentQuestions.length)
const isLastQuestion = computed(() => questionIndex.value >= questionTotal.value - 1)
const selectedOptionId = computed(() => {
  const question = currentQuestion.value
  if (!question) return null
  return testStore.answers[question.id] ?? null
})
const audioAlreadyPlayed = computed(() => {
  const question = currentQuestion.value
  if (!question) return false
  return Boolean(testStore.audioPlayed[question.id])
})
const strikeBannerCount = computed(() => {
  if (testStore.strikeCount >= 2) return 2 as const
  if (testStore.strikeCount === 1) return 1 as const
  return null
})

async function navigateSectionDone(reason: 'manual' | 'strike' | 'time_up') {
  if (isSubmittingSection.value) return
  isSubmittingSection.value = true
  await navigateTo({
    path: `/test/${attemptId.value}/section-done`,
    query: { reason },
  })
}

async function openRunner(options: { fullscreenOk: boolean }) {
  fullscreenFailed.value = !options.fullscreenOk
  gatePassed.value = true
  await closeSectionIfTimerExpired()
}

async function closeSectionIfTimerExpired() {
  if (isSubmittingSection.value) return
  if (testStore.currentSection?.status !== 'in_progress') return
  if (secondsLeft.value > 0) return

  await testStore.submitSection('time_up')
  await navigateSectionDone('time_up')
}

async function handleEnterFullscreen() {
  gateError.value = null
  try {
    await enter()
    await openRunner({ fullscreenOk: true })
  } catch {
    gateError.value = 'Could not enter fullscreen. Please allow fullscreen and try again, or continue without fullscreen for the demo.'
  }
}

async function handleContinueWithoutFullscreen() {
  gateError.value = null
  await openRunner({ fullscreenOk: false })
}

async function handleStrikeFromIntegrity() {
  if (!gatePassed.value || isHandlingStrike.value || isSubmittingSection.value) return
  if (testStore.currentSection?.status !== 'in_progress') return

  const now = Date.now()
  if (now - lastStrikeAt < STRIKE_COOLDOWN_MS) return

  isHandlingStrike.value = true
  lastStrikeAt = now
  try {
    const result = await testStore.applyStrike()
    if (result.closed) {
      await navigateSectionDone('strike')
      return
    }

    try {
      await enter()
    } catch {
      // Re-entry may fail without a fresh gesture; banner already reflects the strike.
    }
  } finally {
    isHandlingStrike.value = false
  }
}

useTabSwitch(() => {
  if (!gatePassed.value) return
  void handleStrikeFromIntegrity()
})

let stopFullscreenWatch: (() => void) | null = null

onMounted(() => {
  stopFullscreenWatch = onExit(() => {
    if (!gatePassed.value) return
    void handleStrikeFromIntegrity()
  })
})

onUnmounted(() => {
  stopFullscreenWatch?.()
})

watch(secondsLeft, async (value, previous) => {
  if (!gatePassed.value) return
  if (isSubmittingSection.value) return
  if (testStore.currentSection?.status !== 'in_progress') return
  if (value !== 0) return
  if (previous === 0 || previous === undefined) return

  await closeSectionIfTimerExpired()
})

async function handleSelectOption(optionId: string) {
  const question = currentQuestion.value
  if (!question) return
  await testStore.selectAnswer(question.id, optionId)
}

async function handleAudioPlayed(questionId: string) {
  await testStore.markAudioPlayed(questionId)
}

async function handlePrev() {
  await testStore.prevQuestion()
}

async function handleNextOrSubmit() {
  if (isLastQuestion.value) {
    await testStore.submitSection('manual')
    await navigateSectionDone('manual')
    return
  }
  await testStore.nextQuestion()
}

async function handleDemoStrike(count: 1 | 2) {
  if (!gatePassed.value || isSubmittingSection.value) return
  if (testStore.currentSection?.status !== 'in_progress') return

  if (count === 1) {
    // Demo strike 1 should only show the warning path, never auto-close.
    if (testStore.strikeCount === 0) {
      await testStore.applyStrike()
    }
    return
  }

  // Demo strike 2: ensure the section closes and navigates away.
  while (
    testStore.strikeCount < 2
    && testStore.currentSection?.status === 'in_progress'
  ) {
    const result = await testStore.applyStrike()
    if (result.closed) {
      await navigateSectionDone('strike')
      return
    }
  }
}
</script>

<template>
  <div class="runner">
    <div v-if="!gatePassed" class="runner-gate">
      <AppCard class="runner-gate__card" padding="lg">
        <div class="runner-gate__icon-wrap" aria-hidden="true">
          <i class="ti ti-arrows-maximize" />
        </div>
        <h1 class="runner-gate__title">
          Enter fullscreen to begin
        </h1>
        <p class="runner-gate__text">
          This test runs in fullscreen. Leaving fullscreen or switching tabs will count as a strike.
        </p>
        <p v-if="gateError" class="runner-gate__error">
          {{ gateError }}
        </p>
        <AppButton size="lg" class="runner-gate__button" @click="handleEnterFullscreen">
          Enter fullscreen
        </AppButton>
        <AppButton
          v-if="gateError"
          variant="ghost"
          size="md"
          class="runner-gate__button"
          @click="handleContinueWithoutFullscreen"
        >
          Continue without fullscreen
        </AppButton>
      </AppCard>
    </div>

    <template v-else>
      <header class="runner-top">
        <div class="runner-top__inner">
          <div class="runner-top__identity">
            <p class="runner-top__app">
              {{ config.public.appName }}
            </p>
            <p class="runner-top__section">
              Section {{ testStore.sectionNumber }} of {{ testStore.attempt?.sectionCount }}:
              {{ testStore.currentSection?.displayName }}
            </p>
          </div>

          <SectionProgressBar
            v-if="testStore.attempt"
            class="runner-top__progress"
            :sections="testStore.attempt.sections"
          />

          <TimerDisplay
            class="runner-top__timer"
            :ends-at="endsAt"
          />
        </div>
      </header>

      <main class="runner-main">
        <p v-if="fullscreenFailed" class="runner-note" role="status">
          Fullscreen was blocked by the browser. You can continue the demo, but integrity checks may be limited.
        </p>

        <StrikeWarningBanner
          v-if="strikeBannerCount"
          :strike-count="strikeBannerCount"
        />

        <QuestionCard
          v-if="currentQuestion"
          :question="currentQuestion"
          :question-number="questionIndex + 1"
          :question-total="questionTotal"
          :selected-option-id="selectedOptionId"
          :audio-already-played="audioAlreadyPlayed"
          @select-option="handleSelectOption"
          @audio-played="handleAudioPlayed"
        />

        <div class="runner-nav">
          <AppButton
            variant="secondary"
            :disabled="questionIndex === 0"
            @click="handlePrev"
          >
            Previous
          </AppButton>
          <AppButton @click="handleNextOrSubmit">
            {{ isLastQuestion ? 'Submit section' : 'Next' }}
          </AppButton>
        </div>
      </main>

      <DemoStrikeFab @strike="handleDemoStrike" />
    </template>
  </div>
</template>

<style scoped>
.runner {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.runner-gate {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

@media (min-width: 640px) {
  .runner-gate {
    padding: var(--space-6);
  }
}

.runner-gate__card {
  width: min(420px, 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-4);
}

.runner-gate__icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background-color: var(--color-bg-tint);
  color: var(--color-primary-dark);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-lg);
}

.runner-gate__title {
  margin: 0;
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

.runner-gate__text {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.runner-gate__error {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-danger);
}

.runner-gate__button {
  width: 100%;
  margin-top: var(--space-2);
}

.runner-top {
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.runner-top__inner {
  width: min(960px, 100%);
  margin: 0 auto;
  padding: var(--space-3) var(--space-4);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
}

.runner-top__identity {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
  flex: 1 1 160px;
}

.runner-top__app {
  margin: 0;
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-primary-dark);
}

.runner-top__section {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.runner-top__progress {
  flex: 1 1 100%;
  min-width: 0;
  order: 3;
}

.runner-top__timer {
  flex: 0 0 auto;
  margin-left: auto;
}

.runner-main {
  width: min(680px, 100%);
  margin: 0 auto;
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  flex: 1;
}

.runner-note {
  margin: 0;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-tint);
  color: var(--color-primary-dark);
  font-size: var(--text-sm);
}

.runner-nav {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding-bottom: var(--space-8);
}

@media (min-width: 768px) {
  .runner-top__inner {
    padding: var(--space-4) var(--space-6);
    flex-wrap: nowrap;
    gap: var(--space-6);
  }

  .runner-top__identity {
    flex: 1 1 auto;
  }

  .runner-top__progress {
    flex: 0 1 auto;
    order: 0;
  }

  .runner-top__timer {
    margin-left: 0;
  }

  .runner-main {
    padding: var(--space-6);
  }
}
</style>
