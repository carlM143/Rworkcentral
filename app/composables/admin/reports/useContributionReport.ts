/**
 * Reports › SSS, Pag-IBIG and PhilHealth.
 *   GET /admin/reports/contributions/{agency}?month=YYYY-MM&department_id=&search=
 */

export type ContributionAgency = 'sss' | 'philhealth' | 'pagibig'

export interface ContributionRow {
  employee_id: number
  employee: string
  emp_id: string
  department_id: number | null
  department: string
  id_number: string | null
  salary_basis: number
  employee_share: number
  employer_share: number
  ec: number
  total: number
  cutoffs: number
}

export interface ContributionReportResponse {
  agency: { key: ContributionAgency, label: string, id_label: string, basis_label: string, has_ec: boolean }
  month: string
  month_label: string
  official: boolean
  draft_payrolls: number
  periods: { id: number, period_name: string, status: string }[]
  data: ContributionRow[]
  totals: { employees: number, employee_share: number, employer_share: number, ec: number, total: number, missing_id: number }
  filters: {
    months: { value: string, label: string }[]
    departments: { id: number, name: string }[]
  }
}

export const useContributionReport = () => {
  const { $api } = useNuxtApp()

  return {
    load: (agency: ContributionAgency, filters: { month?: string, department_id?: number | '', search?: string } = {}) =>
      $api<ContributionReportResponse>(`/admin/reports/contributions/${agency}`, {
        method: 'GET',
        query: Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined && v !== null)),
      }),
  }
}
