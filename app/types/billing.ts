export type BillingStatus =
  | 'Draft'
  | 'Ready'
  | 'For Review'
  | 'With Issue'
  | 'Completed'
  | 'Paid'

export type BillingPeriodStatus =
  | 'Preparing'
  | 'For Review'
  | 'Completed'

export interface BillingRecord {
  id: number

  clientCode: string
  clientName: string

  department?: string

  employees: number

  regularHours: number
  overtimeHours: number

  regularAmount: number
  overtimeAmount: number
  adjustments: number

  totalAmount: number

  status: BillingStatus

  issue?: string
}

export interface BillingPeriod {
  id: number

  code: string

  dateFrom: string
  dateTo: string

  billingDate: string

  status: BillingPeriodStatus

  progress: number
}

export interface BillingRun {
  id: number

  period: string

  clients: number

  totalAmount: number

  billingDate: string

  status: BillingStatus
}