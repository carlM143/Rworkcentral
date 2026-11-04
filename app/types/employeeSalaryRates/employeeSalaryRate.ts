
export interface EmployeeSalaryRate {
  id: number

  employee_id: number
  emp_id: string | number | null
  employee_name: string

  department_id: number | null
  department_name: string
  position_name: string

  salary_type_id: number | null
  salary_type_name: string

  basic_salary: string | number
  allowance: string | number

  status: boolean
}

export interface SalaryRateOption {
  id: number
  name: string
}

export interface SalaryRateFilterOptions {
  departments: SalaryRateOption[]
  salary_types: SalaryRateOption[]
}

export interface SalaryRatesResponse {
  success: boolean
  message: string
  data: EmployeeSalaryRate[]
}

export interface SalaryRateOptionsResponse {
  success: boolean
  message: string
  data: SalaryRateFilterOptions
}
