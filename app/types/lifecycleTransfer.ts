export type LifecycleTransferType =
  | 'Department Transfer'
  | 'Position Transfer'
  | 'Branch Transfer'
  | 'Client Assignment Transfer'
  | 'Internal Transfer'

export type LifecycleTransferStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Scheduled'
  | 'Effective'
  | 'Rejected'
  | 'Cancelled'

export interface LifecycleTransfer {
  id: number

  transferNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  transferType: LifecycleTransferType

  currentDepartment: string
  currentPosition: string
  currentBranch: string

  newDepartment: string
  newPosition: string
  newBranch: string

  requestedDate: string
  effectiveDate: string

  requestedBy: string
  approvedBy?: string

  reason: string

  status: LifecycleTransferStatus

  remarks?: string

  createdAt: string
  updatedAt: string
}