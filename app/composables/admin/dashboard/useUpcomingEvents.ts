import {
  BriefcaseBusiness,
  Cake,
  CalendarDays,
  Flag,
  UserCheck,
} from 'lucide-vue-next'

/**
 * Upcoming employee dates and holidays for the dashboard.
 *   GET /admin/dashboard/upcoming-events?days=30&limit=6     dashboard card
 *   GET /admin/upcoming-events?...&page=                     View all page
 */

export type UpcomingEventType = 'birthday' | 'anniversary' | 'regularization' | 'holiday' | 'milestone'

export interface UpcomingEvent {
  key: string
  type: UpcomingEventType
  label: string
  title: string
  detail: string
  date: string
  days_until: number // negative = already passed
  emp_id: string | null
  department_id: number | null
  department: string | null
}

export interface UpcomingEvents {
  from: string
  to: string
  total: number
  counts: Partial<Record<UpcomingEventType, number>>
  items: UpcomingEvent[]
}

export interface UpcomingEventsPage extends UpcomingEvents {
  meta: { current_page: number, last_page: number, per_page: number, total: number, from: number, to: number }
  departments: { id: number, name: string }[]
}

export interface UpcomingListParams {
  days?: number
  month?: string // YYYY-MM
  types?: UpcomingEventType[]
  department_id?: number | null
  search?: string
  page?: number
  per_page?: number
}

export const UPCOMING_TYPE_LABELS: Record<UpcomingEventType, string> = {
  birthday: 'Birthdays',
  anniversary: 'Work Anniversaries',
  regularization: 'Regularizations',
  holiday: 'Holidays',
  milestone: 'Milestones',
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const UPCOMING_EVENT_STYLE: Record<UpcomingEventType, { icon: unknown, color: 'green' | 'orange' | 'purple' | 'blue' | 'red' }> = {
  birthday: { icon: Cake, color: 'purple' },
  anniversary: { icon: BriefcaseBusiness, color: 'blue' },
  regularization: { icon: UserCheck, color: 'green' },
  holiday: { icon: CalendarDays, color: 'orange' },
  milestone: { icon: Flag, color: 'red' },
}

export const eventDateLabel = (event: Pick<UpcomingEvent, 'date' | 'days_until'>) => {
  if (event.days_until === 0) return 'Today'
  if (event.days_until === 1) return 'Tomorrow'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(new Date(`${event.date}T00:00:00`))
}

export const useUpcomingEvents = () => {
  const { $api } = useNuxtApp()

  const events = ref<UpcomingEvents | null>(null)
  const loading = ref(false)
  const error = ref('')

  const getEvents = async (days = 30, limit = 6) => {
    loading.value = true
    error.value = ''
    try {
      const response = await $api<ApiResponse<UpcomingEvents>>('/admin/dashboard/upcoming-events', {
        method: 'GET',
        query: { days, limit },
      })
      events.value = response.data
    } catch {
      error.value = 'Unable to load upcoming events.'
    } finally {
      loading.value = false
    }
  }

  // View all page (paginated, filtered).
  const list = (params: UpcomingListParams) =>
    $api<ApiResponse<UpcomingEventsPage>>('/admin/upcoming-events', {
      method: 'GET',
      query: Object.fromEntries(
        Object.entries({ ...params, types: params.types?.join(',') })
          .filter(([, value]) => value !== '' && value !== null && value !== undefined),
      ),
    })

  return { events, loading, error, getEvents, list }
}