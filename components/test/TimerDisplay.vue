<script setup lang="ts">
const props = defineProps<{
  endsAt: string | null | undefined
}>()

const endsAtRef = toRef(props, 'endsAt')
const { secondsLeft, urgency } = useTimer(endsAtRef)

const display = computed(() => {
  const total = secondsLeft.value
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})
</script>

<template>
  <div
    class="timer-display"
    :class="[
      `timer-display--${urgency}`,
      { 'timer-display--pulse': urgency === 'danger' },
    ]"
    role="timer"
    :aria-label="`Time remaining ${display}`"
  >
    <i class="ti ti-clock timer-display__icon" aria-hidden="true" />
    <span class="timer-display__value">{{ display }}</span>
  </div>
</template>

<style scoped>
.timer-display {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-xl);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  line-height: 1;
}

.timer-display__icon {
  font-size: var(--text-lg);
}

.timer-display--safe {
  color: var(--color-timer-safe);
}

.timer-display--warning {
  color: var(--color-timer-warning);
}

.timer-display--danger {
  color: var(--color-timer-danger);
}

.timer-display--pulse .timer-display__value {
  animation: timer-pulse 1s ease-in-out infinite;
}
</style>
