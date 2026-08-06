<script setup lang="ts">
import type { AdminTest, TestSectionAssignment, ScoringMode } from '~/types/admin'

const store = useAdminStore()
const toast = useToastStore()
const route = useRoute()

const testId = computed(() => route.params.id as string)
const test = computed(() => store.tests.find((t) => t.id === testId.value))

// Local editable copy
const localName = ref('')
const localScoringMode = ref<ScoringMode>('SUM')
const localAssignments = ref<TestSectionAssignment[]>([])

watch(
  test,
  (t) => {
    if (!t) return
    localName.value = t.name
    localScoringMode.value = t.scoringMode
    localAssignments.value = t.sectionAssignments.map((a) => ({ ...a }))
  },
  { immediate: true },
)

// Get section name by ID
function sectionName(sectionId: string): string {
  const sec = store.sections.find((s) => s.id === sectionId)
  return sec?.displayName ?? sectionId
}

// Assigned section objects for DragList
const assignedSections = computed(() =>
  localAssignments.value.map((a) => {
    const sec = store.sections.find((s) => s.id === a.sectionId)
    return { id: a.sectionId, name: sec?.displayName ?? a.sectionId, weight: a.weight }
  }),
)

const availableSections = computed(() =>
  store.sections.filter(
    (s) => !localAssignments.value.some((a) => a.sectionId === s.id),
  ),
)

const SCORING_OPTIONS: { value: ScoringMode; label: string }[] = [
  { value: 'SUM', label: 'Sum' },
  { value: 'LOWEST_SECTION', label: 'Lowest Section' },
  { value: 'HIGHEST_SECTION', label: 'Highest Section' },
  { value: 'PERCENTAGE', label: 'Percentage' },
]

// Weight helpers
const weightTotal = computed(() =>
  localAssignments.value.reduce((sum, a) => sum + (a.weight ?? 0), 0),
)

const weightsValid = computed(() => {
  if (localScoringMode.value !== 'PERCENTAGE') return true
  return weightTotal.value === 100
})

function addSection(sectionId: string) {
  const nextOrder = localAssignments.value.length + 1
  localAssignments.value = [
    ...localAssignments.value,
    { sectionId, order: nextOrder, weight: 0 },
  ]
}

function removeSection(sectionId: string) {
  localAssignments.value = localAssignments.value
    .filter((a) => a.sectionId !== sectionId)
    .map((a, i) => ({ ...a, order: i + 1 }))
}

function updateWeight(sectionId: string, weight: number) {
  localAssignments.value = localAssignments.value.map((a) =>
    a.sectionId === sectionId ? { ...a, weight } : a,
  )
}

function onReorder(items: Array<{ id: string; name: string; weight?: number }>) {
  localAssignments.value = items.map((item, i) => {
    const existing = localAssignments.value.find((a) => a.sectionId === item.id)
    return { sectionId: item.id, order: i + 1, weight: existing?.weight ?? 0 }
  })
}

async function saveTest() {
  if (localScoringMode.value === 'PERCENTAGE' && !weightsValid.value) {
    toast.show(`Weights must sum to 100% (currently: ${weightTotal.value}%)`, 'danger')
    return
  }
  try {
    await store.updateTest(testId.value, {
      name: localName.value,
      scoringMode: localScoringMode.value,
      sectionAssignments: localAssignments.value,
    })
    toast.show('Test saved', 'success')
  } catch (err) {
    toast.show(err instanceof Error ? err.message : 'Failed to save test', 'danger')
  }
}

async function deleteThis() {
  if (!confirm('Delete this test?')) return
  try {
    await store.deleteTest(testId.value)
    toast.show('Test deleted', 'success')
    await navigateTo('/admin/tests')
  } catch (err) {
    toast.show(err instanceof Error ? err.message : 'Failed to delete test', 'danger')
  }
}
</script>

