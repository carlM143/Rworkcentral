import type { LeaveApprovalDateItem } from '~/types/leaveApproval'

export type ApprovalRequestType =
  | 'Leave'
  | 'Overtime'
  | 'Undertime'
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
  sourceId?: number
  sourceType?: 'leave' | 'overtime' | 'undertime'

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

  // Detailed fields for preview modal
  start?: string
  end?: string
  totalDays?: number
  dates?: LeaveApprovalDateItem[]
  requestedPayType?: 'paid' | 'unpaid'
  leavePolicyId?: number | null
  policyStatus?: string | null
  startTime?: string
  endTime?: string
  requestedHours?: number
  requestedTimeOut?: string
  scheduledTimeOut?: string
  requestedMinutes?: number
}
