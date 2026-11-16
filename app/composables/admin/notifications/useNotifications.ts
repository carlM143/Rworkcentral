import {
  AlertTriangle,
  Bell,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  IdCard,
  Truck,
  WalletCards,
} from 'lucide-vue-next'

/**
 * In-app notifications of the signed-in user.
 * The bell (layout), the dashboard card and the View all page share the
 * same state, so a read in one place updates the others.
 *
 *   GET   /admin/notifications/summary
 *   GET   /admin/notifications
 *   PATCH /admin/notifications/{id}/read
 *   PATCH /admin/notifications/read-all
 */

export type NotificationLevel = 'info' | 'success' | 'warning' | 'danger'

export interface AppNotification {
  id: string
  category: string
  level: NotificationLevel
  title: string
  message: string
  url: string | null
  actor: string | null
  read: boolean
  created_at: string
}

export interface NotificationPage {
  data: AppNotification[]
  meta: { current_page: number, last_page: number, per_page: number, total: number, from: number, to: number }
  unread_count: number
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const NOTIFICATION_CATEGORIES: Record<string, { label: string, icon: unknown }> = {
  request: { label: 'Requests', icon: ClipboardCheck },
  decision: { label: 'Decisions', icon: CheckCircle2 },
  salary: { label: 'Salary', icon: WalletCards },
  payroll: { label: 'Payroll', icon: Calculator },
  trip: { label: 'Trips', icon: Truck },
  driver: { label: 'Drivers', icon: IdCard },
  alert: { label: 'Alerts', icon: AlertTriangle },
}

export const notificationIcon = (category: string) => NOTIFICATION_CATEGORIES[category]?.icon ?? Bell

// level → color class suffix used by the dashboard and the bell
export const LEVEL_TONE: Record<NotificationLevel, 'blue' | 'green' | 'orange' | 'red'> = {
  info: 'blue',
  success: 'green',
  warning: 'orange',
  danger: 'red',
}

export const timeAgo = (iso: string) => {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  if (seconds < 60) return 'Just now'
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso))
}

let pollTimer: ReturnType<typeof setInterval> | undefined

export const useNotifications = () => {
  const { $api } = useNuxtApp()

  // Shared across the whole app.
  const unreadCount = useState<number>('notifications-unread', () => 0)
  const latest = useState<AppNotification[]>('notifications-latest', () => [])
  const loaded = useState<boolean>('notifications-loaded', () => false)
  const loading = ref(false)
  const error = ref('')

  const loadSummary = async (limit = 8) => {
    loading.value = true
    error.value = ''
    try {
      const response = await $api<ApiResponse<{ unread_count: number, latest: AppNotification[] }>>(
        '/admin/notifications/summary',
        { method: 'GET', query: { limit } },
      )
      unreadCount.value = response.data.unread_count
      latest.value = response.data.latest
      loaded.value = true
    } catch {
      error.value = 'Unable to load notifications.'
    } finally {
      loading.value = false
    }
  }

  const list = (params: { page?: number, per_page?: number, category?: string, unread?: boolean } = {}) =>
    $api<{ success: boolean } & NotificationPage>('/admin/notifications', {
      method: 'GET',
      query: Object.fromEntries(
        Object.entries({ ...params, unread: params.unread ? 1 : undefined })
          .filter(([, value]) => value !== '' && value !== null && value !== undefined),
      ),
    })

  const markRead = async (item: AppNotification) => {
    if (item.read) return
    const response = await $api<{ unread_count: number }>(`/admin/notifications/${item.id}/read`, { method: 'PATCH' })
    item.read = true
    unreadCount.value = response.unread_count
    latest.value = latest.value.map(n => (n.id === item.id ? { ...n, read: true } : n))
  }

  const markAllRead = async () => {
    await $api('/admin/notifications/read-all', { method: 'PATCH' })
    unreadCount.value = 0
    latest.value = latest.value.map(n => ({ ...n, read: true }))
  }

  // Refresh every minute while the admin layout is open.
  const startPolling = (intervalMs = 60_000) => {
    if (!import.meta.client || pollTimer) return
    pollTimer = setInterval(() => {
      if (document.visibilityState === 'visible') void loadSummary()
    }, intervalMs)
  }

  const stopPolling = () => {
    if (pollTimer) clearInterval(pollTimer)
    pollTimer = undefined
  }

  return { unreadCount, latest, loaded, loading, error, loadSummary, list, markRead, markAllRead, startPolling, stopPolling }
}