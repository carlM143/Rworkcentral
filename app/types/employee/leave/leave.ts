/**
 * Employee leave requests.
 * API: /employee/leave-requests (see composables/employee/leave/useLeave.ts)
 */

export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type LeaveDayType = 'whole_day' | 'half_day'
export type LeavePayType = 'paid' | 'unpaid'

/** Shared attachment shape returned by every employee request endpoint. */
export interface RequestAttachment {
  name: string
  dataUrl: string
}

export interface LeaveRequestDate {
  id: number
  leave_date: string
  day_type: LeaveDayType
  day_value: number
  requested_pay_type: LeavePayType | null
  approved_pay_type: LeavePayType | null
}

/** One leave request (LeaveRequestController › formatLeaveRequest). */
export interface LeaveRequestRecord {
  /** Request number, e.g. "LR-2026-0001" (falls back to "LR-{raw_id}"). */
  id: string
  raw_id: number
  request_no: string | null
  category: 'Leave'
  /** Leave type name, e.g. "Vacation Leave". */
  type: string
  leave_type_id: number | null
  leave_policy_id: number | null
  request_date: string | null
  requested_pay_type: string | null
  approved_pay_type: string | null
  start: string | null
  end: string | null
  reason: string
  status: LeaveRequestStatus
  status_label: string
  file_path: string | null
  file_url: string | null
  image: RequestAttachment | null
  dates: LeaveRequestDate[]
  total_days: number
  total_paid_days: number
  total_unpaid_days: number
  created_at: string | null
}

/** POST / PUT body (StoreLeaveRequest). */
export interface LeavePayload {
  leave_type_id?: number
  /** Leave type name (the backend also accepts it instead of leave_type_id). */
  type: string
  request_date: string
  requested_pay_type?: 'paid' | 'unpaid' | 'mixed'
  start_date: string
  end_date: string
  reason: string
  dates: {
    leave_date: string
    day_type: LeaveDayType
    day_value: number
    requested_pay_type?: LeavePayType
  }[]
  /** Image as a data URL; null with remove_image to delete the current one. */
  image?: string | null
  remove_image?: boolean
}

export interface LeaveApiResponse<T> {
  success: boolean
  message: string
  data: T
}
