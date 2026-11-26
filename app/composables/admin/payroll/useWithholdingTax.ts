export type TaxFrequency = 'daily' | 'weekly' | 'semi_monthly' | 'monthly'

export interface TaxBracket {
  over: number
  up_to: number | null
  base_tax: number
  rate: number
}

export interface TaxTable {
  id: number
  name: string
  frequency: TaxFrequency
  effective_from: string
  effective_to: string | null
  is_active: boolean
  reference: string | null
  notes: string | null
  in_force: boolean
  brackets: TaxBracket[]
}

export interface TaxSettings {
  apply_mwe_exemption: boolean
  main_allowance_taxable: boolean
  non_taxable_allowances: string[]
}

export interface TaxTablePayload {
  name: string
  frequency: TaxFrequency
  effective_from: string
  effective_to?: string | null
  is_active?: boolean
  reference?: string | null
  notes?: string | null
  brackets: TaxBracket[]
}

export const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  bi_weekly: 'Bi-weekly',
  semi_monthly: 'Semi-monthly',
  monthly: 'Monthly',
}

export const useWithholdingTax = () => {
  const { $api } = useNuxtApp()

  return {
    load: () =>
      $api<{ data: TaxTable[], settings: TaxSettings, allowance_names: string[], frequencies: TaxFrequency[] }>('/admin/withholding-tax'),
    create: (payload: TaxTablePayload) =>
      $api<{ message: string }>('/admin/withholding-tax/tables', { method: 'POST', body: payload }),
    update: (id: number, payload: TaxTablePayload) =>
      $api<{ message: string }>(`/admin/withholding-tax/tables/${id}`, { method: 'PUT', body: payload }),
    remove: (id: number) =>
      $api<{ message: string }>(`/admin/withholding-tax/tables/${id}`, { method: 'DELETE' }),
    saveSettings: (settings: TaxSettings) =>
      $api<{ message: string }>('/admin/withholding-tax/settings', { method: 'PUT', body: settings }),
    calculate: (frequency: string, taxable: number, date?: string) =>
      $api<{ data: { taxable: number, tax: number, bracket: TaxBracket | null, table: { id: number, name: string } | null } }>(
        '/admin/withholding-tax/calculate',
        { method: 'POST', body: { frequency, taxable, date } },
      ),
  }
}

export const apiMessage = (err: unknown, fallback: string) => {
  const e = err as { data?: { message?: string, errors?: Record<string, string[]> } }
  const first = e?.data?.errors ? Object.values(e.data.errors)[0]?.[0] : undefined
  return first ?? e?.data?.message ?? fallback
}
