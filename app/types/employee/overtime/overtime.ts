/**
 * Employee overtime requests.
 * API: /employee/overtime-requests (see composables/employee/overtime/useOvertime.ts)
 */
import type { RequestAttachment } from '~/types/employee/leave/leave'

export type OvertimeRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

/** One overtime request (OvertimeRequestController › formatOvertimeRequest). */
export interface OvertimeRequestRecord {
  /** Request number, e.g. "OT-2026-0001" (falls back to "OT-{raw_id}"). */
  id: string
  raw_id: number
  request_no: string | null
  category: 'Overtime'
  type: 'Overtime'
  /** Overtime date (YYYY-MM-DD). */
  start: string
  /** Next day when the overtime ends after midnight. */
  end: string
  reason: string
  status: OvertimeRequestStatus
  status_label: string
  file_path: string | null
  file_url: string | null
  image: RequestAttachment | null
  timing: {
    /** HH:mm */
    startTime: string
    /** HH:mm */
    endTime: string
    endsNextDay: boolean
    requestedMinutes: number
  }
  work_schedule: unknown
  created_at: string | null
}

/** POST / PUT body (StoreOvertimeRequest). */
export interface OvertimePayload {
  ot_date: string
  /** HH:mm */
  start_time: string
  /** HH:mm */
  end_time: string
  ends_next_day: boolean
  reason: string
  /** Image as a data URL; null with remove_image to delete the current one. */
  image?: string | null
  remove_image?: boolean
}

export interface OvertimeApiResponse<T> {
  success: boolean
  message: string
  data: T
}
