<script setup lang="ts">
const store = useAdminStore()
const toast = useToastStore()

function testName(testId: string): string {
  return store.tests.find((t) => t.id === testId)?.name ?? '—'
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString()
}

async function createGroup() {
  try {
    const group = await store.createGroup({
      name: 'New Group',
      testId: '',
      startTime: '',
      endTime: '',
      certificateDelayHours: 48,
      userIds: [],
    })
    toast.show('Group created', 'success')
    await navigateTo(`/admin/groups/${group.id}`)
  } catch (err) {
    toast.show(err instanceof Error ? err.message : 'Failed to create group', 'danger')
  }
}

async function deleteGroup(id: string) {
  if (!confirm('Delete this group?')) return
  try {
    await store.deleteGroup(id)
    toast.show('Group deleted', 'success')
  } catch (err) {
    toast.show(err instanceof Error ? err.message : 'Failed to delete group', 'danger')
  }
}

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'test', label: 'Test' },
  { key: 'dates', label: 'Dates' },
  { key: 'users', label: 'Users' },
  { key: 'actions', label: 'Actions' },
]
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-heading">Groups</h1>
      <AppButton variant="primary" size="md" @click="createGroup">
        <i class="ti ti-plus" /> Create group
      </AppButton>
    </div>

    <DataTable :columns="columns" :rows="store.groups">
      <template #cell-test="{ row }">
        {{ testName(row.testId) }}
      </template>
      <template #cell-dates="{ row }">
        <span class="date-range">{{ formatDate(row.startTime) }} — {{ formatDate(row.endTime) }}</span>
      </template>
      <template #cell-users="{ row }">
        {{ row.userIds.length }}
      </template>
      <template #cell-actions="{ row }">
        <div class="actions-cell">
          <AppButton variant="ghost" size="sm" @click="navigateTo(`/admin/groups/${row.id}`)"><i class="ti ti-edit" /> Edit</AppButton>
          <AppButton variant="ghost" size="sm" class="delete-ghost" @click="deleteGroup(row.id)"><i class="ti ti-trash" /> Delete</AppButton>
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

.date-range {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
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
