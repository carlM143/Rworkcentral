import {
  CalendarClock,
  Hourglass,
  House,
  PencilLine,
  TimerReset,
  Umbrella,
  WalletCards,
} from 'lucide-vue-next'

/**
 * Pending requests from every module.
 *   GET /admin/dashboard/pending-requests  counts per type
 *   GET /admin/pending-requests            combined list (View all)
 * Approving and rejecting stay on each module's own page.
 */

export type PendingRequestType =
  | 'leave'
  | 'overtime'
  | 'undertime'
  | 'time_correction'
  | 'wfh'
  | 'rest_day_switch'
  | 'salary_adjustment'

export interface PendingTypeSummary {
  type: PendingRequestType
  label: string
  url: string
  count: number
  oldest_at: string | null
  oldest_days: number | null
}

export interface PendingSummary {
  total: number
  types: PendingTypeSummary[]
}

export interface PendingRequestItem {
  key: string
  id: number
  type: PendingRequestType
  type_label: string
  request_no: string
  details: string
  date: string | null
  reason: string | null
  employee: {
    id: number
    emp_id: string
    name: string
    department_id: number | null
    department: string | null
  }
  filed_at: string
  waiting_days: number
  url: string
}

export interface PendingListParams {
  type?: PendingRequestType | ''
  search?: string
  department_id?: number | null
  sort?: 'oldest' | 'newest'
  page?: number
  per_page?: number
}

export interface PendingListResponse {
  success: boolean
  message: string
  data: PendingRequestItem[]
  meta: { current_page: number, last_page: number, per_page: number, total: number, from: number, to: number }
  departments: { id: number, name: string }[]
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// Icon and color per request type (shared by the dashboard and View all).
export const PENDING_TYPE_STYLE: Record<PendingRequestType, { icon: unknown, color: 'green' | 'orange' | 'purple' | 'blue' | 'red' }> = {
  leave: { icon: Umbrella, color: 'green' },
  overtime: { icon: TimerReset, color: 'orange' },
  undertime: { icon: Hourglass, color: 'red' },
  time_correction: { icon: PencilLine, color: 'purple' },
  wfh: { icon: House, color: 'blue' },
  rest_day_switch: { icon: CalendarClock, color: 'orange' },
  salary_adjustment: { icon: WalletCards, color: 'green' },
}

export const waitingLabel = (days: number | null | undefined) => {
  if (days === null || days === undefined) return ''
  if (days <= 0) return 'Today'
  return days === 1 ? '1 day' : `${days} days`
}

export const usePendingRequests = () => {
  const { $api } = useNuxtApp()

  const summary = ref<PendingSummary | null>(null)
  const summaryLoading = ref(false)
  const summaryError = ref('')

  const getSummary = async () => {
    summaryLoading.value = true
    summaryError.value = ''
    try {
      const response = await $api<ApiResponse<PendingSummary>>('/admin/dashboard/pending-requests', { method: 'GET' })
      summary.value = response.data
    } catch {
      summaryError.value = 'Unable to load pending requests.'
    } finally {
      summaryLoading.value = false
    }
  }

  const list = (params: PendingListParams = {}) =>
    $api<PendingListResponse>('/admin/pending-requests', {
      method: 'GET',
      query: Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
      ),
    })

  return { summary, summaryLoading, summaryError, getSummary, list }
}