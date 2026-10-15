export type TimeCorrectionStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'

export type TimeCorrectionType =
  | 'Time In'
  | 'Time Out'
  | 'Time In & Out'
  | 'Missing Log'

export type TimeCorrectionPriority =
  | 'Normal'
  | 'Urgent'

export interface TimeCorrectionAttachment {
  name: string
  url?: string
}

export interface TimeLogCorrectionRequest {
  id: number

  timeLogId?: number

  requestNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  attendanceDate: string

  correctionType:
    TimeCorrectionType

  originalTimeIn?: string
  originalTimeOut?: string

  requestedTimeIn?: string
  requestedTimeOut?: string

  reason: string

  attachment?:
    TimeCorrectionAttachment

  priority:
    TimeCorrectionPriority

  status:
    TimeCorrectionStatus

  requestedAt: string
  requestedBy: string

  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
}