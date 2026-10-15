export type BillingReportStatus =
  | 'Draft'
  | 'Pending'
  | 'For Review'
  | 'Completed'
  | 'Paid'

export interface BillingReportRecord {
  id: number

  billingNumber: string
  clientCode: string
  clientName: string

  billingPeriod: string
  periodStart: string
  periodEnd: string

  employeesBilled: number

  baseAmount: number
  overtimeAmount: number
  holidayAmount: number
  allowances: number
  addOns: number
  adjustments: number

  grossBilling: number

  deductions: number
  credits: number

  netBilling: number

  invoiceNumber?: string
  invoiceDate?: string

  dueDate?: string
  paidDate?: string

  status: BillingReportStatus
}