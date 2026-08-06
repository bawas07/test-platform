<script setup lang="ts">
import type { AdminQuestion, AdminQuestionOption } from '~/types/admin'

const store = useAdminStore()
const toast = useToastStore()
const route = useRoute()

const showModal = ref(false)
const editingId = ref<string | null>(null)

// Form state
const formText = ref('')
const formAudioUrl = ref('')
const formOptions = ref<{ id: string; label: string; text: string }[]>([])
const correctOptionId = ref('')

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

// Filters
const searchQuery = ref('')
const filterSection = ref<string>((route.query.section as string) || '')
const filterAudio = ref<string>('')

const filteredQuestions = computed(() => {
  let list = store.questions

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    list = list.filter((q) => q.text.toLowerCase().includes(query))
  }

  if (filterSection.value) {
    const section = store.sections.find((s) => s.id === filterSection.value)
    if (section) {
      const ids = new Set(section.questionIds)
      list = list.filter((q) => ids.has(q.id))
    }
  }

  if (filterAudio.value === 'yes') {
    list = list.filter((q) => q.audioUrl)
  } else if (filterAudio.value === 'no') {
    list = list.filter((q) => !q.audioUrl)
  }

  return list
})

function openCreate() {
  editingId.value = null
  formText.value = ''
  formAudioUrl.value = ''
  formOptions.value = [
    { id: crypto.randomUUID(), label: 'A', text: '' },
    { id: crypto.randomUUID(), label: 'B', text: '' },
  ]
  correctOptionId.value = formOptions.value[0].id
  showModal.value = true
}

function openEdit(question: AdminQuestion) {
  editingId.value = question.id
  formText.value = question.text
  formAudioUrl.value = question.audioUrl ?? ''
  formOptions.value = question.options.map((o) => ({ ...o }))
  correctOptionId.value = question.correctOptionId
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingId.value = null
}

function addOption() {
  if (formOptions.value.length >= 6) return
  const nextLabel = LABELS[formOptions.value.length]
  formOptions.value.push({
    id: crypto.randomUUID(),
    label: nextLabel,
    text: '',
  })
}

function removeOption(index: number) {
  if (formOptions.value.length <= 2) return
  const removed = formOptions.value[index]
  formOptions.value.splice(index, 1)
  // Reassign labels
  formOptions.value.forEach((opt, i) => {
    opt.label = LABELS[i]
  })
  // If the removed option was the correct one, reset to first
  if (correctOptionId.value === removed.id) {
    correctOptionId.value = formOptions.value[0].id
  }
}

async function saveQuestion() {
  if (!formText.value.trim()) return
  if (formOptions.value.some((o) => !o.text.trim())) return

  const options: AdminQuestionOption[] = formOptions.value.map((o) => ({
    id: o.id,
    label: o.label,
    text: o.text.trim(),
  }))

  const data = {
    text: formText.value.trim(),
    audioUrl: formAudioUrl.value.trim() || null,
    options,
    correctOptionId: correctOptionId.value,
  }

  try {
    if (editingId.value) {
      await store.updateQuestion(editingId.value, data)
      toast.show('Question updated', 'success')
    } else {
      await store.createQuestion(data)
      toast.show('Question created', 'success')
    }
    closeModal()
  } catch (err) {
    toast.show(err instanceof Error ? err.message : 'Failed to save question', 'danger')
  }
}

async function deleteQuestion(id: string) {
  if (!confirm('Delete this question?')) return
  try {
    await store.deleteQuestion(id)
    toast.show('Question deleted', 'success')
  } catch (err) {
    toast.show(err instanceof Error ? err.message : 'Failed to delete question', 'danger')
  }
}

function correctLabel(question: AdminQuestion): string {
  return question.options.find((o) => o.id === question.correctOptionId)?.label ?? '?'
}

function truncateText(text: string, max: number = 60): string {
  return text.length > max ? text.slice(0, max) + '…' : text
}

