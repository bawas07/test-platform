<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    placeholder?: string
    error?: string
    helper?: string
    type?: string
    disabled?: boolean
    id?: string
  }>(),
  {
    modelValue: '',
    label: undefined,
    placeholder: undefined,
    error: undefined,
    helper: undefined,
    type: 'text',
    disabled: false,
    id: undefined,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = computed(() => props.id ?? `app-input-${useId()}`)

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="app-input" :class="{ 'app-input--error': Boolean(error), 'app-input--disabled': disabled }">
    <label v-if="label" class="app-input__label" :for="inputId">
      {{ label }}
    </label>

    <input
      :id="inputId"
      class="app-input__field"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-invalid="Boolean(error) || undefined"
      :aria-describedby="error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined"
      @input="handleInput"
    >

    <p v-if="error" :id="`${inputId}-error`" class="app-input__error">
      {{ error }}
    </p>
    <p v-else-if="helper" :id="`${inputId}-helper`" class="app-input__helper">
      {{ helper }}
    </p>
  </div>
</template>

<style scoped>
.app-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
}

.app-input__label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-primary);
}

.app-input__field {
  width: 100%;
  height: 40px;
  padding: 0 var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-card);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-family: inherit;
  outline: none;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease,
    background-color 150ms ease;
}

.app-input__field::placeholder {
  color: var(--color-text-muted);
}

.app-input__field:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 35%, transparent);
}

.app-input--error .app-input__field {
  border-color: var(--color-danger);
  background-color: var(--color-danger-bg);
}

.app-input--error .app-input__field:focus {
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-danger) 30%, transparent);
}

.app-input__field:disabled {
  background-color: var(--color-bg-page);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.app-input__error {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-danger);
}

.app-input__helper {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
}
</style>
