export type WorkScheduleStatus = 'Active' | 'Inactive'

export type WorkScheduleType = string

export type WorkScheduleDayName =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Sat'
  | 'Sun'

export interface WorkScheduleDayFormData {
  day_of_week: WorkScheduleDayName
  is_working_day: boolean
  time_in: string | null
  time_out: string | null
}

export interface WorkScheduleDay extends WorkScheduleDayFormData {
  id: number
  work_schedule_id: number
}

export interface WorkSchedule {
  id: number
  code: string
  name: string
  type: WorkScheduleType
  typeId: number

  // Derived from the first working day for existing schedule summary views.
  timeIn: string
  timeOut: string
  breakStart?: string
  breakEnd?: string

  workHours: number
  gracePeriod: number
  employeeCount: number

  status: WorkScheduleStatus

  days: WorkScheduleDay[]
}

export interface WorkScheduleFormData {
  code: string
  name: string
  type: WorkScheduleType

  // Temporary compatibility for the existing shared-time edit controls.
  timeIn?: string
  timeOut?: string
  breakStart?: string
  breakEnd?: string

  workHours: number
  gracePeriod: number
  status: WorkScheduleStatus

  days: WorkScheduleDayFormData[]
}

export const WORK_SCHEDULE_DAYS: WorkScheduleDayName[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Sat',
  'Sun',
]

export const createDefaultScheduleDays = (): WorkScheduleDayFormData[] =>
  WORK_SCHEDULE_DAYS.map(day => ({
    day_of_week: day,
    is_working_day: !['Sat', 'Sun'].includes(day),
    time_in: !['Sat', 'Sun'].includes(day) ? '08:00' : null,
    time_out: !['Sat', 'Sun'].includes(day) ? '17:00' : null,
  }))
