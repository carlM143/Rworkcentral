import type {
  EmployeeTransfer,
  EmployeeTransferStatus,
  EmployeeTransferType,
} from '~/types/employeeTransfer'

export const useEmployeeTransfers = () => {
  const transfers =
    useState<EmployeeTransfer[]>(
      'employee-transfers',
      () => [
        {
          id: 1,

          transferNumber:
            'TRF-2026-001',

          employeeId: 4,
          employeeNumber:
            'EMP-004',

          employeeName:
            'Ana Garcia',

          transferType:
            'Department & Position',

          fromDepartment:
            'Human Resources',

          fromPosition:
            'HR Staff',

          toDepartment:
            'Operations',

          toPosition:
            'Operations Staff',

          reason:
            'Operational manpower requirement and internal reassignment.',

          requestedDate:
            '2026-09-20',

          effectiveDate:
            '2026-10-01',

          status:
            'Completed',

          requestedBy:
            'Maria Santos',

          reviewedBy:
            'General Manager',

          reviewedAt:
            '2026-09-22T10:30:00',

          completedAt:
            '2026-10-01T08:00:00',

          remarks:
            'Employee successfully transferred.',
        },

        {
          id: 2,

          transferNumber:
            'TRF-2026-002',

          employeeId: 7,
          employeeNumber:
            'EMP-007',

          employeeName:
            'Mark Lopez',

          transferType:
            'Position Change',

          fromDepartment:
            'IT',

          fromPosition:
            'IT Support',

          toDepartment:
            'IT',

          toPosition:
            'Senior IT Support',

          reason:
            'Role expansion based on performance and technical responsibilities.',

          requestedDate:
            '2026-09-25',

          effectiveDate:
            '2026-10-15',

          status:
            'Approved',

          requestedBy:
            'IT Manager',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-09-27T13:20:00',
        },

        {
          id: 3,

          transferNumber:
            'TRF-2026-003',

          employeeId: 3,
          employeeNumber:
            'EMP-003',

          employeeName:
            'Pedro Reyes',

          transferType:
            'Department Transfer',

          fromDepartment:
            'Finance',

          fromPosition:
            'Finance Staff',

          toDepartment:
            'Billing',

          toPosition:
            'Finance Staff',

          reason:
            'Temporary organizational realignment.',

          requestedDate:
            '2026-10-01',

          effectiveDate:
            '2026-10-16',

          status:
            'For Review',

          requestedBy:
            'Finance Manager',
        },

        {
          id: 4,

          transferNumber:
            'TRF-2026-004',

          employeeId: 8,
          employeeNumber:
            'EMP-008',

          employeeName:
            'Jenny Ramos',

          transferType:
            'Position Change',

          fromDepartment:
            'Human Resources',

          fromPosition:
            'HR Staff',

          toDepartment:
            'Human Resources',

          toPosition:
            'HR Specialist',

          reason:
            'Employee development and expanded recruitment responsibilities.',

          requestedDate:
            '2026-10-03',

          effectiveDate:
            '2026-11-01',

          status:
            'Pending',

          requestedBy:
            'Maria Santos',
        },

        {
          id: 5,

          transferNumber:
            'TRF-2026-005',

          employeeId: 6,
          employeeNumber:
            'EMP-006',

          employeeName:
            'Angela Flores',

          transferType:
            'Department & Position',

          fromDepartment:
            'Billing',

          fromPosition:
            'Billing Staff',

          toDepartment:
            'Finance',

          toPosition:
            'Finance Staff',

          reason:
            'Finance team staffing requirement.',

          requestedDate:
            '2026-08-20',

          effectiveDate:
            '2026-09-01',

          status:
            'Rejected',

          requestedBy:
            'Billing Supervisor',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-08-22T11:00:00',

          remarks:
            'Current billing staffing level does not allow reassignment.',
        },

        {
          id: 6,

          transferNumber:
            'TRF-2026-006',

          employeeId: 9,
          employeeNumber:
            'EMP-009',

          employeeName:
            'Robert Castillo',

          transferType:
            'Position Change',

          fromDepartment:
            'Finance',

          fromPosition:
            'Finance Staff',

          toDepartment:
            'Finance',

          toPosition:
            'Finance Officer',

          reason:
            'Promotion and additional finance responsibilities.',

          requestedDate:
            '2026-07-10',

          effectiveDate:
            '2026-08-01',

          status:
            'Completed',

          requestedBy:
            'Finance Manager',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-07-13T14:00:00',

          completedAt:
            '2026-08-01T08:00:00',
        },

        {
          id: 7,

          transferNumber:
            'TRF-2026-007',

          employeeId: 12,
          employeeNumber:
            'EMP-012',

          employeeName:
            'Claire Villanueva',

          transferType:
            'Position Change',

          fromDepartment:
            'Operations',

          fromPosition:
            'Operations Staff',

          toDepartment:
            'Operations',

          toPosition:
            'Operations Coordinator',

          reason:
            'Internal promotion based on supervisory responsibilities.',

          requestedDate:
            '2026-08-05',

          effectiveDate:
            '2026-09-01',

          status:
            'Completed',

          requestedBy:
            'Operations Manager',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-08-08T09:30:00',

          completedAt:
            '2026-09-01T08:00:00',
        },

        {
          id: 8,

          transferNumber:
            'TRF-2026-008',

          employeeId: 10,
          employeeNumber:
            'EMP-010',

          employeeName:
            'Grace Navarro',

          transferType:
            'Department Transfer',

          fromDepartment:
            'Human Resources',

          fromPosition:
            'HR Staff',

          toDepartment:
            'Operations',

          toPosition:
            'HR Staff',

          reason:
            'Request cancelled after operational review.',

          requestedDate:
            '2026-09-01',

          effectiveDate:
            '2026-09-20',

          status:
            'Cancelled',

          requestedBy:
            'Maria Santos',

          remarks:
            'Transfer request withdrawn.',
        },

        {
          id: 9,

          transferNumber:
            'TRF-2026-009',

          employeeId: 5,
          employeeNumber:
            'EMP-005',

          employeeName:
            'Carlo Mendoza',

          transferType:
            'Position Change',

          fromDepartment:
            'IT',

          fromPosition:
            'Junior Developer',

          toDepartment:
            'IT',

          toPosition:
            'Software Developer',

          reason:
            'Regularization of role and expanded development responsibilities.',

          requestedDate:
            '2026-06-12',

          effectiveDate:
            '2026-07-01',

          status:
            'Completed',

          requestedBy:
            'IT Manager',

          reviewedBy:
            'Maria Santos',

          reviewedAt:
            '2026-06-15T10:00:00',

          completedAt:
            '2026-07-01T08:00:00',
        },

        {
          id: 10,

          transferNumber:
            'TRF-2026-010',

          employeeId: 11,
          employeeNumber:
            'EMP-011',

          employeeName:
            'Leo Martinez',

          transferType:
            'Department & Position',

          fromDepartment:
            'Operations',

          fromPosition:
            'Driver',

          toDepartment:
            'Operations',

          toPosition:
            'Lead Driver',

          reason:
            'Recommended for lead driver responsibilities.',

          requestedDate:
            '2026-10-05',

          effectiveDate:
            '2026-11-01',

          status:
            'Pending',

          requestedBy:
            'Operations Manager',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const fromDepartment =
    ref('')

  const toDepartment =
    ref('')

  const transferType =
    ref('')

  const status =
    ref('')

  const dateFrom =
    ref('')

  const dateTo =
    ref('')

  /* =========================================================
     PAGINATION
  ========================================================= */

  const currentPage =
    ref(1)

  const perPage =
    ref(6)

  /* =========================================================
     OPTIONS
  ========================================================= */

  const departmentOptions =
    computed(() => {
      return [
        ...new Set(
          transfers.value.flatMap(
            item => [
              item.fromDepartment,
              item.toDepartment,
            ],
          ),
        ),
      ].sort()
    })

  const transferTypeOptions:
    EmployeeTransferType[] = [
      'Department Transfer',
      'Position Change',
      'Department & Position',
    ]

  const statusOptions:
    EmployeeTransferStatus[] = [
      'Pending',
      'For Review',
      'Approved',
      'Completed',
      'Rejected',
      'Cancelled',
    ]

  /* =========================================================
     FILTERED
  ========================================================= */

  const filteredTransfers =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return transfers.value.filter(
        item => {
          const matchesSearch =
            !keyword ||
            item.transferNumber
              .toLowerCase()
              .includes(keyword) ||
            item.employeeNumber
              .toLowerCase()
              .includes(keyword) ||
            item.employeeName
              .toLowerCase()
              .includes(keyword) ||
            item.fromPosition
              .toLowerCase()
              .includes(keyword) ||
            item.toPosition
              .toLowerCase()
              .includes(keyword) ||
            item.reason
              .toLowerCase()
              .includes(keyword)

          const matchesFromDepartment =
            !fromDepartment.value ||
            item.fromDepartment ===
              fromDepartment.value

          const matchesToDepartment =
            !toDepartment.value ||
            item.toDepartment ===
              toDepartment.value

          const matchesType =
            !transferType.value ||
            item.transferType ===
              transferType.value

          const matchesStatus =
            !status.value ||
            item.status ===
              status.value

          const matchesDateFrom =
            !dateFrom.value ||
            item.effectiveDate >=
              dateFrom.value

          const matchesDateTo =
            !dateTo.value ||
            item.effectiveDate <=
              dateTo.value

          return (
            matchesSearch &&
            matchesFromDepartment &&
            matchesToDepartment &&
            matchesType &&
            matchesStatus &&
            matchesDateFrom &&
            matchesDateTo
          )
        },
      )
    })

  /* =========================================================
     STATS
  ========================================================= */

  const stats =
    computed(() => {
      const data =
        filteredTransfers.value

      return {
        totalTransfers:
          data.length,

        pendingReview:
          data.filter(
            item =>
              item.status ===
                'Pending' ||
              item.status ===
                'For Review',
          ).length,

        approved:
          data.filter(
            item =>
              item.status ===
              'Approved',
          ).length,

        completed:
          data.filter(
            item =>
              item.status ===
              'Completed',
          ).length,
      }
    })

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages =
    computed(() => {
      return Math.max(
        1,
        Math.ceil(
          filteredTransfers
            .value.length /
            perPage.value,
        ),
      )
    })

  const paginatedTransfers =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredTransfers
        .value
        .slice(
          start,
          start +
            perPage.value,
        )
    })

  const showingFrom =
    computed(() => {
      if (
        filteredTransfers
          .value.length === 0
      ) {
        return 0
      }

      return (
        (
          currentPage.value -
          1
        ) *
          perPage.value +
        1
      )
    })

  const showingTo =
    computed(() => {
      return Math.min(
        currentPage.value *
          perPage.value,

        filteredTransfers
          .value.length,
      )
    })

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value = ''

    fromDepartment.value = ''
    toDepartment.value = ''

    transferType.value = ''
    status.value = ''

    dateFrom.value = ''
    dateTo.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      fromDepartment,
      toDepartment,
      transferType,
      status,
      dateFrom,
      dateTo,
    ],
    () => {
      currentPage.value = 1
    },
  )

  watch(
    totalPages,
    value => {
      if (
        currentPage.value >
        value
      ) {
        currentPage.value =
          value
      }
    },
  )

  return {
    transfers,

    search,

    fromDepartment,
    toDepartment,

    transferType,
    status,

    dateFrom,
    dateTo,

    currentPage,

    filteredTransfers,
    paginatedTransfers,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    departmentOptions,
    transferTypeOptions,
    statusOptions,

    resetFilters,
  }
}