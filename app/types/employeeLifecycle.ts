export type LifecycleTransactionType =
  | 'Onboarding'
  | 'Regularization'
  | 'Transfer'
  | 'Promotion'
  | 'Employment Change'
  | 'Offboarding'

export type LifecycleTransactionStatus =
  | 'Pending'
  | 'In Progress'
  | 'Scheduled'
  | 'Completed'
  | 'Cancelled'

export interface LifecycleTransaction {
  id: number

  reference: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  type: LifecycleTransactionType

  currentValue?: string
  newValue?: string

  effectiveDate: string

  requestedBy: string

  remarks?: string

  status: LifecycleTransactionStatus
}

export interface LifecycleActivity {
  id: number

  employeeName: string

  action: string
  description: string

  date: string
}

export interface LifecycleUpcomingAction {
  id: number

  employeeName: string
  employeeNumber: string

  type: LifecycleTransactionType

  action: string

  dueDate: string
}