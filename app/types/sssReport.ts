export type SssContributionStatus =
  | 'Draft'
  | 'For Review'
  | 'Ready for Remittance'
  | 'Remitted'

export type SssEmploymentType =
  | 'Regular'
  | 'Probationary'
  | 'Contractual'
  | 'Project-Based'

export interface SssReportRecord {
  id: number

  referenceNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  sssNumber: string

  department: string
  position: string

  employmentType: SssEmploymentType

  contributionMonth: string
  contributionYear: number

  compensation: number
  contributionBasis: number

  employeeShare: number
  employerShare: number
  ecContribution: number

  totalContribution: number

  remittanceReference?: string
  remittanceDate?: string

  status: SssContributionStatus

  remarks?: string
}