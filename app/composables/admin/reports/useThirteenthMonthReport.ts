/**
 * Reports › 13th Month Pay.
 *   GET /admin/reports/thirteenth-month?year=&department_id=&search=&include_draft=
 */

export interface ThirteenthMonthRow {
  employee_id: number
  employee: string
  emp_id: string
  active: boolean
  department_id: number | null
  department: string
  position: string
  payrolls: number
  months: number
  draft_payrolls: number
  last_cutoff: string
  basic_pay: number
  deductions: number
  earned_basic: number
  thirteenth_month: number
  taxable_excess: number
}

export interface ThirteenthMonthResponse {
  year: number
  include_draft: boolean
  official: boolean
  draft_payrolls: number
  deadline: string
  covered_until: string | null
  data: ThirteenthMonthRow[]
  totals: { employees: number, basic_pay: number, deductions: number, earned_basic: number, thirteenth_month: number, taxable_excess: number }
  filters: { years: number[], departments: { id: number, name: string }[] }
}

export const useThirteenthMonthReport = () => {
  const { $api } = useNuxtApp()

  return {
    load: (filters: { year?: number | '', department_id?: number | '', search?: string, include_draft?: boolean } = {}) =>
      $api<ThirteenthMonthResponse>('/admin/reports/thirteenth-month', {
        method: 'GET',
        query: Object.fromEntries(
          Object.entries({ ...filters, include_draft: filters.include_draft === undefined ? undefined : (filters.include_draft ? 1 : 0) })
            .filter(([, v]) => v !== '' && v !== undefined && v !== null),
        ),
      }),
  }
}