import {
  useContributionDeductionSettingApi,
  type ContributionDeductionSettingPayload,
  type ContributionDeductionSettingRecord,
} from './useContributionDeductionSettingApi'

const extractMessage = (error: unknown, fallback: string) => {
  const data = (error as { data?: { message?: string; errors?: Record<string, string[]> } })?.data

  if (data?.errors) {
    const first = Object.values(data.errors).flat()[0]
    if (first) return first
  }

  return data?.message || fallback
}

export const useContributionDeductionSettings = () => {
  const api = useContributionDeductionSettingApi()

  const deductionSettings = useState<ContributionDeductionSettingRecord[]>(
    'admin-contribution-deduction-settings',
    () => [],
  )
  const loading = ref(false)
  const saving = ref(false)
  const errorMessage = ref('')

  const loadDeductionSettings = async () => {
    loading.value = true
    errorMessage.value = ''
    try {
      const res = await api.getContributionDeductionSettings()
      deductionSettings.value = res.data
    } catch (error) {
      errorMessage.value = extractMessage(error, 'Unable to load contribution deduction settings.')
    } finally {
      loading.value = false
    }
  }

  const createDeductionSetting = async (payload: ContributionDeductionSettingPayload) => {
    saving.value = true
    errorMessage.value = ''
    try {
      const res = await api.createContributionDeductionSetting(payload)
      await loadDeductionSettings()
      return res
    } catch (error) {
      errorMessage.value = extractMessage(error, 'Unable to save contribution deduction setting.')
      throw error
    } finally {
      saving.value = false
    }
  }

  const updateDeductionSetting = async (id: number, payload: ContributionDeductionSettingPayload) => {
    saving.value = true
    errorMessage.value = ''
    try {
      const res = await api.updateContributionDeductionSetting(id, payload)
      await loadDeductionSettings()
      return res
    } catch (error) {
      errorMessage.value = extractMessage(error, 'Unable to update contribution deduction setting.')
      throw error
    } finally {
      saving.value = false
    }
  }

  const deleteDeductionSetting = async (id: number) => {
    saving.value = true
    errorMessage.value = ''
    try {
      const res = await api.deleteContributionDeductionSetting(id)
      await loadDeductionSettings()
      return res
    } catch (error) {
      errorMessage.value = extractMessage(error, 'Unable to delete contribution deduction setting.')
      await loadDeductionSettings()
      throw error
    } finally {
      saving.value = false
    }
  }

  return {
    deductionSettings,
    loading,
    saving,
    errorMessage,
    loadDeductionSettings,
    createDeductionSetting,
    updateDeductionSetting,
    deleteDeductionSetting,
  }
}
