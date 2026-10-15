export type ApprovedOvertimeType =
  | 'Regular OT'
  | 'Rest Day OT'
  | 'Holiday OT'

export type ApprovedOvertimePayrollStatus =
  | 'Ready for Payroll'
  | 'Included in Payroll'
  | 'Processed'

export interface ApprovedOvertime {
  id: number

  requestNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  overtimeDate: string

  startTime: string
  endTime: string

  requestedHours: number
  approvedHours: number

  overtimeType: ApprovedOvertimeType

  reason: string

  approvedBy: string
  approvedAt: string

  payrollStatus: ApprovedOvertimePayrollStatus

  payrollPeriod?: string

  remarks?: string
}