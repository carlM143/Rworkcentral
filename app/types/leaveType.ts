export type LeaveTypeCategory =
  | 'Company Leave'
  | 'Statutory Leave'
  | 'Special Leave'

export type LeaveTypeStatus =
  | 'Active'
  | 'Inactive'

export type LeaveCreditUnit =
  | 'Days'
  | 'Hours'

export interface LeaveType {
  id: number

  code: string
  name: string

  category: LeaveTypeCategory

  description: string

  defaultCredits: number
  creditUnit: LeaveCreditUnit

  isPaid: boolean
  requiresApproval: boolean

  carryOverAllowed: boolean
  maxCarryOver: number

  minimumDays: number
  maximumDays?: number

  status: LeaveTypeStatus

  createdBy: string
  createdAt: string

  updatedAt: string
}