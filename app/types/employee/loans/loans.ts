/**
 * Employee loans (the logged-in employee's own loans, read-only).
 * API: GET /employee/loans, GET /employee/loans/{employeeLoan}
 * (backend App\Http\Controllers\Api\Employee\LoanController)
 */

export type EmployeeLoanStatus = 'Active' | 'Inactive' | 'Fully Paid'

export interface EmployeeLoanSummary {
  total_due: number
  paid: number
  outstanding: number
  status: EmployeeLoanStatus
  /** 0–100 */
  progress: number
}

export interface EmployeeLoanRecord {
  id: number
  reference_no: string | null
  loan_type: {
    id: number
    code: string
    name: string
    provider: string | null
  } | null
  principal: number
  /** total_payable − principal */
  interest: number
  total_payable: number
  /** Monthly deduction (split between cutoffs by the schedule). */
  installment: number
  /** "1st cutoff only", "2nd cutoff only" or "50% / 50% split". */
  deduction_schedule?: string
  first_cutoff_amount?: number
  second_cutoff_amount?: number
  /** Payroll group frequency (weekly, semi_monthly, monthly…); null when not assigned. */
  frequency: string | null
  method: string
  /** YYYY-MM-DD */
  loan_date: string | null
  deduction_start_date: string | null
  /** Payment date of the next payroll; null when not active or no upcoming payroll period. */
  next_due_date: string | null
  remaining_installments: number
  remarks: string | null
  summary: EmployeeLoanSummary
}

export interface EmployeeLoanPayment {
  id: number
  date: string | null
  type: 'payroll_deduction' | 'manual_payment' | 'adjustment' | 'reversal' | string
  method: string
  /** Positive for payments; adjustments keep their sign (+ adds to the balance). */
  amount: number
  reference: string | null
  payroll_period: string | null
  remarks: string | null
  balance_after: number
}

/** GET /employee/loans/{id} */
export type EmployeeLoanDetail = EmployeeLoanRecord & { payments: EmployeeLoanPayment[] }

export interface EmployeeLoanTotals {
  count: number
  active_count: number
  outstanding: number
  paid: number
  /** Deducted per payroll for all active loans together. */
  installment_per_payroll: number
}

/** GET /employee/loans */
export interface EmployeeLoanListData {
  loans: EmployeeLoanRecord[]
  totals: EmployeeLoanTotals
}

export interface EmployeeLoanApiResponse<T> {
  success: boolean
  message: string
  data: T
}
