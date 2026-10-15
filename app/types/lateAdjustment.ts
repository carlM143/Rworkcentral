export type LateAdjustmentStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'

export interface LateAdjustmentRecord {
  id: number

  timeLogId: number

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  attendanceDate: string

  schedule: string

  actualTimeIn: string

  originalLateMinutes: number

  adjustedLateMinutes: number

  reason: string

  status:
    LateAdjustmentStatus

  requestedAt: string
  requestedBy: string

  reviewedAt?: string
  reviewedBy?: string

  reviewNotes?: string
}

export interface LateAdjustmentFormData {
  adjustedLateMinutes: number

  reason: string
}