
export interface PayrollPeriod {
  id: number
  userId: number | null
  companyId: number
  periodName: string
  cutoffStart: string
  cutoffEnd: string
  paymentDate: string
  status: string
}

export interface PayrollPeriodFormData {
  periodName: string
  cutoffStart: string
  cutoffEnd: string
  paymentDate: string
}

export interface PayrollPeriodApiRecord {
  id: number
  user_id: number | null
  company_id: number
  period_name: string
  cutoff_start: string
  cutoff_end: string
  payment_date: string
  status: string
}

export interface PayrollPeriodApiResponse<T> {
  success: boolean
  message: string
  data: T
}
