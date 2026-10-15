export type WfhRequestType =
  | 'Full Day WFH'
  | 'Half Day WFH'
  | 'Hybrid Schedule'

export type WfhApprovalStatus =
  | 'Pending'
  | 'For Review'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled'

export interface WfhApproval {
  id: number

  requestNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  requestType: WfhRequestType

  startDate: string
  endDate: string

  totalDays: number

  workLocation: string

  reason: string

  workPlan: string

  filedAt: string

  immediateSupervisor: string

  status: WfhApprovalStatus

  reviewedBy?: string
  reviewedAt?: string

  remarks?: string
}