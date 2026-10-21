import type {
  LifecycleTransfer,
  LifecycleTransferStatus,
  LifecycleTransferType,
} from '~/types/lifecycleTransfer'

export const useLifecycleTransfers = () => {
  const records =
    useState<LifecycleTransfer[]>(
      'employee-lifecycle-transfers',
      () => [
        {
          id: 1,
          transferNumber: 'TRF-2026-001',

          employeeId: 4,
          employeeNumber: 'EMP-004',
          employeeName: 'Ana Garcia',

          transferType: 'Department Transfer',

          currentDepartment: 'Operations',
          currentPosition: 'Operations Staff',
          currentBranch: 'Main Branch',

          newDepartment: 'Billing',
          newPosition: 'Billing Coordinator',
          newBranch: 'Main Branch',

          requestedDate: '2026-10-01',
          effectiveDate: '2026-10-15',

          requestedBy: 'Maria Santos',
          approvedBy: 'General Manager',

          reason:
            'Employee reassignment based on operational requirements.',

          status: 'Scheduled',

          remarks:
            'Transfer will take effect after current assignment turnover.',

          createdAt: '2026-10-01T09:00:00',
          updatedAt: '2026-10-06T14:00:00',
        },

        {
          id: 2,
          transferNumber: 'TRF-2026-002',

          employeeId: 7,
          employeeNumber: 'EMP-007',
          employeeName: 'Mark Lopez',

          transferType: 'Position Transfer',

          currentDepartment: 'IT',
          currentPosition: 'IT Support',
          currentBranch: 'Main Branch',

          newDepartment: 'IT',
          newPosition: 'Senior IT Support',
          newBranch: 'Main Branch',

          requestedDate: '2026-10-02',
          effectiveDate: '2026-10-20',

          requestedBy: 'IT Manager',

          reason:
            'Role reassignment following increased responsibilities.',

          status: 'Pending Approval',

          remarks:
            'Waiting for HR and management approval.',

          createdAt: '2026-10-02T10:00:00',
          updatedAt: '2026-10-07T09:00:00',
        },

        {
          id: 3,
          transferNumber: 'TRF-2026-003',

          employeeId: 3,
          employeeNumber: 'EMP-003',
          employeeName: 'Pedro Reyes',

          transferType: 'Branch Transfer',

          currentDepartment: 'Finance',
          currentPosition: 'Finance Staff',
          currentBranch: 'Main Branch',

          newDepartment: 'Finance',
          newPosition: 'Finance Staff',
          newBranch: 'South Branch',

          requestedDate: '2026-09-25',
          effectiveDate: '2026-10-01',

          requestedBy: 'Finance Manager',
          approvedBy: 'Maria Santos',

          reason:
            'Temporary branch staffing requirement.',

          status: 'Effective',

          remarks:
            'Employee has already reported to South Branch.',

          createdAt: '2026-09-25T08:00:00',
          updatedAt: '2026-10-01T08:30:00',
        },

        {
          id: 4,
          transferNumber: 'TRF-2026-004',

          employeeId: 1,
          employeeNumber: 'EMP-001',
          employeeName: 'Juan Dela Cruz',

          transferType: 'Client Assignment Transfer',

          currentDepartment: 'Operations',
          currentPosition: 'Driver',
          currentBranch: 'Main Branch',

          newDepartment: 'Operations',
          newPosition: 'Driver',
          newBranch: 'Client Site - Makati',

          requestedDate: '2026-10-04',
          effectiveDate: '2026-10-12',

          requestedBy: 'Operations Manager',
          approvedBy: 'Maria Santos',

          reason:
            'Driver reassigned to new client deployment.',

          status: 'Approved',

          createdAt: '2026-10-04T11:00:00',
          updatedAt: '2026-10-07T13:30:00',
        },

        {
          id: 5,
          transferNumber: 'TRF-2026-005',

          employeeId: 6,
          employeeNumber: 'EMP-006',
          employeeName: 'Angela Flores',

          transferType: 'Department Transfer',

          currentDepartment: 'Billing',
          currentPosition: 'Billing Staff',
          currentBranch: 'Main Branch',

          newDepartment: 'Finance',
          newPosition: 'Finance Assistant',
          newBranch: 'Main Branch',

          requestedDate: '2026-10-05',
          effectiveDate: '2026-10-25',

          requestedBy: 'Billing Supervisor',

          reason:
            'Proposed internal transfer based on employee skills.',

          status: 'Draft',

          remarks:
            'Still for discussion with Finance department.',

          createdAt: '2026-10-05T09:45:00',
          updatedAt: '2026-10-05T09:45:00',
        },

        {
          id: 6,
          transferNumber: 'TRF-2026-006',

          employeeId: 8,
          employeeNumber: 'EMP-008',
          employeeName: 'Jenny Ramos',

          transferType: 'Position Transfer',

          currentDepartment: 'Human Resources',
          currentPosition: 'HR Staff',
          currentBranch: 'Main Branch',

          newDepartment: 'Human Resources',
          newPosition: 'HR Officer',
          newBranch: 'Main Branch',

          requestedDate: '2026-09-10',
          effectiveDate: '2026-09-16',

          requestedBy: 'Maria Santos',
          approvedBy: 'General Manager',

          reason:
            'Employee role advancement after performance review.',

          status: 'Effective',

          createdAt: '2026-09-10T08:00:00',
          updatedAt: '2026-09-16T08:00:00',
        },

        {
          id: 7,
          transferNumber: 'TRF-2026-007',

          employeeId: 11,
          employeeNumber: 'EMP-011',
          employeeName: 'Leo Martinez',

          transferType: 'Branch Transfer',

          currentDepartment: 'Operations',
          currentPosition: 'Driver',
          currentBranch: 'North Branch',

          newDepartment: 'Operations',
          newPosition: 'Driver',
          newBranch: 'Main Branch',

          requestedDate: '2026-10-03',
          effectiveDate: '2026-10-18',

          requestedBy: 'Operations Supervisor',

          reason:
            'Driver rotation between operating branches.',

          status: 'Pending Approval',

          createdAt: '2026-10-03T10:30:00',
          updatedAt: '2026-10-07T11:00:00',
        },

        {
          id: 8,
          transferNumber: 'TRF-2026-008',

          employeeId: 10,
          employeeNumber: 'EMP-010',
          employeeName: 'Grace Navarro',

          transferType: 'Internal Transfer',

          currentDepartment: 'Human Resources',
          currentPosition: 'HR Staff',
          currentBranch: 'Main Branch',

          newDepartment: 'Human Resources',
          newPosition: 'Recruitment Coordinator',
          newBranch: 'Main Branch',

          requestedDate: '2026-09-28',
          effectiveDate: '2026-10-05',

          requestedBy: 'Maria Santos',
          approvedBy: 'General Manager',

          reason:
            'Internal reassignment to recruitment operations.',

          status: 'Effective',

          createdAt: '2026-09-28T13:00:00',
          updatedAt: '2026-10-05T08:00:00',
        },

        {
          id: 9,
          transferNumber: 'TRF-2026-009',

          employeeId: 5,
          employeeNumber: 'EMP-005',
          employeeName: 'Carlo Mendoza',

          transferType: 'Branch Transfer',

          currentDepartment: 'IT',
          currentPosition: 'Software Developer',
          currentBranch: 'Main Branch',

          newDepartment: 'IT',
          newPosition: 'Software Developer',
          newBranch: 'South Branch',

          requestedDate: '2026-10-06',
          effectiveDate: '2026-11-01',

          requestedBy: 'IT Manager',

          reason:
            'Requested technical support assignment for South Branch.',

          status: 'Rejected',

          remarks:
            'Transfer rejected due to current project commitments.',

          createdAt: '2026-10-06T09:00:00',
          updatedAt: '2026-10-07T15:00:00',
        },

        {
          id: 10,
          transferNumber: 'TRF-2026-010',

          employeeId: 12,
          employeeNumber: 'EMP-012',
          employeeName: 'Claire Villanueva',

          transferType: 'Department Transfer',

          currentDepartment: 'Operations',
          currentPosition: 'Operations Coordinator',
          currentBranch: 'Main Branch',

          newDepartment: 'Human Resources',
          newPosition: 'Employee Relations Officer',
          newBranch: 'Main Branch',

          requestedDate: '2026-10-07',
          effectiveDate: '2026-11-03',

          requestedBy: 'Operations Manager',

          reason:
            'Proposed cross-functional transfer based on employee experience.',

          status: 'Pending Approval',

          createdAt: '2026-10-07T13:15:00',
          updatedAt: '2026-10-07T13:15:00',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const transferType =
    ref('')

  const destinationDepartment =
    ref('')

  const status =
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

  const transferTypeOptions:
    LifecycleTransferType[] = [
      'Department Transfer',
      'Position Transfer',
      'Branch Transfer',
      'Client Assignment Transfer',
      'Internal Transfer',
    ]

  const statusOptions:
    LifecycleTransferStatus[] = [
      'Draft',
      'Pending Approval',
      'Approved',
      'Scheduled',
      'Effective',
      'Rejected',
      'Cancelled',
    ]

  const destinationDepartmentOptions =
    computed(() => {
      return [
        ...new Set(
          records.value.map(
            item =>
              item.newDepartment,
          ),
        ),
      ].sort()
    })

  /* =========================================================
     FILTERED RECORDS
  ========================================================= */

  const filteredRecords =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return records.value.filter(
        item => {
          const matchesSearch =
            !keyword ||
            item.transferNumber
              .toLowerCase()
              .includes(keyword) ||
            item.employeeName
              .toLowerCase()
              .includes(keyword) ||
            item.employeeNumber
              .toLowerCase()
              .includes(keyword) ||
            item.currentPosition
              .toLowerCase()
              .includes(keyword) ||
            item.newPosition
              .toLowerCase()
              .includes(keyword)

          const matchesType =
            !transferType.value ||
            item.transferType ===
              transferType.value

          const matchesDepartment =
            !destinationDepartment.value ||
            item.newDepartment ===
              destinationDepartment.value

          const matchesStatus =
            !status.value ||
            item.status ===
              status.value

          return (
            matchesSearch &&
            matchesType &&
            matchesDepartment &&
            matchesStatus
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
        records.value

      return {
        total:
          data.length,

        pending:
          data.filter(
            item =>
              item.status ===
              'Pending Approval',
          ).length,

        scheduled:
          data.filter(
            item =>
              item.status ===
                'Scheduled' ||
              item.status ===
                'Approved',
          ).length,

        effective:
          data.filter(
            item =>
              item.status ===
              'Effective',
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
          filteredRecords
            .value.length /
            perPage.value,
        ),
      )
    })

  const paginatedRecords =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredRecords
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
        filteredRecords
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

        filteredRecords
          .value.length,
      )
    })

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value = ''
    transferType.value = ''
    destinationDepartment.value = ''
    status.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      transferType,
      destinationDepartment,
      status,
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

  
  /* =========================================
     CREATE EMPLOYEE TRANSFER
  ========================================= */

  type CreateTransferInput = Pick<
    LifecycleTransfer,
    | 'employeeId'
    | 'employeeNumber'
    | 'employeeName'
    | 'transferType'
    | 'currentDepartment'
    | 'currentPosition'
    | 'currentBranch'
    | 'newDepartment'
    | 'newPosition'
    | 'newBranch'
    | 'requestedDate'
    | 'effectiveDate'
    | 'requestedBy'
    | 'reason'
    | 'remarks'
  >

  const createTransfer = (
    data: CreateTransferInput,
  ): LifecycleTransfer | null => {
    if (
      !data.employeeId ||
      !data.newDepartment.trim() ||
      !data.newPosition.trim() ||
      !data.newBranch.trim() ||
      !data.reason.trim()
    ) {
      return null
    }

    if (data.effectiveDate < data.requestedDate) {
      return null
    }

    const nextId = Math.max(
      0,
      ...records.value.map(item => item.id),
    ) + 1

    const year = new Date().getFullYear()

    const transferNumber = [
      'TRF',
      year,
      String(nextId).padStart(3, '0'),
    ].join('-')

    const now = new Date().toISOString()

    const record: LifecycleTransfer = {
      ...data,

      id: nextId,
      transferNumber,

      status: 'Draft',

      createdAt: now,
      updatedAt: now,
    }

    records.value.unshift(record)
    currentPage.value = 1

    return record
  }

  /* =========================================
     EDIT EMPLOYEE TRANSFER
  ========================================= */

  type UpdateTransferInput = Partial<
    Pick<
      LifecycleTransfer,
      | 'transferType'
      | 'newDepartment'
      | 'newPosition'
      | 'newBranch'
      | 'requestedDate'
      | 'effectiveDate'
      | 'requestedBy'
      | 'reason'
      | 'remarks'
    >
  >

  const updateTransfer = (
    id: number,
    data: UpdateTransferInput,
  ): boolean => {
    const index = records.value.findIndex(
      item => item.id === id,
    )

    if (index === -1) {
      return false
    }

    const current = records.value[index]

    if (!current) {
      return false
    }

    const finalStatuses: LifecycleTransferStatus[] = [
      'Effective',
      'Rejected',
      'Cancelled',
    ]

    if (finalStatuses.includes(current.status)) {
      return false
    }

    const updated: LifecycleTransfer = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    }

    if (
      !updated.newDepartment.trim() ||
      !updated.newPosition.trim() ||
      !updated.newBranch.trim() ||
      !updated.reason.trim() ||
      updated.effectiveDate < updated.requestedDate
    ) {
      return false
    }

    records.value[index] = updated

    return true
  }

  /* =========================================
     UPDATE TRANSFER STATUS
  ========================================= */

  const changeTransferStatus = (
    id: number,
    newStatus: LifecycleTransferStatus,
    remarks?: string,
    approvedBy?: string,
  ): boolean => {
    const index = records.value.findIndex(
      item => item.id === id,
    )

    if (index === -1) {
      return false
    }

    const current = records.value[index]

    if (!current) {
      return false
    }

    const allowedTransitions: Record<
      LifecycleTransferStatus,
      LifecycleTransferStatus[]
    > = {
      Draft: [
        'Pending Approval',
        'Cancelled',
      ],

      'Pending Approval': [
        'Approved',
        'Rejected',
        'Cancelled',
      ],

      Approved: [
        'Scheduled',
        'Effective',
        'Cancelled',
      ],

      Scheduled: [
        'Effective',
        'Cancelled',
      ],

      Effective: [],
      Rejected: [],
      Cancelled: [],
    }

    if (current.status === newStatus) {
      if (['Effective', 'Rejected', 'Cancelled'].includes(current.status)) {
        return false
      }

      records.value[index] = {
        ...current,
        remarks: remarks ?? current.remarks,
        updatedAt: new Date().toISOString(),
      }

      return true
    }

    if (!allowedTransitions[current.status].includes(newStatus)) {
      return false
    }

    const approver = approvedBy?.trim() || current.approvedBy

    if (
      ['Approved', 'Scheduled', 'Effective'].includes(newStatus) &&
      !approver
    ) {
      return false
    }

    if (
      newStatus === 'Cancelled' &&
      !remarks?.trim()
    ) {
      return false
    }

    records.value[index] = {
      ...current,

      status: newStatus,

      approvedBy: approver,

      remarks: remarks ?? current.remarks,

      updatedAt: new Date().toISOString(),
    }

    return true
  }

  
  return {
    records,

    search,
    transferType,
    destinationDepartment,
    status,

    currentPage,
    perPage,

    filteredRecords,
    paginatedRecords,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    transferTypeOptions,
    destinationDepartmentOptions,
    statusOptions,

    createTransfer,
    updateTransfer,
    changeTransferStatus,

    resetFilters,
  }
}