export type AttendanceStatus =
  | 'Present'
  | 'Late'
  | 'Absent'
  | 'On Leave'
  | 'Rest Day'

export interface AttendanceRecord {
  id: number

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  date: string

  schedule: string

  timeIn?: string
  timeOut?: string

  lateMinutes: number
  undertimeMinutes: number

  status: AttendanceStatus
}

export type TimeLogStatus =
  | 'Complete'
  | 'Incomplete'
  | 'Missing Log'
  | 'On Leave'
  | 'Rest Day'

export interface TimeLogRecord {
  id: number

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  date: string
  schedule: string

  timeIn?: string
  breakOut?: string
  breakIn?: string
  timeOut?: string

  lateMinutes: number
  undertimeMinutes: number

  hoursWorked?: number

  status: TimeLogStatus
}

