export type ReportCategory =
  | 'Employees'
  | 'Timekeeping'
  | 'Payroll'
  | 'Leave & Overtime'
  | 'Government'

export type ReportStatus =
  | 'Completed'
  | 'Pending'

export interface ReportModule {
  id: number

  title: string
  description: string

  category: ReportCategory

  route: string

  reports: number
}

export interface RecentReport {
  id: number

  title: string
  category: ReportCategory

  period: string

  generatedBy: string
  generatedAt: string

  format: 'PDF' | 'Excel'

  status: ReportStatus
}

export interface AnalyticsSummary {
  label: string
  value: string
  description: string
}