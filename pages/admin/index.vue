<script setup lang="ts">
const store = useAdminStore()

const stats = computed(() => store.getDashboardStats())
const recentAttempts = computed(() => store.getRecentAttempts(5))

function studentName(userId: string): string {
  return store.users.find((u) => u.id === userId)?.name ?? userId
}

function groupForAttempt(attempt: (typeof recentAttempts.value)[0]) {
  return store.groups.find((g) => g.id === attempt.groupId)
}

function testForGroup(groupId: string): string {
  const group = store.groups.find((g) => g.id === groupId)
  if (!group) return '—'
  return store.tests.find((t) => t.id === group.testId)?.name ?? '—'
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString()
}

function statusBadge(status: string): { label: string; variant: 'success' | 'primary' | 'neutral' } {
  if (status === 'completed') return { label: 'Completed', variant: 'success' }
  if (status === 'in_progress') return { label: 'In Progress', variant: 'primary' }
  return { label: status, variant: 'neutral' }
}
</script>

<template>
  <div>
    <h1 class="page-heading">Dashboard</h1>

    <!-- Summary Cards -->
    <div class="stats-row">
      <AppCard padding="md" class="stat-card">
        <p class="stat-label">Total Groups</p>
        <p class="stat-value">{{ stats.groupCount }}</p>
      </AppCard>
      <AppCard padding="md" class="stat-card">
        <p class="stat-label">Active Tests</p>
        <p class="stat-value">{{ stats.activeTestCount }}</p>
      </AppCard>
      <AppCard padding="md" class="stat-card">
        <p class="stat-label">Total Students</p>
        <p class="stat-value">{{ stats.studentCount }}</p>
      </AppCard>
    </div>

    <!-- Recent Attempts -->
    <h2 class="section-heading">Recent Attempts</h2>
    <div v-if="recentAttempts.length === 0" class="empty-state">
      <i class="ti ti-clipboard-text empty-state-icon" aria-hidden="true" />
      <p>No attempts recorded yet.</p>
    </div>
    <div v-else class="table-wrap">
      <table class="simple-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Test</th>
            <th>Group</th>
            <th>Status</th>
            <th>Total Score</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="attempt in recentAttempts" :key="attempt.id">
            <td>{{ studentName(attempt.userId) }}</td>
            <td>{{ testForGroup(attempt.groupId) }}</td>
            <td>{{ groupForAttempt(attempt)?.name ?? '—' }}</td>
            <td>
              <AppBadge
                :label="statusBadge(attempt.status).label"
                :variant="statusBadge(attempt.status).variant"
              />
            </td>
            <td>{{ attempt.totalScore }}</td>
            <td>{{ formatDate(attempt.completedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.page-heading {
  margin: 0 0 var(--space-6);
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.stats-row {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.stat-card {
  flex: 1;
}

.stat-label {
  margin: 0 0 var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.stat-value {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.section-heading {
  margin: 0 0 var(--space-4);
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

.table-wrap {
  overflow-x: auto;
}

.simple-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

.simple-table th {
  text-align: left;
  padding: var(--space-3) var(--space-4);
  border-bottom: 2px solid var(--color-border);
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: var(--text-xs);
}

.simple-table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.simple-table tbody tr:hover {
  background-color: var(--color-bg-page);
}

.empty-state {
  text-align: center;
  padding: var(--space-8);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.empty-state-icon {
  font-size: 40px;
  margin-bottom: var(--space-3);
  opacity: 0.5;
  color: var(--color-text-muted);
  display: block;
}

@media (max-width: 639px) {
  .stats-row {
    flex-direction: column;
  }
}
</style>
