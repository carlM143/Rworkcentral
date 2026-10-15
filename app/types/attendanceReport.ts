export type AttendanceEmploymentType =
  | 'Regular'
  | 'Probationary'
  | 'Contractual'
  | 'Project-Based'

export type AttendanceReportStatus =
  | 'Excellent'
  | 'Good'
  | 'Needs Attention'
  | 'Critical'

export interface AttendanceReportRecord {
  id: number

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  employmentType: AttendanceEmploymentType

  periodStart: string
  periodEnd: string

  scheduledDays: number
  presentDays: number
  absentDays: number
  leaveDays: number

  lateCount: number
  lateMinutes: number

  undertimeCount: number
  undertimeMinutes: number

  overtimeHours: number

  totalWorkedHours: number

  attendanceRate: number

  status: AttendanceReportStatus
}