export type ClientAssignmentStatus =
  | 'Active'
  | 'Pending'
  | 'Ended'
  | 'Transferred'

export type ClientAssignmentType =
  | 'Primary'
  | 'Temporary'
  | 'Reliever'
  | 'Project-Based'

export interface ClientEmployeeAssignment {
  id: number

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  clientId: number
  clientCode: string
  clientName: string

  assignmentDate: string
  endDate?: string

  assignmentType: ClientAssignmentType
  status: ClientAssignmentStatus

  assignedBy: string
  createdAt: string

  remarks?: string
}

export interface ClientAssignmentFormData {
  employeeId: number

  clientId: number

  assignmentDate: string

  endDate?: string

  assignmentType:
    ClientAssignmentType

  status:
    ClientAssignmentStatus

  remarks?: string
}