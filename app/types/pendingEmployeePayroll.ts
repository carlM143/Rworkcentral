export type PendingEmployeePayrollStatus =
  | 'Pending'
  | 'For Review'
  | 'With Issue'
  | 'Ready'

export interface PendingEmployeePayroll {
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

  lateMinutes: number
  undertimeMinutes: number

  absentDays: number
  leaveDays: number

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

  status: PendingEmployeePayrollStatus

  issueCount: number

  remarks?: string

  preparedBy: string
  preparedAt: string
}