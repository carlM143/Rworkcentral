import type { Department } from '~/types/department'

export const useDepartments = () => {
  const { employees } = useEmployees()
  // Shared local state across the directory and its detail pages. Not yet persisted to an API.
  const departments = useState<Department[]>('hris-departments', () => [
    { id: 1, code: 'OPS', name: 'Operations', description: 'Handles daily operations, dispatching, drivers and field activities.', head: 'Leo Martinez', status: 'Active' },
    { id: 2, code: 'HR', name: 'Human Resources', description: 'Manages employee records, recruitment, employee relations and HR administration.', head: 'Claire Villanueva', status: 'Active' },
    { id: 3, code: 'FIN', name: 'Finance', description: 'Handles accounting, payroll processing and financial records.', status: 'Active' },
  ])

  const search = ref('')
  const status = ref('')
  const currentPage = ref(1)
  const perPage = ref(6)
  const getActiveEmployees = (departmentName: string) => employees.value.filter(employee => employee.status === 'Active' && employee.department === departmentName)
  const getEmployeeCount = (departmentName: string) => getActiveEmployees(departmentName).length
  const getPositionCount = (departmentName: string) => new Set(getActiveEmployees(departmentName).map(employee => employee.position)).size

  const filteredDepartments = computed(() => {
    const keyword = search.value.trim().toLowerCase()
    return departments.value.filter(item => {
      const matchesSearch = !keyword || [item.name, item.code, item.head ?? '', item.description ?? ''].some(v => v.toLowerCase().includes(keyword))
      return matchesSearch && (!status.value || item.status === status.value)
    })
  })
  const totalPages = computed(() => Math.max(1, Math.ceil(filteredDepartments.value.length / perPage.value)))
  const paginatedDepartments = computed(() => filteredDepartments.value.slice((currentPage.value - 1) * perPage.value, currentPage.value * perPage.value))
  const showingFrom = computed(() => filteredDepartments.value.length ? (currentPage.value - 1) * perPage.value + 1 : 0)
  const showingTo = computed(() => Math.min(currentPage.value * perPage.value, filteredDepartments.value.length))
  const stats = computed(() => {
    const active = departments.value.filter(item => item.status === 'Active')
    return {
      total: departments.value.length,
      active: active.length,
      employees: employees.value.filter(employee => employee.status === 'Active' && departments.value.some(item => item.name === employee.department)).length,
      vacantHeads: active.filter(item => !item.head?.trim()).length,
    }
  })
  const statusOptions = ['Active', 'Inactive']
  const resetFilters = () => { search.value = ''; status.value = ''; currentPage.value = 1 }
  const getDepartmentById = (id: string | number) => departments.value.find(item => item.id === Number(id))

  type DepartmentInput = Pick<Department, 'name' | 'code' | 'description' | 'status'> & { head?: string }
  const saveDepartment = (input: DepartmentInput, id?: number) => {
    const name = input.name.trim()
    const code = input.code.trim().toUpperCase()
    if (!name || !code) return { ok: false, message: 'Department name and code are required.' }
    if (departments.value.some(item => item.id !== id && (item.name.toLowerCase() === name.toLowerCase() || item.code.toLowerCase() === code.toLowerCase()))) {
      return { ok: false, message: 'Department name or code already exists.' }
    }
    const payload = { name, code, description: input.description?.trim() ?? '', head: input.head?.trim() || undefined, status: input.status }
    if (id !== undefined) {
      const index = departments.value.findIndex(item => item.id === id)
      if (index < 0) return { ok: false, message: 'Department not found.' }
      departments.value[index] = { ...departments.value[index], ...payload }
    } else {
      const newId = Math.max(0, ...departments.value.map(item => item.id)) + 1
      departments.value.push({ id: newId, ...payload })
    }
    return { ok: true, message: id === undefined ? 'Department added locally.' : 'Department updated locally.' }
  }

  watch([search, status], () => { currentPage.value = 1 })
  watch(totalPages, pages => { if (currentPage.value > pages) currentPage.value = pages })
  return {
    departments, search, status, currentPage, perPage, filteredDepartments, paginatedDepartments,
    totalPages, showingFrom, showingTo, stats, statusOptions, getEmployeeCount,
    getPositionCount, getDepartmentById, saveDepartment, resetFilters,
  }
}
