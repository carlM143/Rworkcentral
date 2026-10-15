export interface OvertimeActionRequest {
  id: number | string

  requestNo: string

  employeeName: string
  employeeNo?: string

  department: string
  position?: string

  otDate: string

  schedule?: string
  otStart?: string
  otEnd?: string

  requestedHours: number

  approvedHours?: number | null

  otType: string

  reason: string

  status: string

  requestedAt?: string

  reviewedBy?: string
  reviewedAt?: string

  remarks?: string
}

export interface FileOvertimeRequestPayload {
  employeeId: number

  employeeName: string
  employeeNo: string

  department: string
  position: string

  otDate: string

  schedule: string

  otStart: string
  otEnd: string

  requestedHours: number

  otType: string

  reason: string

  attachment?: string
}

export interface OvertimeReviewPayload {
  decision:
    | 'Approve'
    | 'Partial'
    | 'Reject'

  approvedHours: number

  remarks: string
}

export interface OvertimeExportPayload {
  format:
    | 'Excel'
    | 'PDF'
    | 'CSV'

  scope:
    | 'Current Filters'
    | 'Date Range'

  includeEmployee: boolean
  includeReason: boolean
  includeApproval: boolean
}

export interface OvertimeCancelPayload {
  reason: string
}