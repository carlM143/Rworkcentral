export type LifecycleEventType =
  | 'Onboarding'
  | 'Regularization'
  | 'Transfer'
  | 'Promotion'
  | 'Employment Change'
  | 'Offboarding'

export type LifecycleHistoryStatus =
  | 'Completed'
  | 'Effective'
  | 'Approved'
  | 'Scheduled'
  | 'In Progress'
  | 'Cancelled'

export interface LifecycleHistoryRecord {
  id: number

  referenceNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  eventType: LifecycleEventType

  eventTitle: string

  previousValue?: string
  newValue?: string

  effectiveDate: string

  processedBy: string
  approvedBy?: string

  status: LifecycleHistoryStatus

  description: string

  remarks?: string

  createdAt: string
}