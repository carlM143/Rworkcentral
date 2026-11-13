import type { OffboardingRecord } from '~/types/offboarding'

export const useOffboarding = () => {
  const { $api } = useNuxtApp()
  const records = ref<OffboardingRecord[]>([])
  const loading = ref(false)
  const errorMessage = ref('')
  const search = ref('')
  const offboardingType = ref('')
  const department = ref('')
  const status = ref('')
  const currentPage = ref(1)
  const offboardingTypeOptions = ['Resignation', 'End of Contract', 'Retirement', 'Termination', 'Redundancy']
  const statusOptions = ['Draft', 'Pending Clearance', 'Clearance In Progress', 'For Review', 'Ready for Final Pay', 'Completed', 'Cancelled']
  const finalPayStatusOptions = ['Not Started', 'For Processing', 'For Review', 'Ready for Release', 'Released']
  const departmentOptions = computed(() => [...new Set(records.value.map(r => r.department))].sort())
  const load = async () => {
    loading.value = true
    errorMessage.value = ''
    try { records.value = (await $api<{ data: OffboardingRecord[] }>('/admin/lifecycle/offboarding')).data }
    catch (err: any) { errorMessage.value = err?.data?.message || 'Unable to load offboarding records.' }
    finally { loading.value = false }
  }
  const save = async (body: unknown, id?: number) => {
    const response = await $api<{ data: OffboardingRecord }>(`/admin/lifecycle/offboarding${id ? `/${id}` : ''}`, { method: id ? 'PUT' : 'POST', body: body as any })
    const index = records.value.findIndex(r => r.id === response.data.id)
    if (index < 0) records.value.unshift(response.data)
    else records.value[index] = response.data
  }
  const filteredRecords = computed(() => records.value.filter(r =>
    (!search.value.trim() || [r.employeeName, r.employeeNumber, r.offboardingNumber, r.reason].join(' ').toLowerCase().includes(search.value.trim().toLowerCase())) &&
    (!offboardingType.value || r.offboardingType === offboardingType.value) &&
    (!department.value || r.department === department.value) && (!status.value || r.status === status.value),
  ))
  const stats = computed(() => ({ total: records.value.length,
    active: records.value.filter(r => !['Draft', 'Completed', 'Cancelled', 'Ready for Final Pay'].includes(r.status)).length,
    finalPay: records.value.filter(r => r.status === 'Ready for Final Pay').length,
    completed: records.value.filter(r => r.status === 'Completed').length,
  }))
  const totalPages = computed(() => Math.max(1, Math.ceil(filteredRecords.value.length / 6)))
  const paginatedRecords = computed(() => filteredRecords.value.slice((currentPage.value - 1) * 6, currentPage.value * 6))
  const showingFrom = computed(() => filteredRecords.value.length ? (currentPage.value - 1) * 6 + 1 : 0)
  const showingTo = computed(() => Math.min(currentPage.value * 6, filteredRecords.value.length))
  const resetFilters = () => { search.value = ''; offboardingType.value = ''; department.value = ''; status.value = '' }
  watch([search, offboardingType, department, status], () => { currentPage.value = 1 })
  watch(totalPages, pages => { currentPage.value = Math.min(currentPage.value, pages) })
  onMounted(load)
  return { records, loading, errorMessage, load, save, search, offboardingType, department, status, currentPage,
    offboardingTypeOptions, statusOptions, finalPayStatusOptions, departmentOptions, filteredRecords, stats,
    totalPages, paginatedRecords, showingFrom, showingTo, resetFilters }
}
