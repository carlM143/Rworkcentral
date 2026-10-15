export type OvertimeRequestStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'

export interface OvertimeRequest {
  id: number

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  date: string

  timeFrom: string
  timeTo: string

  hours: number

  reason: string

  status: OvertimeRequestStatus

  filedAt: string

  approvedBy?: string
}

export interface OvertimeDepartmentSummary {
  department: string
  employees: number
  requests: number
  approvedHours: number
}