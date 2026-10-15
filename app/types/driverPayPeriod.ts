export type DriverPayPeriodStatus =
  | 'Draft'
  | 'Open'
  | 'Processing'
  | 'Closed'
  | 'Cancelled'

export type DriverPayPeriodAction =
  | 'open'
  | 'process'
  | 'close'
  | 'cancel'

export interface DriverPayPeriod {
  id: number

  periodCode: string
  periodName: string

  payrollType: 'Driver Payroll'

  startDate: string
  endDate: string

  cutoffDate: string
  payDate: string

  totalDrivers: number
  pendingDrivers: number
  processedDrivers: number
  completedDrivers: number

  grossAmount: number
  totalDeductions: number
  netAmount: number

  status: DriverPayPeriodStatus

  remarks?: string

  createdBy: string
  createdAt: string

  openedBy?: string
  openedAt?: string

  processingBy?: string
  processingAt?: string

  closedBy?: string
  closedAt?: string

  cancelledBy?: string
  cancelledAt?: string
  cancellationReason?: string
}

export interface DriverPayPeriodFormData {
  periodName: string

  startDate: string
  endDate: string

  cutoffDate: string
  payDate: string

  remarks: string
}

export interface DriverPayPeriodStatusFormData {
  periodId: number

  action: DriverPayPeriodAction

  notes: string
}