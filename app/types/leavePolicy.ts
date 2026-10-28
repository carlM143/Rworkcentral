
export type LeavePolicyStatus = 'pending' | 'approved'

export interface LeaveTypeOption {
  id: number
  code: string
  name: string
  status: string
}

export interface EmploymentTypeOption {
  id: number
  name: string
}

export interface LeavePolicyApiRecord {
  id: number
  leave_type_id: number
  employment_type_id: number
  is_eligible: boolean | number
  is_paid: boolean | number
  annual_credits: number | string
  min_service_months: number
  allow_carry_over: boolean | number
  max_carry_over_days: number | string
  requires_approval: boolean | number
  usage_window: string
  validity_period: string
  effective_from: string
  effective_to: string | null
  status: string
  leave_type?: {
    id: number
    leave_name: string
    leave_code: string
    status: string
  } | null
  employment_type?: {
    id: number
    name: string
  } | null
}

export interface LeavePolicy {
  id: number
  leaveTypeId: number
  employmentTypeId: number
  leaveTypeName: string
  leaveTypeCode: string
  employmentTypeName: string
  isEligible: boolean
  isPaid: boolean
  annualCredits: number
  minServiceMonths: number
  allowCarryOver: boolean
  maxCarryOverDays: number
  requiresApproval: boolean
  usageWindow: string
  validityPeriod: string
  effectiveFrom: string
  effectiveTo: string
  status: LeavePolicyStatus
}

export interface LeavePolicyPayload {
  leave_type_id: number
  employment_type_id: number
  is_eligible: boolean
  is_paid: boolean
  annual_credits: number
  min_service_months: number
  allow_carry_over: boolean
  max_carry_over_days: number
  requires_approval: boolean
  usage_window: string
  validity_period: string
  effective_from: string
  effective_to: string | null
  status: LeavePolicyStatus
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
