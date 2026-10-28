export type WorkScheduleStatus = 'Active' | 'Inactive'

export type WorkScheduleType = string

export interface WorkSchedule {
  id: number
  code: string
  name: string
  type: WorkScheduleType
  typeId: number

  timeIn: string
  timeOut: string
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
