import type { Employee } from '~/types/employee'

interface WorkScheduleDayRecord {
  day_of_week: string
  is_working_day?: boolean | number | string | null
}

interface EmployeeIndexRecord {
  id: number
  emp_id: number | string
  firstname: string
  middlename?: string | null
  lastname: string
  birthday?: string | null
  gender?: string | null
  civil_status?: string | null
  profile_photo?: string | null
  status: boolean | number | string
  updated_at?: string | null
  department?: { department_name?: string | null } | null
  contact_information?: {
    email?: string | null
    mobile?: string | null
    residential_address?: string | null
  } | null
  employments?: Array<{
    id: number
    date_hired?: string | null
    employment_type?: {
      name?: string | null
      type_name?: string | null
      employment_type?: string | null
    } | null
    department?: { department_name?: string | null } | null
    position?: { position?: string | null } | null
    work_schedule?: {
      schedule_name?: string | null
      days?: WorkScheduleDayRecord[] | null
    } | null
  }> | null
}

interface EmployeeIndexResponse {
  success: boolean
  message?: string
  data: EmployeeIndexRecord[]
}

const dateOnly = (value?: string | null): string => value?.slice(0, 10) ?? ''

const isActiveValue = (value: EmployeeIndexRecord['status']): boolean =>
  value === true || value === 1 || value === '1' || value === 'true'

const weekdayKey = (value: string): string => {
  const normalized = value.trim().toLowerCase()
  if (normalized === 'saturday') return 'sat'
  if (normalized === 'sunday') return 'sun'
  return normalized
}

const getRestDays = (days?: WorkScheduleDayRecord[] | null): string | undefined => {
  if (!Array.isArray(days)) return undefined

  const working = new Set(
    days
      .filter(day => day.is_working_day !== false
        && day.is_working_day !== 0
        && day.is_working_day !== '0'
        && day.is_working_day !== 'false')
      .map(day => weekdayKey(day.day_of_week)),
  )

  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Sat', 'Sun']
    .filter(day => !working.has(weekdayKey(day)))
    .join(', ') || 'None'
}

const mapEmployeeRecord = (record: EmployeeIndexRecord): Employee => {
  const employment = [...(record.employments ?? [])].sort((a, b) => {
    const dateCompare = dateOnly(b.date_hired).localeCompare(dateOnly(a.date_hired))
    return dateCompare || b.id - a.id
  })[0]
  const isActive = isActiveValue(record.status)

  return {
    id: record.id,
    employeeNumber: String(record.emp_id),
    firstName: record.firstname,
    middleName: record.middlename ?? undefined,
    lastName: record.lastname,
    email: record.contact_information?.email || 'Not provided',
    phone: record.contact_information?.mobile ?? undefined,
    avatar: record.profile_photo ?? undefined,
    birthDate: dateOnly(record.birthday),
    gender: record.gender ?? undefined,
    civilStatus: record.civil_status ?? undefined,
    address: record.contact_information?.residential_address ?? undefined,
    department: employment?.department?.department_name
      ?? record.department?.department_name
      ?? 'Not assigned',
    position: employment?.position?.position ?? 'Not assigned',
    employmentType: (
      employment?.employment_type?.type_name
      ?? employment?.employment_type?.name
      ?? employment?.employment_type?.employment_type
      ?? 'Not assigned'
    ) as Employee['employmentType'],
    status: isActive ? 'Active' : 'Inactive',
    dateHired: dateOnly(employment?.date_hired),
    workSchedule: employment?.work_schedule?.schedule_name ?? undefined,
    restDay: getRestDays(employment?.work_schedule?.days),
    // Uses updated_at as requested; this is the LAST edit, not a permanent deactivation timestamp.
    inactiveDate: !isActive ? dateOnly(record.updated_at) || undefined : undefined,
  }
}

/**
 * Employee Directory: API ONLY. No hardcoded employees or demo fallback.
 * The second argument is retained for existing calls like useEmployees('Active', true).
 * It no longer enables mock data when false.
 * For a single employee profile use GET /admin/employees/:id directly.
 */
