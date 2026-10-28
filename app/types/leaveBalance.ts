
export type LeaveBalanceStatus = 'healthy' | 'low' | 'none'
export type CreditAdjustmentAction = 'add' | 'deduct'

export interface LeaveBalance {
  employee_id: number
  employee: string
  emp_id: string | number | null
  department?: string | null
  leave_policy_id: number
  leave_type: string | null
  policy_paid?: boolean | null
  cycle_start: string
  cycle_end: string
  allocated: number
  deductions: number
  adjustments: number
  carry_over: number
  expired: number
  reversals: number
  available: number
}

export interface EmployeeLeaveBalance {
  employee_id: number
  employee: string
  emp_id: string | number | null
  department: string | null
  records: LeaveBalance[]
  totalAllocated: number
  totalUsed: number
  totalAvailable: number
  status: LeaveBalanceStatus
}

export interface LeaveBalanceStats {
  employeesWithCredits: number
  remainingCredits: number
  lowBalance: number
  noCredits: number
}

export interface LeaveBalanceOption {
  label: string
  value: string
}

export interface AdjustLeaveCreditPayload {
  employee_id: number
  leave_policy_id: number
  action: CreditAdjustmentAction
  days: number
  remarks: string
}

export interface LeaveBalanceApiResponse<T> {
  success: boolean
  message: string
  data: T
}
