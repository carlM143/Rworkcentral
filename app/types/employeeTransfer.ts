export type EmployeeTransferType =
  | 'Department Transfer'
  | 'Position Change'
  | 'Department & Position'

export type EmployeeTransferStatus =
  | 'Pending'
  | 'For Review'
  | 'Approved'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled'

export interface EmployeeTransfer {
  id: number

  transferNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  transferType: EmployeeTransferType

  fromDepartment: string
  fromPosition: string

  toDepartment: string
  toPosition: string

  reason: string

  requestedDate: string
  effectiveDate: string

  status: EmployeeTransferStatus

  requestedBy: string

  reviewedBy?: string
  reviewedAt?: string

  completedAt?: string

  remarks?: string
}