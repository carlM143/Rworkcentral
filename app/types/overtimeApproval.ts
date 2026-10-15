export type OvertimeApprovalType =
  | 'Regular OT'
  | 'Rest Day OT'
  | 'Holiday OT'

export type OvertimeApprovalStatus =
  | 'Pending'
  | 'For Review'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled'

export interface OvertimeApproval {
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
  approvedHours?: number

  overtimeType: OvertimeApprovalType

  reason: string

  filedAt: string

  status: OvertimeApprovalStatus

  immediateSupervisor: string

  reviewedBy?: string
  reviewedAt?: string

  remarks?: string
}