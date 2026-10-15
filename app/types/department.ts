export type DepartmentStatus =
  | 'Active'
  | 'Inactive'

export interface Department {
  id: number
  code: string
  name: string
  description?: string
  head?: string
  status: DepartmentStatus
}