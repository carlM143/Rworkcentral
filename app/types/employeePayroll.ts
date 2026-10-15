export type EmployeePayrollStatus =
  | 'Pending'
  | 'For Review'
  | 'Ready'
  | 'Completed'

export type EmployeePayrollPaymentStatus =
  | 'Not Yet Paid'
  | 'Pending Payment'
  | 'Paid'
  | 'Released'

export interface EmployeePayroll {
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

  payrollStatus: EmployeePayrollStatus
  paymentStatus: EmployeePayrollPaymentStatus

  referenceNumber?: string

  preparedBy: string
  preparedAt: string

  completedBy?: string
  completedAt?: string

  paidBy?: string
  paidAt?: string

  remarks?: string
}