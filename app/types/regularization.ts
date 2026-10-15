export type RegularizationStatus =
  | 'For Evaluation'
  | 'For Review'
  | 'Recommended'
  | 'Approved'
  | 'Regularized'
  | 'Extended'
  | 'Not Recommended'

export type EvaluationStatus =
  | 'Pending'
  | 'In Progress'
  | 'Completed'

export type Recommendation =
  | 'Pending'
  | 'For Regularization'
  | 'Extend Probation'
  | 'Not Recommended'

export interface RegularizationRecord {
  id: number

  regularizationNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  dateHired: string
  probationEndDate: string
  targetRegularizationDate: string

  probationMonths: number

  evaluationStatus: EvaluationStatus

  evaluationScore?: number

  recommendation: Recommendation

  reviewedBy?: string
  approvedBy?: string

  approvalDate?: string
  effectiveDate?: string

  documentsComplete: boolean

  status: RegularizationStatus

  remarks?: string

  createdAt: string
  updatedAt: string
}