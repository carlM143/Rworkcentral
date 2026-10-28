export type DepartmentStatus = 'Active' | 'Inactive'

export interface Department {
  id: number
  companyId: number
  code: string
  name: string
  status: DepartmentStatus

  employeeCount: number
  positionCount: number

  // Retained as optional for older components.
  // Not currently stored by the Department API.
  description?: string
  head?: string
}

export interface DepartmentFormData {
  name: string
  code: string
  status: DepartmentStatus
}