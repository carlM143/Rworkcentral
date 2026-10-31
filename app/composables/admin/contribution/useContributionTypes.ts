import { useContributionTypeApi, type ContributionTypePayload, type ContributionTypeRecord } from './useContributionTypeApi'

const extractMessage = (error: unknown, fallback: string) => {
  const data = (error as { data?: { message?: string, errors?: Record<string, string[]> } })?.data

  if (data?.errors) {
    const first = Object.values(data.errors).flat()[0]
    if (first) return first
  }

  return data?.message || fallback
}

export const useContributionTypes = () => {
  const api = useContributionTypeApi()

  const contributionTypes = useState<ContributionTypeRecord[]>('admin-contribution-types', () => [])
  const loading = ref(false)
  const saving = ref(false)
  const errorMessage = ref('')

  const loadContributionTypes = async () => {
    loading.value = true
    errorMessage.value = ''
    try {
      const res = await api.getContributionTypes()
      contributionTypes.value = res.data
    } catch (error) {
      errorMessage.value = extractMessage(error, 'Unable to load contribution types.')
    } finally {
      loading.value = false
    }
  }

  const createContributionType = async (payload: ContributionTypePayload) => {
    saving.value = true
    errorMessage.value = ''
    try {
      const res = await api.createContributionType(payload)
      await loadContributionTypes()
      return res
    } catch (error) {
      errorMessage.value = extractMessage(error, 'Unable to save contribution type.')
      throw error
    } finally {
      saving.value = false
    }
  }

  const updateContributionType = async (id: number, payload: ContributionTypePayload) => {
    saving.value = true
    errorMessage.value = ''
    try {
      const res = await api.updateContributionType(id, payload)
      await loadContributionTypes()
      return res
    } catch (error) {
      errorMessage.value = extractMessage(error, 'Unable to update contribution type.')
      throw error
    } finally {
      saving.value = false
    }
  }

  const deleteContributionType = async (id: number) => {
    saving.value = true
    errorMessage.value = ''
    try {
      const res = await api.deleteContributionType(id)
      await loadContributionTypes()
      return res
    } catch (error) {
      errorMessage.value = extractMessage(error, 'Unable to delete contribution type.')
      await loadContributionTypes()
      throw error
    } finally {
      saving.value = false
    }
  }

  return {
    contributionTypes,
    loading,
    saving,
    errorMessage,
    loadContributionTypes,
    createContributionType,
    updateContributionType,
    deleteContributionType,
  }
}
