export type EmployeePayrollStatus = 'draft' | 'finalized'

/** Additional allowance (employee_allowance) for this payroll. */
export interface EmployeePayrollAllowance {
  allowance_name: string | null
  monthly_amount: number
  /** Amount for this cut-off (already included in allowance_pay). */
  amount: number
}

export interface EmployeePayrollRow {
  payroll_id: number
  payslip_no: string | null
  employee: {
    emp_id: string | null
    name: string
    department: string | null
  }
  payroll_group: string | null
  period: {
    id: number
    period_name: string | null
    pay_period_start: string | null
    pay_period_end: string | null
    payment_date: string | null
  } | null
  basic_pay: number
  overtime_pay: number
  holiday_pay: number
  /** Total allowance: main allowance + additional allowances. */
  allowance_pay: number
  /** Main allowance only (allowance_pay − additional_allowance_pay). */
  base_allowance_pay?: number
  additional_allowance_pay?: number
  /** Empty for payrolls generated before additional allowances were added. */
  additional_allowances?: EmployeePayrollAllowance[]
  gross_pay: number
  total_deductions: number
  net_pay: number
  status: EmployeePayrollStatus
  /** True once HR sent the payslip to the employee's account. */
  payslip_sent?: boolean
  payslip_sent_at?: string | null
}

/**
 * POST /admin/employee-payrolls/send-payslips
 * Send either specific payrolls or every finalized payroll in a period.
 * Already-sent payslips are skipped unless resend is true.
 */
export type SendPayslipsPayload =
  | { payroll_ids: number[], resend?: boolean }
  | { payroll_period_id: number, resend?: boolean }

export interface SendPayslipsResult {
  sent: { payroll_id: number, payslip_no: string | null, name: string }[]
  skipped: { payroll_id: number, name: string, reason: string }[]
}

export interface EmployeePayrollFilters {
  payroll_period_id?: number | null
  department_id?: number | null
  status?: EmployeePayrollStatus | ''
  search?: string
  page?: number
  per_page?: number
}

export interface EmployeePayrollResponse {
  rows: EmployeePayrollRow[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from: number
    to: number
  }
  totals: {
    records: number
    gross_pay: number
    total_deductions: number
    net_pay: number
  }
  filters: {
    periods: { id: number, period_name: string, status: string }[]
    departments: { id: number, name: string }[]
  }
}