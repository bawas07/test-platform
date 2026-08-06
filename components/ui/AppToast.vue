<script setup lang="ts">
import type { ToastVariant } from '~/stores/toast'

const toastStore = useToastStore()

const variantIcon: Record<ToastVariant, string> = {
  success: 'ti-circle-check',
  warning: 'ti-alert-triangle',
  danger: 'ti-alert-circle',
  info: 'ti-info-circle',
}
</script>

<template>
  <div class="app-toast-stack" aria-live="polite" aria-relevant="additions">
    <div
      v-for="toast in toastStore.toasts"
      :key="toast.id"
      class="app-toast"
      :class="`app-toast--${toast.variant}`"
      role="status"
    >
      <i class="ti app-toast__icon" :class="variantIcon[toast.variant]" aria-hidden="true" />
      <p class="app-toast__message">
        {{ toast.message }}
      </p>
      <button
        type="button"
        class="app-toast__dismiss"
        aria-label="Dismiss"
        @click="toastStore.dismiss(toast.id)"
      >
        <i class="ti ti-x" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.app-toast-stack {
  position: fixed;
  top: var(--space-6);
  right: var(--space-6);
  z-index: 1100;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: min(360px, calc(100vw - var(--space-12)));
  pointer-events: none;
}

.app-toast {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-card);
  box-shadow: var(--shadow-md);
  pointer-events: auto;
  animation: fade-in 150ms ease;
}

.app-toast__icon {
  font-size: var(--text-md);
  line-height: 1;
  margin-top: 1px;
  flex-shrink: 0;
}

.app-toast__message {
  margin: 0;
  flex: 1;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  line-height: 1.4;
}

.app-toast__dismiss {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  flex-shrink: 0;
}

.app-toast__dismiss:hover {
  background-color: var(--color-bg-page);
  color: var(--color-text-primary);
}

.app-toast--success {
  border-color: color-mix(in srgb, var(--color-success) 35%, var(--color-border));
  background-color: var(--color-success-bg);
}

.app-toast--success .app-toast__icon {
  color: var(--color-success);
}

.app-toast--warning {
  border-color: color-mix(in srgb, var(--color-warning) 40%, var(--color-border));
  background-color: var(--color-warning-bg);
}

.app-toast--warning .app-toast__icon {
  color: var(--color-warning);
}

.app-toast--danger {
  border-color: color-mix(in srgb, var(--color-danger) 35%, var(--color-border));
  background-color: var(--color-danger-bg);
}

.app-toast--danger .app-toast__icon {
  color: var(--color-danger);
}

.app-toast--info {
  border-color: color-mix(in srgb, var(--color-primary) 35%, var(--color-border));
  background-color: var(--color-bg-tint);
}

.app-toast--info .app-toast__icon {
  color: var(--color-primary-dark);
}
</style>
