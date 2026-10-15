export type ToastType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'

export interface ToastItem {
  id: number
  type: ToastType
  title: string
  message?: string
}

export const useToast = () => {
  const toasts = useState<ToastItem[]>(
    'global-toasts',
    () => [],
  )

  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter(
      toast => toast.id !== id,
    )
  }

  const showToast = (
    type: ToastType,
    title: string,
    message = '',
    duration = 3500,
  ) => {
    const id =
      Date.now() +
      Math.floor(Math.random() * 1000)

    toasts.value.push({
      id,
      type,
      title,
      message,
    })

    if (import.meta.client) {
      window.setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  const success = (
    title: string,
    message = '',
  ) => {
    showToast(
      'success',
      title,
      message,
    )
  }

  const error = (
    title: string,
    message = '',
  ) => {
    showToast(
      'error',
      title,
      message,
    )
  }

  const warning = (
    title: string,
    message = '',
  ) => {
    showToast(
      'warning',
      title,
      message,
    )
  }

  const info = (
    title: string,
    message = '',
  ) => {
    showToast(
      'info',
      title,
      message,
    )
  }

  return {
    toasts,

    showToast,
    removeToast,

    success,
    error,
    warning,
    info,
  }
}