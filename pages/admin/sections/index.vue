<script setup lang="ts">
const store = useAdminStore()
const toast = useToastStore()
const route = useRoute()

// Filters
const searchQuery = ref('')
const filterTest = ref<string>('')

const filteredSections = computed(() => {
  let list = store.sections

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(
      (s) =>
        s.displayName.toLowerCase().includes(q) ||
        s.sectionKey.toLowerCase().includes(q),
    )
  }

  if (filterTest.value) {
    const test = store.tests.find((t) => t.id === filterTest.value)
    if (test) {
      const ids = new Set(test.sectionAssignments.map((a) => a.sectionId))
      list = list.filter((s) => ids.has(s.id))
    }
  }

  return list
})

function testCount(sectionId: string): number {
  return store.tests.filter((t) =>
    t.sectionAssignments.some((a) => a.sectionId === sectionId),
  ).length
}

function goToQuestions(sectionId: string) {
  navigateTo({ path: '/admin/questions', query: { section: sectionId } })
}

async function goToDetail(id: string) {
  await navigateTo(`/admin/sections/${id}`)
}

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

const columns = [
  { key: 'displayName', label: 'Name' },
  { key: 'sectionKey', label: 'Identifier' },
  { key: 'questions', label: 'Questions' },
  { key: 'testCount', label: 'Part of test' },
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

    <div class="filter-bar">
      <AppInput
        v-model="searchQuery"
        placeholder="Search by name or key…"
        class="filter-search"
      />
      <select v-model="filterTest" class="styled-select filter-select">
        <option value="">All tests</option>
        <option v-for="t in store.tests" :key="t.id" :value="t.id">{{ t.name }}</option>
      </select>
    </div>

    <DataTable :columns="columns" :rows="filteredSections" :empty-message="store.sections.length ? 'No sections match the current filters' : undefined">
      <template #cell-displayName="{ row }">
        {{ row.displayName }}
      </template>
      <template #cell-sectionKey="{ row }">
        <code class="key-code">{{ row.sectionKey || '—' }}</code>
      </template>
      <template #cell-questions="{ row }">
        <button class="link-btn" @click="goToQuestions(row.id)">
          {{ row.questionIds.length }} question{{ row.questionIds.length !== 1 ? 's' : '' }}
        </button>
      </template>
      <template #cell-testCount="{ row }">
        {{ testCount(row.id) || '—' }}
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

.filter-select {
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

.filter-select:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-primary);
}

.key-code {
  font-size: var(--text-xs);
  background: var(--color-bg-page);
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
}

.link-btn {
  display: inline;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-primary);
  font-size: var(--text-sm);
  font-family: inherit;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.link-btn:hover {
  color: var(--color-primary-dark);
}
</style>
