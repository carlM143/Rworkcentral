export type LeaveBalanceStatus =
  | 'Healthy'
  | 'Low Balance'
  | 'Exhausted'

export type LeaveCreditType =
  | 'Vacation Leave'
  | 'Sick Leave'
  | 'Emergency Leave'
  | 'Special Leave'

export type LeaveCreditKey =
  | 'vacationLeave'
  | 'sickLeave'
  | 'emergencyLeave'
  | 'specialLeave'

export type LeaveCreditAdjustmentType =
  | 'Add Credits'
  | 'Deduct Credits'

export interface LeaveCreditBreakdown {
  allocated: number
  used: number
  available: number
}

export interface LeaveBalance {
  id: number

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  vacationLeave: LeaveCreditBreakdown
  sickLeave: LeaveCreditBreakdown
  emergencyLeave: LeaveCreditBreakdown
  specialLeave: LeaveCreditBreakdown

  totalAllocated: number
  totalUsed: number
  totalAvailable: number

  status: LeaveBalanceStatus

  lastUpdated: string
}

export interface LeaveCreditAdjustmentFormData {
  employeeId: number

  leaveType:
    LeaveCreditType

  adjustmentType:
    LeaveCreditAdjustmentType

  days: number

  reason: string
}