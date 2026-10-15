export type PayrollStatus =
  | 'Ready'
  | 'With Issue'
  | 'For Review'
  | 'Completed'

export type PayrollPeriodStatus =
  | 'Preparing'
  | 'For Review'
  | 'Completed'

export interface PayrollPreviewRecord {
  id: number

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  basicPay: number
  overtimePay: number
  allowance: number
  deductions: number

  netPay: number

  status: PayrollStatus
  issue?: string
}

export interface PayrollPeriod {
  id: number

  code: string

  dateFrom: string
  dateTo: string

  payrollDate: string

  type: string

  status: PayrollPeriodStatus

  progress: number
}

export interface PayrollRun {
  id: number

  period: string
  payrollDate: string

  employees: number

  grossPay: number
  netPay: number

  status: PayrollStatus
}