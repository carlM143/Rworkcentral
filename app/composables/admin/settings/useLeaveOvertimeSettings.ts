/**
 * Leave & Overtime Settings.
 *
 * UI ONLY FOR NOW: values are kept in memory (useState) and reset on a full
 * page reload. Planned Laravel endpoints:
 *   GET /admin/settings/leave-overtime
 *   PUT /admin/settings/leave-overtime
 *
 * Leave types, per-employment-type policies and balances keep their own
 * pages under Leave Management; this page holds the company-wide rules.
 */

export type OvertimeDayType =
  | 'regular_ot'
  | 'rest_day'
  | 'rest_day_ot'
  | 'special_holiday'
  | 'special_holiday_ot'
  | 'regular_holiday'
  | 'regular_holiday_ot'

export interface OvertimeRate {
  key: OvertimeDayType
  label: string
  description: string
  percent: number // of the hourly rate
}

export interface LeaveOvertimeSettings {
  leave: {
    advance_notice_days: number
    sick_filing_days_after: number
    medical_certificate_after_days: number // 0 = never required
    allow_half_day: boolean
    allow_negative_balance: boolean
    reset_basis: 'calendar_year' | 'hire_anniversary'
    carry_over_deadline: string // MM-DD, unused carried-over credits expire after this date
  }
  overtime: {
    requires_pre_approval: boolean
    minimum_minutes: number
    rounding_minutes: 0 | 15 | 30
    max_hours_per_day: number
    filing_deadline_days: number
    starts_after_minutes: number // buffer after scheduled end before OT counts
  }
  undertime: {
    requires_filing: boolean
    max_hours_per_day: number
  }
  rates: OvertimeRate[]
}

export const defaultLeaveOvertimeSettings = (): LeaveOvertimeSettings => ({
  leave: {
    advance_notice_days: 3,
    sick_filing_days_after: 2,
    medical_certificate_after_days: 2,
    allow_half_day: true,
    allow_negative_balance: false,
    reset_basis: 'calendar_year',
    carry_over_deadline: '03-31',
  },
  overtime: {
    requires_pre_approval: true,
    minimum_minutes: 30,
    rounding_minutes: 15,
    max_hours_per_day: 4,
    filing_deadline_days: 3,
    starts_after_minutes: 0,
  },
  undertime: {
    requires_filing: true,
    max_hours_per_day: 4,
  },
  // Philippine Labor Code / DOLE premium pay defaults (percent of hourly rate).
  rates: [
    { key: 'regular_ot', label: 'Regular day overtime', description: 'Work beyond 8 hours on a regular working day', percent: 125 },
    { key: 'rest_day', label: 'Rest day', description: 'First 8 hours on a scheduled rest day', percent: 130 },
    { key: 'rest_day_ot', label: 'Rest day overtime', description: 'Beyond 8 hours on a rest day', percent: 169 },
    { key: 'special_holiday', label: 'Special non-working day', description: 'First 8 hours on a special day', percent: 130 },
    { key: 'special_holiday_ot', label: 'Special day overtime', description: 'Beyond 8 hours on a special day', percent: 169 },
    { key: 'regular_holiday', label: 'Regular holiday', description: 'First 8 hours on a regular holiday', percent: 200 },
    { key: 'regular_holiday_ot', label: 'Regular holiday overtime', description: 'Beyond 8 hours on a regular holiday', percent: 260 },
  ],
})

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))
const delay = () => new Promise(resolve => setTimeout(resolve, 250))

export const useLeaveOvertimeSettings = () => {
  const saved = useState<LeaveOvertimeSettings>('settings-leave-overtime', defaultLeaveOvertimeSettings)
  const updatedAt = useState<string | null>('settings-leave-overtime-updated', () => null)

  // GET /admin/settings/leave-overtime
  const load = async (): Promise<ApiResponse<LeaveOvertimeSettings>> => {
    await delay()
    return { success: true, message: 'Leave and overtime settings retrieved.', data: clone(saved.value) }
  }

  // PUT /admin/settings/leave-overtime
  const save = async (payload: LeaveOvertimeSettings): Promise<ApiResponse<LeaveOvertimeSettings>> => {
    await delay()
    saved.value = clone(payload)
    updatedAt.value = new Date().toISOString()
    return { success: true, message: 'Leave and overtime settings saved.', data: clone(saved.value) }
  }

  return { load, save, updatedAt }
}