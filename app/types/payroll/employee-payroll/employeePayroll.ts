export type EmployeePayrollStatus = 'draft' | 'finalized'

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
  allowance_pay: number
  gross_pay: number
  total_deductions: number
  net_pay: number
  status: EmployeePayrollStatus
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