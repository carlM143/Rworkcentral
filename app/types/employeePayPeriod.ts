export type EmployeePayPeriodStatus =
  | 'Draft'
  | 'Open'
  | 'Processing'
  | 'Closed'
  | 'Cancelled'

export interface EmployeePayPeriod {
  id: number

  periodCode: string
  periodName: string

  payrollType: 'Employee Payroll'

  startDate: string
  endDate: string

  cutoffDate: string
  payDate: string

  totalEmployees: number
  pendingEmployees: number
  processedEmployees: number
  completedEmployees: number

  grossAmount: number
  totalDeductions: number
  netAmount: number

  status: EmployeePayPeriodStatus

  remarks?: string

  createdBy: string
  createdAt: string
}