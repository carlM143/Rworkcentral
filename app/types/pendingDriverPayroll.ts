export type PendingDriverPayrollStatus =
  | 'Pending'
  | 'For Review'
  | 'With Issue'
  | 'Ready'

export interface PendingDriverPayroll {
  id: number

  payrollNumber: string

  driverId: number
  employeeNumber: string
  driverName: string
  department: string
  position: string

  periodId: number
  periodCode: string
  periodName: string
  periodStart: string
  periodEnd: string

  totalTrips: number
  regularHours: number
  overtimeHours: number

  regularPay: number
  tripPay: number
  overtimePay: number
  holidayPay: number
  allowance: number

  grossPay: number

  sss: number
  philHealth: number
  pagIbig: number
  loanDeduction: number
  otherDeductions: number

  totalDeductions: number
  netPay: number

  status: PendingDriverPayrollStatus

  issueCount: number

  remarks?: string

  preparedBy: string
  preparedAt: string
}