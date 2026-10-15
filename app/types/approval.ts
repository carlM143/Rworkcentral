export type ApprovalRequestType =
  | 'Leave'
  | 'Overtime'
  | 'Time Log Correction'
  | 'WFH'

export type ApprovalRequestStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'

export type ApprovalPriority =
  | 'Normal'
  | 'Urgent'

export interface ApprovalRequest {
  id: number

  reference: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  type: ApprovalRequestType

  title: string
  description: string

  requestDate: string
  submittedAt: string

  status: ApprovalRequestStatus
  priority: ApprovalPriority

  approver?: string
}