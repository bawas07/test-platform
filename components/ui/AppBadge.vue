<script setup lang="ts">
type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'primary'

withDefaults(
  defineProps<{
    variant?: BadgeVariant
    label: string
  }>(),
  {
    variant: 'neutral',
  },
)
</script>

<template>
  <span class="app-badge" :class="`app-badge--${variant}`">
    {{ label }}
  </span>
</template>

<style scoped>
.app-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 500;
  line-height: 1.4;
  white-space: nowrap;
}

.app-badge--success {
  background-color: var(--color-success-bg);
  color: var(--color-success);
}

.app-badge--warning {
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
}

.app-badge--danger {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
}

.app-badge--neutral {
  background-color: var(--color-bg-page);
  color: var(--color-text-secondary);
}

.app-badge--primary {
  background-color: var(--color-bg-tint);
  color: var(--color-primary-dark);
}
</style>
