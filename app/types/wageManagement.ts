export type WageOrderStatus =
  | 'Draft'
  | 'Scheduled'
  | 'Active'
  | 'Superseded'

export interface WageOrder {
  id: number
  code: string
  title: string
  region: string
  classification: string
  oldMinimumRate: number
  newMinimumRate: number
  increaseAmount: number
  effectiveDate: string
  tranche: string
  source: string
  status: WageOrderStatus
}

export type WageAdjustmentStatus =
  | 'For Review'
  | 'Pending Approval'
  | 'Approved'
  | 'Scheduled'
  | 'Effective'

export type WageAdjustmentResult =
  | 'Required'
  | 'Compliant'
  | 'Distortion Review'

export interface WageAdjustmentRecord {
  id: number

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string
  region: string
  classification?: string

  currentRate: number
  newMinimumRate: number

  requiredIncrease: number
  proposedRate: number

  result: WageAdjustmentResult

  distortionRisk: boolean

  wageOrderCode: string
  effectiveDate: string

  status: WageAdjustmentStatus
  remarks?: string
  distortionReviewed?: boolean
  approvedBy?: string
  appliedFromRate?: number
}

export type CompensationChangeReason =
  | 'Government Wage Order'
  | 'Promotion'
  | 'Regularization'
  | 'Merit Increase'
  | 'Annual Increase'
  | 'Salary Alignment'
  | 'Wage Distortion Correction'
  | 'Manual Correction'

export interface CompensationHistoryRecord {
  id: number

  employeeId: number
  employeeNumber: string
  employeeName: string

  oldRate: number
  newRate: number

  salaryType: 'Daily' | 'Monthly'

  reason: CompensationChangeReason

  effectiveDate: string

  wageOrderCode?: string
  approvedBy: string

  remarks?: string
}

export type WageComplianceStatus =
  | 'Compliant'
  | 'Below Minimum'
  | 'Pending Adjustment'
  | 'Distortion Review'

export interface WageComplianceRecord {
  id: number

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  region: string

  currentRate: number
  requiredMinimum: number

  variance: number

  wageOrderCode: string

  distortionRisk: boolean

  status: WageComplianceStatus
}
