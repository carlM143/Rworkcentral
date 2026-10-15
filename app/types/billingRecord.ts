export type BillingRecordStatus =
  | 'Preparing'
  | 'For Review'
  | 'With Issue'
  | 'Ready'

export interface BillingRecord {
  id: number

  billingNumber: string
  batchCode: string

  clientId: number
  clientCode: string
  clientName: string

  periodStart: string
  periodEnd: string
  billingDate: string

  employeeCount: number

  regularHours: number
  overtimeHours: number

  regularAmount: number
  overtimeAmount: number
  holidayAmount: number
  nightDifferentialAmount: number
  allowances: number
  adjustments: number

  subtotal: number
  totalBilling: number

  issueCount: number

  status: BillingRecordStatus

  preparedBy: string
  preparedAt: string

  remarks?: string
}