/**
 * Payroll Settings.
 *
 * UI ONLY FOR NOW: values are kept in memory (useState) and reset on a full
 * page reload. Planned Laravel endpoints:
 *   GET /admin/settings/payroll
 *   PUT /admin/settings/payroll
 *
 * Payroll groups, pay periods, salary rates, contributions and wage orders
 * keep their own pages; this page holds the company-wide computation rules.
 */

export type PayFrequency = 'semi_monthly' | 'monthly' | 'weekly'
export type PaydayAdjustment = 'previous_working_day' | 'next_working_day' | 'no_change'
export type ContributionCutoff = 'split' | 'first' | 'second'

export interface PayrollSettings {
  schedule: {
    default_frequency: PayFrequency
    first_cutoff_end_day: number // semi-monthly: 1st cutoff = 1..this day, 2nd = next day..month end
    first_payday: number // day of month the 1st cutoff is paid
    second_payday: number // day of month the 2nd cutoff is paid (next month when lower than the cutoff end)
    payday_adjustment: PaydayAdjustment
  }
  rates: {
    working_days_per_year: 261 | 313 | 365
    hours_per_day: number
    rounding: 'centavo' | 'peso'
  }
  deductions: {
    deduct_late_undertime: boolean
    deduct_absences: boolean
    contributions_cutoff: ContributionCutoff
    loans_cutoff: ContributionCutoff
  }
  tax: {
    compute_withholding: boolean
    exempt_minimum_wage_earners: boolean
    method: 'per_period_table' | 'annualized'
  }
  thirteenth_month: {
    release: 'december' | 'split_may_december'
    include_allowances: boolean
  }
  release: {
    require_approval: boolean
    lock_after_release: boolean
    payslip_in_employee_portal: boolean
    show_year_to_date: boolean
  }
}

export const defaultPayrollSettings = (): PayrollSettings => ({
  schedule: {
    default_frequency: 'semi_monthly',
    first_cutoff_end_day: 15,
    first_payday: 20,
    second_payday: 5,
    payday_adjustment: 'previous_working_day',
  },
  rates: {
    working_days_per_year: 261, // 5 working days a week
    hours_per_day: 8,
    rounding: 'centavo',
  },
  deductions: {
    deduct_late_undertime: true,
    deduct_absences: true,
    contributions_cutoff: 'split',
    loans_cutoff: 'second',
  },
  tax: {
    compute_withholding: true,
    exempt_minimum_wage_earners: true,
    method: 'per_period_table',
  },
  thirteenth_month: {
    release: 'december', // must be paid on or before December 24 (PD 851)
    include_allowances: false,
  },
  release: {
    require_approval: true,
    lock_after_release: true,
    payslip_in_employee_portal: true,
    show_year_to_date: true,
  },
})

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value))
const delay = () => new Promise(resolve => setTimeout(resolve, 250))

export const usePayrollSettings = () => {
  const saved = useState<PayrollSettings>('settings-payroll', defaultPayrollSettings)

  // GET /admin/settings/payroll
  const load = async (): Promise<ApiResponse<PayrollSettings>> => {
    await delay()
    return { success: true, message: 'Payroll settings retrieved.', data: clone(saved.value) }
  }

  // PUT /admin/settings/payroll
  const save = async (payload: PayrollSettings): Promise<ApiResponse<PayrollSettings>> => {
    await delay()
    saved.value = clone(payload)
    return { success: true, message: 'Payroll settings saved.', data: clone(saved.value) }
  }

  return { load, save }
}