<template>
  <div v-if="!test" class="not-found">
    <p>Test not found.</p>
    <NuxtLink to="/admin/tests" class="back-link">← Back to tests</NuxtLink>
  </div>

  <div v-else>
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-heading">Test: {{ test.name }}</h1>
      <div class="header-actions">
        <AppButton variant="primary" @click="saveTest">Save</AppButton>
        <AppButton variant="danger" @click="deleteThis">Delete</AppButton>
      </div>
    </div>

    <!-- Form Card -->
    <AppCard padding="md" class="form-card">
      <AppInput v-model="localName" label="Name" />

      <div class="scoring-field">
        <label class="field-label">Scoring mode</label>
        <select v-model="localScoringMode" class="styled-select">
          <option
            v-for="opt in SCORING_OPTIONS"
            :key="opt.value"
            :value="opt.value"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>
    </AppCard>

    <!-- Sections Card -->
    <AppCard padding="md" class="form-card">
      <h2 class="card-heading">Sections</h2>

      <DragList
        :items="assignedSections"
        item-key="id"
        @reorder="onReorder"
      >
        <template #item="{ item: secItem }">
          <div class="drag-item-row">
            <span class="drag-item-text">{{ secItem.name }}</span>
            <template v-if="localScoringMode === 'PERCENTAGE'">
              <input
                type="number"
                class="weight-input"
                :value="secItem.weight"
                min="0"
                max="100"
                placeholder="Weight %"
                @input="updateWeight(secItem.id, Number(($event.target as HTMLInputElement).value))"
              >
            </template>
            <button
              type="button"
              class="item-remove-btn"
              aria-label="Remove section"
              @click="removeSection(secItem.id)"
            >
              ×
            </button>
          </div>
        </template>
      </DragList>

      <div v-if="assignedSections.length === 0" class="empty-hint">
        No sections assigned yet.
      </div>

      <!-- Weight validation -->
      <p
        v-if="localScoringMode === 'PERCENTAGE' && !weightsValid"
        class="weight-error"
      >
        Weights must sum to 100% (currently: {{ weightTotal }}%)
      </p>

      <!-- Available sections -->
      <div v-if="availableSections.length > 0" class="available-section">
        <h3 class="available-heading">Available sections</h3>
        <div class="available-list">
          <button
            v-for="sec in availableSections"
            :key="sec.id"
            type="button"
            class="add-section-btn"
            @click="addSection(sec.id)"
          >
            + {{ sec.displayName }}
          </button>
        </div>
      </div>
    </AppCard>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
  gap: var(--space-3);
}

.page-heading {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.header-actions {
  display: flex;
  gap: var(--space-3);
}

.form-card {
  margin-bottom: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.card-heading {
  margin: 0 0 var(--space-1);
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

.scoring-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.field-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}

.styled-select {
  height: 40px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-card);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-family: inherit;
  outline: none;
  cursor: pointer;
}

.styled-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 35%, transparent);
}

.drag-item-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
}

.drag-item-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.weight-input {
  width: 80px;
  height: 30px;
  padding: 0 var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-page);
  color: var(--color-text-primary);
  font-size: var(--text-xs);
  font-family: inherit;
  outline: none;
  text-align: center;
}

.weight-input:focus {
  border-color: var(--color-primary);
}

.item-remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 16px;
  cursor: pointer;
  flex-shrink: 0;
}

.item-remove-btn:hover {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
}

.empty-hint {
  padding: var(--space-4) 0 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  text-align: center;
}

.weight-error {
  margin: var(--space-3) 0 0;
  font-size: var(--text-sm);
  color: var(--color-danger);
  font-weight: 500;
}

.available-section {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.available-heading {
  margin: 0 0 var(--space-2);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.available-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.add-section-btn {
  display: block;
  width: 100%;
  text-align: left;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-family: inherit;
  cursor: pointer;
  transition: border-color 150ms ease, background-color 150ms ease;
}

.add-section-btn:hover {
  border-color: var(--color-primary);
  background-color: var(--color-bg-tint);
}

.not-found {
  text-align: center;
  padding: var(--space-12) 0;
  color: var(--color-text-muted);
}

.back-link {
  color: var(--color-primary);
  text-decoration: none;
  font-size: var(--text-sm);
}

.back-link:hover {
  text-decoration: underline;
}
</style>
