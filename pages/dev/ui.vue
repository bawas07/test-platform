<script setup lang="ts">
definePageMeta({
  layout: 'blank',
})

if (import.meta.dev === false) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
}

const name = ref('')
const email = ref('budi@example.com')
const isModalOpen = ref(false)
const toastStore = useToastStore()

function openToast(variant: 'success' | 'warning' | 'danger' | 'info') {
  toastStore.show(`Sample ${variant} toast`, variant)
}
</script>

<template>
  <div class="dev-ui">
    <h1 class="dev-ui__title">
      Design system smoke check
    </h1>

    <AppCard class="dev-ui__section">
      <h2 class="dev-ui__heading">
        Buttons
      </h2>
      <div class="dev-ui__row">
        <AppButton variant="primary">
          Primary
        </AppButton>
        <AppButton variant="secondary">
          Secondary
        </AppButton>
        <AppButton variant="danger">
          Danger
        </AppButton>
        <AppButton variant="ghost">
          Ghost
        </AppButton>
        <AppButton loading>
          Loading
        </AppButton>
        <AppButton disabled>
          Disabled
        </AppButton>
      </div>
      <div class="dev-ui__row">
        <AppButton size="sm">
          Small
        </AppButton>
        <AppButton size="md">
          Medium
        </AppButton>
        <AppButton size="lg">
          Large
        </AppButton>
      </div>
    </AppCard>

    <AppCard class="dev-ui__section">
      <h2 class="dev-ui__heading">
        Inputs
      </h2>
      <div class="dev-ui__stack">
        <AppInput
          v-model="name"
          label="Full name"
          placeholder="Budi Santoso"
          helper="Enter your full name as on the certificate"
        />
        <AppInput
          v-model="email"
          label="Email"
          type="email"
          error="Please enter a valid email"
        />
        <AppInput
          model-value="Locked value"
          label="Disabled"
          disabled
        />
      </div>
    </AppCard>

    <AppCard class="dev-ui__section">
      <h2 class="dev-ui__heading">
        Badges
      </h2>
      <div class="dev-ui__row">
        <AppBadge variant="success" label="Success" />
        <AppBadge variant="warning" label="Warning" />
        <AppBadge variant="danger" label="Danger" />
        <AppBadge variant="neutral" label="Neutral" />
        <AppBadge variant="primary" label="Primary" />
      </div>
    </AppCard>

    <AppCard class="dev-ui__section" padding="lg">
      <h2 class="dev-ui__heading">
        Modal and toast
      </h2>
      <div class="dev-ui__row">
        <AppButton @click="isModalOpen = true">
          Open modal
        </AppButton>
        <AppButton variant="secondary" @click="openToast('info')">
          Info toast
        </AppButton>
        <AppButton variant="secondary" @click="openToast('success')">
          Success toast
        </AppButton>
        <AppButton variant="secondary" @click="openToast('warning')">
          Warning toast
        </AppButton>
        <AppButton variant="danger" @click="openToast('danger')">
          Danger toast
        </AppButton>
      </div>
    </AppCard>

    <AppModal v-model="isModalOpen" title="Confirm action" size="md">
      <p>
        This modal uses the shared design system panel. Click the backdrop or close control to dismiss.
      </p>
      <template #footer>
        <AppButton variant="ghost" @click="isModalOpen = false">
          Cancel
        </AppButton>
        <AppButton @click="isModalOpen = false">
          Confirm
        </AppButton>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
.dev-ui {
  width: min(880px, 100%);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.dev-ui__title {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-primary);
}

.dev-ui__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.dev-ui__heading {
  margin: 0;
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--color-text-primary);
}

.dev-ui__row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
}

.dev-ui__stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>
