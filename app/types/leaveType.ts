export type LeaveTypeStatus = 'active' | 'inactive'

export interface LeaveType {
  id: number
  userId: number
  code: string
  name: string
  status: string
  policiesCount: number
  requestsCount: number
}

export interface LeaveTypePayload {
  leave_code: string
  leave_name: string
  status: LeaveTypeStatus
}

export interface LeaveTypeApiRecord {
  id: number
  user_id: number
  leave_code: string
  leave_name: string
  status: string
  leave_policies_count?: number
  leave_requests_count?: number
}

export interface LeaveTypeApiResponse<T> {
  success: boolean
  message: string
  data: T
}