<script setup lang="ts">
type CardPadding = 'sm' | 'md' | 'lg'

withDefaults(
  defineProps<{
    padding?: CardPadding
  }>(),
  {
    padding: 'md',
  },
)
</script>

<template>
  <div class="app-card" :class="`app-card--${padding}`">
    <slot />
  </div>
</template>

<style scoped>
.app-card {
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.app-card--sm {
  padding: var(--space-4);
}

.app-card--md {
  padding: var(--space-6);
}

.app-card--lg {
  padding: var(--space-8);
}
</style>
