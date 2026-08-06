<script setup lang="ts">
type ModalSize = 'sm' | 'md' | 'lg'

withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    size?: ModalSize
  }>(),
  {
    title: undefined,
    size: 'md',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function close() {
  emit('update:modelValue', false)
}

function onBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    close()
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="app-modal__backdrop"
      role="presentation"
      @click="onBackdropClick"
    >
      <div
        class="app-modal__panel"
        :class="`app-modal__panel--${size}`"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        @click.stop
      >
        <header v-if="title" class="app-modal__header">
          <h2 class="app-modal__title">
            {{ title }}
          </h2>
          <button
            type="button"
            class="app-modal__close"
            aria-label="Close"
            @click="close"
          >
            <i class="ti ti-x" aria-hidden="true" />
          </button>
        </header>

        <div class="app-modal__body">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="app-modal__footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.app-modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background-color: rgba(28, 43, 54, 0.6);
  animation: fade-in 150ms ease;
}

.app-modal__panel {
  width: 100%;
  background-color: var(--color-bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-height: min(90vh, 720px);
  overflow: auto;
}

.app-modal__panel--sm {
  max-width: 400px;
}

.app-modal__panel--md {
  max-width: 560px;
}

.app-modal__panel--lg {
  max-width: 720px;
}

.app-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.app-modal__title {
  margin: 0;
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

.app-modal__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  flex-shrink: 0;
}

.app-modal__close:hover {
  background-color: var(--color-bg-page);
  color: var(--color-text-primary);
}

.app-modal__body {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}

.app-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

@media (max-width: 479px) {
  .app-modal__backdrop {
    padding: var(--space-3);
  }

  .app-modal__panel {
    padding: var(--space-4);
  }

  .app-modal__panel--sm,
  .app-modal__panel--md,
  .app-modal__panel--lg {
    max-width: 100%;
  }
}
</style>
