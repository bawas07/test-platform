<script setup lang="ts">
import type { AdminSection, ScoreMapRow } from '~/types/admin'

const store = useAdminStore()
const toast = useToastStore()
const route = useRoute()

const sectionId = computed(() => route.params.id as string)
const section = computed(() => store.sections.find((s) => s.id === sectionId.value))

// Local editable copy
const localSectionKey = ref('')
const localDisplayName = ref('')
const localTimeLimit = ref(0)
const localMaxScore = ref(0)
const localRandomize = ref(false)
const localQuestionIds = ref<string[]>([])
const localScoreMap = ref<ScoreMapRow[]>([])

// Sync from store when section changes
watch(
  section,
  (sec) => {
    if (!sec) return
    localSectionKey.value = sec.sectionKey
    localDisplayName.value = sec.displayName
    localTimeLimit.value = sec.timeLimit
    localMaxScore.value = sec.maxScore
    localRandomize.value = sec.randomize
    localQuestionIds.value = [...sec.questionIds]
    localScoreMap.value = sec.scoreMap.map((r) => ({ ...r }))
  },
  { immediate: true },
)

// Assigned questions (objects)
const assignedQuestions = computed(() =>
  localQuestionIds.value
    .map((id) => store.questions.find((q) => q.id === id))
    .filter(Boolean) as Array<{ id: string; text: string }>,
)

// Unassigned questions
const availableQuestions = computed(() =>
  store.questions.filter((q) => !localQuestionIds.value.includes(q.id)),
)

function addQuestion(questionId: string) {
  localQuestionIds.value = [...localQuestionIds.value, questionId]
}

function removeQuestion(questionId: string) {
  localQuestionIds.value = localQuestionIds.value.filter((id) => id !== questionId)
}

function onReorder(items: Array<{ id: string; text: string }>) {
  localQuestionIds.value = items.map((item) => item.id)
}

async function saveSection() {
  try {
    await store.updateSection(sectionId.value, {
      sectionKey: localSectionKey.value,
      displayName: localDisplayName.value,
      timeLimit: localTimeLimit.value,
      maxScore: localMaxScore.value,
      randomize: localRandomize.value,
      questionIds: localQuestionIds.value,
      scoreMap: localScoreMap.value,
    })
    toast.show('Section saved', 'success')
  } catch (err) {
    toast.show(err instanceof Error ? err.message : 'Failed to save section', 'danger')
  }
}

async function deleteThis() {
  if (!confirm('Delete this section?')) return
  try {
    await store.deleteSection(sectionId.value)
    toast.show('Section deleted', 'success')
    await navigateTo('/admin/sections')
  } catch (err) {
    toast.show(err instanceof Error ? err.message : 'Failed to delete section', 'danger')
  }
}
</script>

<template>
  <div v-if="!section" class="not-found">
    <p>Section not found.</p>
    <NuxtLink to="/admin/sections" class="back-link">← Back to sections</NuxtLink>
  </div>

  <div v-else>
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-heading">Section: {{ section.displayName || section.sectionKey }}</h1>
      <div class="header-actions">
        <AppButton variant="primary" @click="saveSection">Save</AppButton>
        <AppButton variant="danger" @click="deleteThis">Delete</AppButton>
      </div>
    </div>

    <!-- Form Card -->
    <AppCard padding="md" class="form-card">
      <AppInput v-model="localSectionKey" label="Section key" />
      <AppInput v-model="localDisplayName" label="Display name" />
      <AppInput v-model.number="localTimeLimit" label="Time limit (minutes)" type="number" />
      <AppInput v-model.number="localMaxScore" label="Max score" type="number" />
      <label class="toggle-label">
        <input v-model="localRandomize" type="checkbox" class="toggle-checkbox">
        Randomize questions
      </label>
    </AppCard>

    <!-- Questions Card -->
    <AppCard padding="md" class="form-card">
      <h2 class="card-heading">Questions</h2>
      <p v-if="localRandomize" class="randomize-notice">
        Questions are randomized; drag ordering is disabled.
      </p>

      <DragList
        :items="assignedQuestions"
        item-key="id"
        :disabled="localRandomize"
        @reorder="onReorder"
      >
        <template #item="{ item }">
          <div class="drag-item-row">
            <span class="drag-item-text">{{ item.text }}</span>
            <button
              type="button"
              class="item-remove-btn"
              aria-label="Remove question"
              @click="removeQuestion(item.id)"
            >
              ×
            </button>
          </div>
        </template>
      </DragList>

      <div v-if="assignedQuestions.length === 0" class="empty-hint">
        No questions assigned yet.
      </div>

      <!-- Available questions -->
      <div v-if="availableQuestions.length > 0" class="available-section">
        <h3 class="available-heading">Available questions</h3>
        <div class="available-list">
          <button
            v-for="q in availableQuestions"
            :key="q.id"
            type="button"
            class="add-question-btn"
            @click="addQuestion(q.id)"
          >
            + {{ q.text.length > 60 ? q.text.slice(0, 60) + '…' : q.text }}
          </button>
        </div>
      </div>
    </AppCard>

    <!-- Score Conversion Card -->
    <AppCard padding="md" class="form-card">
      <h2 class="card-heading">Score conversion table</h2>
      <ScoreMapEditor v-model="localScoreMap" />
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

.toggle-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  cursor: pointer;
}

.toggle-checkbox {
  accent-color: var(--color-primary);
  cursor: pointer;
}

.randomize-notice {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-style: italic;
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

.add-question-btn {
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

.add-question-btn:hover {
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
