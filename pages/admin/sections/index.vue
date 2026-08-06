<script setup lang="ts">
const store = useAdminStore()
const toast = useToastStore()

async function createSection() {
  try {
    const section = await store.createSection({
      sectionKey: '',
      displayName: 'New section',
      timeLimit: 0,
      maxScore: 0,
      randomize: false,
      questionIds: [],
      scoreMap: [],
    })
    toast.show('Section created', 'success')
    await navigateTo(`/admin/sections/${section.id}`)
  } catch (err) {
    toast.show(err instanceof Error ? err.message : 'Failed to create section', 'danger')
  }
}

async function deleteSection(id: string) {
  if (!confirm('Delete this section?')) return
  try {
    await store.deleteSection(id)
    toast.show('Section deleted', 'success')
  } catch (err) {
    toast.show(err instanceof Error ? err.message : 'Failed to delete section', 'danger')
  }
}

function goToDetail(id: string) {
  navigateTo(`/admin/sections/${id}`)
}

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'timeLimit', label: 'Time Limit (min)' },
  { key: 'maxScore', label: 'Max Score' },
  { key: 'questions', label: 'Questions' },
  { key: 'randomize', label: 'Randomize' },
  { key: 'actions', label: 'Actions' },
]
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-heading">Sections</h1>
      <AppButton variant="primary" size="md" @click="createSection">
        <i class="ti ti-plus" /> Create section
      </AppButton>
    </div>

    <DataTable :columns="columns" :rows="store.sections">
      <template #cell-name="{ row }">
        {{ row.displayName }}
      </template>
      <template #cell-timeLimit="{ row }">
        {{ row.timeLimit }} min
      </template>
      <template #cell-questions="{ row }">
        {{ row.questionIds.length }}
      </template>
      <template #cell-randomize="{ row }">
        <AppBadge :label="row.randomize ? 'Yes' : 'No'" :variant="row.randomize ? 'primary' : 'neutral'" />
      </template>
      <template #cell-actions="{ row }">
        <div class="actions-cell">
          <AppButton variant="ghost" size="sm" @click="goToDetail(row.id)"><i class="ti ti-edit" /> Edit</AppButton>
          <AppButton variant="ghost" size="sm" class="delete-ghost" @click="deleteSection(row.id)"><i class="ti ti-trash" /> Delete</AppButton>
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
