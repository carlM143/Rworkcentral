export type TimeLogCorrectionType =
  | 'Missing Time In'
  | 'Missing Time Out'
  | 'Incorrect Time In'
  | 'Incorrect Time Out'
  | 'Incorrect Time In & Out'
  | 'Missing Time Log'

export type TimeLogApprovalStatus =
  | 'Pending'
  | 'For Review'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled'

export interface TimeLogApproval {
  id: number

  requestNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  attendanceDate: string

  correctionType: TimeLogCorrectionType

  originalTimeIn?: string
  originalTimeOut?: string

  requestedTimeIn?: string
  requestedTimeOut?: string

  reason: string

  filedAt: string

  immediateSupervisor: string

  status: TimeLogApprovalStatus

  reviewedBy?: string
  reviewedAt?: string

  remarks?: string
}