<script setup lang="ts">
const props = defineProps<{
  strikeCount: 1 | 2
}>()

const isVisible = ref(true)
let hideTimer: ReturnType<typeof setTimeout> | null = null

function clearHideTimer() {
  if (hideTimer !== null) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

function setupVisibility() {
  clearHideTimer()
  isVisible.value = true

  if (props.strikeCount === 1) {
    hideTimer = setTimeout(() => {
      isVisible.value = false
    }, 5000)
  }
}

watch(
  () => props.strikeCount,
  () => {
    setupVisibility()
  },
  { immediate: true },
)

onUnmounted(() => {
  clearHideTimer()
})

const message = computed(() => {
  if (props.strikeCount === 2) {
    return 'Section submitted due to tab switching.'
  }
  return 'Warning: switching tabs is not allowed. One more and this section will be submitted.'
})
</script>

<template>
  <div
    v-show="isVisible"
    class="strike-banner"
    :class="`strike-banner--${strikeCount === 2 ? 'danger' : 'warning'}`"
    role="alert"
  >
    <i
      class="ti strike-banner__icon"
      :class="strikeCount === 2 ? 'ti-alert-circle' : 'ti-alert-triangle'"
      aria-hidden="true"
    />
    <p class="strike-banner__text">
      {{ message }}
    </p>
  </div>
</template>

<style scoped>
.strike-banner {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border-left: 4px solid transparent;
  animation: fade-in 150ms ease;
}

.strike-banner--warning {
  background-color: var(--color-warning-bg);
  border-left-color: var(--color-warning);
}

.strike-banner--danger {
  background-color: var(--color-danger-bg);
  border-left-color: var(--color-danger);
}

.strike-banner__icon {
  font-size: var(--text-md);
  line-height: 1.4;
  flex-shrink: 0;
}

.strike-banner--warning .strike-banner__icon {
  color: var(--color-warning);
}

.strike-banner--danger .strike-banner__icon {
  color: var(--color-danger);
}

.strike-banner__text {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: 500;
  line-height: 1.5;
  color: var(--color-text-primary);
}
</style>
