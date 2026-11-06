export type ReadinessStatus = 'ready' | 'warning' | 'blocked'
export type ReadinessSeverity = 'blocker' | 'warning'
export type PeriodStatus = 'draft' | 'open' | 'processing' | 'closed'

export interface ReadinessIssue {
  severity: ReadinessSeverity
  code: string
  message: string
}

export interface ReadinessPending {
  overtime: number
  undertime: number
  leave: number
  corrections: number
  late_adjustments: number
  transfers: number
}

export interface ReadinessEmployee {
  employee_id: number
  emp_id: string
  name: string
  department: string | null
  is_active: boolean
  payroll_group: {
    id: number
    group_name: string
    frequency: string
  } | null
  basic_salary: string | number | null
  allowance: string | number | null
  salary_type: string | null
  time_logs_count: number
  incomplete_logs_count: number
  pending: ReadinessPending
  status: ReadinessStatus
  issues: ReadinessIssue[]
}

export interface ReadinessGroupSummary {
  id: number
  group_name: string
  frequency: string
  employees: number
  ready: number
  warning: number
  blocked: number
  frequency_mismatch: boolean
}

export interface ReadinessUnassigned {
  employee_id: number
  emp_id: string
  name: string
  department: string | null
}

export interface ReadinessStats {
  included: number
  ready: number
  warning: number
  blocked: number
  unassigned: number
}

export interface ReadinessPeriod {
  id: number
  period_name: string | null
  cutoff_number: 1 | 2
  cutoff_start: string
  cutoff_end: string
  payment_date: string | null
  status: string
}

export interface PayrollReadinessResult {
  period: ReadinessPeriod
  period_issues: ReadinessIssue[]
  stats: ReadinessStats
  groups: ReadinessGroupSummary[]
  employees: ReadinessEmployee[]
  unassigned: ReadinessUnassigned[]
  can_generate: boolean
}