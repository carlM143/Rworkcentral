export type BillingAdjustmentType =
  | 'Add Billing'
  | 'Deduction'
  | 'Correction'
  | 'Overtime Adjustment'
  | 'Rate Adjustment'
  | 'Manual Adjustment'

export type BillingAdjustmentStatus =
  | 'Pending'
  | 'For Review'
  | 'Approved'
  | 'Rejected'
  | 'Applied'

export interface BillingAdjustment {
  id: number

  adjustmentNumber: string

  billingRecordId: number
  billingNumber: string
  batchCode: string

  clientId: number
  clientCode: string
  clientName: string

  periodStart: string
  periodEnd: string

  adjustmentType: BillingAdjustmentType

  amount: number

  reason: string
  remarks?: string

  status: BillingAdjustmentStatus

  requestedBy: string
  requestedAt: string

  reviewedBy?: string
  reviewedAt?: string

  appliedBy?: string
  appliedAt?: string
}