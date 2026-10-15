export type LeaveBalanceStatus =
  | 'Healthy'
  | 'Low Balance'
  | 'Exhausted'

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