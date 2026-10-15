export type PromotionStatus =
  | 'Draft'
  | 'For Review'
  | 'Pending Approval'
  | 'Approved'
  | 'Scheduled'
  | 'Effective'
  | 'Rejected'
  | 'Cancelled'

export type PromotionType =
  | 'Position Promotion'
  | 'Grade Promotion'
  | 'Salary Promotion'
  | 'Leadership Promotion'

export interface PromotionRecord {
  id: number

  promotionNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string

  currentPosition: string
  newPosition: string

  currentGrade: string
  newGrade: string

  currentSalary: number
  newSalary: number

  salaryIncrease: number
  increasePercentage: number

  promotionType: PromotionType

  recommendedBy: string
  approvedBy?: string

  recommendationDate: string
  effectiveDate: string

  reason: string

  status: PromotionStatus

  remarks?: string

  createdAt: string
  updatedAt: string
}