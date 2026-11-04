export type AdjustmentType = 'increase' | 'decrease' | 'correction'
export type AdjustmentStatus = 'pending' | 'approved' | 'rejected' | 'applied' | 'cancelled'
export type ApprovalAction = 'approve' | 'reject' | 'apply'
export type MoneyValue = number | string | null

export interface SalaryAdjustment {
  id: number
  employee_id: number
  employee_name: string
  emp_id: string | number | null
  salary_setup_id: number
  salary_type: string | null
  adjustment_type: AdjustmentType
  previous_basic_salary: MoneyValue
  new_basic_salary: MoneyValue
  previous_allowance: MoneyValue
  new_allowance: MoneyValue
  effective_date: string
  reason: string | null
  status: AdjustmentStatus
  approved_by: number | null
  approved_by_name: string | null
  approved_at: string | null
  applied_by: number | null
  applied_by_name: string | null
  applied_at: string | null
  created_at: string | null
}

export interface SalarySetupChoice {
  // From GET /admin/employee-salary-rates; id is salary_setups.id, not employees.id.
  id: number | null
  employee_id: number
  employee_name: string
  emp_id: string | number | null
  department_name?: string | null
  position_name?: string | null
  salary_type_name: string
  basic_salary: MoneyValue
  allowance: MoneyValue
  is_configured: boolean
  status: boolean | number | string
}

export interface CreateSalaryAdjustmentPayload {
  employee_id: number
  salary_setup_id: number
  adjustment_type: AdjustmentType
  new_basic_salary: number
  new_allowance: number | null
  effective_date: string
  reason: string | null
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export type SalaryAdjustmentsResponse = ApiResponse<SalaryAdjustment[]>
export type SalaryAdjustmentResponse = ApiResponse<SalaryAdjustment>
export type SalarySetupChoicesResponse = ApiResponse<SalarySetupChoice[]>

export interface SalaryAdjustmentStats {
  total: number
  pending: number
  approved: number
  applied: number
}

export interface ApiErrorDetails {
  message: string
  errors: Record<string, string[]>
}