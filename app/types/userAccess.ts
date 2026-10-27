export type SystemUserRole =
  | 'Administrator'
  | 'Human Resources'
  | 'HR Administrator'
  | 'Manager'
  | 'Supervisor'
  | 'Employee'

export type SystemUserStatus =
  | 'Active'
  | 'Invited'
  | 'Disabled'

export interface SystemUser {
  id: number

  employeeId?: number
  employeeNumber?: string
  canSetupAccount?: boolean

  name: string
  email: string

  role: SystemUserRole | '-'

  department?: string

  status: SystemUserStatus

  twoFactorEnabled: boolean

  lastLogin?: string
}

export interface AccessActivity {
  id: number

  userName: string

  action: string
  description: string

  performedBy: string

  date: string
}
