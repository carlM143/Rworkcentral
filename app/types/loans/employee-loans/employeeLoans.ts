
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
  deduction_amount: LoanMoney

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
  loan_date: string
  deduction_start_date: string
  remarks: string | null
  status: boolean
}