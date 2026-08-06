<script setup lang="ts">
const emit = defineEmits<{
  strike: [count: 1 | 2]
}>()
</script>

<template>
  <div class="demo-fab" aria-label="Demo strike controls">
    <span class="demo-fab__label">Demo</span>
    <div class="demo-fab__actions">
      <button
        type="button"
        class="demo-fab__button"
        @click="emit('strike', 1)"
      >
        Strike 1
      </button>
      <button
        type="button"
        class="demo-fab__button demo-fab__button--danger"
        @click="emit('strike', 2)"
      >
        Strike 2
      </button>
    </div>
  </div>
</template>

<style scoped>
.demo-fab {
  position: fixed;
  right: var(--space-4);
  bottom: var(--space-4);
  z-index: 900;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background-color: var(--color-bg-card);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  min-width: 120px;
  max-width: calc(100vw - var(--space-8));
}

@media (min-width: 640px) {
  .demo-fab {
    right: var(--space-6);
    bottom: var(--space-6);
    min-width: 140px;
  }
}

.demo-fab__label {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.demo-fab__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.demo-fab__button {
  height: 32px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-warning);
  border-radius: var(--radius-md);
  background-color: var(--color-warning-bg);
  color: #b45309;
  font-family: inherit;
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms ease;
}

.demo-fab__button:hover {
  filter: brightness(0.97);
}

.demo-fab__button--danger {
  border-color: var(--color-danger);
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
}
</style>
