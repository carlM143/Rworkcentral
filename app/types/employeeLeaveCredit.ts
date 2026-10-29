export type EmployeeLeaveCreditStatus =
  | 'eligible'
  | 'not_yet_eligible'
  | 'not_eligible'
  | 'no_policy'

export type EmployeeLeaveCreditPay = 'Paid' | 'Unpaid' | 'N/A'

export interface EmployeeLeaveCredit {
  leave_type_id: number
  leave_code: string
  leave_type: string
  employment_type: string
  employment_type_id: number
  leave_policy_id: number | null
  annual_credits: number
  available_credits: number
  pay: EmployeeLeaveCreditPay
  min_service_months: number
  status: EmployeeLeaveCreditStatus
}

export interface EmployeeLeaveCreditData {
  employee_id: number
  emp_id: number
  employee_name: string
  employment_type: string
  employment_type_id: number
  date_hired: string
  months_of_service: number
  leave_types: EmployeeLeaveCredit[]
}

export interface EmployeeLeaveCreditApiResponse {
  success: boolean
  message: string
  data: EmployeeLeaveCreditData
}