const questionColumns = [
  { key: 'text', label: 'Text' },
  { key: 'options', label: 'Options' },
  { key: 'correct', label: 'Correct' },
  { key: 'audio', label: 'Audio' },
  { key: 'actions', label: 'Actions' },
]
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-heading">Questions</h1>
      <AppButton variant="primary" size="md" @click="openCreate">
        <i class="ti ti-plus" /> Add question
      </AppButton>
    </div>

    <div class="filter-bar">
      <AppInput
        v-model="searchQuery"
        placeholder="Search questions…"
        class="filter-search"
      />
      <select v-model="filterSection" class="styled-select filter-select">
        <option value="">All sections</option>
        <option v-for="s in store.sections" :key="s.id" :value="s.id">{{ s.displayName || s.sectionKey }}</option>
      </select>
      <select v-model="filterAudio" class="styled-select filter-select">
        <option value="">All audio</option>
        <option value="yes">Has audio</option>
        <option value="no">No audio</option>
      </select>
    </div>

    <DataTable :columns="questionColumns" :rows="filteredQuestions" :empty-message="store.questions.length ? 'No questions match the current filters' : undefined">
      <template #cell-text="{ row }">
        <span class="truncated-text">{{ truncateText(row.text) }}</span>
      </template>
      <template #cell-options="{ row }">
        {{ row.options.length }} options
      </template>
      <template #cell-correct="{ row }">
        {{ correctLabel(row) }}
      </template>
      <template #cell-audio="{ row }">
        <AppBadge :label="row.audioUrl ? 'Yes' : 'No'" :variant="row.audioUrl ? 'primary' : 'neutral'" />
      </template>
      <template #cell-actions="{ row }">
        <div class="actions-cell">
          <AppButton variant="ghost" size="sm" @click="openEdit(row)"><i class="ti ti-edit" /> Edit</AppButton>
          <AppButton variant="ghost" size="sm" class="delete-ghost" @click="deleteQuestion(row.id)"><i class="ti ti-trash" /> Delete</AppButton>
        </div>
      </template>
    </DataTable>

    <!-- Create / Edit Modal -->
    <AppModal v-model="showModal" :title="editingId ? 'Edit question' : 'Add question'" size="lg">
      <div class="modal-form">
        <AppInput v-model="formText" label="Question text" placeholder="Enter the question" />

        <fieldset class="options-fieldset">
          <legend class="options-legend">Options</legend>
          <div v-for="(opt, idx) in formOptions" :key="opt.id" class="option-row">
            <span class="option-label">{{ opt.label }}</span>
            <AppInput v-model="opt.text" :placeholder="`Option ${opt.label}`" class="option-input" />
            <button
              type="button"
              class="option-remove-btn"
              :disabled="formOptions.length <= 2"
              aria-label="Remove option"
              @click="removeOption(idx)"
            >
              ×
            </button>
          </div>
          <button
            type="button"
            class="add-option-btn"
            :disabled="formOptions.length >= 6"
            @click="addOption"
          >
            <i class="ti ti-plus" /> Add option
          </button>
        </fieldset>

        <fieldset class="correct-fieldset">
          <legend class="options-legend">Correct answer</legend>
          <div v-for="(opt, idx) in formOptions" :key="opt.id" class="radio-row">
            <input
              :id="`correct-${opt.id}`"
              v-model="correctOptionId"
              type="radio"
              :value="opt.id"
              class="radio-input"
            >
            <label :for="`correct-${opt.id}`" class="radio-label">
              {{ opt.label }} — {{ opt.text || '(empty)' }}
            </label>
          </div>
        </fieldset>

        <AppInput v-model="formAudioUrl" label="Audio URL" placeholder="Optional audio URL" />
      </div>

      <template #footer>
        <AppButton variant="ghost" @click="closeModal">Cancel</AppButton>
        <AppButton variant="primary" @click="saveQuestion">
          {{ editingId ? 'Save question' : 'Save question' }}
        </AppButton>
      </template>
    </AppModal>
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

.truncated-text {
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
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

/* Modal form */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.options-fieldset,
.correct-fieldset {
  border: none;
  padding: 0;
  margin: 0;
}

.options-legend {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
  padding: 0;
}

.option-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.option-label {
  width: 24px;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-align: center;
  flex-shrink: 0;
}

.option-input {
  flex: 1;
}

.option-remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 18px;
  cursor: pointer;
  flex-shrink: 0;
}

.option-remove-btn:hover:not(:disabled) {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
}

.option-remove-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.add-option-btn {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  font-family: inherit;
  cursor: pointer;
  margin-top: var(--space-1);
}

.add-option-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.add-option-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.radio-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.radio-input {
  accent-color: var(--color-primary);
  cursor: pointer;
}

.radio-label {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  cursor: pointer;
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
</style>
