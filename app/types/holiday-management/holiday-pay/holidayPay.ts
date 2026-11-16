export type HolidayPayScenario =
  | 'unworked'
  | 'worked'
  | 'worked_overtime'
  | 'rest_day_worked'
  | 'rest_day_overtime'

export type HolidayPayAppliesTo = 'all' | 'daily_paid' | 'monthly_paid'

export interface HolidayTypeOption {
  id: number
  type_code: string
  type_name: string
}

export interface HolidayPayRule {
  id: number
  holiday_type_id: number
  scenario: HolidayPayScenario
  rate_percent: string | number
  applies_to: HolidayPayAppliesTo
  effective_from: string
  effective_to: string | null
  is_status: boolean
  holiday_type?: HolidayTypeOption | null
}

export interface HolidayPayRulePayload {
  holiday_type_id: number
  scenario: HolidayPayScenario
  rate_percent: number
  applies_to: HolidayPayAppliesTo
  effective_from: string
  effective_to: string | null
  is_status: boolean
}

export interface HolidayPayRow {
  id: number
  holiday_date: string
  holiday: { id: number, name: string | null, type: string | null }
  employee: { emp_id: string | null, name: string, department: string | null }
  period: { id: number, period_name: string | null } | null
  payroll_status: 'draft' | 'finalized' | null
  scenario: HolidayPayScenario
  scenario_label: string
  worked_minutes: number
  overtime_minutes: number
  daily_rate: number
  rate_percent: number
  amount: number
}

export interface HolidayPayFilters {
  payroll_period_id?: number | null
  holiday_id?: number | null
  search?: string
  page?: number
  per_page?: number
}

export interface HolidayPayHistory {
  rows: HolidayPayRow[]
  meta: { current_page: number, last_page: number, per_page: number, total: number, from: number, to: number }
  totals: { records: number, employees: number, amount: number }
  filters: {
    periods: { id: number, period_name: string, status: string }[]
    holidays: { id: number, name: string }[]
  }
}