<script setup lang="ts">
definePageMeta({
  layout: 'blank',
})

const auth = useAuthStore()
const router = useRouter()
const config = useRuntimeConfig()

const appName = config.public.appName as string

const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const error = ref<string | null>(null)

async function handleSubmit() {
  error.value = null

  if (!email.value || email.value.trim().length === 0) {
    error.value = 'Email is required'
    return
  }

  if (!password.value) {
    error.value = 'Password is required'
    return
  }

  isSubmitting.value = true
  try {
    await auth.login(email.value, password.value)
    await router.push('/admin')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Login failed'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <AppCard padding="lg" class="login-card">
      <div class="login-header">
        <p class="login-brand">{{ appName }}</p>
        <h1 class="login-title">Admin login</h1>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <AppInput
          v-model="email"
          label="Email"
          type="email"
          placeholder="admin@example.com"
          :disabled="isSubmitting"
        />

        <AppInput
          v-model="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          :disabled="isSubmitting"
        />

        <div v-if="error" class="login-error">
          {{ error }}
        </div>

        <AppButton
          type="submit"
          variant="primary"
          size="lg"
          :loading="isSubmitting"
          class="login-submit"
        >
          Log in
        </AppButton>
      </form>
    </AppCard>
  </div>
</template>

<style scoped>
.login-page {
  width: min(400px, 100%);
}

.login-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.login-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  text-align: center;
}

.login-brand {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-primary-dark);
}

.login-title {
  margin: 0;
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.login-error {
  margin: 0;
  padding: var(--space-3);
  background-color: var(--color-danger-bg);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  color: var(--color-danger);
}

.login-submit {
  width: 100%;
}
</style>
