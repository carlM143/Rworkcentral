/**
 * Reports › Wage Compliance.
 *   GET /admin/reports/wage-compliance?as_of=&region=&department_id=&status=&search=
 */

export type ComplianceStatus =
  | 'below' | 'pending' | 'distortion' | 'upcoming' | 'compliant'
  | 'no_salary' | 'no_wage_order' | 'no_location'

export interface ComplianceRow {
  employee_id: number
  employee: string
  emp_id: string
  department_id: number | null
  department: string
  position: string
  employment_type: string | null
  location: string
  region_code: string | null
  region_name: string | null
  classification: string | null
  salary_type: string | null
  basic_salary: number | null
  current_daily: number | null
  minimum_daily: number | null
  previous_minimum: number | null
  variance_daily: number | null
  monthly_shortfall: number
  wage_order: { id: number, order_no: string, title: string, effective_date: string | null } | null
  upcoming: { id: number, order_no: string, minimum_daily: number, effective_date: string | null } | null
  adjustment: {
    id: number
    status: string
    new_basic_salary: number
    effective_date: string | null
    wage_order_no: string | null
    from_wage_order: boolean
  } | null
  status: ComplianceStatus
  status_label: string
}

export interface ComplianceResponse {
  data: ComplianceRow[]
  as_of: string
  stats: {
    reviewed: number
    compliant: number
    below: number
    pending: number
    distortion: number
    upcoming: number
    missing_data: number
    monthly_shortfall: number
  }
  filters: {
    regions: { code: string, name: string }[]
    departments: { id: number, name: string }[]
    statuses: { value: ComplianceStatus, label: string }[]
  }
}

export interface ComplianceFilters {
  as_of?: string
  region?: string
  department_id?: number | ''
  status?: ComplianceStatus | ''
  search?: string
}

export const useWageCompliance = () => {
  const { $api } = useNuxtApp()

  return {
    list: (filters: ComplianceFilters = {}) =>
      $api<ComplianceResponse>('/admin/reports/wage-compliance', {
        method: 'GET',
        query: Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined && v !== null)),
      }),
  }
}