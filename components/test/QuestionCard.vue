<script setup lang="ts">
import type { Question } from '~/types/test'

defineProps<{
  question: Question
  questionNumber: number
  questionTotal: number
  selectedOptionId: string | null
  audioAlreadyPlayed: boolean
}>()

const emit = defineEmits<{
  'select-option': [optionId: string]
  'audio-played': [questionId: string]
}>()
</script>

<template>
  <AppCard class="question-card" padding="lg">
    <p class="question-card__meta">
      Question {{ questionNumber }} of {{ questionTotal }}
    </p>

    <AudioPlayer
      v-if="question.audioUrl"
      :audio-url="question.audioUrl"
      :question-id="question.id"
      :already-played="audioAlreadyPlayed"
      class="question-card__audio"
      @played="emit('audio-played', $event)"
    />

    <p class="question-card__text">
      {{ question.text }}
    </p>

    <div class="question-card__options" role="listbox" :aria-label="`Options for question ${questionNumber}`">
      <AnswerOption
        v-for="option in question.options"
        :key="option.id"
        :label="option.label"
        :text="option.text"
        :selected="selectedOptionId === option.id"
        @select="emit('select-option', option.id)"
      />
    </div>
  </AppCard>
</template>

<style scoped>
.question-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  animation: fade-in 150ms ease;
}

.question-card__meta {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.question-card__audio {
  width: 100%;
}

.question-card__text {
  margin: 0;
  font-size: var(--text-base);
  font-weight: 400;
  line-height: 1.7;
  color: var(--color-text-primary);
}

.question-card__options {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
</style>
