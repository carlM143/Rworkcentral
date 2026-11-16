import { ref } from 'vue'
import type {
  DashboardSummary,
  DashboardSummaryResponse,
} from '~/types/dashboard/dashboard'

export const useDashboardSummary = () => {
  const { $api } = useNuxtApp()

  const summary = ref<DashboardSummary | null>(null)
  const loading = ref(false)
  const error = ref('')

  const getSummary = async (date?: string): Promise<void> => {
    loading.value = true
    error.value = ''

    try {
      const response = await $api<DashboardSummaryResponse>('/admin/dashboard/summary', {
        method: 'GET',
        query: date ? { date } : undefined,
      })

      if (response.success === false || !response.data) {
        throw new Error(response.message || 'Invalid dashboard response.')
      }

      summary.value = response.data
    } catch (problem: unknown) {
      const err = problem as { data?: { message?: string }; message?: string }
      summary.value = null
      error.value = err?.data?.message || err?.message || 'Unable to load dashboard.'
    } finally {
      loading.value = false
    }
  }

  return { summary, loading, error, getSummary }
}