export type DriverPayrollPaymentStatus =
  | 'Pending Payment'
  | 'Paid'
  | 'Released'

export type CompletedDriverPayrollStatus =
  'Completed'

export interface CompletedDriverPayroll {
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

  payrollStatus: CompletedDriverPayrollStatus
  paymentStatus: DriverPayrollPaymentStatus

  completedBy: string
  completedAt: string

  paidBy?: string
  paidAt?: string

  referenceNumber?: string

  remarks?: string
}