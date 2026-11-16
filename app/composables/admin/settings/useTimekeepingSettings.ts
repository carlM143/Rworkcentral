/**
 * Timekeeping Settings.
 *
 * UI ONLY FOR NOW: values are kept in memory (useState) and reset on a full
 * page reload. The shape matches the planned Laravel endpoints so only the
 * function bodies change when the backend is connected:
 *   GET /admin/settings/timekeeping
 *   PUT /admin/settings/timekeeping
 */

export type LateCounting = 'after_grace' | 'from_schedule'

export interface TimekeepingSettings {
  attendance: {
    default_grace_minutes: number
    late_counting: LateCounting // count only minutes beyond grace, or all minutes once past grace
    late_rounding_minutes: 0 | 5 | 15 | 30
    undertime_tolerance_minutes: number
    half_day_hours: number // worked hours below this = half day
    absent_below_hours: number // worked hours below this = absent
  }
  sources: {
    qr_scan: boolean
    biometric_import: boolean
    manual_entry: boolean
    manual_requires_remarks: boolean
    first_in_last_out: boolean
  }
  missing_logs: {
    missing_time_out: 'incomplete' | 'absent'
    flag_after_hours: number // hours after scheduled end before an open log is flagged
    notify_employee: boolean
  }
  corrections: {
    filing_window_days: number
    require_attachment: boolean
    max_waiver_minutes_per_month: number // 0 = no limit
  }
  night_differential: {
    enabled: boolean
    start: string // HH:mm
    end: string // HH:mm
    rate_percent: number
  }
}

export const defaultTimekeepingSettings = (): TimekeepingSettings => ({
  attendance: {
    default_grace_minutes: 10,
    late_counting: 'from_schedule',
    late_rounding_minutes: 0,
    undertime_tolerance_minutes: 0,
    half_day_hours: 4,
    absent_below_hours: 2,
  },
  sources: {
    qr_scan: true,
    biometric_import: true,
    manual_entry: true,
    manual_requires_remarks: true,
    first_in_last_out: true,
  },
  missing_logs: {
    missing_time_out: 'incomplete',
    flag_after_hours: 4,
    notify_employee: true,
  },
  corrections: {
    filing_window_days: 5,
    require_attachment: false,
    max_waiver_minutes_per_month: 0,
  },
  night_differential: {
    enabled: true,
    start: '22:00',
    end: '06:00',
    rate_percent: 10, // Labor Code Art. 86 minimum
  },
})

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))
const delay = () => new Promise(resolve => setTimeout(resolve, 250))

export const useTimekeepingSettings = () => {
  const saved = useState<TimekeepingSettings>('settings-timekeeping', defaultTimekeepingSettings)
  const updatedAt = useState<string | null>('settings-timekeeping-updated', () => null)

  // GET /admin/settings/timekeeping
  const load = async (): Promise<ApiResponse<TimekeepingSettings>> => {
    await delay()
    return { success: true, message: 'Timekeeping settings retrieved.', data: clone(saved.value) }
  }

  // PUT /admin/settings/timekeeping
  const save = async (payload: TimekeepingSettings): Promise<ApiResponse<TimekeepingSettings>> => {
    await delay()
    saved.value = clone(payload)
    updatedAt.value = new Date().toISOString()
    return { success: true, message: 'Timekeeping settings saved.', data: clone(saved.value) }
  }

  return { load, save, updatedAt }
}