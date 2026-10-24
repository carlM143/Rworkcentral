import type { Employee } from '~/types/employee'

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
  department?: {
    department_name?: string | null
  } | null
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
    } | null
    department?: {
      department_name?: string | null
    } | null
    position?: {
      position?: string | null
    } | null
    work_schedule?: {
      schedule_name?: string | null
    } | null
    restday?: {
      rest_day?: string | null
    } | null
  }>
}

interface EmployeeIndexResponse {
  success: boolean
  message: string
  data: EmployeeIndexRecord[]
}

const dateOnly = (value?: string | null) => value?.slice(0, 10) ?? ''

const mapEmployeeRecord = (record: EmployeeIndexRecord): Employee => {
  const employments = [...(record.employments ?? [])]
    .sort((first, second) => first.id - second.id)
  const employment = employments[employments.length - 1]
  const isActive = record.status === true
    || record.status === 1
    || record.status === '1'
    || record.status === 'true'

  return {
    id: record.id,
    employeeNumber: String(record.emp_id),
    firstName: record.firstname,
    middleName: record.middlename ?? undefined,
    lastName: record.lastname,
    email: record.contact_information?.email ?? 'Not provided',
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
    employmentType: (employment?.employment_type?.name ?? 'Not assigned') as Employee['employmentType'],
    status: isActive ? 'Active' : 'Inactive',
    dateHired: dateOnly(employment?.date_hired),
    workSchedule: employment?.work_schedule?.schedule_name ?? undefined,
    restDay: employment?.restday?.rest_day ?? undefined,
  }
}

