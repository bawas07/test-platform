<script setup lang="ts">
import type { AdminQuestion, AdminSection, ScoreMapRow } from '~/types/admin'

const store = useAdminStore()
const toast = useToastStore()
const route = useRoute()

const sectionId = computed(() => route.params.id as string)
const section = computed(() => store.sections.find((s) => s.id === sectionId.value))
const isViewMode = computed(() => route.query.view === '1')

// Local editable copy
const localSectionKey = ref('')
const localDisplayName = ref('')
const localTimeLimit = ref(0)
const localMaxScore = ref(0)
const localRandomize = ref(false)
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
    localScoreMap.value = sec.scoreMap.map((r) => ({ ...r }))
  },
  { immediate: true },
)

const sectionQuestions = computed(() =>
  store.questions.filter((q) => q.sectionId === sectionId.value),
)

function openAddQuestion() {
  navigateTo({ path: '/admin/questions', query: { section: sectionId.value } })
}

function openEditQuestion(question: AdminQuestion) {
  navigateTo({ path: '/admin/questions', query: { section: sectionId.value } })
}

async function deleteSectionQuestion(questionId: string) {
  if (!confirm('Remove this question from the section?')) return
  await store.deleteQuestion(questionId)
  toast.show('Question deleted', 'success')
}

async function saveSection() {
  try {
    await store.updateSection(sectionId.value, {
      sectionKey: localSectionKey.value,
      displayName: localDisplayName.value,
      timeLimit: localTimeLimit.value,
      maxScore: localMaxScore.value,
      randomize: localRandomize.value,
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

function testsForSection(sectionId: string) {
  return store.tests.filter((t) => t.sectionAssignments.some((a) => a.sectionId === sectionId))
}

function groupsForSection(sectionId: string) {
  return store.groups.filter((g) => {
    const test = store.tests.find((t) => t.id === g.testId)
    return test?.sectionAssignments.some((a) => a.sectionId === sectionId)
  })
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
      <h1 class="page-heading">Section: {{ section.displayName || section.sectionKey }} <span v-if="isViewMode" class="view-badge">(View only)</span></h1>
      <div v-if="!isViewMode" class="header-actions">
        <AppButton variant="primary" @click="saveSection">Save</AppButton>
        <AppButton variant="danger" @click="deleteThis">Delete</AppButton>
      </div>
    </div>

    <!-- Form Card -->
    <AppCard v-if="!isViewMode" padding="md" class="form-card">
      <AppInput v-model="localSectionKey" label="Section key" />
      <AppInput v-model="localDisplayName" label="Display name" />
      <AppInput v-model.number="localTimeLimit" label="Time limit (minutes)" type="number" />
      <AppInput v-model.number="localMaxScore" label="Max score" type="number" />
      <label class="toggle-label">
        <input v-model="localRandomize" type="checkbox" class="toggle-checkbox">
        Randomize questions
      </label>
    </AppCard>

    <!-- View-mode detail card -->
    <AppCard v-else padding="md" class="form-card">
      <dl class="detail-list">
        <div class="detail-row">
          <dt class="detail-label">Section key</dt>
          <dd class="detail-value">{{ localSectionKey || '—' }}</dd>
        </div>
        <div class="detail-row">
          <dt class="detail-label">Display name</dt>
          <dd class="detail-value">{{ localDisplayName }}</dd>
        </div>
        <div class="detail-row">
          <dt class="detail-label">Time limit</dt>
          <dd class="detail-value">{{ localTimeLimit }} minutes</dd>
        </div>
        <div class="detail-row">
          <dt class="detail-label">Max score</dt>
          <dd class="detail-value">{{ localMaxScore }}</dd>
        </div>
        <div class="detail-row">
          <dt class="detail-label">Randomize</dt>
          <dd class="detail-value">
            <AppBadge :label="localRandomize ? 'Yes' : 'No'" :variant="localRandomize ? 'primary' : 'neutral'" />
          </dd>
        </div>
      </dl>
    </AppCard>

    <!-- Questions Card -->
    <AppCard padding="md" class="form-card">
      <h2 class="card-heading">Questions</h2>

      <template v-if="!isViewMode">
        <div v-if="sectionQuestions.length > 0" class="question-edit-list">
          <div v-for="(q, idx) in sectionQuestions" :key="q.id" class="question-edit-row">
            <span class="question-edit-index">{{ idx + 1 }}.</span>
            <span class="question-edit-text">{{ q.text.length > 60 ? q.text.slice(0, 60) + '…' : q.text }}</span>
            <AppButton variant="ghost" size="sm" @click="openEditQuestion(q)"><i class="ti ti-edit" /></AppButton>
            <AppButton variant="ghost" size="sm" class="delete-ghost" @click="deleteSectionQuestion(q.id)"><i class="ti ti-trash" /></AppButton>
          </div>
        </div>
        <div v-else class="empty-hint">No questions yet.</div>

        <AppButton variant="secondary" size="sm" class="add-question-inline" @click="openAddQuestion">
          <i class="ti ti-plus" /> Add question
        </AppButton>
      </template>

      <template v-else>
        <ol v-if="sectionQuestions.length > 0" class="question-view-list">
          <li v-for="q in sectionQuestions" :key="q.id" class="question-view-item">{{ q.text }}</li>
        </ol>
        <div v-else class="empty-hint">No questions assigned.</div>
      </template>
    </AppCard>

    <!-- Score Conversion Card -->
    <AppCard padding="md" class="form-card">
      <h2 class="card-heading">Score conversion table</h2>
      <ScoreMapEditor v-model="localScoreMap" :disabled="isViewMode" />
    </AppCard>

    <!-- Related: part of tests / groups -->
    <div v-if="isViewMode" class="related-section">
      <AppCard padding="md">
        <h2 class="card-heading">Part of tests</h2>
        <div v-if="testsForSection(sectionId).length === 0" class="related-empty">Not assigned to any test</div>
        <div v-else class="related-list">
          <button
            v-for="t in testsForSection(sectionId)"
            :key="t.id"
            type="button"
            class="related-link"
            @click="navigateTo(`/admin/tests/${t.id}`)"
          >
            {{ t.name }}
          </button>
        </div>

        <h2 class="card-heading" style="margin-top: var(--space-5)">Part of groups</h2>
        <div v-if="groupsForSection(sectionId).length === 0" class="related-empty">Not assigned to any group</div>
        <div v-else class="related-list">
          <button
            v-for="g in groupsForSection(sectionId)"
            :key="g.id"
            type="button"
            class="related-link"
            @click="navigateTo(`/admin/groups/${g.id}`)"
          >
            {{ g.name }}
          </button>
        </div>
      </AppCard>
    </div>
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

.delete-ghost {
  color: var(--color-danger);
}

.delete-ghost:hover {
  color: var(--color-danger);
  background-color: var(--color-danger-bg);
}

.question-edit-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.question-edit-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-page);
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
}

.question-edit-index {
  color: var(--color-text-muted);
  font-weight: 500;
  min-width: 24px;
}

.question-edit-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.add-question-inline {
  align-self: flex-start;
}

.empty-hint {
  padding: var(--space-4) 0 0;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  text-align: center;
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

.view-badge {
  font-size: var(--text-xs);
  font-weight: 400;
  color: var(--color-text-muted);
}

.related-section {
  margin-top: var(--space-5);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.related-empty {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.related-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.related-link {
  display: block;
  width: 100%;
  text-align: left;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-card);
  color: var(--color-primary);
  font-size: var(--text-sm);
  font-family: inherit;
  cursor: pointer;
  transition: border-color 150ms ease, background-color 150ms ease;
}

.related-link:hover {
  border-color: var(--color-primary);
  background-color: var(--color-bg-tint);
}

.detail-list {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.detail-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
}

.detail-label {
  width: 120px;
  flex-shrink: 0;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.detail-value {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}

.question-view-list {
  margin: 0;
  padding-left: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.question-view-item {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  line-height: 1.5;
}
</style>
