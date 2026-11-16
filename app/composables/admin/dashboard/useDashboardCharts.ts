/**
 * Dashboard charts.
 *   GET /admin/dashboard/attendance?range=this_week|last_week|last_14_days
 *   GET /admin/dashboard/headcount?top=5
 */

export type AttendanceRange = 'this_week' | 'last_week' | 'last_14_days'

export interface AttendanceDay {
  date: string
  label: string
  scheduled: number
  present: number | null // null = future day
  late: number | null
  absent: number | null
  on_leave: number
  wfh: number
  is_future: boolean
  is_holiday: boolean
  holiday_name: string | null
}

export interface AttendanceOverview {
  range: AttendanceRange
  from: string
  to: string
  days: AttendanceDay[]
  summary: { attendance_rate: number | null, late_total: number, absent_total: number }
}

export interface Headcount {
  total: number
  department_count: number
  departments: { id: number | null, name: string, count: number, percent: number }[]
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const useDashboardCharts = () => {
  const { $api } = useNuxtApp()

  const attendance = ref<AttendanceOverview | null>(null)
  const attendanceLoading = ref(false)
  const attendanceError = ref('')

  const headcount = ref<Headcount | null>(null)
  const headcountLoading = ref(false)
  const headcountError = ref('')

  const getAttendance = async (range: AttendanceRange = 'this_week') => {
    attendanceLoading.value = true
    attendanceError.value = ''
    try {
      const response = await $api<ApiResponse<AttendanceOverview>>('/admin/dashboard/attendance', { method: 'GET', query: { range } })
      attendance.value = response.data
    } catch {
      attendanceError.value = 'Unable to load attendance.'
    } finally {
      attendanceLoading.value = false
    }
  }

  const getHeadcount = async (top = 5) => {
    headcountLoading.value = true
    headcountError.value = ''
    try {
      const response = await $api<ApiResponse<Headcount>>('/admin/dashboard/headcount', { method: 'GET', query: { top } })
      headcount.value = response.data
    } catch {
      headcountError.value = 'Unable to load headcount.'
    } finally {
      headcountLoading.value = false
    }
  }

  return {
    attendance, attendanceLoading, attendanceError, getAttendance,
    headcount, headcountLoading, headcountError, getHeadcount,
  }
}