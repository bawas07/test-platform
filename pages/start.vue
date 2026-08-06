<script setup lang="ts">
definePageMeta({
  layout: 'blank',
})

const config = useRuntimeConfig()
const appName = config.public.appName
const testStore = useTestStore()

const isStarting = ref(false)

if (!testStore.verifiedPreview) {
  await navigateTo('/')
}

const preview = computed(() => testStore.verifiedPreview)

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

async function handleStart() {
  if (isStarting.value) return

  isStarting.value = true
  try {
    await testStore.startTest()
    await navigateTo('/test/sample-attempt-1')
  } finally {
    isStarting.value = false
  }
}
</script>

<template>
  <div v-if="preview" class="start-page">
    <AppCard class="start-page__card" padding="lg">
      <div class="start-page__header">
        <p class="start-page__brand">
          {{ appName }}
        </p>
        <h1 class="start-page__title">
          Hello, {{ preview.studentName }}
        </h1>
      </div>

      <dl class="start-page__details">
        <div class="start-page__row">
          <dt>Test</dt>
          <dd>{{ preview.testName }}</dd>
        </div>
        <div class="start-page__row">
          <dt>Group</dt>
          <dd>{{ preview.groupName }}</dd>
        </div>
        <div class="start-page__row">
          <dt>Starts</dt>
          <dd>{{ formatDateTime(preview.startTime) }}</dd>
        </div>
        <div class="start-page__row">
          <dt>Ends</dt>
          <dd>{{ formatDateTime(preview.endTime) }}</dd>
        </div>
        <div class="start-page__row">
          <dt>Sections</dt>
          <dd>{{ preview.sectionCount }}</dd>
        </div>
      </dl>

      <div class="start-page__warning" role="note">
        <i class="ti ti-alert-triangle start-page__warning-icon" aria-hidden="true" />
        <p>
          Once started, the test must be completed in one sitting per section.
          Switching tabs or leaving fullscreen will count as a strike.
        </p>
      </div>

      <AppButton
        size="lg"
        :loading="isStarting"
        class="start-page__submit"
        @click="handleStart"
      >
        Start test
      </AppButton>
    </AppCard>
  </div>
</template>

<style scoped>
.start-page {
  width: min(480px, 100%);
}

.start-page__card {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.start-page__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.start-page__brand {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-primary-dark);
}

.start-page__title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.start-page__details {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.start-page__row {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: var(--space-3);
  font-size: var(--text-sm);
}

.start-page__row dt {
  margin: 0;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.start-page__row dd {
  margin: 0;
  color: var(--color-text-primary);
  font-weight: 500;
}

.start-page__warning {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background-color: var(--color-warning-bg);
  border-left: 4px solid var(--color-warning);
}

.start-page__warning-icon {
  color: var(--color-warning);
  font-size: var(--text-md);
  flex-shrink: 0;
  margin-top: 2px;
}

.start-page__warning p {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  line-height: 1.5;
}

.start-page__submit {
  width: 100%;
}
</style>
