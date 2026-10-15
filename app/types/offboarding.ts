export type OffboardingType =
  | 'Resignation'
  | 'End of Contract'
  | 'Retirement'
  | 'Termination'
  | 'Redundancy'

export type OffboardingStatus =
  | 'Draft'
  | 'Pending Clearance'
  | 'Clearance In Progress'
  | 'For Review'
  | 'Ready for Final Pay'
  | 'Completed'
  | 'Cancelled'

export type FinalPayStatus =
  | 'Not Started'
  | 'For Processing'
  | 'For Review'
  | 'Ready for Release'
  | 'Released'

export interface OffboardingChecklist {
  hrClearance: boolean
  departmentClearance: boolean
  financeClearance: boolean
  itClearance: boolean
  assetReturn: boolean
  exitInterview: boolean
}

export interface OffboardingRecord {
  id: number

  offboardingNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  offboardingType: OffboardingType

  noticeDate: string
  lastWorkingDay: string
  separationDate: string

  initiatedBy: string

  reason: string

  checklist: OffboardingChecklist

  completedTasks: number
  totalTasks: number
  clearanceProgress: number

  finalPayStatus: FinalPayStatus

  exitInterviewDate?: string
  approvedBy?: string

  status: OffboardingStatus

  remarks?: string

  createdAt: string
  updatedAt: string
}