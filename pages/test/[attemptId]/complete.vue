<script setup lang="ts">
definePageMeta({
  layout: 'blank',
})

const testStore = useTestStore()
const route = useRoute()

const attemptId = computed(() => String(route.params.attemptId))

if (!testStore.isAttemptMatch(attemptId.value)) {
  await navigateTo('/')
}

const studentName = computed(() => testStore.attempt?.studentName ?? 'student')
const delayHours = computed(() => testStore.attempt?.certificateDelayHours ?? 24)
const certificateEnabled = computed(() => Boolean(testStore.attempt?.certificateEnabled))

async function goToCertificate() {
  await navigateTo(`/certificate/${attemptId.value}`)
}
</script>

<template>
  <div class="complete-page">
    <AppCard class="complete-page__card" padding="lg">
      <div class="complete-page__icon" aria-hidden="true">
        <i class="ti ti-circle-check" />
      </div>

      <h1 class="complete-page__title">
        Test complete
      </h1>

      <p class="complete-page__message">
        Thank you, {{ studentName }}. Your responses have been recorded.
      </p>

      <p class="complete-page__certificate-note">
        Your certificate will be available in {{ delayHours }} hours.
        For this sample demo, you can view it right away.
      </p>

      <AppButton
        size="lg"
        class="complete-page__action"
        :disabled="!certificateEnabled"
        @click="goToCertificate"
      >
        Check certificate
      </AppButton>
    </AppCard>
  </div>
</template>

<style scoped>
.complete-page {
  width: min(440px, 100%);
}

.complete-page__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-4);
}

.complete-page__icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background-color: var(--color-success-bg);
  color: var(--color-success);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-lg);
}

.complete-page__title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.complete-page__message,
.complete-page__certificate-note {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.complete-page__action {
  width: 100%;
  margin-top: var(--space-2);
}
</style>
