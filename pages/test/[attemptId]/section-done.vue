<script setup lang="ts">
definePageMeta({
  layout: 'blank',
})

const route = useRoute()
const testStore = useTestStore()

const attemptId = computed(() => String(route.params.attemptId))

if (!testStore.isAttemptMatch(attemptId.value)) {
  await navigateTo('/')
}

const reason = computed(() => {
  const queryReason = String(route.query.reason ?? testStore.lastCloseReason ?? 'manual')
  if (queryReason === 'time_up' || queryReason === 'strike' || queryReason === 'manual') {
    return queryReason
  }
  return 'manual'
})

const sectionName = computed(() => {
  const sections = testStore.attempt?.sections ?? []
  const closed = [...sections]
    .reverse()
    .find((section) => section.status === 'completed' || section.status === 'auto_closed')
  return closed?.displayName ?? testStore.currentSection?.displayName ?? 'this section'
})

const title = computed(() => {
  if (reason.value === 'time_up') return "Time's up"
  if (reason.value === 'strike') return 'Section closed'
  return 'Section complete'
})

const iconClass = computed(() => {
  if (reason.value === 'time_up') return 'ti-clock'
  if (reason.value === 'strike') return 'ti-alert-circle'
  return 'ti-circle-check'
})

const message = computed(() => {
  if (reason.value === 'time_up') {
    return `Section "${sectionName.value}" has ended because time ran out. Your answers have been saved.`
  }
  if (reason.value === 'strike') {
    return `Section "${sectionName.value}" was submitted due to integrity rules. Your answers have been saved.`
  }
  return `Section "${sectionName.value}" is complete. Your answers have been saved.`
})

const isAdvancing = ref(false)

async function handleContinue() {
  if (isAdvancing.value) return
  isAdvancing.value = true

  try {
    if (testStore.hasMoreSections) {
      const result = await testStore.advanceSection()
      if (!result.done) {
        await navigateTo(`/test/${attemptId.value}`)
        return
      }
    }

    await navigateTo(`/test/${attemptId.value}/complete`)
  } finally {
    isAdvancing.value = false
  }
}
</script>

<template>
  <div class="section-done">
    <AppCard class="section-done__card" padding="lg">
      <div
        class="section-done__icon"
        :class="`section-done__icon--${reason}`"
        aria-hidden="true"
      >
        <i class="ti" :class="iconClass" />
      </div>

      <h1 class="section-done__title">
        {{ title }}
      </h1>

      <p class="section-done__message">
        {{ message }}
      </p>

      <AppButton
        size="lg"
        class="section-done__action"
        :loading="isAdvancing"
        @click="handleContinue"
      >
        {{ testStore.hasMoreSections ? 'Continue to next section' : 'View results' }}
      </AppButton>
    </AppCard>
  </div>
</template>

<style scoped>
.section-done {
  width: min(440px, 100%);
}

.section-done__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-4);
}

.section-done__icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-lg);
}

.section-done__icon--manual {
  background-color: var(--color-success-bg);
  color: var(--color-success);
}

.section-done__icon--time_up {
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
}

.section-done__icon--strike {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
}

.section-done__title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.section-done__message {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.section-done__action {
  width: 100%;
  margin-top: var(--space-2);
}
</style>
