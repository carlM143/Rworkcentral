/**
 * Admin › Payroll › Payroll History
 * API (backend ParollHistoryController, privilege payroll:history.view):
 *   GET /admin/payroll-history                      periods with totals
 *   GET /admin/payroll-history/{payrollPeriod}      one period: totals, per group, every employee
 *   GET /admin/payroll-history/employees/{employee} one employee's payrolls + finalized totals
 */

export type PayrollHistoryPeriodStatus = 'draft' | 'open' | 'processing' | 'closed' | string

export interface PayrollHistoryPeriod {
  id: number
  period_name: string | null
  cutoff_number: number
  pay_period_start: string | null
  pay_period_end: string | null
  cutoff_start: string | null
  cutoff_end: string | null
  payment_date: string | null
  status: PayrollHistoryPeriodStatus
}

/** Sums over payroll records (a period, a group, or the filtered range). */
export interface PayrollHistoryTotals {
  employees: number
  finalized: number
  draft: number
  payslips_sent: number
  gross_pay: number
  contributions_total: number
  loan_deductions_total: number
  withholding_tax: number
  total_deductions: number
  net_pay: number
  /** Latest finalization in the set (ISO 8601). */
  finalized_at: string | null
}

export interface PayrollHistoryPeriodRow {
  period: PayrollHistoryPeriod
  totals: PayrollHistoryTotals
}

/** GET /admin/payroll-history */
export interface PayrollHistoryListData {
  periods: PayrollHistoryPeriodRow[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  /** Totals for the whole filtered range. */
  summary: PayrollHistoryTotals
  /** Years that have generated payroll, newest first. */
  years: number[]
}

export interface PayrollHistoryListFilters {
  year?: number | null
  status?: 'processing' | 'closed' | ''
  page?: number
  per_page?: number
}

/** One employee's payroll in a period. */
export interface PayrollHistoryPayrollRow {
  payroll_id: number
  payslip_no: string
  employee: {
    id: number
    emp_id: string | number | null
    /** "Lastname, Firstname" */
    name: string
    department: string | null
  }
  payroll_group: string | null
  basic_pay: number
  allowance_pay: number
  overtime_pay: number
  holiday_pay: number
  gross_pay: number
  contributions_total: number
  loan_deductions_total: number
  withholding_tax: number
  total_deductions: number
  net_pay: number
  status: 'draft' | 'finalized'
  finalized_at: string | null
  payslip_sent_at: string | null
}

export interface PayrollHistoryGroupTotals {
  payroll_group_id: number
  group_name: string
  totals: PayrollHistoryTotals
}

/** GET /admin/payroll-history/{payrollPeriod} */
export interface PayrollHistoryPeriodDetail {
  period: PayrollHistoryPeriod
  totals: PayrollHistoryTotals
  by_group: PayrollHistoryGroupTotals[]
  employees: PayrollHistoryPayrollRow[]
}

export interface PayrollHistoryPeriodFilters {
  payroll_group_id?: number | null
  search?: string
  status?: 'draft' | 'finalized' | ''
}

/** GET /admin/payroll-history/employees/{employee} */
export interface PayrollHistoryEmployeeData {
  employee: {
    id: number
    emp_id: string | number | null
    name: string
    department: string | null
  }
  payrolls: (PayrollHistoryPayrollRow & { period: PayrollHistoryPeriod })[]
  /** Finalized payrolls only (drafts can still change). */
  totals: {
    payroll_count: number
    gross_pay: number
    contributions: number
    withholding_tax: number
    loan_deductions: number
    total_deductions: number
    net_pay: number
  }
}

export interface PayrollHistoryApiResponse<T> {
  success: boolean
  message: string
  data: T
}
