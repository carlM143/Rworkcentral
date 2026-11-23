/**
 * Reports › Payroll Reports.
 *   GET /admin/reports/payroll?payroll_period_id=&department_id=&employment_type_id=&status=&search=
 */

export interface PayrollPeriodOption {
  id: number
  name: string
  pay_period_start: string
  pay_period_end: string
  cutoff_start: string
  cutoff_end: string
  payment_date: string
  status: string
  payrolls: number
  finalized: number
  official: boolean
}

export interface PayrollRegisterRow {
  id: number
  payroll_no: string
  employee_id: number
  employee: string
  emp_id: string
  department_id: number | null
  department: string
  position: string
  employment_type_id: number | null
  employment_type: string
  payroll_group: string | null
  salary_type: string | null
  basic_salary: number
  days_worked: number
  basic_pay: number
  overtime_pay: number
  holiday_pay: number
  allowance_pay: number
  gross_pay: number
  late_deduction: number
  undertime_deduction: number
  unpaid_leave_deduction: number
  unpaid_holiday_deduction: number
  attendance_deductions: number
  sss: number
  philhealth: number
  pagibig: number
  other_contributions: number
  contributions_total: number
  withholding_tax: number
  loan_deductions: number
  total_deductions: number
  net_pay: number
  employer_contributions: number
  bank_name: string | null
  account_name: string | null
  account_number: string | null
  status: 'draft' | 'finalized' | string
  generated_at: string | null
  finalized_at: string | null
}

export type PayrollTotals = { employees: number } & Record<
  'basic_pay' | 'overtime_pay' | 'holiday_pay' | 'allowance_pay' | 'gross_pay' | 'attendance_deductions'
  | 'sss' | 'philhealth' | 'pagibig' | 'other_contributions' | 'contributions_total' | 'withholding_tax'
  | 'loan_deductions' | 'total_deductions' | 'net_pay' | 'employer_contributions',
  number
>

export interface PayrollReportResponse {
  period: PayrollPeriodOption | null
  data: PayrollRegisterRow[]
  totals: PayrollTotals
  departments: { department: string, employees: number, gross_pay: number, total_deductions: number, net_pay: number, employer_contributions: number }[]
  counts: { all: number, draft: number, finalized: number }
  filters: {
    periods: PayrollPeriodOption[]
    departments: { id: number, name: string }[]
    employment_types: { id: number, name: string }[]
  }
}

export interface PayrollReportFilters {
  payroll_period_id?: number | ''
  department_id?: number | ''
  employment_type_id?: number | ''
  status?: '' | 'draft' | 'finalized'
  search?: string
}

export const usePayrollRegister = () => {
  const { $api } = useNuxtApp()

  return {
    load: (filters: PayrollReportFilters = {}) =>
      $api<PayrollReportResponse>('/admin/reports/payroll', {
        method: 'GET',
        query: Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined && v !== null)),
      }),
  }
}