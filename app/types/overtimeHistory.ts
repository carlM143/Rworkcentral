export type OvertimeHistoryType =
  | 'Regular OT'
  | 'Rest Day OT'
  | 'Holiday OT'

export type OvertimeHistoryStatus =
  | 'Approved'
  | 'Rejected'
  | 'Cancelled'

export type OvertimeHistoryPayrollStatus =
  | 'Not Applicable'
  | 'Ready for Payroll'
  | 'Included in Payroll'
  | 'Processed'

export interface OvertimeHistory {
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

  overtimeType: OvertimeHistoryType

  reason: string

  status: OvertimeHistoryStatus

  payrollStatus: OvertimeHistoryPayrollStatus
  payrollPeriod?: string

  requestedAt: string

  reviewedBy?: string
  reviewedAt?: string

  remarks?: string
}