export interface WithholdingTaxRow {
  employee_id: number
  employee: string
  emp_id: string
  department_id: number | null
  department: string
  tin: string | null
  mwe: boolean
  gross: number
  non_taxable: number
  taxable: number
  tax: number
  cutoffs: number
}

export interface WithholdingTaxReport {
  month: string
  month_label: string
  official: boolean
  draft_payrolls: number
  data: WithholdingTaxRow[]
  totals: { employees: number, gross: number, non_taxable: number, taxable: number, tax: number, mwe: number, missing_tin: number }
  filters: { months: { value: string, label: string }[], departments: { id: number, name: string }[] }
}

export const useWithholdingTaxReport = () => {
  const { $api } = useNuxtApp()
  return {
    load: (filters: { month?: string, department_id?: number | '', search?: string } = {}) =>
      $api<WithholdingTaxReport>('/admin/reports/withholding-tax', {
        method: 'GET',
        query: Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined && v !== null)),
      }),
  }
}
