export type LeaveCalendarStatus =
  | 'Approved'
  | 'Pending'

export type LeaveCalendarType =
  | 'Vacation Leave'
  | 'Sick Leave'
  | 'Emergency Leave'
  | 'Special Leave'
  | 'Maternity Leave'
  | 'Paternity Leave'

export interface LeaveCalendarEvent {
  id: number

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  leaveType: LeaveCalendarType

  startDate: string
  endDate: string

  days: number

  reason: string

  status: LeaveCalendarStatus
}