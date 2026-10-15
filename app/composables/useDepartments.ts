import type {
  Department,
} from '~/types/department'

export const useDepartments = () => {
  const {
    employees,
  } = useEmployees()

  const departments = ref<Department[]>([
    {
      id: 1,
      code: 'OPS',
      name: 'Operations',
      description:
        'Handles daily operations, dispatching, drivers and field activities.',
      head: 'Leo Martinez',
      status: 'Active',
    },
    {
      id: 2,
      code: 'HR',
      name: 'Human Resources',
      description:
        'Manages employee records, recruitment, employee relations and HR administration.',
      head: 'Claire Villanueva',
      status: 'Active',
    },
    {
      id: 3,
      code: 'FIN',
      name: 'Finance',
      description:
        'Handles accounting, payroll processing and financial records.',
      status: 'Active',
    },
    {
      id: 4,
      code: 'BILL',
      name: 'Billing',
      description:
        'Manages billing preparation, client charges and billing records.',
      status: 'Active',
    },
  ])

  const search = ref('')
  const status = ref('')

  const currentPage = ref(1)
  const perPage = ref(6)

  /* ==============================
     HELPERS
  ============================== */

  const getActiveEmployees = (
    departmentName: string,
  ) => {
    return employees.value.filter(
      employee =>
        employee.status === 'Active' &&
        employee.department ===
          departmentName,
    )
  }

  const getEmployeeCount = (
    departmentName: string,
  ) => {
    return getActiveEmployees(
      departmentName,
    ).length
  }

  const getPositionCount = (
    departmentName: string,
  ) => {
    return new Set(
      getActiveEmployees(
        departmentName,
      ).map(
        employee => employee.position,
      ),
    ).size
  }

  /* ==============================
     FILTERING
  ============================== */

  const filteredDepartments =
    computed(() => {
      const keyword =
        search.value
          .toLowerCase()
          .trim()

      return departments.value.filter(
        department => {
          const matchesSearch =
            !keyword ||
            department.name
              .toLowerCase()
              .includes(keyword) ||
            department.code
              .toLowerCase()
              .includes(keyword) ||
            department.head
              ?.toLowerCase()
              .includes(keyword)

          const matchesStatus =
            !status.value ||
            department.status ===
              status.value

          return (
            matchesSearch &&
            matchesStatus
          )
        },
      )
    })

  /* ==============================
     PAGINATION
  ============================== */

  const totalPages = computed(() => {
    return Math.max(
      1,
      Math.ceil(
        filteredDepartments.value.length /
          perPage.value,
      ),
    )
  })

  const paginatedDepartments =
    computed(() => {
      const start =
        (currentPage.value - 1) *
        perPage.value

      return filteredDepartments.value.slice(
        start,
        start + perPage.value,
      )
    })

  const showingFrom = computed(() => {
    if (
      !filteredDepartments.value.length
    ) {
      return 0
    }

    return (
      (currentPage.value - 1) *
        perPage.value +
      1
    )
  })

  const showingTo = computed(() => {
    return Math.min(
      currentPage.value * perPage.value,
      filteredDepartments.value.length,
    )
  })

  /* ==============================
     STATS
  ============================== */

  const stats = computed(() => {
    const activeDepartments =
      departments.value.filter(
        department =>
          department.status === 'Active',
      )

    const assignedEmployees =
      employees.value.filter(
        employee =>
          employee.status === 'Active' &&
          departments.value.some(
            department =>
              department.name ===
              employee.department,
          ),
      )

    const vacantHeads =
      activeDepartments.filter(
        department =>
          !department.head?.trim(),
      )

    return {
      total: departments.value.length,
      active: activeDepartments.length,
      employees:
        assignedEmployees.length,
      vacantHeads:
        vacantHeads.length,
    }
  })

  const statusOptions = [
    'Active',
    'Inactive',
  ]

  const resetFilters = () => {
    search.value = ''
    status.value = ''
    currentPage.value = 1
  }

  const getDepartmentById = (
    id: number | string,
  ) => {
    return departments.value.find(
      department =>
        department.id === Number(id),
    )
  }

  watch(
    [
      search,
      status,
    ],
    () => {
      currentPage.value = 1
    },
  )

  watch(totalPages, () => {
    if (
      currentPage.value >
      totalPages.value
    ) {
      currentPage.value =
        totalPages.value
    }
  })

  return {
    departments,

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

    resetFilters,
  }
}