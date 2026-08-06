<script setup lang="ts">
const props = defineProps<{
  audioUrl: string
  questionId: string
  alreadyPlayed: boolean
}>()

const emit = defineEmits<{
  played: [questionId: string]
}>()

const audioUrlRef = toRef(props, 'audioUrl')
const alreadyPlayedRef = toRef(props, 'alreadyPlayed')
const { state, play } = useAudio(audioUrlRef, alreadyPlayedRef)

const label = computed(() => {
  if (state.value === 'playing') return 'Playing...'
  if (state.value === 'done') return 'Audio played'
  return 'Play audio'
})

const isDisabled = computed(() => state.value !== 'idle')

async function handlePlay() {
  await play(async () => {
    emit('played', props.questionId)
  })
}
</script>

<template>
  <button
    type="button"
    class="audio-player"
    :class="`audio-player--${state}`"
    :disabled="isDisabled"
    @click="handlePlay"
  >
    <span class="audio-player__icon-wrap" aria-hidden="true">
      <i
        v-if="state === 'playing'"
        class="ti ti-loader-2 audio-player__spinner"
      />
      <i
        v-else
        class="ti ti-player-play"
      />
    </span>
    <span class="audio-player__label">{{ label }}</span>
  </button>
</template>

<style scoped>
.audio-player {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  height: 56px;
  padding: 0 var(--space-4);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: var(--text-sm);
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    color 150ms ease,
    border-color 150ms ease;
}

.audio-player--idle {
  background-color: var(--color-bg-tint);
  color: var(--color-primary-dark);
  border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
}

.audio-player--idle:hover {
  border-color: var(--color-primary);
}

.audio-player--playing {
  background-color: var(--color-bg-tint);
  color: var(--color-primary-dark);
  cursor: default;
}

.audio-player--done {
  background-color: var(--color-bg-page);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.audio-player__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background-color: color-mix(in srgb, var(--color-primary) 15%, transparent);
  color: var(--color-primary);
  flex-shrink: 0;
}

.audio-player--done .audio-player__icon-wrap {
  background-color: var(--color-border);
  color: var(--color-text-muted);
}

.audio-player__spinner {
  animation: audio-spin 0.8s linear infinite;
}

.audio-player__label {
  flex: 1;
}

@keyframes audio-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
