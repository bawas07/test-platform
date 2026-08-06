<script setup lang="ts">
import type { ScoreMapRow } from '~/types/admin'

const props = withDefaults(
  defineProps<{
    modelValue: ScoreMapRow[]
    disabled?: boolean
    maxQuestions?: number
  }>(),
  {
    disabled: false,
    maxQuestions: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: ScoreMapRow[]]
}>()

const rows = ref<ScoreMapRow[]>([])

// Sync external modelValue into local rows (deep clone)
watch(
  () => props.modelValue,
  (val) => {
    rows.value = val.map((r) => ({ rawScore: r.rawScore, scaledScore: r.scaledScore }))
  },
  { immediate: true, deep: true },
)

// Emit whenever local rows change
watch(
  rows,
  (val) => {
    emit('update:modelValue', val.map((r) => ({ rawScore: r.rawScore, scaledScore: r.scaledScore })))
  },
  { deep: true },
)

function addRow(): void {
  rows.value = [...rows.value, { rawScore: 0, scaledScore: 0 }]
}

function removeRow(index: number): void {
  rows.value = rows.value.filter((_, i) => i !== index)
}
</script>

<template>
  <div class="score-map-editor">
    <table class="score-map-editor__table">
      <thead>
        <tr>
          <th class="score-map-editor__th">Correct answers</th>
          <th class="score-map-editor__th">Scaled score</th>
          <th class="score-map-editor__th score-map-editor__th--action" />
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in rows" :key="index" class="score-map-editor__row">
          <td class="score-map-editor__td">
            <input
              v-model.number="row.rawScore"
              type="number"
              class="score-map-editor__input"
              min="0"
              placeholder="0"
              :readonly="props.disabled"
            >
          </td>
          <td class="score-map-editor__td">
            <input
              v-model.number="row.scaledScore"
              type="number"
              class="score-map-editor__input"
              min="0"
              placeholder="0"
              :readonly="props.disabled"
            >
          </td>
          <td v-if="!props.disabled" class="score-map-editor__td score-map-editor__td--action">
            <button
              type="button"
              class="score-map-editor__remove-btn"
              aria-label="Remove row"
              @click="removeRow(index)"
            >
              ×
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <button v-if="!props.disabled" type="button" class="score-map-editor__add-btn" @click="addRow">
      <i class="ti ti-plus" /> Add row
    </button>
  </div>
</template>

<style scoped>
.score-map-editor {
  width: 100%;
}

.score-map-editor__table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
  margin-bottom: var(--space-3);
}

.score-map-editor__th {
  text-align: left;
  padding: var(--space-2) var(--space-3);
  border-bottom: 2px solid var(--color-border);
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: var(--text-xs);
}

.score-map-editor__th--action {
  width: 40px;
  text-align: center;
}

.score-map-editor__td {
  padding: var(--space-1) var(--space-3);
  border-bottom: 1px solid var(--color-border);
}

.score-map-editor__td--action {
  text-align: center;
}

.score-map-editor__input {
  width: 100%;
  height: 34px;
  padding: 0 var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-card);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-family: inherit;
  outline: none;
  transition: border-color 150ms ease;
}

.score-map-editor__input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 35%, transparent);
}

/* Remove spinner arrows on number inputs */
.score-map-editor__input::-webkit-outer-spin-button,
.score-map-editor__input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.score-map-editor__input[type='number'] {
  -moz-appearance: textfield;
}

.score-map-editor__remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    color 150ms ease;
}

.score-map-editor__remove-btn:hover {
  background-color: var(--color-danger-bg);
  color: var(--color-danger);
}

.score-map-editor__add-btn {
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
  transition:
    border-color 150ms ease,
    color 150ms ease,
    background-color 150ms ease;
}

.score-map-editor__add-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: var(--color-bg-tint);
}
</style>
