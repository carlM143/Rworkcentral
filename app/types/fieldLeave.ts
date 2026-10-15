export type FieldLeaveType =
  | 'Client Visit'
  | 'Site Assignment'
  | 'Official Business'
  | 'Delivery / Pickup'
  | 'Field Work'
  | 'Inspection'
  | 'Other'

export type FieldLeaveStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Completed'
  | 'Cancelled'

export type FieldLeaveAction =
  | 'approve'
  | 'reject'
  | 'complete'
  | 'cancel'

export interface FieldLeaveAttachment {
  name: string
  url?: string
}

export interface FieldLeaveRecord {
  id: number

  requestNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  leaveType:
    FieldLeaveType

  fieldDate: string

  timeFrom: string
  timeTo: string

  destination: string

  client?: string

  purpose: string

  relatedTripId?: number
  relatedTripNumber?: string

  attachment?:
    FieldLeaveAttachment

  status:
    FieldLeaveStatus

  requestedBy: string
  requestedAt: string

  approvedBy?: string
  approvedAt?: string
  approvalNotes?: string

  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string

  completedBy?: string
  completedAt?: string
  actualCompletionTime?: string
  completionNotes?: string

  cancelledBy?: string
  cancelledAt?: string
  cancellationReason?: string
}

export interface FieldLeaveFormData {
  employeeId: number | null

  leaveType:
    FieldLeaveType

  fieldDate: string

  timeFrom: string
  timeTo: string

  destination: string

  client: string

  purpose: string

  relatedTripId:
    number | null

  attachmentName: string
}

export interface FieldLeaveStatusFormData {
  requestId: number

  action:
    FieldLeaveAction

  completionTime?: string

  notes: string
}