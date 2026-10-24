import type { Department, DepartmentFormData } from '~/types/department'
import type { DepartmentApiRecord, DepartmentPayload } from '~/composables/admin/departments/useDepartmentApi'
import { useDepartmentApi } from '~/composables/admin/departments/useDepartmentApi'

export const useDepartments = () => {
  const api = useDepartmentApi()

  const departments = useState<Department[]>('hris-departments', () => [])
  const loading = ref(false)
  const saving = ref(false)
  const errorMessage = ref('')

  // FILTERS
  const search = ref('')
  const status = ref('')

  // PAGINATION
  const currentPage = ref(1)
  const perPage = ref(6)

  // API ERROR HANDLING
  const getErrorMessage = (error: any): string => {
    const validationErrors = error?.data?.errors
    const firstValidationError = validationErrors ? Object.values(validationErrors).flat()[0] : null

    return String(firstValidationError || error?.data?.message || error?.response?._data?.message || error?.message || 'An unexpected API error occurred.')
  }

  // CONVERT BACKEND DATA TO FRONTEND
  const mapDepartment = (item: DepartmentApiRecord): Department => ({
    id: item.id,
    companyId: item.company_id,
    code: item.department_code,
    name: item.department_name,
    status: item.status === true || item.status === 1 ? 'Active' : 'Inactive',
    employeeCount: Number(item.employments_count ?? 0),
    positionCount: Number(item.positions_count ?? 0),
  })

  // FETCH ALL DEPARTMENTS
  const loadDepartments = async () => {
    loading.value = true
    errorMessage.value = ''

    try {
      const response = await api.getDepartments()
      departments.value = response.data.map(mapDepartment)
      return response
    } catch (error: any) {
      console.error('Department API Error:', error)
      console.error('Status Code:', error?.statusCode || error?.response?.status)
      console.error('Laravel Response:', error?.data || error?.response?._data)

      errorMessage.value = getErrorMessage(error)
      departments.value = []
      throw error
    } finally {
      loading.value = false
    }
  }

  // PREPARE REQUEST PAYLOAD
  const buildPayload = (form: DepartmentFormData): DepartmentPayload => {
    const name = form.name.trim()
    const code = form.code.trim().toUpperCase()

    if (!name) throw new Error('Department name is required.')
    if (!code) throw new Error('Department code is required.')
    if (name.length > 255) throw new Error('Department name must not exceed 255 characters.')
    if (code.length > 20) throw new Error('Department code must not exceed 20 characters.')

    return {
      department_name: name,
      department_code: code,
      status: form.status === 'Active',
    }
  }

  // CREATE OR UPDATE DEPARTMENT
  const saveDepartment = async (form: DepartmentFormData, id?: number) => {
    if (saving.value) throw new Error('Another department request is already in progress.')

    const payload = buildPayload(form)
    saving.value = true

    try {
      const response = id === undefined
        ? await api.createDepartment(payload)
        : await api.updateDepartment(id, payload)

      await loadDepartments()
      return response
    } catch (error: any) {
      console.error('Save Department Error:', error)
      throw error
    } finally {
      saving.value = false
    }
  }

  // DELETE DEPARTMENT
  const removeDepartment = async (id: number) => {
    if (saving.value) throw new Error('Another department request is already in progress.')

    saving.value = true

    try {
      const response = await api.deleteDepartment(id)
      await loadDepartments()
      return response
    } catch (error: any) {
      console.error('Delete Department Error:', error)
      throw error
    } finally {
      saving.value = false
    }
  }

  // FILTER DEPARTMENTS
  const filteredDepartments = computed(() => {
    const keyword = search.value.trim().toLowerCase()

    return departments.value.filter(department => {
      const matchesSearch = !keyword || department.name.toLowerCase().includes(keyword) || department.code.toLowerCase().includes(keyword)
      const matchesStatus = !status.value || department.status === status.value
      return matchesSearch && matchesStatus
    })
  })

  // PAGINATION
  const totalPages = computed(() => Math.max(1, Math.ceil(filteredDepartments.value.length / perPage.value)))

  const paginatedDepartments = computed(() => {
    const start = (currentPage.value - 1) * perPage.value
    return filteredDepartments.value.slice(start, start + perPage.value)
  })

  const showingFrom = computed(() => filteredDepartments.value.length ? (currentPage.value - 1) * perPage.value + 1 : 0)
  const showingTo = computed(() => Math.min(currentPage.value * perPage.value, filteredDepartments.value.length))

  // DEPARTMENT STATISTICS
  const stats = computed(() => ({
    total: departments.value.length,
    active: departments.value.filter(department => department.status === 'Active').length,
    inactive: departments.value.filter(department => department.status === 'Inactive').length,
    employees: departments.value.reduce((total, department) => total + department.employeeCount, 0),
  }))

  // EMPLOYEE COUNT
  const getEmployeeCount = (departmentName: string) => {
    return departments.value.find(item => item.name === departmentName)?.employeeCount ?? 0
  }

  // POSITION COUNT
  const getPositionCount = (departmentName: string) => {
    return departments.value.find(item => item.name === departmentName)?.positionCount ?? 0
  }

  // GET SINGLE DEPARTMENT
  const getDepartmentById = (id: string | number) => {
    return departments.value.find(item => item.id === Number(id))
  }

  const statusOptions = ['Active', 'Inactive']

  // RESET FILTERS
  const resetFilters = () => {
    search.value = ''
    status.value = ''
    currentPage.value = 1
  }

  // WATCH FILTERS
  watch([search, status], () => { currentPage.value = 1 })
  watch(totalPages, pages => { if (currentPage.value > pages) currentPage.value = pages })

  return {
    departments,
    loading,
    saving,
    errorMessage,
    search,
    status,
    currentPage,
    perPage,
    filteredDepartments,
    paginatedDepartments,
    totalPages,
    showingFrom,
    showingTo,
    stats,
    statusOptions,
    getEmployeeCount,
    getPositionCount,
    getDepartmentById,
    loadDepartments,
    saveDepartment,
    removeDepartment,
    resetFilters,
  }
}