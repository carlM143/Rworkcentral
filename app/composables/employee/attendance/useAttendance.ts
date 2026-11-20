import type {
  AttendanceApiResponse,
  AttendanceFilters,
  TimeLogRecord,
} from '~/types/employee/attendance/attendance'

const BASE = '/employee/time-logs'

/** First validation error, API message, or the fallback. */
export const attendanceError = (cause: unknown, fallback: string): string => {
  const problem = cause as {
    data?: { message?: string, errors?: Record<string, string[]> }
    response?: { _data?: { message?: string, errors?: Record<string, string[]> } }
  }
  const data = problem?.data ?? problem?.response?._data
  const validationError = Object.values(data?.errors ?? {}).flat()[0]
  return String(validationError || data?.message || fallback)
}

/**
 * Status shown to the employee for a time log.
 * Same rules as the dashboard (useEmployeePortal › syncLogIntoPunches).
 */
export const attendanceStatusLabel = (log: TimeLogRecord): string => {
  if (log.source === 'wfh') {
    if (log.status === 'complete') return 'WFH (Verified)'
    if (log.time_out) return 'WFH (Pending Verification)'
    if (log.time_in) return 'WFH (Timed In)'
    return 'WFH Scheduled'
  }
  if ((log.late_minutes ?? 0) > 0) return 'Late'
  if ((log.undertime_minutes ?? 0) > 0) return 'Undertime'
  if (log.status === 'incomplete') return log.time_in ? 'Timed In' : 'Incomplete'
  return 'On Time'
}

/** Worked hours from worked_minutes, e.g. 7.5 */
export const attendanceWorkedHours = (log: TimeLogRecord): number | null =>
  log.worked_minutes === null || log.worked_minutes === undefined
    ? null
    : Number((log.worked_minutes / 60).toFixed(1))

export const useAttendance = () => {
  const { $api } = useNuxtApp()

  /** GET /employee/time-logs — newest first; optional date range. */
  const list = async (filters: AttendanceFilters = {}) => {
    const query = Object.fromEntries(Object.entries(filters).filter(([, value]) => Boolean(value)))
    const res = await $api<AttendanceApiResponse<TimeLogRecord[]>>(BASE, { query })
    return Array.isArray(res.data) ? res.data : []
  }

  /** GET /employee/time-logs/today — null when there is no log yet. */
  const today = async () =>
    (await $api<AttendanceApiResponse<TimeLogRecord | null>>(`${BASE}/today`)).data

  return { list, today }
}
