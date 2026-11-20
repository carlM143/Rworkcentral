/**
 * Employee loans (the logged-in employee's own loans).
 * NOTE: there is no employee loans API yet; see composables/employee/loans/useEmployeePortalLoans.ts.
 */

export interface EmployeeLoanPayment {
  id: string
  /** YYYY-MM-DD */
  date: string
  amount: number
  method: string
  reference: string
  remarks: string
}

export interface EmployeePortalLoan {
  id: string
  type: string
  principal: number
  interest: number
  installment: number
  frequency: string
  /** YYYY-MM-DD */
  grantedAt: string
  firstPaymentAt: string
  nextDueAt: string | null
  method: string
  remarks: string
  payments: EmployeeLoanPayment[]
}

export interface EmployeeLoanSummary {
  totalDue: number
  paid: number
  outstanding: number
  status: 'Active' | 'Fully Paid'
  /** 0–100 */
  progress: number
}

export type EmployeeLoanRepayment = EmployeeLoanPayment & { balanceAfter: number }
