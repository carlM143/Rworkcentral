export type PayrollRateType =
  | 'Employee'
  | 'Driver'

export type PayrollPayBasis =
  | 'Monthly'
  | 'Daily'
  | 'Hourly'
  | 'Trip Based'

export type PayrollRateStatus =
  | 'Active'
  | 'Inactive'
  | 'Scheduled'

export interface PayrollRate {
  id: number

  rateCode: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  rateType: PayrollRateType
  payBasis: PayrollPayBasis

  monthlyRate?: number
  dailyRate?: number
  hourlyRate?: number

  overtimeRate?: number
  restDayRate?: number
  regularHolidayRate?: number
  specialHolidayRate?: number
  nightDifferentialRate?: number

  tripRate?: number
  allowance?: number

  effectiveDate: string

  status: PayrollRateStatus

  remarks?: string

  createdBy: string
  createdAt: string

  updatedBy?: string
  updatedAt?: string
}

export interface PayrollRateFormData {
  employeeId: number | null

  rateType: PayrollRateType
  payBasis: PayrollPayBasis

  monthlyRate: number | null
  dailyRate: number | null
  hourlyRate: number | null

  overtimeRate: number | null
  restDayRate: number | null
  regularHolidayRate: number | null
  specialHolidayRate: number | null
  nightDifferentialRate: number | null

  tripRate: number | null
  allowance: number | null

  effectiveDate: string

  remarks: string
}

export interface PayrollRateHistory {
  id: number

  payrollRateId: number

  effectiveDate: string

  rateType: PayrollRateType
  payBasis: PayrollPayBasis

  previousRate: string
  newRate: string

  changedBy: string
  changedAt: string

  remarks?: string
}