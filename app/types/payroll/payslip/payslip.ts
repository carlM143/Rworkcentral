export interface PayslipPeriod {
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

export interface PayslipListItem {
  payroll_id: number
  payslip_no: string
  emp_id: string | null
  name: string
  department: string | null
  payroll_group: string | null
  gross_pay: number
  total_deductions: number
  net_pay: number
}

export interface PayslipList {
  period: PayslipPeriod
  payslips: PayslipListItem[]
}

export interface PayslipLine {
  label: string
  note: string | null
  amount: number
}

export interface Payslip {
  payslip_no: string
  company: {
    name: string
    address: string | null
  }
  period: PayslipPeriod
  employee: {
    emp_id: string | null
    name: string
    department: string | null
    payroll_group: string | null
    salary_type: string | null
    basic_salary: number
  }
  earnings: PayslipLine[]
  time_deductions: PayslipLine[]
  deductions: PayslipLine[]
  employer_shares: PayslipLine[]
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
    account_number: string | null
  }
  finalized_at: string | null
}