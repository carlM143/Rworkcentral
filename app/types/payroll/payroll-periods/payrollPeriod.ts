export interface PayrollPeriod {
  id: number
  user_id: number | null
  company_id: number
  label: string
  period_name: string | null
  cutoff_number: 1 | 2
  cutoff_start: string
  cutoff_end: string
  payment_date: string
  status: string
}

export interface PayrollPeriodPayload {
  period_name: string
  cutoff_number: 1 | 2
  cutoff_start: string
  cutoff_end: string
  payment_date: string
}

export interface PayrollPeriodFormData {
  periodName: string
  cutoffNumber?: 1 | 2
  cutoffStart: string
  cutoffEnd: string
  paymentDate: string
}

export interface PayrollPeriodFormValue extends PayrollPeriodFormData {
  id: number
  status: string
}