export const useEmployees = (
  statusFilter: 'Active' | 'Inactive' = 'Active',
  loadFromApi = false,
) => {
  const { $api } = useNuxtApp()
  const loading = ref(loadFromApi)
  const loadError = ref('')

  const employees = ref<Employee[]>(loadFromApi ? [] : [
    {
  id: 1,
  employeeNumber: 'EMP-001',
  firstName: 'Juan',
  lastName: 'Dela Cruz',
  email: 'juan.delacruz@example.com',
  phone: '09171234567',

  // EMPLOYMENT
  department: 'Operations',
  position: 'Driver',

  employmentType: 'Regular',
  status: 'Active',

  dateHired: '2023-01-15',

  supervisor: 'Leo Martinez',
  branch: 'Main Branch',
  workSchedule: '8:00 AM - 5:00 PM',
  restDay: 'Sunday',

  // PAYROLL
  salaryType: 'Monthly',
  basicSalary: 20000,
  allowance: 1000,
  payrollGroup: 'Regular Employees',

  // BANK / PAYMENT
  bankName: 'BPI',
  accountName: 'Juan Dela Cruz',
  accountNumber: '9284928285',

  // GOVERNMENT
  sssNumber: '34-1234567-8',
  philHealthNumber: '12-345678901-2',
  pagIbigNumber: '1234-5678-9012',
  tinNumber: '123-456-789-000',

  // DOCUMENTS
  documents: [
    {
      id: 1,
      type: 'Government ID',
      name: 'juan-valid-id.pdf',
      status: 'Verified',
      uploadedAt: '2026-01-10',
    },
    {
      id: 2,
      type: 'Employment Contract',
      name: 'juan-employment-contract.pdf',
      status: 'Verified',
      uploadedAt: '2023-01-15',
    },
    {
      id: 3,
      type: 'Medical Certificate',
      name: 'juan-medical-certificate.pdf',
      status: 'Expiring Soon',
      uploadedAt: '2025-10-10',
      expiresAt: '2026-10-10',
    },
  ],
},
    {
      id: 2,
      employeeNumber: 'EMP-002',
      firstName: 'Maria',
      lastName: 'Santos',
      email: 'maria.santos@example.com',
      phone: '09181234567',
      department: 'Human Resources',
      position: 'HR Officer',
      employmentType: 'Regular',
      status: 'Active',
      dateHired: '2022-08-10',
    },
    {
      id: 3,
      employeeNumber: 'EMP-003',
      firstName: 'Pedro',
      lastName: 'Reyes',
      email: 'pedro.reyes@example.com',
      phone: '09191234567',
      department: 'Finance',
      position: 'Accountant',
      employmentType: 'Probationary',
      status: 'Active',
      dateHired: '2026-05-02',
    },
    {
      id: 4,
      employeeNumber: 'EMP-004',
      firstName: 'Ana',
      lastName: 'Garcia',
      email: 'ana.garcia@example.com',
      phone: '09201234567',
      department: 'Operations',
      position: 'Dispatcher',
      employmentType: 'Contractual',
      status: 'Active',
      dateHired: '2026-02-12',
    },
    {
      id: 5,
      employeeNumber: 'EMP-005',
      firstName: 'Carlo',
      lastName: 'Mendoza',
      email: 'carlo.mendoza@example.com',
      phone: '09211234567',
      department: 'Operations',
      position: 'Driver',
      employmentType: 'Regular',
      status: 'Active',
      dateHired: '2021-11-20',
    },
    {
      id: 6,
      employeeNumber: 'EMP-006',
      firstName: 'Angela',
      lastName: 'Flores',
      email: 'angela.flores@example.com',
      phone: '09221234567',
      department: 'Billing',
      position: 'Billing Officer',
      employmentType: 'Regular',
      status: 'Active',
      dateHired: '2023-06-08',
    },
    {
      id: 7,
      employeeNumber: 'EMP-007',
      firstName: 'Mark',
      lastName: 'Lopez',
      email: 'mark.lopez@example.com',
      phone: '09231234567',
      department: 'Operations',
      position: 'Driver',
      employmentType: 'Probationary',
      status: 'Active',
      dateHired: '2026-06-18',
    },
    {
      id: 8,
      employeeNumber: 'EMP-008',
      firstName: 'Jenny',
      lastName: 'Ramos',
      email: 'jenny.ramos@example.com',
      phone: '09241234567',
      department: 'Human Resources',
      position: 'HR Assistant',
      employmentType: 'Contractual',
      status: 'Active',
      dateHired: '2025-10-06',
    },
    {
      id: 9,
      employeeNumber: 'EMP-009',
      firstName: 'Robert',
      lastName: 'Castillo',
      email: 'robert.castillo@example.com',
      phone: '09251234567',
      department: 'Finance',
      position: 'Payroll Officer',
      employmentType: 'Regular',
      status: 'Active',
      dateHired: '2022-03-14',
    },
    {
      id: 10,
      employeeNumber: 'EMP-010',
      firstName: 'Grace',
      lastName: 'Navarro',
      email: 'grace.navarro@example.com',
      phone: '09261234567',
      department: 'Billing',
      position: 'Billing Assistant',
      employmentType: 'Probationary',
      status: 'Active',
      dateHired: '2026-07-01',
    },
    {
      id: 11,
      employeeNumber: 'EMP-011',
      firstName: 'Leo',
      lastName: 'Martinez',
      email: 'leo.martinez@example.com',
      phone: '09271234567',
      department: 'Operations',
      position: 'Supervisor',
      employmentType: 'Regular',
      status: 'Active',
      dateHired: '2020-09-11',
    },
    {
      id: 12,
      employeeNumber: 'EMP-012',
      firstName: 'Claire',
      lastName: 'Villanueva',
      email: 'claire.villanueva@example.com',
      phone: '09281234567',
      department: 'Human Resources',
      position: 'HR Manager',
      employmentType: 'Regular',
      status: 'Active',
      dateHired: '2019-04-22',
    },

    {
    id: 13,
    employeeNumber: 'EMP-013',
    firstName: 'Daniel',
    lastName: 'Aquino',
    email: 'daniel.aquino@example.com',
    phone: '09291234567',

    department: 'Operations',
    position: 'Driver',

    employmentType: 'Regular',
    status: 'Inactive',

    dateHired: '2021-02-15',

    supervisor: 'Leo Martinez',
    branch: 'Main Branch',
    workSchedule: '8:00 AM - 5:00 PM',
    restDay: 'Sunday',

    inactiveDate: '2026-08-15',
    inactiveReason: 'Resigned',
  },
  {
    id: 14,
    employeeNumber: 'EMP-014',
    firstName: 'Sofia',
    lastName: 'Torres',
    email: 'sofia.torres@example.com',
    phone: '09301234567',

    department: 'Billing',
    position: 'Billing Assistant',

    employmentType: 'Contractual',
    status: 'Inactive',

    dateHired: '2025-01-06',

    branch: 'Main Branch',
    workSchedule: '8:00 AM - 5:00 PM',
    restDay: 'Sunday',

    inactiveDate: '2026-07-31',
    inactiveReason: 'End of Contract',
  },
  {
    id: 15,
    employeeNumber: 'EMP-015',
    firstName: 'Marco',
    lastName: 'Fernandez',
    email: 'marco.fernandez@example.com',
    phone: '09311234567',

    department: 'Operations',
    position: 'Dispatcher',

    employmentType: 'Probationary',
    status: 'Inactive',

    dateHired: '2026-01-12',

    branch: 'Main Branch',

    inactiveDate: '2026-06-30',
    inactiveReason: 'Employment Ended',
   },
  ])

  const loadEmployees = async () => {
    if (!loadFromApi) return

    loading.value = true
    loadError.value = ''

    try {
      const response = await $api<EmployeeIndexResponse>('/admin/employees', {
        method: 'GET',
        query: {
          status: statusFilter === 'Active' ? 1 : 0,
        },
      })

      employees.value = response.data.map(mapEmployeeRecord)
    } catch (problem: any) {
      employees.value = []
      loadError.value = problem?.data?.message
        ?? problem?.response?._data?.message
        ?? problem?.message
        ?? 'Unable to load employees from the backend.'

      console.error('Employee Index API Error:', problem)
    } finally {
      loading.value = false
    }
  }

  if (loadFromApi) {
    onMounted(() => {
      void loadEmployees()
    })
  }

  const search = ref('')
  const department = ref('')
  const position = ref('')
  const employmentType = ref('')

  const currentPage = ref(1)
  const perPage = ref(6)

  const filteredEmployees = computed(() => {
  const keyword =
    search.value
      .toLowerCase()
      .trim()

  return employees.value.filter(
    (employee) => {
      const fullName =
        `${employee.firstName} ${employee.middleName ?? ''} ${employee.lastName}`
          .replace(/\s+/g, ' ')
          .toLowerCase()

      const matchesStatus =
        employee.status === statusFilter

      const matchesSearch =
        !keyword ||
        fullName.includes(keyword) ||
        employee.employeeNumber
          .toLowerCase()
          .includes(keyword) ||
        employee.email
          .toLowerCase()
          .includes(keyword)

      const matchesDepartment =
        !department.value ||
        employee.department ===
          department.value

      const matchesPosition =
        !position.value ||
        employee.position ===
          position.value

      const matchesType =
        !employmentType.value ||
        employee.employmentType ===
          employmentType.value

      return (
        matchesStatus &&
        matchesSearch &&
        matchesDepartment &&
        matchesPosition &&
        matchesType
      )
    },
  )
})

  const totalPages = computed(() => {
    return Math.max(
      1,
      Math.ceil(
        filteredEmployees.value.length / perPage.value,
      ),
    )
  })

  const paginatedEmployees = computed(() => {
    const start =
      (currentPage.value - 1) * perPage.value

    return filteredEmployees.value.slice(
      start,
      start + perPage.value,
    )
  })

 const stats = computed(() => {
  const scopedEmployees =
    employees.value.filter(
      employee =>
        employee.status === statusFilter,
    )

  return {
    total: scopedEmployees.length,

    regular:
      scopedEmployees.filter(
        employee =>
          employee.employmentType ===
          'Regular',
      ).length,

    probationary:
      scopedEmployees.filter(
        employee =>
          employee.employmentType ===
          'Probationary',
      ).length,

    contractual:
      scopedEmployees.filter(
        employee =>
          employee.employmentType ===
          'Contractual',
      ).length,
  }
})

 const departments = computed(() => {
  return [
    ...new Set(
      employees.value
        .filter(
          employee =>
            employee.status ===
            statusFilter,
        )
        .map(
          employee =>
            employee.department,
        ),
    ),
  ].sort()
})

 const positions = computed(() => {
  return [
    ...new Set(
      employees.value
        .filter(
          employee =>
            employee.status ===
            statusFilter,
        )
        .map(
          employee =>
            employee.position,
        ),
    ),
  ].sort()
})

  const showingFrom = computed(() => {
    if (!filteredEmployees.value.length) return 0

    return (
      (currentPage.value - 1) * perPage.value +
      1
    )
  })

  const showingTo = computed(() => {
    return Math.min(
      currentPage.value * perPage.value,
      filteredEmployees.value.length,
    )
  })

  const resetFilters = () => {
    search.value = ''
    department.value = ''
    position.value = ''
    employmentType.value = ''
    currentPage.value = 1
  }

  watch(
    [
      search,
      department,
      position,
      employmentType,
    ],
    () => {
      currentPage.value = 1
    },
  )

  watch(totalPages, () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  })

   const getEmployeeById = (
    id: number | string,
  ) => {
    return employees.value.find(
      employee =>
        employee.id === Number(id),
    )
  }

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
