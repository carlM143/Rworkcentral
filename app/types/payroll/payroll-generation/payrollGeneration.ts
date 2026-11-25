export type Money = string | number
export interface PayrollIncompleteLog {
  time_log_id: number
  work_date: string | null
  time_in: string | null
  time_out: string | null
  missing: 'time_in' | 'time_out'
  payroll_effect: string
}

export interface GeneratedPayrollLine {
  payroll_id: number
  employee_id: number
  name: string
  gross_pay: number
  total_deductions: number
  net_pay: number
  incomplete_logs?: PayrollIncompleteLog[]
}

export interface SkippedPayrollLine {
  employee_id: number
  name: string
  reason: string
}

/** Payroll was generated, but the employee has days that need review. */
export interface PayrollGenerationWarning {
  payroll_id: number
  employee_id: number
  name: string
  code: 'incomplete_time_logs' | string
  rate_type: string
  message: string
  logs: PayrollIncompleteLog[]
}

export interface PayrollGenerationResult {
  generated: GeneratedPayrollLine[]
  skipped: SkippedPayrollLine[]
  warnings?: PayrollGenerationWarning[]
}

export interface PayrollLoanLine {
  employee_loan_id: number
  loan_type: string
  reference: string | null
  amount: number
  balance_before: number
  balance_after: number
  /** True when less than the scheduled amount was deducted (low balance or pay). */
  partial: boolean
  /** Cutoff of the month (1 or 2) and the loan's percent for it (monthly groups: 100). */
  cutoff_number?: number
  cutoff_percent?: number
  /** Monthly deduction × cutoff percent (before capping at the balance). */
  scheduled_amount?: number
}

export type HolidayPayScenario =
  | 'unworked'
  | 'worked'
  | 'worked_overtime'
  | 'rest_day_worked'
  | 'rest_day_overtime'

/** One holiday pay line (amount added to gross pay). */
export interface PayrollHolidayLine {
  holiday_id: number
  holiday_name: string
  holiday_pay_rule_id: number | null
  time_log_id: number | null
  holiday_date: string
  scenario: HolidayPayScenario
  worked_minutes: number
  overtime_minutes: number
  daily_rate: number
  rate_percent: number
  amount: number
}

/** How each holiday in the cut-off applied to the employee. */
export interface PayrollHolidayDay {
  date: string
  holiday_id: number
  holiday_name: string
  type: string | null
  covered: boolean
  worked: boolean
  rest_day: boolean
  paid: boolean
  reason: string
}

/**
 * Salary in effect for part of the cut-off. One segment when nothing changed;
 * more when a salary adjustment took effect inside the cut-off.
 */
export interface PayrollSalarySegment {
  from: string
  to: string
  days: number
  basic: number
  allowance: number
  salary_adjustment_id: number | null
  /** Added by payroll generation (payrolls generated before this have none). */
  days_worked?: number
  worked_minutes?: number
  basic_pay?: number
  /** e.g. "Wage order RB XI-35" or "Salary adjustment #12" */
  source?: string | null
}

/** Additional allowance (employee_allowance), split per cut-off like the main allowance. */
export interface PayrollAdditionalAllowance {
  allowance_name: string
  monthly_amount: number
  /** Amount for this cut-off (already included in allowance_pay). */
  amount: number
}

export interface PayrollContributionLine {
  id: number
  contribution_type_id: number
  salary_basis_amount: Money
  employee_share: Money
  employer_share: Money
  contribution_type?: {
    id: number
    contribution_code: string
    contribution_name: string
  } | null
}

export interface PayrollRecord {
  id: number
  employee_id: number
  payroll_group_id: number
  status: 'draft' | 'finalized'
  basic_salary: Money
  allowance: Money | null
  daily_rate: Money
  days_worked: number
  worked_minutes: number
  basic_pay: Money
  allowance_pay: Money
  overtime_minutes: number
  overtime_pay: Money
  late_minutes: number
  late_deduction: Money
  undertime_minutes: number
  undertime_deduction: Money
  unpaid_leave_days: Money
  unpaid_leave_deduction: Money
  holiday_pay: Money
  unpaid_holiday_days: Money
  unpaid_holiday_deduction: Money
  gross_pay: Money
  contributions_total: Money
  loan_deductions_total: Money
  withholding_tax: Money
  total_deductions: Money
  net_pay: Money
  breakdown: {
    rate_type: string
    frequency: string
    monthly_rate: number
    minute_rate: number
    loans: PayrollLoanLine[]
    holidays?: PayrollHolidayLine[]
    holiday_days?: PayrollHolidayDay[]
    /** Missing on payrolls generated before salary adjustments were supported. */
    salary_segments?: PayrollSalarySegment[]
    additional_allowances?: PayrollAdditionalAllowance[]
    incomplete_logs?: PayrollIncompleteLog[]
  } | null
  employee?: {
    id: number
    emp_id: string
    firstname: string
    lastname: string
  } | null
  payroll_group?: {
    id: number
    group_name: string
    frequency: string
  } | null
  salary_type?: {
    id: number
    type_name: string
  } | null
  contributions: PayrollContributionLine[]
}

export interface PayrollRunTotals {
  employees: number
  draft: number
  finalized: number
  holiday_pay: number
  unpaid_holiday_deduction: number
  gross_pay: number
  total_deductions: number
  net_pay: number
}

export interface PayrollRunData {
  payrolls: PayrollRecord[]
  totals: PayrollRunTotals
}