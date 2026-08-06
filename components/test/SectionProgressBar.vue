<script setup lang="ts">
import type { SectionStatus } from '~/types/test'

interface ProgressSection {
  displayName: string
  status: SectionStatus
}

defineProps<{
  sections: ProgressSection[]
}>()

function badgeVariant(status: SectionStatus): 'neutral' | 'primary' | 'success' | 'danger' {
  if (status === 'in_progress') return 'primary'
  if (status === 'completed') return 'success'
  if (status === 'auto_closed') return 'danger'
  return 'neutral'
}

function statusIcon(status: SectionStatus): string | null {
  if (status === 'completed') return 'ti-circle-check'
  if (status === 'auto_closed') return 'ti-circle-x'
  return null
}

function statusLabel(section: ProgressSection): string {
  return section.displayName
}
</script>

<template>
  <div class="section-progress" role="list" aria-label="Section progress">
    <div
      v-for="section in sections"
      :key="section.displayName"
      class="section-progress__item"
      :class="`section-progress__item--${section.status}`"
      role="listitem"
    >
      <span
        v-if="section.status === 'in_progress'"
        class="section-progress__dot"
        aria-hidden="true"
      />
      <i
        v-else-if="statusIcon(section.status)"
        class="ti section-progress__icon"
        :class="statusIcon(section.status)!"
        aria-hidden="true"
      />
      <AppBadge
        :variant="badgeVariant(section.status)"
        :label="statusLabel(section)"
      />
    </div>
  </div>
</template>

<style scoped>
.section-progress {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}

.section-progress__item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  pointer-events: none;
  user-select: none;
}

.section-progress__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  animation: timer-pulse 1.2s ease-in-out infinite;
  flex-shrink: 0;
}

.section-progress__icon {
  font-size: var(--text-sm);
  line-height: 1;
}

.section-progress__item--completed .section-progress__icon {
  color: var(--color-success);
}

.section-progress__item--auto_closed .section-progress__icon {
  color: var(--color-danger);
}
</style>
