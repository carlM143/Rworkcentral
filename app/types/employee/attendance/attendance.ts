/**
 * Employee attendance (the logged-in employee's own time logs).
 * API: GET /employee/time-logs, GET /employee/time-logs/today
 * (see composables/employee/attendance/useAttendance.ts)
 */

/** "biometric", "qr", "wfh", "manual", … as recorded by the backend. */
export type TimeLogSource = string

/** complete | incomplete | … as recorded by the backend. */
export type TimeLogStatus = string

/** One day's time log (App\Models\TimeLog). Datetimes are ISO strings. */
export interface TimeLogRecord {
  id: number
  employee_id: number
  work_date: string
  time_in: string | null
  time_out: string | null
  break_out: string | null
  break_in: string | null
  late_minutes: number | null
  undertime_minutes: number | null
  worked_minutes: number | null
  overtime_minutes: number | null
  work_schedule_id: number | null
  scheduled_time_in: string | null
  scheduled_time_out: string | null
  raw_late_minutes: number | null
  grace_period_minutes: number | null
  chargeable_late_minutes: number | null
  source: TimeLogSource | null
  remarks: string | null
  status: TimeLogStatus | null
  created_at?: string
  updated_at?: string
}

/** GET /employee/time-logs?start_date=&end_date= (both optional, YYYY-MM-DD). */
export interface AttendanceFilters {
  start_date?: string
  end_date?: string
}

export interface AttendanceApiResponse<T> {
  success: boolean
  message: string
  data: T
}
