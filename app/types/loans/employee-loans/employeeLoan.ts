export type LoanMoney = string | number

export interface EmployeeLoanEmployee {
  id: number
  emp_id: string | number | null
  name: string
}

export interface EmployeeLoanType {
  id: number
  loan_code: string
  loan_name: string
  provider: string | null
}

/** Balance-based state (status=false is used both for "deactivated" and "paid off"). */
export type EmployeeLoanState = 'active' | 'inactive' | 'fully_paid'

export interface EmployeeLoan {
  id: number

  employee_id: number
  loan_type_id: number

  loan_reference_no: string

  employee: EmployeeLoanEmployee | null
  loan_type: EmployeeLoanType | null

  principal_amount: LoanMoney
  total_payable_amount: LoanMoney
  opening_balance: LoanMoney
  /** Monthly deduction; split between the two cutoffs by the percents below. */
  deduction_amount: LoanMoney

  /** Percent of the monthly deduction taken on the 1st cutoff (first + second = 100). */
  first_cutoff_percent: number
  /** Percent of the monthly deduction taken on the 2nd cutoff. */
  second_cutoff_percent: number
  /** "1st cutoff only", "2nd cutoff only" or "50% / 50% split". */
  deduction_schedule: string
  first_cutoff_amount: number
  second_cutoff_amount: number

  total_paid?: number
  current_balance?: number
  loan_state?: EmployeeLoanState

  loan_date: string | null
  deduction_start_date: string | null

  remarks: string | null
  status: boolean

  created_by_name: string | null
  created_at: string | null
}

export interface EmployeeLoansResponse {
  success: boolean
  message: string
  data: EmployeeLoan[]
}

export interface EmployeeLoanResponse {
  success: boolean
  message: string
  data: EmployeeLoan
}

export interface EmployeeLoanPayload {
  employee_id: number
  loan_type_id: number
  loan_reference_no: string
  principal_amount: number
  total_payable_amount: number
  deduction_amount: number
  /** Optional on create (backend default 100 / 0); must total 100 with second_cutoff_percent. */
  first_cutoff_percent?: number
  second_cutoff_percent?: number
  loan_date: string
  deduction_start_date: string
  remarks: string | null
  status: boolean
}

/** PATCH /admin/employee-loans/{id}/deduction-schedule */
export interface EmployeeLoanDeductionSchedulePayload {
  first_cutoff_percent: number
  second_cutoff_percent: number
}

/** Preset schedules offered in the UI (custom splits are also allowed). */
export const LOAN_DEDUCTION_PRESETS = [
  { key: 'first', label: '1st cutoff only', first: 100, second: 0 },
  { key: 'second', label: '2nd cutoff only', first: 0, second: 100 },
  { key: 'split', label: 'Split 50% / 50%', first: 50, second: 50 },
] as const
