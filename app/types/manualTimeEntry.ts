export type ManualTimeEntryType =
  | 'Time In'
  | 'Break Out'
  | 'Break In'
  | 'Time Out'

export type ManualTimeEntryStatus =
  | 'Pending'
  | 'Completed'
  | 'Cancelled'

export type AttendanceStatus =
  | 'Complete'
  | 'Incomplete'
  | 'Missing'
  | 'Missing Log'
  | 'Late'
  | 'Undertime'
  | 'Absent'
  | string

export interface ManualTimeAttachment {
  name: string
  url?: string
}

export interface ManualTimeEntry {
  id: number
  entryNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string
  department: string
  position: string

  attendanceDate: string
  schedule: string

  // Actual attendance from Laravel time_logs
  timeIn?: string | null
  timeOut?: string | null
  attendanceStatus?: AttendanceStatus
  remarks?: string | null

  // Existing legacy fields retained for compatibility
  entryType: ManualTimeEntryType
  time: string
  reason: string
  attachment?: ManualTimeAttachment

  // Manual entry workflow status
  status: ManualTimeEntryStatus

  encodedBy: string
  encodedAt: string

  validatedBy?: string
  validatedAt?: string
  validationNotes?: string
}

export interface ManualTimeEntryFormData {
  employeeId: number | null
  attendanceDate: string

  // New attendance form
  timeIn?: string
  timeOut?: string
  remarks?: string

  // Legacy form compatibility
  entryType: ManualTimeEntryType
  time: string
  reason: string

  attachmentName?: string
}
