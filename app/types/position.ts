export type PositionStatus =
  | 'Active'
  | 'Inactive'

export type PositionLevel =
  | 'Entry Level'
  | 'Staff'
  | 'Senior'
  | 'Supervisor'
  | 'Manager'
  | 'Executive'

export interface Position {
  id: number

  code: string
  name: string

  department: string

  level: PositionLevel

  description: string

  currentHeadcount: number
  approvedHeadcount: number

  minimumSalary?: number
  maximumSalary?: number

  status: PositionStatus

  createdAt: string
  updatedAt: string
}