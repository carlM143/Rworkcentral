export type PerformanceEvaluationStatus =
  | 'Pending'
  | 'In Progress'
  | 'For Review'
  | 'Completed'
  | 'Acknowledged'

export type PerformanceRecommendation =
  | 'Pending'
  | 'Needs Improvement'
  | 'Meets Expectations'
  | 'Exceeds Expectations'
  | 'Outstanding'

export interface PerformanceEvaluation {
  id: number

  evaluationNumber: string

  cycleCode: string
  cycleName: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  evaluatorName: string
  evaluatorPosition: string

  evaluationPeriodStart: string
  evaluationPeriodEnd: string

  dueDate: string

  progress: number

  overallScore?: number

  recommendation: PerformanceRecommendation

  status: PerformanceEvaluationStatus

  completedAt?: string
  acknowledgedAt?: string

  remarks?: string
}