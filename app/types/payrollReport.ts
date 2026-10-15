export type PayrollReportStatus =
  | 'Draft'
  | 'Pending'
  | 'Processed'
  | 'Completed'

export type PayrollEmploymentType =
  | 'Regular'
  | 'Probationary'
  | 'Contractual'
  | 'Project-Based'

export interface PayrollReportRecord {
  id: number

  payrollNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  employmentType: PayrollEmploymentType

  payPeriod: string
  periodStart: string
  periodEnd: string

  basicPay: number
  overtimePay: number
  holidayPay: number
  allowances: number
  otherEarnings: number

  grossPay: number

  sss: number
  philHealth: number
  pagibig: number
  withholdingTax: number

  loanDeductions: number
  otherDeductions: number

  totalDeductions: number
  netPay: number

  status: PayrollReportStatus
}