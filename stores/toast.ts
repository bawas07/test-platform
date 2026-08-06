export type ToastVariant = 'success' | 'warning' | 'danger' | 'info'

export interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

const AUTO_DISMISS_MS = 4000

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<ToastItem[]>([])

  function dismiss(id: string) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function show(message: string, variant: ToastVariant = 'info') {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    toasts.value = [...toasts.value, { id, message, variant }]

    setTimeout(() => {
      dismiss(id)
    }, AUTO_DISMISS_MS)

    return id
  }

  return {
    toasts,
    show,
    dismiss,
  }
})
