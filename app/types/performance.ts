export type EvaluationStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Completed'
  | 'Overdue'

export type EvaluationType =
  | 'Annual'
  | 'Probationary'
  | 'Regularization'
  | 'Special'

export type PerformanceCycleStatus =
  | 'Draft'
  | 'Active'
  | 'Completed'

export interface PerformanceEvaluation {
  id: number

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  evaluator: string

  evaluationType: EvaluationType

  dueDate: string

  score?: number
  rating?: string

  status: EvaluationStatus
}

export interface PerformanceCycle {
  id: number

  name: string

  dateFrom: string
  dateTo: string

  totalEmployees: number
  completedEmployees: number

  progress: number

  status: PerformanceCycleStatus
}

export interface PerformanceActivity {
  id: number

  employeeName: string

  action: string
  description: string

  date: string
}