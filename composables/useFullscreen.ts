export function useFullscreen() {
  async function enter(): Promise<void> {
    const element = document.documentElement
    if (!element.requestFullscreen) {
      throw new Error('Fullscreen is not supported in this browser')
    }
    await element.requestFullscreen()
  }

  function onExit(callback: () => void): () => void {
    function handleChange() {
      if (!document.fullscreenElement) {
        callback()
      }
    }

    document.addEventListener('fullscreenchange', handleChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleChange)
    }
  }

  return {
    enter,
    onExit,
  }
}
