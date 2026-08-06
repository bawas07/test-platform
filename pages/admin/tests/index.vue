<script setup lang="ts">
const store = useAdminStore()
const toast = useToastStore()

async function createTest() {
  try {
    const test = await store.createTest({
      name: 'New Test',
      scoringMode: 'SUM',
      sectionAssignments: [],
    })
    toast.show('Test created', 'success')
    await navigateTo(`/admin/tests/${test.id}`)
  } catch (err) {
    toast.show(err instanceof Error ? err.message : 'Failed to create test', 'danger')
  }
}

async function deleteTest(id: string) {
  if (!confirm('Delete this test?')) return
  try {
    await store.deleteTest(id)
    toast.show('Test deleted', 'success')
  } catch (err) {
    toast.show(err instanceof Error ? err.message : 'Failed to delete test', 'danger')
  }
}

function scoringBadge(mode: string): string {
  const map: Record<string, string> = {
    SUM: 'Sum',
    LOWEST_SECTION: 'Lowest Section',
    HIGHEST_SECTION: 'Highest Section',
    PERCENTAGE: 'Percentage',
  }
  return map[mode] ?? mode
}

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'scoringMode', label: 'Scoring Mode' },
  { key: 'sections', label: 'Sections' },
  { key: 'actions', label: 'Actions' },
]
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-heading">Tests</h1>
      <AppButton variant="primary" size="md" @click="createTest">
        <i class="ti ti-plus" /> Create test
      </AppButton>
    </div>

    <DataTable :columns="columns" :rows="store.tests">
      <template #cell-scoringMode="{ row }">
        <AppBadge :label="scoringBadge(row.scoringMode)" variant="primary" />
      </template>
      <template #cell-sections="{ row }">
        {{ row.sectionAssignments.length }}
      </template>
      <template #cell-actions="{ row }">
        <div class="actions-cell">
          <AppButton variant="ghost" size="sm" @click="navigateTo(`/admin/tests/${row.id}`)"><i class="ti ti-edit" /> Edit</AppButton>
          <AppButton variant="ghost" size="sm" class="delete-ghost" @click="deleteTest(row.id)"><i class="ti ti-trash" /> Delete</AppButton>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
}

.page-heading {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.actions-cell {
  display: flex;
  gap: var(--space-1);
}

.delete-ghost {
  color: var(--color-danger);
}

.delete-ghost:hover {
  color: var(--color-danger);
  background-color: var(--color-danger-bg);
}
</style>
