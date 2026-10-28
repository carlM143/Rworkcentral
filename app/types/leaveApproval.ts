
export type LeaveApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type LeavePayType = 'paid' | 'unpaid'

export interface LeaveApproval {
  id: number
  request_no: string
  employee: {
    id: number | null
    emp_id: number | null
    name: string
  }
  leave_type: string
  leave_code: string | null
  leave_policy_id: number
  policy_status: string | null
  policy_eligible: boolean
  policy_paid: boolean | null
  request_date: string | null
  requested_pay_type: LeavePayType
  approved_pay_type: LeavePayType | null
  reason: string | null
  status: LeaveApprovalStatus
  approved_by: number | null
  approved_at: string | null
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
