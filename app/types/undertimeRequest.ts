export type UndertimeRequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'

export interface UndertimeRequest {
  id: number
  requestNumber: string
  employeeId: number
  employeeNumber: string
  employeeName: string
  undertimeDate: string
  requestedTimeOut: string
  scheduledTimeOut: string
  requestedMinutes: number
  reason: string
  status: UndertimeRequestStatus
  requestedAt: string
  reviewedBy?: string
  reviewedAt?: string
}

export interface UndertimeApprovalApiRecord {
  id: number
  employee_id: number
  request_no: string
  undertime_date: string
  requested_time_out: string
  scheduled_time_out: string
  requested_minutes: number
  reason: string
  status: string
  approved_at: string | null
  created_at: string
  employee?: { emp_id: string; firstname: string; lastname: string } | null
  approver?: { name: string } | null
}

export interface UndertimeApprovalApiResponse<T> {
  success: boolean
  message: string
  data: T
}
