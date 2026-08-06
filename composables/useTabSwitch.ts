export function useTabSwitch(onSwitch: () => void) {
  function handleVisibility() {
    if (document.visibilityState === 'hidden') {
      onSwitch()
    }
  }

  function handleBlur() {
    onSwitch()
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('blur', handleBlur)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibility)
    window.removeEventListener('blur', handleBlur)
  })
}
