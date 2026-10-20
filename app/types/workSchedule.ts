export type WorkScheduleStatus =
  | 'Active'
  | 'Inactive'

export type WorkScheduleType =
  | 'Regular'
  | 'Morning Shift'
  | 'Night Shift'
  | 'Flexible'

export interface WorkSchedule {
  id: number

  code: string
  name: string
  type: WorkScheduleType

  timeIn?: string
  timeOut?: string

  breakStart?: string
  breakEnd?: string

  workHours: number
  gracePeriod: number

  employeeCount: number

  status: WorkScheduleStatus
}

export interface WorkScheduleFormData {
  code: string
  name: string
  type: WorkScheduleType

  timeIn: string
  timeOut: string

  breakStart: string
  breakEnd: string

  workHours: number
  gracePeriod: number

  status: WorkScheduleStatus
}

export interface ScheduleActivity {
  id: number

  title: string
  description: string

  performedBy: string

  date: string
}