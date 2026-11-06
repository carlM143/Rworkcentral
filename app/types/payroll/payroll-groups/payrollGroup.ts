export type PayrollFrequency =
  | 'weekly'
  | 'bi_weekly'
  | 'semi_monthly'
  | 'monthly'

export interface PayrollGroup {
  id: number
  group_name: string
  description: string | null
  frequency: PayrollFrequency
  is_active: boolean
  current_employee_count?: number
  payrolls_count?: number
  assignments_count?: number
  created_at?: string
  updated_at?: string
}

export interface PayrollGroupStats {
  total: number
  active: number
  inactive: number
}

export interface PayrollGroupPayload {
  group_name: string
  description: string | null
  frequency: PayrollFrequency
  is_active: boolean
}

export interface PayrollEmployee {
  id: number
  emp_id: string
  firstname: string
  lastname: string
  department_id: number | null
  status: boolean | number | string
  payroll_group_assignments?: PayrollAssignment[]
}

export interface PayrollAssignment {
  id: number
  employee_id: number
  payroll_group_id: number
  effective_from: string
  effective_to: string | null
  employee?: PayrollEmployee
  payroll_group?: PayrollGroup
  payrollGroup?: PayrollGroup
  assigned_by?: {
    id: number
    name: string
  }
  assignedBy?: {
    id: number
    name: string
  }
  created_at?: string
}

export interface LaravelPagination<T> {
  current_page: number
  data: T[]
  first_page_url: string | null
  from: number | null
  last_page: number
  last_page_url: string | null
  links: Array<{
    url: string | null
    label: string
    active: boolean
  }>
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number | null
  total: number
}

export interface PayrollGroupResponse {
  success: boolean
  message?: string
  data: PayrollGroup[]
  stats: PayrollGroupStats
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface PayrollGroupApiError {
  message?: string
  errors?: Record<string, string[]>
}