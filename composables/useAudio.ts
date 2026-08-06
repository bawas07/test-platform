import type { Ref } from 'vue'

export type AudioPlayState = 'idle' | 'playing' | 'done'

export function useAudio(
  audioUrl: Ref<string | null | undefined>,
  alreadyPlayed: Ref<boolean>,
) {
  const state = ref<AudioPlayState>(alreadyPlayed.value ? 'done' : 'idle')
  let audio: HTMLAudioElement | null = null

  watch(alreadyPlayed, (played) => {
    if (played && state.value === 'idle') {
      state.value = 'done'
    }
  })

  async function play(onPlayStart: () => void | Promise<void>) {
    if (state.value !== 'idle') return
    if (!audioUrl.value) return

    await onPlayStart()
    state.value = 'playing'

    audio = new Audio(audioUrl.value)
    audio.onended = () => {
      state.value = 'done'
    }
    audio.onerror = () => {
      state.value = 'done'
    }

    try {
      await audio.play()
    } catch {
      // Autoplay or load failure still counts as consumed once play was requested.
      state.value = 'done'
    }
  }

  onUnmounted(() => {
    if (audio) {
      audio.pause()
      audio = null
    }
  })

  return {
    state,
    play,
  }
}
