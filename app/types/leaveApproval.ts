export type LeaveApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type LeavePayType = 'paid' | 'unpaid'

export interface LeaveApprovalDateItem {
  id?: number
  leave_date: string
  day_type: 'whole_day' | 'half_day' | string
  day_value: number
}

export interface LeaveApproval {
  id: number
  request_no: string
  employee: {
    id: number | null
    emp_id: number | string | null
    name: string
    department?: string | null
    position?: string | null
  }
  leave_type: string
  leave_code: string | null
  leave_policy_id: number
  policy_status: string | null
  policy_eligible: boolean
  policy_paid: boolean | null
  request_date: string | null
  start?: string | null
  end?: string | null
  dates?: LeaveApprovalDateItem[]
  requested_pay_type: LeavePayType
  approved_pay_type: LeavePayType | null
  total_days?: number
  reason: string | null
  status: LeaveApprovalStatus
  approved_by: number | null
  approver_name?: string | null
  approved_at: string | null
  created_at?: string | null
}

export interface LeaveApprovalStats {
  total: number
  pending: number
  approved: number
  rejected: number
}

export interface LeaveApprovalApiResponse<T> {
  success: boolean
  message: string
  data: T
}
