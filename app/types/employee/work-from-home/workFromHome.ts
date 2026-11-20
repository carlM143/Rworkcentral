/**
 * Employee work-from-home requests.
 * API: /employee/wfh-requests (see composables/employee/work-from-home/useWorkFromHome.ts)
 */

export type WfhRequestStatus = 'pending' | 'approved' | 'rejected' | string

export type WfhDayStatus = 'not_submitted' | 'draft' | 'submitted' | 'accepted' | 'returned'

/** One calendar day in the requested range. */
export interface DateBreakdownItem {
  date: string
  day_name: string
  is_working_day: boolean
  schedule_time?: string | null
}

/** Proof-of-work attachment (image or PDF document). */
export interface WfhFileItem {
  id?: number
  path: string
  url: string
  name: string
  mime: 'image' | 'application/pdf'
}

/** Proof-of-work tracking for one approved WFH working day. */
export interface WfhDayTracker {
  date: string
  tracker_id: number | null
  status: WfhDayStatus
  remarks: string | null
  submitted_at: string | null
  reviewed_at: string | null
  reviewed_by: string | null
  document: WfhFileItem | null
  images: WfhFileItem[]
}

export interface WfhProofCounts {
  expected: number
  not_submitted: number
  submitted: number
  accepted: number
  returned: number
  attachments: number
}

export interface WfhRequest {
  id: number
  request_no: string
  start_date: string
  end_date: string
  number_of_days: number
  calendar_days?: number
  working_dates?: string[]
  breakdown?: DateBreakdownItem[]
  schedule_name?: string | null
  schedule_code?: string | null
  working_days?: string[]
  rest_days?: string[]
  supervisor_name: string
  reason: string
  request_date: string
  status: WfhRequestStatus
  remarks: string | null
  approved_by?: string | null
  approved_at?: string | null
  /** e.g. "complete" when every expected day is verified. */
  document_status?: string
  counts?: WfhProofCounts
  days?: WfhDayTracker[]
}

/** GET /employee/wfh-requests/schedule */
export interface ScheduleData {
  schedule_id: number | null
  schedule_name: string | null
  schedule_code: string | null
  working_days: string[]
  rest_days: string[]
}

/** POST /employee/wfh-requests/preview */
export interface WfhPreviewPayload {
  start_date: string
  end_date: string
}

export interface WfhPreviewData {
  number_of_days: number
  calendar_days?: number
  working_dates?: string[]
  breakdown?: DateBreakdownItem[]
  schedule_name?: string
  schedule_code?: string
  working_days?: string[]
  rest_days?: string[]
}

/** POST /employee/wfh-requests */
export interface WfhRequestPayload {
  start_date: string
  end_date: string
  supervisor_name: string
  reason: string
}

/** POST /employee/wfh-requests/{id}/days */
export interface WfhDayProofPayload {
  date_attendance: string
  images: File[]
  document: File | null
}
