import {
  useContributionRateScheduleApi,
  type ContributionRateSchedulePayload,
  type ContributionRateScheduleRecord,
} from './useContributionRateScheduleApi'

const extractMessage = (error: unknown, fallback: string) => {
  const data = (error as { data?: { message?: string, errors?: Record<string, string[]> } })?.data

  if (data?.errors) {
    const first = Object.values(data.errors).flat()[0]
    if (first) return first
  }

  return data?.message || fallback
}

export const useContributionRateSchedules = () => {
  const api = useContributionRateScheduleApi()

  const rateSchedules = useState<ContributionRateScheduleRecord[]>('admin-contribution-rate-schedules', () => [])
  const loading = ref(false)
  const saving = ref(false)
  const errorMessage = ref('')

  const loadRateSchedules = async () => {
    loading.value = true
    errorMessage.value = ''
    try {
      const res = await api.getContributionRateSchedules()
      rateSchedules.value = res.data
    } catch (error) {
      errorMessage.value = extractMessage(error, 'Unable to load contribution rate schedules.')
    } finally {
      loading.value = false
    }
  }

  const createRateSchedule = async (payload: ContributionRateSchedulePayload) => {
    saving.value = true
    errorMessage.value = ''
    try {
      const res = await api.createContributionRateSchedule(payload)
      await loadRateSchedules()
      return res
    } catch (error) {
      errorMessage.value = extractMessage(error, 'Unable to save contribution rate schedule.')
      throw error
    } finally {
      saving.value = false
    }
  }

  const updateRateSchedule = async (id: number, payload: ContributionRateSchedulePayload) => {
    saving.value = true
    errorMessage.value = ''
    try {
      const res = await api.updateContributionRateSchedule(id, payload)
      await loadRateSchedules()
      return res
    } catch (error) {
      errorMessage.value = extractMessage(error, 'Unable to update contribution rate schedule.')
      throw error
    } finally {
      saving.value = false
    }
  }

  const deleteRateSchedule = async (id: number) => {
    saving.value = true
    errorMessage.value = ''
    try {
      const res = await api.deleteContributionRateSchedule(id)
      await loadRateSchedules()
      return res
    } catch (error) {
      errorMessage.value = extractMessage(error, 'Unable to delete contribution rate schedule.')
      await loadRateSchedules()
      throw error
    } finally {
      saving.value = false
    }
  }

  return {
    rateSchedules,
    loading,
    saving,
    errorMessage,
    loadRateSchedules,
    createRateSchedule,
    updateRateSchedule,
    deleteRateSchedule,
  }
}
