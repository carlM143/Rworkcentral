export interface EmployeeLeaveType {
  id: number
  leave_code: string
  leave_name: string
  status: string
}

export interface EmployeeLeaveTypesResponse {
  success: boolean
  message: string
  data: EmployeeLeaveType[]
}
