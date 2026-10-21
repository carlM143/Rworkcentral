
import type {
  TimeLogRecord,
  AttendanceSource,
} from '~/types/timekeeping'

export type TimeLogAttendanceSource =
  AttendanceSource

export interface TimeLogViewRecord
  extends TimeLogRecord {
  attendanceSource: TimeLogAttendanceSource
}
