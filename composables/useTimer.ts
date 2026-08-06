import type { Ref } from 'vue'

export type TimerUrgency = 'safe' | 'warning' | 'danger'

export function useTimer(endsAt: Ref<string | null | undefined>) {
  const secondsLeft = ref(0)

  const urgency = computed<TimerUrgency>(() => {
    if (secondsLeft.value > 60) return 'safe'
    if (secondsLeft.value > 30) return 'warning'
    return 'danger'
  })

  let intervalId: ReturnType<typeof setInterval> | null = null

  function clearTimer() {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function tick(value: string) {
    secondsLeft.value = Math.max(
      0,
      Math.floor((new Date(value).getTime() - Date.now()) / 1000),
    )
  }

  function start(value: string | null | undefined) {
    clearTimer()

    if (!value) {
      secondsLeft.value = 0
      return
    }

    tick(value)
    intervalId = setInterval(() => {
      tick(value)
    }, 500)
  }

  watch(endsAt, (value) => {
    start(value)
  }, { immediate: true })

  onUnmounted(() => {
    clearTimer()
  })

  return {
    secondsLeft,
    urgency,
  }
}
