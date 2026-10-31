import {
  useContributionRateBracketApi,
  type ContributionRateBracketPayload,
  type ContributionRateBracketRecord,
} from './useContributionRateBracketApi'

const extractMessage = (error: unknown, fallback: string) => {
  const data = (error as { data?: { message?: string; errors?: Record<string, string[]> } })?.data

  if (data?.errors) {
    const first = Object.values(data.errors).flat()[0]
    if (first) return first
  }

  return data?.message || fallback
}

export const useContributionRateBrackets = () => {
  const api = useContributionRateBracketApi()

  const rateBrackets = useState<ContributionRateBracketRecord[]>('admin-contribution-rate-brackets', () => [])
  const loading = ref(false)
  const saving = ref(false)
  const errorMessage = ref('')

  const loadRateBrackets = async (scheduleId?: number) => {
    loading.value = true
    errorMessage.value = ''
    try {
      const res = await api.getContributionRateBrackets(scheduleId)
      rateBrackets.value = res.data
    } catch (error) {
      errorMessage.value = extractMessage(error, 'Unable to load contribution rate brackets.')
    } finally {
      loading.value = false
    }
  }

  const createRateBracket = async (payload: ContributionRateBracketPayload) => {
    saving.value = true
    errorMessage.value = ''
    try {
      const res = await api.createContributionRateBracket(payload)
      await loadRateBrackets()
      return res
    } catch (error) {
      errorMessage.value = extractMessage(error, 'Unable to save contribution rate bracket.')
      throw error
    } finally {
      saving.value = false
    }
  }

  const updateRateBracket = async (id: number, payload: ContributionRateBracketPayload) => {
    saving.value = true
    errorMessage.value = ''
    try {
      const res = await api.updateContributionRateBracket(id, payload)
      await loadRateBrackets()
      return res
    } catch (error) {
      errorMessage.value = extractMessage(error, 'Unable to update contribution rate bracket.')
      throw error
    } finally {
      saving.value = false
    }
  }

  const deleteRateBracket = async (id: number) => {
    saving.value = true
    errorMessage.value = ''
    try {
      const res = await api.deleteContributionRateBracket(id)
      await loadRateBrackets()
      return res
    } catch (error) {
      errorMessage.value = extractMessage(error, 'Unable to delete contribution rate bracket.')
      await loadRateBrackets()
      throw error
    } finally {
      saving.value = false
    }
  }

  return {
    rateBrackets,
    loading,
    saving,
    errorMessage,
    loadRateBrackets,
    createRateBracket,
    updateRateBracket,
    deleteRateBracket,
  }
}
