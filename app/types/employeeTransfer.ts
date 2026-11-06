
export type EmployeeTransferStatus =
  | 'pending' | 'approved' | 'scheduled'
  | 'applied' | 'rejected' | 'cancelled'

export type TransferMode = 'direct' | 'request'

export interface TransferDepartment {
  id: number
  department_name?: string | null
  department_code?: string | null
  name?: string | null
  company_id?: number | null
}

export interface TransferEmployee {
  id: number
  emp_id?: string | number | null
  firstname?: string | null
  lastname?: string | null
  department_id?: number | null
}

export interface TransferUser {
  id: number
  name?: string | null
  email?: string | null
}

export interface EmployeeTransfer {
  id: number
  employee_id: number
  from_department_id: number
  to_department_id: number
  effective_date: string
  reason: string | null
  status: EmployeeTransferStatus
  created_by: number
  reviewed_by: number | null
  reviewed_at: string | null
  review_remarks: string | null
  applied_by: number | null
  applied_at: string | null
  created_at: string
  updated_at: string
  employee?: TransferEmployee | null
  from_department?: TransferDepartment | null
  to_department?: TransferDepartment | null
  creator?: TransferUser | null
  reviewer?: TransferUser | null
  applier?: TransferUser | null
}

export interface EmployeeTransferStatsData {
  total: number
  pending: number
  approved: number
  scheduled: number
  applied: number
  rejected: number
  cancelled: number
}

export interface EmployeeOption {
  id: number
  label: string
  employeeNumber: string
  currentDepartmentId: number | null
}

export interface CreateTransferPayload {
  employee_id: number
  to_department_id: number
  effective_date: string
  reason?: string
  mode: TransferMode
}

export interface UpdateTransferPayload {
  to_department_id: number
  effective_date: string
  reason?: string
}
