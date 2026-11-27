/**
 * Employee undertime requests.
 * API: /employee/undertime-requests (see composables/employee/undertime/useUndertime.ts)
 */
import type { RequestAttachment } from '~/types/employee/leave/leave'

export type UndertimeRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

/** One undertime request (UndertimeRequestController › formatUndertimeRequest). */
export interface UndertimeRequestRecord {
  department_approvals?: import('~/types/leaveApproval').LeaveApproval['department_approvals']
  department_approval_status?: string | null
  reviewed_by?: string | null
  reviewed_at?: string | null
  /** Request number, e.g. "UT-2026-0001" (falls back to "UT-{raw_id}"). */
  id: string
  raw_id: number
  request_no: string | null
  category: 'Undertime'
  type: 'Undertime'
  /** Undertime date (YYYY-MM-DD). */
  start: string
  end: string
  reason: string
  status: UndertimeRequestStatus
  status_label: string
  file_path: string | null
  file_url: string | null
  image: RequestAttachment | null
  timing: {
    /** When the employee leaves (HH:mm) — same as requestedTimeOut. */
    startTime: string
    /** Scheduled time out (HH:mm) — same as scheduledTimeOut. */
    endTime: string
    scheduledTimeOut: string
    requestedTimeOut: string
    requestedMinutes: number
  }
  work_schedule: unknown
  created_at: string | null
}

/** POST / PUT body (StoreUndertimeRequest). */
export interface UndertimePayload {
  undertime_date: string
  /** Time the employee leaves (HH:mm). */
  requested_time: string
  /** Scheduled time out (HH:mm). */
  scheduled_time: string
  requested_minutes: number
  reason: string
  /** Image as a data URL; null with remove_image to delete the current one. */
  image?: string | null
  remove_image?: boolean
}

export interface UndertimeApiResponse<T> {
  success: boolean
  message: string
  data: T
}
