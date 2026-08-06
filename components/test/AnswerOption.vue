<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string
    text: string
    selected?: boolean
    disabled?: boolean
  }>(),
  {
    selected: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  select: []
}>()

function handleClick() {
  if (props.disabled) return
  emit('select')
}
</script>

<template>
  <button
    type="button"
    class="answer-option"
    :class="{
      'answer-option--selected': selected,
      'answer-option--disabled': disabled,
    }"
    :disabled="disabled"
    :aria-pressed="selected"
    @click="handleClick"
  >
    <span class="answer-option__label">{{ label }}</span>
    <span class="answer-option__text">{{ text }}</span>
  </button>
</template>

<style scoped>
.answer-option {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  width: 100%;
  min-height: 56px;
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-card);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: var(--text-base);
  text-align: left;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease;
}

.answer-option:hover:not(:disabled) {
  background-color: var(--color-bg-tint);
  border-color: var(--color-primary);
}

.answer-option--selected {
  background-color: var(--color-bg-tint);
  border: 2px solid var(--color-primary);
  color: var(--color-primary-dark);
  box-shadow: inset 3px 0 0 var(--color-primary);
  padding-left: calc(var(--space-4) - 1px);
}

.answer-option--disabled,
.answer-option:disabled {
  background-color: var(--color-bg-page);
  border-color: var(--color-border);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.answer-option__label {
  min-width: 24px;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-primary);
  line-height: 1.5;
}

.answer-option--selected .answer-option__label {
  color: var(--color-primary-dark);
}

.answer-option--disabled .answer-option__label {
  color: var(--color-text-muted);
}

.answer-option__text {
  flex: 1;
  line-height: 1.5;
}
</style>
