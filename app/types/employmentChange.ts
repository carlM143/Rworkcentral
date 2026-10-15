export type EmploymentChangeType =
  | 'Employment Type Change'
  | 'Contract Extension'
  | 'Work Arrangement Change'
  | 'Reporting Line Change'
  | 'Compensation Adjustment'
  | 'Employment Status Change'

export type EmploymentChangeStatus =
  | 'Draft'
  | 'For Review'
  | 'Pending Approval'
  | 'Approved'
  | 'Scheduled'
  | 'Effective'
  | 'Rejected'
  | 'Cancelled'

export interface EmploymentChangeRecord {
  id: number

  changeNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  changeType: EmploymentChangeType

  currentValue: string
  newValue: string

  requestedDate: string
  effectiveDate: string

  requestedBy: string
  approvedBy?: string

  reason: string

  status: EmploymentChangeStatus

  remarks?: string

  createdAt: string
  updatedAt: string
}