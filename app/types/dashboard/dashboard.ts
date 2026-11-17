export interface DashboardMetric {
  value: number
  percent: number
}

export interface DashboardSummary {
  date: string
  total_employees: {
    value: number
    new_this_month: number
  }
  present: DashboardMetric
  late: DashboardMetric
  absent: DashboardMetric
  wfh: DashboardMetric
}

export interface DashboardSummaryResponse {
  success: boolean
  message: string
  data: DashboardSummary
}