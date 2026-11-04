export type TransactionMoney = string | number

export interface EmployeeLoanTransaction {
  id: number
  referenceNo: string
  employeeId: number | null
  employeeName: string
  employeeNumber: string
  employeeLoanId: number | null
  loanReferenceNo: string
  loanTypeId: number | null
  loanTypeName: string
  transactionType: string
  transactionDate: string | null
  amount: TransactionMoney
  balanceBefore: TransactionMoney | null
  balanceAfter: TransactionMoney | null
  status: string
  remarks: string | null
  createdBy: string | null
}

export interface EmployeeLoanTransactionFilters {
  employee_id: string
  employee_loan_id: string
  loan_type_id: string
  transaction_type: string
  from_date: string
  to_date: string
  status: string
  per_page: number
}

export interface EmployeeLoanTransactionPagination {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
  from: number
  to: number
}

export interface EmployeeLoanTransactionStats {
  total: number
  totalAmount: number
  completed: number
  pending: number
}
