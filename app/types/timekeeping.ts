
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

/* =========================================================
   TIME LOG STATUS
========================================================= */

export type TimeLogStatus =
  | 'Complete'
  | 'Incomplete'
  | 'Missing Log'
  | 'On Leave'
  | 'Rest Day'

/* =========================================================
   ATTENDANCE SOURCE
========================================================= */

export type AttendanceSource =
  | 'RWorkCentral Biometric'
  | 'Client Biometric'
  | 'Mobile / Web Attendance'
  | 'Manual Entry'
  | 'Imported Attendance'

/* =========================================================
   TIME LOG RECORD
========================================================= */

export interface TimeLogRecord {
  id: number

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  date: string
  schedule: string

  /* TIME ENTRIES */

  timeIn?: string
  breakOut?: string
  breakIn?: string
  timeOut?: string

  /* ATTENDANCE COMPUTATION */

  lateMinutes: number
  undertimeMinutes: number

  hoursWorked?: number

  /* ATTENDANCE SOURCE */

  attendanceSource?: AttendanceSource

  /* IMPORT INFORMATION */

  importBatchId?: string
  importedAt?: string

  /* STATUS */

  status: TimeLogStatus
}
