export type CompletedBillingStatus =
  'Completed'

export type CompletedBillingPaymentStatus =
  | 'Unpaid'
  | 'Partially Paid'
  | 'Paid'

export interface CompletedBilling {
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

  billingStatus: CompletedBillingStatus
  paymentStatus: CompletedBillingPaymentStatus

  amountPaid: number
  outstandingAmount: number

  referenceNumber?: string

  completedBy: string
  completedAt: string

  paidAt?: string

  remarks?: string
}