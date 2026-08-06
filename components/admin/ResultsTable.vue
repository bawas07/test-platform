<script setup lang="ts">
import type { AdminAttempt } from '~/types/admin'

const props = defineProps<{
  attempts: AdminAttempt[]
  sectionNames: string[]
}>()

const adminStore = useAdminStore()

function studentName(userId: string): string {
  const user = adminStore.users.find((u) => u.id === userId)
  return user?.name ?? userId
}

function sectionDisplay(
  attempt: AdminAttempt,
  sectionName: string,
): string {
  const score = attempt.sectionScores.find((s) => s.sectionName === sectionName)
  if (!score) return '—'
  return `${score.score}/${score.maxScore}`
}

const hasData = computed(() => props.attempts.length > 0)
</script>

<template>
  <div class="results-table">
    <div v-if="hasData" class="results-table__scroll">
      <table class="results-table__table">
        <thead>
          <tr>
            <th class="results-table__th">Student</th>
            <th
              v-for="sectionName in sectionNames"
              :key="sectionName"
              class="results-table__th"
            >
              {{ sectionName }}
            </th>
            <th class="results-table__th results-table__th--total">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="attempt in attempts" :key="attempt.id" class="results-table__row">
            <td class="results-table__td results-table__td--name">
              {{ studentName(attempt.userId) }}
            </td>
            <td
              v-for="sectionName in sectionNames"
              :key="sectionName"
              class="results-table__td"
            >
              {{ sectionDisplay(attempt, sectionName) }}
            </td>
            <td class="results-table__td results-table__td--total">
              <span class="results-table__total-score">{{ attempt.totalScore }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="results-table__empty">
      <i class="ti ti-chart-bar results-table__empty-icon" aria-hidden="true" />
      <p class="results-table__empty-text">No results yet</p>
    </div>
  </div>
</template>

<style scoped>
.results-table {
  width: 100%;
}

.results-table__scroll {
  overflow-x: auto;
}

.results-table__table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

.results-table__th {
  text-align: left;
  padding: var(--space-3) var(--space-4);
  border-bottom: 2px solid var(--color-border);
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: var(--text-xs);
}

.results-table__th--total {
  text-align: center;
}

.results-table__td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.results-table__td--name {
  font-weight: 500;
}

.results-table__td--total {
  text-align: center;
}

.results-table__row:hover {
  background-color: var(--color-bg-page);
}

.results-table__total-score {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  padding: var(--space-1) var(--space-2);
  background-color: var(--color-bg-tint);
  color: var(--color-primary-dark);
  border-radius: var(--radius-full);
  font-weight: 600;
  font-size: var(--text-xs);
}

/* Empty state */
.results-table__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-4);
  color: var(--color-text-muted);
}

.results-table__empty-icon {
  font-size: 40px;
  margin-bottom: var(--space-3);
  opacity: 0.5;
}

.results-table__empty-text {
  margin: 0;
  font-size: var(--text-sm);
}
</style>
