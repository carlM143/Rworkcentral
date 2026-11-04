export interface LoanType {
  id: number
  loan_code: string
  loan_name: string
  provider: string | null
  status: boolean
}

export interface LoanTypesResponse {
  success: boolean
  message: string
  data: LoanType[]
} 

export interface CreateLoanTypePayload {
  loan_code: string
  loan_name: string
  provider: string
  status: boolean
}

export type UpdateLoanTypePayload = CreateLoanTypePayload
