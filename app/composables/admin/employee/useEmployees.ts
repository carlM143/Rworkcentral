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


interface EmployeeMasterOption {
  id: number
  name: string
}

interface EmployeeFilterOptionsData {
  departments: EmployeeMasterOption[]
  positions: EmployeeMasterOption[]
  employment_types: EmployeeMasterOption[]
}

interface EmployeeFilterOptionsResponse {
  success: boolean
  message?: string
  data: EmployeeFilterOptionsData
}

export const useEmployees = (
  initialStatus: 'Active' | 'Inactive' = 'Active',
  _loadFromApi = true,
) => {
  const { $api } = useNuxtApp()

  // EMPLOYEE DATA
  const employees = ref<Employee[]>([])
  const loading = ref(false)
  const loadError = ref('')

  // FILTER OPTIONS FROM DATABASE
  const filterOptions = ref<EmployeeFilterOptionsData>({
    departments: [],
    positions: [],
    employment_types: [],
  })

  const filterOptionsLoading = ref(false)
  const filterOptionsError = ref('')

  // FILTER VALUES
  const search = ref('')
  const department = ref('')
  const position = ref('')
  const employmentType = ref('')
  const status = ref<string>(initialStatus)

  // PAGINATION
  const currentPage = ref(1)
  const perPage = ref(6)

  // PREVENT STALE RESPONSES
  let latestRequestId = 0

  // FETCH MASTER FILTER OPTIONS
  const loadFilterOptions = async (): Promise<void> => {
    filterOptionsLoading.value = true
    filterOptionsError.value = ''

    try {
      const response = await $api<EmployeeFilterOptionsResponse>(
        '/admin/employees/filter-options',
        { method: 'GET' },
      )

      if (
        response.success === false ||
        !response.data ||
        !Array.isArray(response.data.departments) ||
        !Array.isArray(response.data.positions) ||
        !Array.isArray(response.data.employment_types)
      ) {
        throw new Error(
          response.message || 'Invalid employee filter options response.',
        )
      }

      filterOptions.value = response.data
    } catch (error: unknown) {
      const problem = error as {
        data?: { message?: string }
        message?: string
      }

      filterOptionsError.value =
        problem.data?.message ||
        problem.message ||
        'Unable to load employee filter options.'

      console.error('Employee Filter Options Error:', error)
    } finally {
      filterOptionsLoading.value = false
    }
  }

  // DROPDOWN OPTIONS FROM MASTER TABLES
  const departments = computed<string[]>(() =>
    filterOptions.value.departments.map(item => item.name),
  )

  const positions = computed<string[]>(() =>
    filterOptions.value.positions.map(item => item.name),
  )

  const employmentTypes = computed<string[]>(() =>
    filterOptions.value.employment_types.map(item => item.name),
  )

  // RESOLVE SELECTED LABEL TO DATABASE ID
  const getOptionId = (
    options: EmployeeMasterOption[],
    selectedName: string,
  ): number | undefined => {
    if (!selectedName) return undefined

    return options.find(
      item => item.name === selectedName,
    )?.id
  }

  // FETCH EMPLOYEES USING DATABASE FILTER IDS
  const loadEmployees = async (): Promise<void> => {
    const requestId = ++latestRequestId

    loading.value = true
    loadError.value = ''

    try {
      const query: Record<string, string | number> = {}

      // STATUS
      if (status.value === 'Active') {
        query.status = 1
      } else if (status.value === 'Inactive') {
        query.status = 0
      }

      // DEPARTMENT
      const departmentId = getOptionId(
        filterOptions.value.departments,
        department.value,
      )

      if (departmentId !== undefined) {
        query.department_id = departmentId
      }

      // POSITION
      const positionId = getOptionId(
        filterOptions.value.positions,
        position.value,
      )

      if (positionId !== undefined) {
        query.position_id = positionId
      }

      // EMPLOYMENT TYPE
      const employmentTypeId = getOptionId(
        filterOptions.value.employment_types,
        employmentType.value,
      )

      if (employmentTypeId !== undefined) {
        query.employment_type_id = employmentTypeId
      }

      const response = await $api<EmployeeIndexResponse>(
        '/admin/employees',
        {
          method: 'GET',
          query,
        },
      )

      if (requestId !== latestRequestId) return

      if (
        response.success === false ||
        !Array.isArray(response.data)
      ) {
        throw new Error(
          response.message || 'Invalid employees API response.',
        )
      }

      employees.value = response.data.map(mapEmployeeRecord)
    } catch (error: unknown) {
      if (requestId !== latestRequestId) return

      employees.value = []

      const problem = error as {
        data?: { message?: string }
        response?: { _data?: { message?: string } }
        message?: string
      }

      loadError.value =
        problem.data?.message ||
        problem.response?._data?.message ||
        problem.message ||
        'Unable to load employees.'

      console.error('Employee Index API Error:', error)
    } finally {
      if (requestId === latestRequestId) {
        loading.value = false
      }
    }
  }

  // LOAD MASTER OPTIONS AND INITIAL EMPLOYEES
  onMounted(async () => {
    await loadFilterOptions()
    await loadEmployees()
  })

  // AUTOMATIC API FILTERING
  watch(
    [department, position, employmentType, status],
    () => {
      currentPage.value = 1
      void loadEmployees()
    },
  )

  // LOCAL TEXT SEARCH ON RETURNED EMPLOYEES
  const filteredEmployees = computed(() => {
    const keyword = search.value.trim().toLowerCase()

    return employees.value.filter(employee => {
      const fullName = [
        employee.firstName,
        employee.middleName,
        employee.lastName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch =
        !keyword ||
        fullName.includes(keyword) ||
        employee.employeeNumber.toLowerCase().includes(keyword) ||
        employee.email.toLowerCase().includes(keyword)

      const matchesStatus =
        !status.value ||
        employee.status === status.value

      return matchesSearch && matchesStatus
    })
  })

  // PAGINATION
  const totalPages = computed(() =>
    Math.max(
      1,
      Math.ceil(filteredEmployees.value.length / perPage.value),
    ),
  )

  const paginatedEmployees = computed(() => {
    const start = (currentPage.value - 1) * perPage.value

    return filteredEmployees.value.slice(
      start,
      start + perPage.value,
    )
  })

  // STATISTICS
  const scopedEmployees = computed(() =>
    employees.value.filter(employee =>
      !status.value || employee.status === status.value,
    ),
  )

  const stats = computed(() => ({
    total: scopedEmployees.value.length,

    regular: scopedEmployees.value.filter(
      employee => employee.employmentType === 'Regular',
    ).length,

    probationary: scopedEmployees.value.filter(
      employee => employee.employmentType === 'Probationary',
    ).length,

    contractual: scopedEmployees.value.filter(
      employee => employee.employmentType === 'Contractual',
    ).length,
  }))

  // RECORD COUNTS
  const showingFrom = computed(() =>
    filteredEmployees.value.length
      ? (currentPage.value - 1) * perPage.value + 1
      : 0,
  )

  const showingTo = computed(() =>
    Math.min(
      currentPage.value * perPage.value,
      filteredEmployees.value.length,
    ),
  )

  // RESET FILTERS
  const resetFilters = () => {
    search.value = ''
    department.value = ''
    position.value = ''
    employmentType.value = ''
    status.value = initialStatus
    currentPage.value = 1
  }

  // RESET PAGINATION ON SEARCH
  watch(search, () => {
    currentPage.value = 1
  })

  watch(totalPages, total => {
    if (currentPage.value > total) {
      currentPage.value = total
    }
  })

  // EXISTING LEGACY HELPER
  const getEmployeeById = (id: number | string) =>
    employees.value.find(
      employee => employee.id === Number(id),
    )

  return {
    employees,
    loading,
    loadError,
    loadEmployees,

    filterOptionsLoading,
    filterOptionsError,
    loadFilterOptions,

    search,
    department,
    position,
    employmentType,
    status,

    currentPage,
    perPage,

    filteredEmployees,
    paginatedEmployees,
    totalPages,

    stats,
    departments,
    positions,
    employmentTypes,

    showingFrom,
    showingTo,

    resetFilters,
    getEmployeeById,
  }
}


