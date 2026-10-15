export type OnboardingStatus =
  | 'Not Started'
  | 'In Progress'
  | 'For Completion'
  | 'Completed'
  | 'On Hold'

export type EmploymentType =
  | 'Regular'
  | 'Probationary'
  | 'Contractual'
  | 'Project-Based'

export interface OnboardingChecklist {
  documents: boolean
  employeeProfile: boolean
  companyAccount: boolean
  orientation: boolean
  policyAcknowledgment: boolean
  departmentEndorsement: boolean
}

export interface OnboardingEmployee {
  id: number

  onboardingNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  email: string

  department: string
  position: string

  employmentType: EmploymentType

  dateHired: string
  onboardingStartDate: string
  targetCompletionDate: string

  assignedHr: string

  checklist: OnboardingChecklist

  completedTasks: number
  totalTasks: number
  progress: number

  status: OnboardingStatus

  remarks?: string

  createdAt: string
  updatedAt: string
}