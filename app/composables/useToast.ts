export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  title: string
  message: string
  duration: number
}

let nextToastId = 0

export const useToast = () => {
  const toasts = useState<ToastItem[]>(
    'rworkcentral-toasts',
    () => [],
  )

  const remove = (id: string) => {
    toasts.value = toasts.value.filter(item => item.id !== id)
  }

  const show = (
    type: ToastType,
    title: string,
    message = '',
    duration = 4500,
  ) => {
    if (!import.meta.client) return ''

    const id = `toast-${Date.now()}-${++nextToastId}`

    toasts.value = [
      ...toasts.value.slice(-4),
      { id, type, title, message, duration },
    ]

    if (duration > 0) {
      window.setTimeout(() => remove(id), duration)
    }

    return id
  }

  const success = (title: string, message = '', duration = 4500) =>
    show('success', title, message, duration)

  const error = (title: string, message = '', duration = 5500) =>
    show('error', title, message, duration)

  const warning = (title: string, message = '', duration = 5000) =>
    show('warning', title, message, duration)

  const info = (title: string, message = '', duration = 4500) =>
    show('info', title, message, duration)

  const clear = () => {
    toasts.value = []
  }

  return {
    toasts: readonly(toasts),
    show,
    success,
    error,
    warning,
    info,
    remove,
    clear,
  }
}
