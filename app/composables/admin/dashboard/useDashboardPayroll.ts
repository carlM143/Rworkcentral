/**
 * Payroll Status card on the dashboard.
 *   GET /admin/dashboard/payroll-status
 */

export interface DashboardPayroll {
  period: {
    id: number
    name: string
    cutoff_start: string
    cutoff_end: string
    payment_date: string
    status: 'draft' | 'open' | 'processing' | 'closed'
    days_to_payday: number
  }
  status_label: string
  step: number // 0 Draft · 1 Open · 2 Generated · 3 Finalized · 4 Paid
  steps: string[]
  next_action: { label: string, url: string }
  employees: { active: number, generated: number, finalized: number }
  totals: { gross: number, deductions: number, net: number }
  previous: { name: string, net: number } | null
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const useDashboardPayroll = () => {
  const { $api } = useNuxtApp()

  const payroll = ref<DashboardPayroll | null>(null)
  const loaded = ref(false)
  const loading = ref(false)
  const error = ref('')

  const getPayroll = async () => {
    loading.value = true
    error.value = ''
    try {
      const response = await $api<ApiResponse<DashboardPayroll | null>>('/admin/dashboard/payroll-status', { method: 'GET' })
      payroll.value = response.data
      loaded.value = true
    } catch {
      error.value = 'Unable to load payroll status.'
    } finally {
      loading.value = false
    }
  }

  return { payroll, loaded, loading, error, getPayroll }
}