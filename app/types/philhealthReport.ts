export type PhilhealthContributionStatus =
  | 'Draft'
  | 'For Review'
  | 'Ready for Remittance'
  | 'Remitted'

export type PhilhealthEmploymentType =
  | 'Regular'
  | 'Probationary'
  | 'Contractual'
  | 'Project-Based'

export interface PhilhealthReportRecord {
  id: number

  referenceNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  philhealthNumber: string

  department: string
  position: string

  employmentType: PhilhealthEmploymentType

  contributionMonth: string
  contributionYear: number

  monthlyBasicSalary: number
  contributionBasis: number

  employeeShare: number
  employerShare: number

  totalPremium: number

  remittanceReference?: string
  remittanceDate?: string

  status: PhilhealthContributionStatus

  remarks?: string
}