import type {
  EmploymentChangeRecord,
  EmploymentChangeStatus,
  EmploymentChangeType,
} from '~/types/employmentChange'

export const useEmploymentChanges = () => {
  const records =
    useState<EmploymentChangeRecord[]>(
      'employee-lifecycle-employment-changes',
      () => [
        {
          id: 1,

          changeNumber:
            'ECH-2026-001',

          employeeId: 2,
          employeeNumber:
            'EMP-002',

          employeeName:
            'Maria Santos',

          department:
            'Human Resources',

          position:
            'HR Administrator',

          changeType:
            'Work Arrangement Change',

          currentValue:
            'On-site',

          newValue:
            'Hybrid - 3 Days On-site',

          requestedDate:
            '2026-10-01',

          effectiveDate:
            '2026-10-15',

          requestedBy:
            'Maria Santos',

          approvedBy:
            'General Manager',

          reason:
            'Approved hybrid work arrangement based on operational requirements.',

          status:
            'Scheduled',

          remarks:
            'New arrangement starts on the next cutoff.',

          createdAt:
            '2026-10-01T08:30:00',

          updatedAt:
            '2026-10-07T14:00:00',
        },

        {
          id: 2,

          changeNumber:
            'ECH-2026-002',

          employeeId: 3,
          employeeNumber:
            'EMP-003',

          employeeName:
            'Pedro Reyes',

          department:
            'Finance',

          position:
            'Finance Staff',

          changeType:
            'Employment Type Change',

          currentValue:
            'Probationary',

          newValue:
            'Regular',

          requestedDate:
            '2026-10-02',

          effectiveDate:
            '2026-10-16',

          requestedBy:
            'Finance Manager',

          approvedBy:
            'Maria Santos',

          reason:
            'Employee completed probationary employment requirements.',

          status:
            'Approved',

          remarks:
            'For employment record update.',

          createdAt:
            '2026-10-02T09:00:00',

          updatedAt:
            '2026-10-07T10:00:00',
        },

        {
          id: 3,

          changeNumber:
            'ECH-2026-003',

          employeeId: 5,
          employeeNumber:
            'EMP-005',

          employeeName:
            'Carlo Mendoza',

          department:
            'Information Technology',

          position:
            'Software Developer',

          changeType:
            'Compensation Adjustment',

          currentValue:
            'PHP 42,000 / month',

          newValue:
            'PHP 46,000 / month',

          requestedDate:
            '2026-10-03',

          effectiveDate:
            '2026-11-01',

          requestedBy:
            'IT Manager',

          reason:
            'Market adjustment and expanded technical responsibilities.',

          status:
            'Pending Approval',

          remarks:
            'For management review.',

          createdAt:
            '2026-10-03T10:15:00',

          updatedAt:
            '2026-10-07T11:30:00',
        },

        {
          id: 4,

          changeNumber:
            'ECH-2026-004',

          employeeId: 6,
          employeeNumber:
            'EMP-006',

          employeeName:
            'Angela Flores',

          department:
            'Billing',

          position:
            'Billing Staff',

          changeType:
            'Reporting Line Change',

          currentValue:
            'Billing Supervisor',

          newValue:
            'Finance Manager',

          requestedDate:
            '2026-10-04',

          effectiveDate:
            '2026-10-20',

          requestedBy:
            'Maria Santos',

          reason:
            'Reporting structure adjustment following department reorganization.',

          status:
            'For Review',

          createdAt:
            '2026-10-04T09:30:00',

          updatedAt:
            '2026-10-07T13:00:00',
        },

        {
          id: 5,

          changeNumber:
            'ECH-2026-005',

          employeeId: 7,
          employeeNumber:
            'EMP-007',

          employeeName:
            'Mark Lopez',

          department:
            'Information Technology',

          position:
            'IT Support',

          changeType:
            'Contract Extension',

          currentValue:
            'Contract Ends Oct 31, 2026',

          newValue:
            'Extended Until Apr 30, 2027',

          requestedDate:
            '2026-10-05',

          effectiveDate:
            '2026-11-01',

          requestedBy:
            'IT Manager',

          approvedBy:
            'Maria Santos',

          reason:
            'Extension required for continued IT operations support.',

          status:
            'Approved',

          remarks:
            'Updated contract for employee signature.',

          createdAt:
            '2026-10-05T08:45:00',

          updatedAt:
            '2026-10-07T14:15:00',
        },

        {
          id: 6,

          changeNumber:
            'ECH-2026-006',

          employeeId: 8,
          employeeNumber:
            'EMP-008',

          employeeName:
            'Jenny Ramos',

          department:
            'Human Resources',

          position:
            'HR Staff',

          changeType:
            'Employment Status Change',

          currentValue:
            'Active',

          newValue:
            'On Leave',

          requestedDate:
            '2026-09-25',

          effectiveDate:
            '2026-10-01',

          requestedBy:
            'Maria Santos',

          approvedBy:
            'General Manager',

          reason:
            'Approved extended leave status.',

          status:
            'Effective',

          remarks:
            'Employment status has been updated.',

          createdAt:
            '2026-09-25T08:00:00',

          updatedAt:
            '2026-10-01T08:30:00',
        },

        {
          id: 7,

          changeNumber:
            'ECH-2026-007',

          employeeId: 9,
          employeeNumber:
            'EMP-009',

          employeeName:
            'Robert Castillo',

          department:
            'Finance',

          position:
            'Finance Officer',

          changeType:
            'Work Arrangement Change',

          currentValue:
            'On-site',

          newValue:
            'Remote - Temporary',

          requestedDate:
            '2026-10-06',

          effectiveDate:
            '2026-10-15',

          requestedBy:
            'Robert Castillo',

          reason:
            'Temporary remote work request.',

          status:
            'Rejected',

          remarks:
            'Position requires on-site financial document handling.',

          createdAt:
            '2026-10-06T09:00:00',

          updatedAt:
            '2026-10-07T15:20:00',
        },

        {
          id: 8,

          changeNumber:
            'ECH-2026-008',

          employeeId: 10,
          employeeNumber:
            'EMP-010',

          employeeName:
            'Grace Navarro',

          department:
            'Human Resources',

          position:
            'HR Staff',

          changeType:
            'Compensation Adjustment',

          currentValue:
            'PHP 28,000 / month',

          newValue:
            'PHP 30,500 / month',

          requestedDate:
            '2026-10-06',

          effectiveDate:
            '2026-11-01',

          requestedBy:
            'Maria Santos',

          reason:
            'Salary alignment based on updated role responsibilities.',

          status:
            'Draft',

          createdAt:
            '2026-10-06T13:00:00',

          updatedAt:
            '2026-10-06T13:00:00',
        },

        {
          id: 9,

          changeNumber:
            'ECH-2026-009',

          employeeId: 11,
          employeeNumber:
            'EMP-011',

          employeeName:
            'Leo Martinez',

          department:
            'Operations',

          position:
            'Driver',

          changeType:
            'Contract Extension',

          currentValue:
            'Project Contract Ends Oct 15, 2026',

          newValue:
            'Extended Until Jan 15, 2027',

          requestedDate:
            '2026-10-07',

          effectiveDate:
            '2026-10-16',

          requestedBy:
            'Operations Manager',

          reason:
            'Client deployment has been extended for another three months.',

          status:
            'Pending Approval',

          remarks:
            'Waiting for final client confirmation.',

          createdAt:
            '2026-10-07T08:30:00',

          updatedAt:
            '2026-10-07T11:00:00',
        },

        {
          id: 10,

          changeNumber:
            'ECH-2026-010',

          employeeId: 12,
          employeeNumber:
            'EMP-012',

          employeeName:
            'Claire Villanueva',

          department:
            'Operations',

          position:
            'Operations Coordinator',

          changeType:
            'Reporting Line Change',

          currentValue:
            'Operations Supervisor',

          newValue:
            'Operations Manager',

          requestedDate:
            '2026-10-07',

          effectiveDate:
            '2026-10-20',

          requestedBy:
            'Operations Manager',

          approvedBy:
            'Maria Santos',

          reason:
            'Updated supervisory structure within Operations.',

          status:
            'Scheduled',

          createdAt:
            '2026-10-07T14:00:00',

          updatedAt:
            '2026-10-07T16:00:00',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const changeType =
    ref('')

  const department =
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

  const changeTypeOptions:
    EmploymentChangeType[] = [
      'Employment Type Change',
      'Contract Extension',
      'Work Arrangement Change',
      'Reporting Line Change',
      'Compensation Adjustment',
      'Employment Status Change',
    ]

  const statusOptions:
    EmploymentChangeStatus[] = [
      'Draft',
      'For Review',
      'Pending Approval',
      'Approved',
      'Scheduled',
      'Effective',
      'Rejected',
      'Cancelled',
    ]

  const departmentOptions =
    computed(() => {
      return [
        ...new Set(
          records.value.map(
            item =>
              item.department,
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
            item.changeNumber
              .toLowerCase()
              .includes(keyword) ||
            item.employeeName
              .toLowerCase()
              .includes(keyword) ||
            item.employeeNumber
              .toLowerCase()
              .includes(keyword) ||
            item.position
              .toLowerCase()
              .includes(keyword) ||
            item.currentValue
              .toLowerCase()
              .includes(keyword) ||
            item.newValue
              .toLowerCase()
              .includes(keyword)

          const matchesType =
            !changeType.value ||
            item.changeType ===
              changeType.value

          const matchesDepartment =
            !department.value ||
            item.department ===
              department.value

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
                'For Review' ||
              item.status ===
                'Pending Approval',
          ).length,

        approved:
          data.filter(
            item =>
              item.status ===
                'Approved' ||
              item.status ===
                'Scheduled',
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
    changeType.value = ''
    department.value = ''
    status.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      changeType,
      department,
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
     CREATE EMPLOYMENT CHANGE
  ========================================= */

  type CreateEmploymentChangeInput = Pick<
    EmploymentChangeRecord,
    | 'employeeId'
    | 'employeeNumber'
    | 'employeeName'
    | 'department'
    | 'position'
    | 'changeType'
    | 'currentValue'
    | 'newValue'
    | 'requestedDate'
    | 'effectiveDate'
    | 'requestedBy'
    | 'reason'
    | 'remarks'
  >

  type UpdateEmploymentChangeInput = Partial<
    Pick<
      EmploymentChangeRecord,
      | 'changeType'
      | 'currentValue'
      | 'newValue'
      | 'requestedDate'
      | 'effectiveDate'
      | 'requestedBy'
      | 'reason'
      | 'remarks'
    >
  >

  const createEmploymentChange = (
    data: CreateEmploymentChangeInput,
  ): EmploymentChangeRecord | null => {
    if (
      !data.employeeId ||
      !data.employeeName.trim() ||
      !data.currentValue.trim() ||
      !data.newValue.trim() ||
      !data.requestedBy.trim() ||
      !data.reason.trim()
    ) {
      return null
    }

    if (
      data.currentValue.trim() === data.newValue.trim() ||
      !data.requestedDate ||
      !data.effectiveDate ||
      data.effectiveDate < data.requestedDate
    ) {
      return null
    }

    const nextId = Math.max(
      0,
      ...records.value.map(item => item.id),
    ) + 1

    const year = new Date().getFullYear()

    const changeNumber = [
      'ECH',
      year,
      String(nextId).padStart(3, '0'),
    ].join('-')

    const now = new Date().toISOString()

    const record: EmploymentChangeRecord = {
      ...data,

      id: nextId,
      changeNumber,

      status: 'Draft',

      createdAt: now,
      updatedAt: now,
    }

    records.value.unshift(record)
    currentPage.value = 1

    return record
  }

  /* =========================================
     UPDATE EMPLOYMENT CHANGE
  ========================================= */

  const updateEmploymentChange = (
    id: number,
    changes: UpdateEmploymentChangeInput,
  ): boolean => {
    const index = records.value.findIndex(
      item => item.id === id,
    )

    if (index === -1) return false

    const current = records.value[index]

    if (!current) return false

    const finalStatuses: EmploymentChangeStatus[] = [
      'Effective',
      'Rejected',
      'Cancelled',
    ]

    if (finalStatuses.includes(current.status)) {
      return false
    }

    const updated: EmploymentChangeRecord = {
      ...current,
      ...changes,
      updatedAt: new Date().toISOString(),
    }

    if (
      !updated.currentValue.trim() ||
      !updated.newValue.trim() ||
      !updated.requestedBy.trim() ||
      !updated.reason.trim() ||
      updated.currentValue.trim() === updated.newValue.trim() ||
      updated.effectiveDate < updated.requestedDate
    ) {
      return false
    }

    records.value[index] = updated

    return true
  }

  /* =========================================
     EMPLOYMENT CHANGE STATUS
  ========================================= */

  const changeEmploymentStatus = (
    id: number,
    newStatus: EmploymentChangeStatus,
    details?: {
      approvedBy?: string
      remarks?: string
      effectiveDate?: string
    },
  ): boolean => {
    const index = records.value.findIndex(
      item => item.id === id,
    )

    if (index === -1) return false

    const record = records.value[index]

    if (!record) return false

    const allowedTransitions: Record<
      EmploymentChangeStatus,
      EmploymentChangeStatus[]
    > = {
      Draft: [
        'For Review',
        'Cancelled',
      ],

      'For Review': [
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

    if (
      !allowedTransitions[record.status].includes(newStatus)
    ) {
      return false
    }

    const approver =
      details?.approvedBy?.trim() ||
      record.approvedBy

    if (
      ['Approved', 'Scheduled', 'Effective'].includes(newStatus) &&
      !approver
    ) {
      return false
    }

    if (
      ['Rejected', 'Cancelled'].includes(newStatus) &&
      !details?.remarks?.trim()
    ) {
      return false
    }

    const effectiveDate =
      details?.effectiveDate ||
      record.effectiveDate

    if (
      effectiveDate < record.requestedDate
    ) {
      return false
    }

    if (newStatus === 'Effective') {
      const now = new Date()
      const today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
      ].join('-')

      if (effectiveDate > today) {
        return false
      }
    }

    records.value[index] = {
      ...record,

      status: newStatus,

      approvedBy: approver,

      effectiveDate,

      remarks:
        details?.remarks?.trim() ||
        record.remarks,

      updatedAt: new Date().toISOString(),
    }

    return true
  }

  
  return {
    records,

    search,
    changeType,
    department,
    status,

    currentPage,
    perPage,

    filteredRecords,
    paginatedRecords,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    changeTypeOptions,
    departmentOptions,
    statusOptions,

    createEmploymentChange,
    updateEmploymentChange,
    changeEmploymentStatus,

    resetFilters,
  }
}