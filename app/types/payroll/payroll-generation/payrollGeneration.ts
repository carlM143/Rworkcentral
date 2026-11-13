export type Money = string | number

export interface GeneratedPayrollLine {
  payroll_id: number
  employee_id: number
  name: string
  gross_pay: number
  total_deductions: number
  net_pay: number
}

export interface SkippedPayrollLine {
  employee_id: number
  name: string
  reason: string
}

export interface PayrollGenerationResult {
  generated: GeneratedPayrollLine[]
  skipped: SkippedPayrollLine[]
}

export interface PayrollLoanLine {
  employee_loan_id: number
  loan_type: string
  reference: string | null
  amount: number
  balance_before: number
  balance_after: number
  partial: boolean
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
  gross_pay: number
  total_deductions: number
  net_pay: number
}

export interface PayrollRunData {
  payrolls: PayrollRecord[]
  totals: PayrollRunTotals
}