<script setup lang="ts">
const store = useAdminStore()
const toast = useToastStore()

// Filters
const searchQuery = ref('')
const filterTest = ref('')

const filteredGroups = computed(() => {
  let list = store.groups

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    list = list.filter((g) => g.name.toLowerCase().includes(query))
  }

  if (filterTest.value) {
    list = list.filter((g) => g.testId === filterTest.value)
  }

  return list
})

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

    <div class="filter-bar">
      <AppInput
        v-model="searchQuery"
        placeholder="Search by name…"
        class="filter-search"
      />
      <select v-model="filterTest" class="styled-select filter-select">
        <option value="">All tests</option>
        <option v-for="t in store.tests" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>
    </div>

    <DataTable :columns="columns" :rows="filteredGroups" :empty-message="store.groups.length ? 'No groups match the current filters' : undefined">
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
          <AppButton variant="ghost" size="sm" @click="navigateTo(`/admin/groups/${row.id}`)"><i class="ti ti-eye" /> View</AppButton>
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

.filter-bar {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
  flex-wrap: wrap;
}

.filter-search {
  flex: 1 1 220px;
  min-width: 180px;
}

.filter-select,
.styled-select {
  flex: 0 0 auto;
  min-width: 150px;
  height: 40px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-family: inherit;
}

.filter-select:focus,
.styled-select:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-primary);
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
