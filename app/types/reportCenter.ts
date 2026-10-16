export type ReportCategory =
  | 'Employee'
  | 'Timekeeping'
  | 'Payroll'
  | 'Statutory'
  | 'Leave & Overtime'
  | 'Lifecycle'

export type ReportFrequency =
  | 'On Demand'
  | 'Daily'
  | 'Weekly'
  | 'Monthly'
  | 'Quarterly'
  | 'Annual'

export type ReportAvailability =
  | 'Available'
  | 'Coming Soon'
  | 'Restricted'

export interface ReportCenterItem {
  id: number

  code: string
  title: string
  description: string

  category: ReportCategory
  frequency: ReportFrequency

  route?: string

  availability: ReportAvailability

  exportFormats: string[]

  lastGenerated?: string

  generatedCount: number

  iconKey: string

  featured?: boolean
}