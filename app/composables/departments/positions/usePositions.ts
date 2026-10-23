import type { Position, PositionFormData, PositionStatus } from '~/types/position'
import { usePositionApi, type PositionApiRecord, type PositionPayload } from './usePositionApi'
import { useDepartmentApi } from '~/composables/departments/useDepartmentApi'

export const usePositions = () => {
  const api = usePositionApi()
  const departmentApi = useDepartmentApi()

  const positions = useState<Position[]>('hris-positions', () => [])
  const departments = ref<{ id: number; name: string }[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const errorMessage = ref('')

  const search = ref('')
  const department = ref('')
  const status = ref('')
  const currentPage = ref(1)
  const perPage = 6

  const statusOptions: PositionStatus[] = ['Active', 'Inactive']
  const departmentOptions = computed(() => departments.value.map(item => item.name).sort())

  const mapPosition = (item: PositionApiRecord): Position => ({
    id: item.id,
    departmentId: item.department_id,
    department: item.department?.department_name ?? 'Unassigned',
    name: item.position,
    description: item.description ?? '',
    status: item.status === true || item.status === 1 || item.status === '1' ? 'Active' : 'Inactive',
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  })

  const loadPositions = async () => {
    loading.value = true
    errorMessage.value = ''

    try {
      const [positionResponse, departmentResponse] = await Promise.all([
        api.getPositions(),
        departmentApi.getDepartments(),
      ])

      positions.value = positionResponse.data.map(mapPosition)
      departments.value = departmentResponse.data.map(item => ({
        id: item.id,
        name: item.department_name,
      }))
    } catch (problem: any) {
      errorMessage.value = problem?.data?.message || problem?.message || 'Unable to load positions.'
      console.error('Position API Error:', problem)
      throw problem
    } finally {
      loading.value = false
    }
  }

  const buildPayload = (form: PositionFormData): PositionPayload => {
    const name = form.name.trim()
    const description = form.description.trim()
    const selectedDepartment = departments.value.find(item => item.id === form.departmentId)

    if (!selectedDepartment) throw new Error('Please select a valid department.')
    if (!name) throw new Error('Position title is required.')
    if (!description) throw new Error('Position description is required.')
    if (!statusOptions.includes(form.status)) throw new Error('Invalid position status.')

    return {
      department_id: selectedDepartment.id,
      position: name,
      description,
      status: form.status === 'Active',
    }
  }

  const savePosition = async (form: PositionFormData, id?: number) => {
    if (saving.value) throw new Error('A position is already being saved.')
    saving.value = true

    try {
      const payload = buildPayload(form)
      const response = id == null ? await api.createPosition(payload) : await api.updatePosition(id, payload)
      await loadPositions()
      currentPage.value = 1
      return response
    } finally {
      saving.value = false
    }
  }

  const removePosition = async (id: number) => {
    if (saving.value) throw new Error('Another operation is in progress.')
    saving.value = true

    try {
      const response = await api.deletePosition(id)
      await loadPositions()
      return response
    } finally {
      saving.value = false
    }
  }

  const filteredPositions = computed(() => {
    const keyword = search.value.trim().toLowerCase()

    return positions.value.filter(item => {
      const matchesSearch = !keyword || [item.name, item.description, item.department].some(value => value.toLowerCase().includes(keyword))
      const matchesDepartment = !department.value || item.department === department.value
      const matchesStatus = !status.value || item.status === status.value
      return matchesSearch && matchesDepartment && matchesStatus
    })
  })

  const stats = computed(() => {
    const data = filteredPositions.value

    return {
      totalPositions: data.length,
      activePositions: data.filter(item => item.status === 'Active').length,
      inactivePositions: data.filter(item => item.status === 'Inactive').length,
      departmentsUsed: new Set(data.map(item => item.departmentId).filter(id => id != null)).size,
    }
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(filteredPositions.value.length / perPage)))
  const paginatedPositions = computed(() => filteredPositions.value.slice((currentPage.value - 1) * perPage, currentPage.value * perPage))
  const showingFrom = computed(() => filteredPositions.value.length ? (currentPage.value - 1) * perPage + 1 : 0)
  const showingTo = computed(() => Math.min(currentPage.value * perPage, filteredPositions.value.length))

  const resetFilters = () => {
    search.value = ''
    department.value = ''
    status.value = ''
    currentPage.value = 1
  }

  watch([search, department, status], () => { currentPage.value = 1 })
  watch(totalPages, pages => { if (currentPage.value > pages) currentPage.value = pages })

  return {
    positions, departments, loading, saving, errorMessage,
    search, department, status, currentPage,
    filteredPositions, paginatedPositions, totalPages, showingFrom, showingTo,
    stats, departmentOptions, statusOptions,
    loadPositions, savePosition, removePosition, resetFilters,
  }
}