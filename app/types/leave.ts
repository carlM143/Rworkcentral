export type LeaveRequestStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'

export type LeaveTypeName =
  | 'Vacation Leave'
  | 'Sick Leave'
  | 'Emergency Leave'
  | 'Paternity Leave'
  | 'Maternity Leave'
  | 'Bereavement Leave'
  | 'Special Leave'
  | 'Unpaid Leave'

export interface LeaveRequest {
  id: number

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  leaveType: LeaveTypeName

  dateFrom: string
  dateTo: string

  days: number

  reason?: string

  status: LeaveRequestStatus

  filedAt: string
}

export interface LeaveRequestFormData {
  employeeId: number

  leaveType: LeaveTypeName

  dateFrom: string
  dateTo: string

  days: number

  reason?: string
}

export interface LeaveBalanceSummary {
  id: number

  leaveType: string

  total: number
  used: number
  available: number
}