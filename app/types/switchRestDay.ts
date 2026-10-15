export type SwitchRestDayStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled'

export type SwitchRestDayAction =
  | 'approve'
  | 'reject'
  | 'cancel'

export interface SwitchRestDayAttachment {
  name: string
  url?: string
}

export interface SwitchRestDayRecord {
  id: number

  requestNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  currentSchedule: string

  currentRestDay: string
  requestedRestDay: string

  effectiveDate: string
  effectiveWeek: string

  reason: string

  attachment?: SwitchRestDayAttachment

  status: SwitchRestDayStatus

  requestedBy: string
  requestedAt: string

  approvedBy?: string
  approvedAt?: string
  approvalNotes?: string

  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string

  cancelledBy?: string
  cancelledAt?: string
  cancellationReason?: string
}

export interface SwitchRestDayFormData {
  employeeId: number | null

  requestedRestDay: string

  effectiveDate: string

  reason: string

  attachmentName: string
}

export interface SwitchRestDayStatusFormData {
  requestId: number

  action: SwitchRestDayAction

  notes: string
}