export const useEmployees = (
  statusFilter: 'Active' | 'Inactive' = 'Active',
  _loadFromApi = true,
) => {
  const { $api } = useNuxtApp()
  const employees = ref<Employee[]>([])
  const loading = ref(false)
  const loadError = ref('')

  const search = ref('')
  const department = ref('')
  const position = ref('')
  const employmentType = ref('')
  const currentPage = ref(1)
  const perPage = ref(6)

  const loadEmployees = async (): Promise<void> => {
    loading.value = true
    loadError.value = ''

    try {
      const response = await $api<EmployeeIndexResponse>('/admin/employees', {
        method: 'GET',
        query: { status: statusFilter === 'Active' ? 1 : 0 },
      })

      if (response.success === false || !Array.isArray(response.data)) {
        throw new Error(response.message || 'Invalid employees API response.')
      }

      employees.value = response.data.map(mapEmployeeRecord)
    } catch (problem: unknown) {
      employees.value = []
      const error = problem as {
        data?: { message?: string }
        response?: { _data?: { message?: string } }
        message?: string
      }
      loadError.value = error.data?.message
        ?? error.response?._data?.message
        ?? error.message
        ?? 'Unable to load employees from the backend.'
      console.error('Employee Index API Error:', problem)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => { void loadEmployees() })

  const filteredEmployees = computed(() => {
    const keyword = search.value.toLowerCase().trim()
    return employees.value.filter(employee => {
      const fullName = [employee.firstName, employee.middleName, employee.lastName]
        .filter(Boolean).join(' ').toLowerCase()

      return employee.status === statusFilter
        && (!keyword || fullName.includes(keyword)
          || employee.employeeNumber.toLowerCase().includes(keyword)
          || employee.email.toLowerCase().includes(keyword))
        && (!department.value || employee.department === department.value)
        && (!position.value || employee.position === position.value)
        && (!employmentType.value || employee.employmentType === employmentType.value)
    })
  })

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filteredEmployees.value.length / perPage.value)),
  )
  const paginatedEmployees = computed(() => {
    const start = (currentPage.value - 1) * perPage.value
    return filteredEmployees.value.slice(start, start + perPage.value)
  })

  const scopedEmployees = computed(() =>
    employees.value.filter(employee => employee.status === statusFilter),
  )
  const stats = computed(() => ({
    total: scopedEmployees.value.length,
    regular: scopedEmployees.value.filter(e => e.employmentType === 'Regular').length,
    probationary: scopedEmployees.value.filter(e => e.employmentType === 'Probationary').length,
    contractual: scopedEmployees.value.filter(e => e.employmentType === 'Contractual').length,
  }))

  const departments = computed(() =>
    [...new Set(scopedEmployees.value.map(e => e.department))].sort(),
  )
  const positions = computed(() =>
    [...new Set(scopedEmployees.value.map(e => e.position))].sort(),
  )
  const showingFrom = computed(() =>
    filteredEmployees.value.length ? (currentPage.value - 1) * perPage.value + 1 : 0,
  )
  const showingTo = computed(() =>
    Math.min(currentPage.value * perPage.value, filteredEmployees.value.length),
  )

  const resetFilters = () => {
    search.value = ''
    department.value = ''
    position.value = ''
    employmentType.value = ''
    currentPage.value = 1
  }

  watch([search, department, position, employmentType], () => {
    currentPage.value = 1
  })
  watch(totalPages, total => {
    if (currentPage.value > total) currentPage.value = total
  })

  // Legacy helper retained for callers using the currently loaded list only.
  // Profile pages must use GET /admin/employees/:id, not this list lookup.
  const getEmployeeById = (id: number | string) =>
    employees.value.find(employee => employee.id === Number(id))

  return {
    employees,
    loading,
    loadError,
    loadEmployees,
    search,
    department,
    position,
    employmentType,
    currentPage,
    perPage,
    filteredEmployees,
    paginatedEmployees,
    totalPages,
    stats,
    departments,
    positions,
    showingFrom,
    showingTo,
    resetFilters,
    getEmployeeById,
  }
}
