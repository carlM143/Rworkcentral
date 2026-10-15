export type EmployeePayrollPaymentStatus =
  | 'Pending Payment'
  | 'Paid'
  | 'Released'

export type CompletedEmployeePayrollStatus =
  'Completed'

export interface CompletedEmployeePayroll {
  id: number

  payrollNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string
  department: string
  position: string

  periodId: number
  periodCode: string
  periodName: string
  periodStart: string
  periodEnd: string

  regularDays: number
  regularHours: number
  overtimeHours: number

  basicPay: number
  overtimePay: number
  holidayPay: number
  nightDifferential: number
  allowances: number
  otherEarnings: number

  grossPay: number

  sss: number
  philHealth: number
  pagIbig: number

  loanDeduction: number
  lateDeduction: number
  undertimeDeduction: number
  absenceDeduction: number
  otherDeductions: number

  totalDeductions: number

  netPay: number

  payrollStatus: CompletedEmployeePayrollStatus
  paymentStatus: EmployeePayrollPaymentStatus

  completedBy: string
  completedAt: string

  paidBy?: string
  paidAt?: string

  referenceNumber?: string

  remarks?: string
}