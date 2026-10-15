export type LeaveApprovalType =
  | 'Vacation Leave'
  | 'Sick Leave'
  | 'Emergency Leave'
  | 'Special Leave'
  | 'Maternity Leave'
  | 'Paternity Leave'
  | 'Unpaid Leave'

export type LeaveApprovalStatus =
  | 'Pending'
  | 'For Review'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled'

export interface LeaveApproval {
  id: number

  requestNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  leaveType: LeaveApprovalType

  startDate: string
  endDate: string

  totalDays: number

  availableBalance: number

  reason: string

  filedAt: string

  status: LeaveApprovalStatus

  immediateSupervisor: string

  reviewedBy?: string
  reviewedAt?: string

  remarks?: string
}