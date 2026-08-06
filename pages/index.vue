<script setup lang="ts">
definePageMeta({
  layout: 'blank',
})

const config = useRuntimeConfig()
const appName = config.public.appName
const testStore = useTestStore()

const code = ref('')
const isSubmitting = ref(false)

const errorMessage = computed(() => testStore.codeError)

async function handleSubmit() {
  if (isSubmitting.value) return

  isSubmitting.value = true
  try {
    const result = await testStore.verifyCode(code.value)
    if (result.ok) {
      await navigateTo('/start')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="code-entry">
    <AppCard class="code-entry__card" padding="lg">
      <div class="code-entry__header">
        <p class="code-entry__brand">
          {{ appName }}
        </p>
        <h1 class="code-entry__title">
          Enter your test code
        </h1>
        <p class="code-entry__subtitle">
          Use the code provided by your teacher to begin.
        </p>
      </div>

      <form class="code-entry__form" @submit.prevent="handleSubmit">
        <AppInput
          v-model="code"
          label="Test code"
          placeholder="DEMO2026"
          :error="errorMessage ?? undefined"
        />

        <AppButton
          type="submit"
          size="lg"
          :loading="isSubmitting"
          class="code-entry__submit"
        >
          Start test
        </AppButton>
      </form>
    </AppCard>
  </div>
</template>

<style scoped>
.code-entry {
  width: min(400px, 100%);
}

.code-entry__card {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.code-entry__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  text-align: center;
}

.code-entry__brand {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-primary-dark);
}

.code-entry__title {
  margin: 0;
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

.code-entry__subtitle {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.code-entry__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.code-entry__submit {
  width: 100%;
}
</style>
