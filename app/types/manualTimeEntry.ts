export type ManualTimeEntryType =
  | 'Time In'
  | 'Break Out'
  | 'Break In'
  | 'Time Out'

export type ManualTimeEntryStatus =
  | 'Pending'
  | 'Completed'
  | 'Cancelled'

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

  entryType:
    ManualTimeEntryType

  time: string

  reason: string

  attachment?:
    ManualTimeAttachment

  status:
    ManualTimeEntryStatus

  encodedBy: string
  encodedAt: string

  validatedBy?: string
  validatedAt?: string

  validationNotes?: string
}

export interface ManualTimeEntryFormData {
  employeeId: number | null

  attendanceDate: string

  entryType:
    ManualTimeEntryType

  time: string

  reason: string

  attachmentName?: string
}