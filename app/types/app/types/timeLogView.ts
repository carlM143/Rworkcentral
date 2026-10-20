import type {
  TimeLogRecord,
} from '~/types/timekeeping'

export type TimeLogWorkScope =
  | 'Internal'
  | 'Client Assigned'

export type TimeLogAttendanceSource =
  | 'RWorkCentral Biometric'
  | 'Client Biometric'
  | 'Mobile / Web Attendance'
  | 'Manual Entry'
  | 'Imported Attendance'

export interface TimeLogViewRecord
  extends TimeLogRecord {
  workScope: TimeLogWorkScope

  clientId?: number
  clientCode?: string
  clientName?: string

  workLocation: string

  attendanceSource:
    TimeLogAttendanceSource
}