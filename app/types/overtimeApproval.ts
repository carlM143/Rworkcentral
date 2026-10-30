export type OvertimeApprovalType =
  | 'Regular OT'
  | 'Rest Day OT'
  | 'Holiday OT'

export type OvertimeApprovalStatus =
  | 'Pending'
  | 'For Review'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled'

export interface OvertimeApproval {
  id: number

  requestNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  overtimeDate: string

  startTime: string
  endTime: string

  requestedHours: number
  approvedHours?: number

  overtimeType: OvertimeApprovalType

  reason: string

  filedAt: string

  status: OvertimeApprovalStatus

  immediateSupervisor: string

  reviewedBy?: string
  reviewedAt?: string

  remarks?: string
}

export interface OvertimeApprovalApiRecord {
  id: number
  employee_id: number
  request_no: string
  ot_date: string
  start_at: string
  end_at: string
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

export interface OvertimeApprovalApiResponse<T> {
  success: boolean
  message: string
  data: T
}
