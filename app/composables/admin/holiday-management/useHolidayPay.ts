import type {
  HolidayPayFilters,
  HolidayPayHistory,
  HolidayPayRule,
  HolidayPayRulePayload,
  HolidayTypeOption,
} from '~/types/holiday-management/holiday-pay/holidayPay'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const useHolidayPay = () => {
  const { $api } = useNuxtApp()

  const rules = ref<HolidayPayRule[]>([])
  const holidayTypes = ref<HolidayTypeOption[]>([])
  const loadingRules = ref(false)
  const loadingHistory = ref(false)
  const saving = ref(false)

  const fetchRules = async () => {
    loadingRules.value = true
    try {
      const res = await $api<ApiResponse<HolidayPayRule[]>>('/admin/holiday-pay-rules')
      rules.value = res.data
    } finally {
      loadingRules.value = false
    }
  }

  const fetchHolidayTypes = async () => {
    const res = await $api<ApiResponse<HolidayTypeOption[]>>('/admin/holiday-pay-rules/types')
    holidayTypes.value = res.data
  }

  const saveRule = async (payload: HolidayPayRulePayload, id?: number | null) => {
    saving.value = true
    try {
      return await $api<ApiResponse<HolidayPayRule>>(
        id ? `/admin/holiday-pay-rules/${id}` : '/admin/holiday-pay-rules',
        { method: id ? 'PUT' : 'POST', body: payload },
      )
    } finally {
      saving.value = false
    }
  }

  const deleteRule = async (id: number) =>
    $api<ApiResponse<null>>(`/admin/holiday-pay-rules/${id}`, { method: 'DELETE' })

  const fetchHistory = async (filters: HolidayPayFilters) => {
    loadingHistory.value = true
    try {
      const query = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== null && v !== undefined && v !== ''),
      )
      const res = await $api<ApiResponse<HolidayPayHistory>>('/admin/holiday-pays', { query })
      return res.data
    } finally {
      loadingHistory.value = false
    }
  }

  const getErrorMessage = (err: unknown) => {
    const e = err as { data?: { message?: string, errors?: Record<string, string[]> }, message?: string }
    return Object.values(e?.data?.errors ?? {}).flat()[0]
      ?? e?.data?.message
      ?? e?.message
      ?? 'Something went wrong.'
  }

  return {
    rules,
    holidayTypes,
    loadingRules,
    loadingHistory,
    saving,
    fetchRules,
    fetchHolidayTypes,
    saveRule,
    deleteRule,
    fetchHistory,
    getErrorMessage,
  }
}