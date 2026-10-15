export type DepartmentAssignmentType =
  | 'Primary'
  | 'Temporary'
  | 'Acting'

export type DepartmentAssignmentStatus =
  | 'Active'
  | 'Temporary'
  | 'Ended'

export interface DepartmentAssignment {
  id: number

  assignmentNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  assignmentType: DepartmentAssignmentType
  status: DepartmentAssignmentStatus

  supervisor: string

  effectiveDate: string
  endDate?: string

  assignedBy: string
  assignedAt: string

  remarks?: string
}