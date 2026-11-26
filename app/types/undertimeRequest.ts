export type UndertimeRequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'

export interface UndertimeRequest {
  departmentApprovals?: import('./leaveApproval').LeaveApproval['department_approvals']
  /** Supervisor (first-level) approval: pending | approved | rejected | overridden | skipped */
  supervisorStatus?: string | null
  supervisorId?: number | null
  id: number
  requestNumber: string
  employeeId: number
  employeeNumber: string
  employeeName: string
  department: string
  position: string
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
  department_approvals?: import('./leaveApproval').LeaveApproval['department_approvals']
  dept_head_status?: string | null
  dept_head_id?: number | null
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
  employee?: {
    emp_id: string | number
    firstname: string
    middlename?: string | null
    lastname: string
    department?: { department_name?: string | null } | null
    employments?: Array<{
      id: number
      department?: { department_name?: string | null } | null
      position?: { position?: string | null } | null
    }>
  } | null
  work_schedule?: { schedule_name?: string } | null
  approver?: { name: string } | null
}

export interface UndertimeApprovalApiResponse<T> {
  success: boolean
  message: string
  data: T
}
