export type PerformanceCycleType =
  | 'Annual Review'
  | 'Semi-Annual Review'
  | 'Quarterly Review'
  | 'Probationary Review'

export type PerformanceCycleStatus =
  | 'Draft'
  | 'Scheduled'
  | 'Active'
  | 'Completed'
  | 'Archived'

export interface PerformanceCycle {
  id: number

  cycleCode: string
  name: string

  type: PerformanceCycleType

  evaluationYear: number

  performancePeriodStart: string
  performancePeriodEnd: string

  evaluationStart: string
  evaluationEnd: string

  totalEmployees: number
  completedEvaluations: number
  pendingEvaluations: number

  status: PerformanceCycleStatus

  createdBy: string
  createdAt: string
  updatedAt: string

  remarks?: string
}