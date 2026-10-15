export type ClientBillingRateType =
  | 'Hourly'
  | 'Daily'
  | 'Monthly'
  | 'Per Trip'
  | 'Fixed'

export type ClientBillingRateStatus =
  | 'Active'
  | 'Scheduled'
  | 'Expired'
  | 'Inactive'

export interface ClientBillingRate {
  id: number

  rateCode: string

  clientId: number
  clientCode: string
  clientName: string

  positionOrService: string

  rateType: ClientBillingRateType

  regularRate: number
  overtimeRate: number
  holidayRate: number
  nightDifferentialRate: number

  effectiveDate: string
  endDate?: string

  status: ClientBillingRateStatus

  remarks?: string

  createdBy: string
  createdAt: string
}