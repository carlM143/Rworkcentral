import { useEmploymentTypeApi, type EmploymentTypeRecord, type EmploymentTypePayload } from './useEmploymentTypeApi'

export const useEmploymentTypes = () => {
  const api = useEmploymentTypeApi()

  const employmentTypes = useState<EmploymentTypeRecord[]>('admin-employment-types', () => [])
  const loading = ref(false)
  const saving = ref(false)
  const errorMessage = ref('')
  const search = ref('')

  const loadEmploymentTypes = async () => {
    loading.value = true
    errorMessage.value = ''
    try {
      const res = await api.getEmploymentTypes()
      employmentTypes.value = res.data
    } catch {
      errorMessage.value = 'Unable to load employment types.'
    } finally {
      loading.value = false
    }
  }

  const createEmploymentType = async (payload: EmploymentTypePayload) => {
    saving.value = true
    try {
      const res = await api.createEmploymentType(payload)
      await loadEmploymentTypes()
      return res
    } finally {
      saving.value = false
    }
  }

  const updateEmploymentType = async (id: number, payload: EmploymentTypePayload) => {
    saving.value = true
    try {
      const res = await api.updateEmploymentType(id, payload)
      await loadEmploymentTypes()
      return res
    } finally {
      saving.value = false
    }
  }

  const deleteEmploymentType = async (id: number) => {
    saving.value = true
    try {
      const res = await api.deleteEmploymentType(id)
      await loadEmploymentTypes()
      return res
    } finally {
      saving.value = false
    }
  }

  const filteredEmploymentTypes = computed(() => {
    const q = search.value.trim().toLowerCase()
    return employmentTypes.value.filter(item =>
      !q || item.name.toLowerCase().includes(q) || (item.description && item.description.toLowerCase().includes(q))
    )
  })

  const stats = computed(() => ({
    total: employmentTypes.value.length,
    active: employmentTypes.value.filter(x => x.status === 'active' || x.status === 'Active' || x.status === '1' || x.status === true).length,
  }))

  return {
    employmentTypes,
    loading,
    saving,
    errorMessage,
    search,
    filteredEmploymentTypes,
    stats,
    loadEmploymentTypes,
    createEmploymentType,
    updateEmploymentType,
    deleteEmploymentType,
  }
}
