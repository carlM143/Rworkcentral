/**
 * The logged-in employee's own payslips.
 * GET /employee/payslips           → list (only payslips HR has sent)
 * GET /employee/payslips/{payroll} → full payslip
 */

export interface EmployeePayslipPeriod {
  id: number
  period_name: string | null
  cutoff_number: number
  pay_period_start: string | null
  pay_period_end: string | null
  cutoff_start: string | null
  cutoff_end: string | null
  payment_date: string | null
  status: string
}

export interface EmployeePayslipListItem {
  payroll_id: number
  payslip_no: string
  period: EmployeePayslipPeriod
  gross_pay: number
  total_deductions: number
  net_pay: number
  /** When HR sent the payslip (ISO 8601). */
  sent_at: string | null
}

export interface EmployeePayslipListData {
  payslips: EmployeePayslipListItem[]
  /** Years that have payslips, newest first (for the year filter). */
  years: number[]
  totals: {
    count: number
    gross_pay: number
    net_pay: number
  }
}

export interface EmployeePayslipApiLine {
  label: string
  note: string | null
  amount: number
}

export interface EmployeePayslipDetail {
  payslip_no: string
  company: { name: string, address: string | null }
  period: EmployeePayslipPeriod
  employee: {
    emp_id: string | null
    name: string
    department: string | null
    payroll_group: string | null
    salary_type: string | null
    basic_salary: number
  }
  days: {
    worked: number
    paid_holidays: number
    unpaid_leave: number
    total_paid: number
  }
  /** Basic pay, allowance, additional allowances, overtime, holiday pay. */
  earnings: EmployeePayslipApiLine[]
  /** Late, undertime, unpaid leave, unpaid holiday (reduce gross pay). */
  time_deductions: EmployeePayslipApiLine[]
  /** Contributions (employee share), then Withholding Tax, then loans. */
  deductions: EmployeePayslipApiLine[]
  employer_shares: EmployeePayslipApiLine[]
  totals: {
    earnings: number
    time_deductions: number
    gross_pay: number
    total_deductions: number
    net_pay: number
  }
  bank: {
    bank_name: string | null
    account_name: string | null
    /** Masked, e.g. "••••••4826". */
    account_number: string | null
  }
  finalized_at: string | null
  sent_at: string
}

export interface EmployeePayslipApiResponse<T> {
  success: boolean
  message: string
  data: T
}
