import {
  useContributionChangeLogApi,
  type ContributionChangeLogFilter,
  type ContributionChangeLogRecord,
} from './useContributionChangeLogApi'

const extractMessage = (error: unknown, fallback: string) => {
  const data = (error as { data?: { message?: string, errors?: Record<string, string[]> } })?.data

  if (data?.errors) {
    const first = Object.values(data.errors).flat()[0]
    if (first) return first
  }

  return data?.message || fallback
}

export const useContributionChangeLogs = () => {
  const api = useContributionChangeLogApi()

  const changeLogs = useState<ContributionChangeLogRecord[]>('admin-contribution-change-logs', () => [])
  const loading = ref(false)
  const errorMessage = ref('')

  const loadChangeLogs = async (params?: ContributionChangeLogFilter) => {
    loading.value = true
    errorMessage.value = ''
    try {
      const res = await api.getContributionChangeLogs(params)
      changeLogs.value = res.data ?? []
    } catch (error) {
      errorMessage.value = extractMessage(error, 'Unable to load contribution change logs.')
    } finally {
      loading.value = false
    }
  }

  return {
    changeLogs,
    loading,
    errorMessage,
    loadChangeLogs,
  }
}
