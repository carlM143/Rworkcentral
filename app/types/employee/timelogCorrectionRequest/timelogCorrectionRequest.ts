export interface EmployeeTimeLog {
  id: number
  work_date: string
  time_in: string | null
  time_out: string | null
  status: string | null
}

export type TimeLogCorrectionType = 'time_in' | 'time_out'

export interface TimeLogCorrectionRecord {
  id: number
  time_log_id: number | null
  work_date: string
  correction_type: TimeLogCorrectionType
  priority: string
  status: string
  original_time_in: string | null
  original_time_out: string | null
  requested_time: string | null
  reason: string
  attachment_path: string | null
  review_remarks: string | null
  reviewed_at: string | null
  created_at: string | null
  updated_at?: string | null
  time_log?: EmployeeTimeLog | null
}

export interface UpdateCorrectionPayload {
  correction_type: TimeLogCorrectionType
  requested_time: string
  reason: string
}

export interface CreateCorrectionPayload extends UpdateCorrectionPayload {
  work_date: string
}
