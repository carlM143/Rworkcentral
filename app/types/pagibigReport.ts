export type PagibigContributionStatus =
  | 'Draft'
  | 'For Review'
  | 'Ready for Remittance'
  | 'Remitted'

export type PagibigEmploymentType =
  | 'Regular'
  | 'Probationary'
  | 'Contractual'
  | 'Project-Based'

export interface PagibigReportRecord {
  id: number

  referenceNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  pagibigMidNumber: string

  department: string
  position: string

  employmentType: PagibigEmploymentType

  contributionMonth: string
  contributionYear: number

  monthlyCompensation: number
  contributionBasis: number

  employeeShare: number
  employerShare: number

  totalContribution: number

  remittanceReference?: string
  remittanceDate?: string

  status: PagibigContributionStatus

  remarks?: string
}