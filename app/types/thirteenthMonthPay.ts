export type ThirteenthMonthStatus =
  | 'Draft'
  | 'For Review'
  | 'Approved'
  | 'For Release'
  | 'Released'

export type ThirteenthMonthEmploymentType =
  | 'Regular'
  | 'Probationary'
  | 'Contractual'
  | 'Project-Based'

export interface ThirteenthMonthRecord {
  id: number

  referenceNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  employmentType: ThirteenthMonthEmploymentType

  coverageYear: number

  employmentStartDate: string
  employmentEndDate?: string

  monthsCovered: number

  basicSalaryEarned: number
  adjustments: number

  eligibleBasicPay: number

  computedAmount: number

  previousRelease: number
  payableAmount: number

  approvedBy?: string

  releaseDate?: string

  status: ThirteenthMonthStatus

  remarks?: string
}