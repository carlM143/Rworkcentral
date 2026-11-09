export type WorkScheduleStatus = 'Active' | 'Inactive'

export type WorkScheduleType = string

export type WorkScheduleDayName =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday'

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

  // Future dated change (hours/days) that has not taken effect yet.
  upcomingRevision?: WorkScheduleRevision | null
}

export interface WorkScheduleRevision {
  id: number
  effective_from: string
  effective_to?: string | null
  required_work_hours: string | number
  grace_period: number
  reason?: string | null
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
  'Saturday',
  'Sunday',
]

const WEEKEND_DAYS: WorkScheduleDayName[] = ['Saturday', 'Sunday']

/**
 * Converts any stored/legacy weekday value ('Sat', 'sun', 'SATURDAY', ...)
 * to the full day name the API validates against. Returns null if unknown.
 */
export const normalizeScheduleDayName = (value: unknown): WorkScheduleDayName | null => {
  const key = String(value ?? '').trim().toLowerCase().slice(0, 3)
  if (key.length < 3) return null
  return WORK_SCHEDULE_DAYS.find(day => day.toLowerCase().startsWith(key)) ?? null
}

export const createDefaultScheduleDays = (): WorkScheduleDayFormData[] =>
  WORK_SCHEDULE_DAYS.map(day => ({
    day_of_week: day,
    is_working_day: !WEEKEND_DAYS.includes(day),
    time_in: !WEEKEND_DAYS.includes(day) ? '08:00' : null,
    time_out: !WEEKEND_DAYS.includes(day) ? '17:00' : null,
  }))
