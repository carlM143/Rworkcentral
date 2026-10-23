export type PositionStatus = 'Active' | 'Inactive'

export interface Position {
  id: number
  departmentId: number | null
  department: string
  name: string
  description: string
  status: PositionStatus
  createdAt: string
  updatedAt: string
}

export interface PositionFormData {
  departmentId: number | null
  name: string
  description: string
  status: PositionStatus
}