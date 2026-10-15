export type LoanType =
  | 'Salary Loan'
  | 'SSS Loan'
  | 'Pag-IBIG Loan'
  | 'Company Loan'
  | 'Cash Advance'
  | 'Emergency Loan'
  | 'Other'

export type LoanStatus =
  | 'Pending'
  | 'Approved'
  | 'Active'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled'

export type LoanPaymentStatus =
  | 'Pending'
  | 'Posted'
  | 'Reversed'

export type LoanStatusAction =
  | 'approve'
  | 'reject'
  | 'activate'
  | 'complete'
  | 'cancel'

export interface LoanAttachment {
  name: string
  url?: string
}

export interface LoanPayment {
  id: number

  loanId: number

  payrollPeriod: string

  referenceNumber: string

  deductionAmount: number

  previousBalance: number

  remainingBalance: number

  datePosted: string

  status: LoanPaymentStatus
}

export interface LoanRecord {
  id: number

  loanNumber: string

  employeeId: number
  employeeNumber: string
  employeeName: string

  department: string
  position: string

  loanType: LoanType

  principalAmount: number

  monthlyDeduction: number

  totalPaid: number

  outstandingBalance: number

  startDate: string

  endDate: string

  status: LoanStatus

  remarks?: string

  attachment?: LoanAttachment

  requestedBy: string

  requestedAt: string

  approvedBy?: string
  approvedAt?: string
  approvalNotes?: string

  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string

  activatedBy?: string
  activatedAt?: string

  completedBy?: string
  completedAt?: string

  cancelledBy?: string
  cancelledAt?: string
  cancellationReason?: string
}

export interface LoanFormData {
  employeeId: number | null

  loanType: LoanType

  principalAmount: number | null

  monthlyDeduction: number | null

  startDate: string

  endDate: string

  remarks: string

  attachmentName: string
}

export interface LoanStatusFormData {
  loanId: number

  action: LoanStatusAction

  notes: string
}