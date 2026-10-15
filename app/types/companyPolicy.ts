export type CompanyPolicyCategory =
  | 'General'
  | 'Attendance'
  | 'Leave'
  | 'Payroll'
  | 'Code of Conduct'
  | 'Health & Safety'
  | 'Information Security'
  | 'Remote Work'

export type CompanyPolicyStatus =
  | 'Draft'
  | 'Published'
  | 'Archived'

export interface CompanyPolicy {
  id: number

  policyNumber: string
  title: string

  category: CompanyPolicyCategory

  summary: string

  version: string

  effectiveDate: string
  reviewDate?: string

  acknowledgmentRequired: boolean

  acknowledgedEmployees: number
  totalEmployees: number

  status: CompanyPolicyStatus

  owner: string

  createdAt: string
  updatedAt: string
}