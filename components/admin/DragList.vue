<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'

const props = withDefaults(
  defineProps<{
    items: any[]
    itemKey: string
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)

const emit = defineEmits<{
  reorder: [items: any[]]
}>()

const localItems = computed({
  get: () => props.items,
  set: (value: any[]) => {
    emit('reorder', value)
  },
})

</script>

<template>
  <div class="drag-list" :class="{ 'drag-list--disabled': disabled }">
    <VueDraggable
      v-model="localItems"
      :disabled="disabled"
      :item-key="itemKey"
      handle=".drag-handle"
      ghost-class="drag-list__ghost"
    >
      <div
        v-for="(item, index) in localItems"
        :key="item[itemKey]"
        class="drag-list__item"
      >
        <span
          class="drag-handle drag-list__handle"
          :class="{ 'drag-handle--disabled': disabled }"
          aria-label="Drag to reorder"
          tabindex="0"
          role="button"
        >
          <i class="ti ti-grip-vertical" aria-hidden="true" />
        </span>
        <span class="drag-list__index">{{ index + 1 }}</span>
        <span class="drag-list__content">
          <slot name="item" :item="item" :index="index">
            {{ item }}
          </slot>
        </span>
      </div>
    </VueDraggable>
  </div>
</template>

<style scoped>
.drag-list {
  width: 100%;
}

.drag-list--disabled {
  opacity: 0.5;
  cursor: default;
}

.drag-list__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  margin-bottom: var(--space-1);
  background-color: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: box-shadow 150ms ease;
}

.drag-list__item:hover {
  box-shadow: var(--shadow-sm);
}

.drag-list__ghost {
  opacity: 0.4;
  background-color: var(--color-bg-tint);
}

.drag-list__handle {
  display: flex;
  align-items: center;
  cursor: grab;
  color: var(--color-text-muted);
  flex-shrink: 0;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  transition: color 150ms ease;
}

.drag-list__handle:hover {
  color: var(--color-text-secondary);
}

.drag-list__handle:active {
  cursor: grabbing;
}

.drag-handle--disabled {
  cursor: default;
  opacity: 0.4;
}

.drag-list__index {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-muted);
  min-width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.drag-list__content {
  flex: 1;
  min-width: 0;
  font-size: var(--text-sm);
  color: var(--color-text-primary);
}
</style>
