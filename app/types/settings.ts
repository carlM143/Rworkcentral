export type ConfigurationStatus =
  | 'Complete'
  | 'Needs Review'
  | 'Not Configured'

export type SettingsCategory =
  | 'Company'
  | 'Users'
  | 'Timekeeping'
  | 'Payroll'
  | 'Leave & Overtime'
  | 'Approval'
  | 'Notifications'
  | 'System'

export interface SettingsModule {
  id: number

  title: string
  description: string

  category: SettingsCategory

  route: string

  status: ConfigurationStatus

  items: string[]
}

export interface SettingsActivity {
  id: number

  action: string
  description: string

  performedBy: string

  date: string
}

export interface SecurityRoleSummary {
  role: string
  users: number
}