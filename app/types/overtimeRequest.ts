export type OvertimeRequestStatus =
  | 'Pending'
  | 'For Review'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled'

export type OvertimeType =
  | 'Regular OT'
  | 'Rest Day OT'
  | 'Holiday OT'

export interface OvertimeRequest {
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

  overtimeType: OvertimeType

  reason: string

  status: OvertimeRequestStatus

  requestedAt: string

  reviewedBy?: string
  reviewedAt?: string

  remarks?: string
}