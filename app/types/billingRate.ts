export type BillingRateType =
  | 'Hourly'
  | 'Daily'
  | 'Monthly'
  | 'Per Trip'
  | 'Fixed'

export type BillingRateStatus =
  | 'Active'
  | 'Scheduled'
  | 'Expired'
  | 'Inactive'

export interface BillingRate {
  id: number

  rateCode: string

  clientId: number
  clientCode: string
  clientName: string

  positionOrService: string

  rateType: BillingRateType

  regularRate: number
  overtimeRate: number
  holidayRate: number
  nightDifferentialRate: number

  effectiveDate: string
  endDate?: string

  status: BillingRateStatus

  createdBy: string
  createdAt: string

  remarks?: string
}