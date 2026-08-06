<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    type: 'button',
  },
)

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const isInactive = computed(() => props.disabled || props.loading)

function handleClick(event: MouseEvent) {
  if (isInactive.value) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    class="app-button"
    :class="[
      `app-button--${variant}`,
      `app-button--${size}`,
      { 'app-button--loading': loading, 'app-button--disabled': isInactive },
    ]"
    :disabled="isInactive"
    :aria-busy="loading || undefined"
    @click="handleClick"
  >
    <span v-if="loading" class="app-button__spinner" aria-hidden="true" />
    <span class="app-button__label" :class="{ 'app-button__label--hidden': loading }">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease;
  position: relative;
  white-space: nowrap;
}

.app-button--sm {
  height: 32px;
  padding: 0 var(--space-3);
}

.app-button--md {
  height: 40px;
  padding: 0 var(--space-4);
}

.app-button--lg {
  height: 48px;
  padding: 0 var(--space-6);
}

.app-button--primary {
  background-color: var(--color-primary);
  color: var(--color-primary-text);
}

.app-button--primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.app-button--secondary {
  background-color: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.app-button--secondary:hover:not(:disabled) {
  background-color: var(--color-bg-tint);
}

.app-button--danger {
  background-color: var(--color-danger);
  color: var(--color-text-inverse);
}

.app-button--danger:hover:not(:disabled) {
  filter: brightness(0.95);
}

.app-button--ghost {
  background-color: transparent;
  color: var(--color-text-secondary);
}

.app-button--ghost:hover:not(:disabled) {
  background-color: var(--color-bg-page);
}

.app-button--disabled,
.app-button:disabled {
  background-color: var(--color-border);
  color: var(--color-text-muted);
  border-color: transparent;
  cursor: not-allowed;
  filter: none;
}

.app-button__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: var(--radius-full);
  animation: app-button-spin 0.6s linear infinite;
  position: absolute;
}

.app-button__label--hidden {
  visibility: hidden;
}

@keyframes app-button-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
