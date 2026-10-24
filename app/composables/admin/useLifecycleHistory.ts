import type {
  LifecycleEventType,
  LifecycleHistoryRecord,
  LifecycleHistoryStatus,
} from '~/types/lifecycleHistory'

export const useLifecycleHistory = () => {
  const records =
    useState<LifecycleHistoryRecord[]>(
      'employee-lifecycle-history',
      () => [
        {
          id: 1,

          referenceNumber:
            'ONB-2026-001',

          employeeId: 13,
          employeeNumber:
            'EMP-013',

          employeeName:
            'Joshua Fernandez',

          department:
            'Operations',

          position:
            'Driver',

          eventType:
            'Onboarding',

          eventTitle:
            'Employee Onboarding Completed',

          newValue:
            'Active Employee',

          effectiveDate:
            '2026-10-08',

          processedBy:
            'Maria Santos',

          approvedBy:
            'Operations Manager',

          status:
            'Completed',

          description:
            'Employee completed onboarding requirements, orientation and department endorsement.',

          remarks:
            'Ready for regular operations.',

          createdAt:
            '2026-10-08T08:30:00',
        },

        {
          id: 2,

          referenceNumber:
            'REG-2026-001',

          employeeId: 3,
          employeeNumber:
            'EMP-003',

          employeeName:
            'Pedro Reyes',

          department:
            'Finance',

          position:
            'Finance Staff',

          eventType:
            'Regularization',

          eventTitle:
            'Employment Regularization',

          previousValue:
            'Probationary',

          newValue:
            'Regular',

          effectiveDate:
            '2026-10-16',

          processedBy:
            'Maria Santos',

          approvedBy:
            'General Manager',

          status:
            'Approved',

          description:
            'Employee successfully completed probationary requirements and was approved for regularization.',

          remarks:
            'Effective next payroll period.',

          createdAt:
            '2026-10-06T15:00:00',
        },

        {
          id: 3,

          referenceNumber:
            'TRF-2026-003',

          employeeId: 3,
          employeeNumber:
            'EMP-003',

          employeeName:
            'Pedro Reyes',

          department:
            'Finance',

          position:
            'Finance Staff',

          eventType:
            'Transfer',

          eventTitle:
            'Branch Transfer',

          previousValue:
            'Main Branch',

          newValue:
            'South Branch',

          effectiveDate:
            '2026-10-01',

          processedBy:
            'Finance Manager',

          approvedBy:
            'Maria Santos',

          status:
            'Effective',

          description:
            'Employee transferred from Main Branch to South Branch to support finance operations.',

          createdAt:
            '2026-09-25T08:00:00',
        },

        {
          id: 4,

          referenceNumber:
            'PRO-2026-002',

          employeeId: 8,
          employeeNumber:
            'EMP-008',

          employeeName:
            'Jenny Ramos',

          department:
            'Human Resources',

          position:
            'HR Officer',

          eventType:
            'Promotion',

          eventTitle:
            'Position Promotion',

          previousValue:
            'HR Staff · G4',

          newValue:
            'HR Officer · G5',

          effectiveDate:
            '2026-10-01',

          processedBy:
            'Maria Santos',

          approvedBy:
            'General Manager',

          status:
            'Effective',

          description:
            'Employee promoted to HR Officer following performance review and increased responsibilities.',

          remarks:
            'Salary adjustment included.',

          createdAt:
            '2026-09-20T08:30:00',
        },

        {
          id: 5,

          referenceNumber:
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

          eventType:
            'Employment Change',

          eventTitle:
            'Work Arrangement Change',

          previousValue:
            'On-site',

          newValue:
            'Hybrid - 3 Days On-site',

          effectiveDate:
            '2026-10-15',

          processedBy:
            'Maria Santos',

          approvedBy:
            'General Manager',

          status:
            'Scheduled',

          description:
            'Approved change from fully on-site work to hybrid arrangement.',

          createdAt:
            '2026-10-01T08:30:00',
        },

        {
          id: 6,

          referenceNumber:
            'OFF-2026-006',

          employeeId: 24,
          employeeNumber:
            'EMP-024',

          employeeName:
            'Antonio Ramirez',

          department:
            'Operations',

          position:
            'Senior Driver',

          eventType:
            'Offboarding',

          eventTitle:
            'Employee Retirement',

          previousValue:
            'Active Employee',

          newValue:
            'Retired',

          effectiveDate:
            '2026-10-01',

          processedBy:
            'Maria Santos',

          approvedBy:
            'General Manager',

          status:
            'Completed',

          description:
            'Employee completed retirement clearance, asset return, exit interview and final pay release.',

          remarks:
            'Retirement process completed.',

          createdAt:
            '2026-10-01T16:00:00',
        },

        {
          id: 7,

          referenceNumber:
            'TRF-2026-008',

          employeeId: 10,
          employeeNumber:
            'EMP-010',

          employeeName:
            'Grace Navarro',

          department:
            'Human Resources',

          position:
            'Recruitment Coordinator',

          eventType:
            'Transfer',

          eventTitle:
            'Internal Role Transfer',

          previousValue:
            'HR Staff',

          newValue:
            'Recruitment Coordinator',

          effectiveDate:
            '2026-10-05',

          processedBy:
            'Maria Santos',

          approvedBy:
            'General Manager',

          status:
            'Effective',

          description:
            'Employee internally reassigned to recruitment coordination operations.',

          createdAt:
            '2026-09-28T13:00:00',
        },

        {
          id: 8,

          referenceNumber:
            'PRO-2026-009',

          employeeId: 2,
          employeeNumber:
            'EMP-002',

          employeeName:
            'Maria Santos',

          department:
            'Human Resources',

          position:
            'HR Administrator',

          eventType:
            'Promotion',

          eventTitle:
            'Leadership Promotion',

          previousValue:
            'HR Administrator · G7',

          newValue:
            'HR Manager · G8',

          effectiveDate:
            '2026-11-01',

          processedBy:
            'General Manager',

          status:
            'In Progress',

          description:
            'Employee recommended for leadership promotion based on HR management responsibilities.',

          remarks:
            'Pending final management approval.',

          createdAt:
            '2026-10-05T10:15:00',
        },

        {
          id: 9,

          referenceNumber:
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

          eventType:
            'Employment Change',

          eventTitle:
            'Contract Extension',

          previousValue:
            'Contract Ends Oct 31, 2026',

          newValue:
            'Extended Until Apr 30, 2027',

          effectiveDate:
            '2026-11-01',

          processedBy:
            'IT Manager',

          approvedBy:
            'Maria Santos',

          status:
            'Approved',

          description:
            'Employment contract extended to support continued IT operations.',

          createdAt:
            '2026-10-05T08:45:00',
        },

        {
          id: 10,

          referenceNumber:
            'REG-2026-006',

          employeeId: 18,
          employeeNumber:
            'EMP-018',

          employeeName:
            'Andrea Mendoza',

          department:
            'Operations',

          position:
            'Operations Coordinator',

          eventType:
            'Regularization',

          eventTitle:
            'Employee Regularized',

          previousValue:
            'Probationary',

          newValue:
            'Regular',

          effectiveDate:
            '2026-09-16',

          processedBy:
            'Maria Santos',

          approvedBy:
            'General Manager',

          status:
            'Completed',

          description:
            'Employee successfully completed probationary evaluation and regularization process.',

          createdAt:
            '2026-09-16T08:30:00',
        },

        {
          id: 11,

          referenceNumber:
            'OFF-2026-002',

          employeeId: 17,
          employeeNumber:
            'EMP-017',

          employeeName:
            'Miguel Torres',

          department:
            'Billing',

          position:
            'Billing Assistant',

          eventType:
            'Offboarding',

          eventTitle:
            'End of Contract',

          previousValue:
            'Active - Contractual',

          newValue:
            'For Separation',

          effectiveDate:
            '2026-10-16',

          processedBy:
            'Billing Supervisor',

          approvedBy:
            'Maria Santos',

          status:
            'In Progress',

          description:
            'Employee contract has ended and offboarding clearance has been completed.',

          remarks:
            'Final pay ready for release.',

          createdAt:
            '2026-09-25T08:00:00',
        },

        {
          id: 12,

          referenceNumber:
            'ONB-2026-002',

          employeeId: 14,
          employeeNumber:
            'EMP-014',

          employeeName:
            'Nicole Bautista',

          department:
            'Human Resources',

          position:
            'HR Assistant',

          eventType:
            'Onboarding',

          eventTitle:
            'Onboarding Completed',

          newValue:
            'Active Employee',

          effectiveDate:
            '2026-10-07',

          processedBy:
            'Maria Santos',

          approvedBy:
            'HR Administrator',

          status:
            'Completed',

          description:
            'New hire onboarding requirements were fully completed.',

          createdAt:
            '2026-10-07T09:30:00',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const eventType =
    ref('')

  const department =
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
    ref(7)

  /* =========================================================
     OPTIONS
  ========================================================= */

  const eventTypeOptions:
    LifecycleEventType[] = [
      'Onboarding',
      'Regularization',
      'Transfer',
      'Promotion',
      'Employment Change',
      'Offboarding',
    ]

  const statusOptions:
    LifecycleHistoryStatus[] = [
      'Completed',
      'Effective',
      'Approved',
      'Scheduled',
      'In Progress',
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
     FILTER
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
            item.referenceNumber
              .toLowerCase()
              .includes(keyword) ||
            item.employeeName
              .toLowerCase()
              .includes(keyword) ||
            item.employeeNumber
              .toLowerCase()
              .includes(keyword) ||
            item.eventTitle
              .toLowerCase()
              .includes(keyword) ||
            item.description
              .toLowerCase()
              .includes(keyword)

          const matchesEventType =
            !eventType.value ||
            item.eventType ===
              eventType.value

          const matchesDepartment =
            !department.value ||
            item.department ===
              department.value

          const matchesStatus =
            !status.value ||
            item.status ===
              status.value

          const eventDate =
            new Date(
              `${item.effectiveDate}T00:00:00`,
            )

          const matchesDateFrom =
            !dateFrom.value ||
            eventDate >=
              new Date(
                `${dateFrom.value}T00:00:00`,
              )

          const matchesDateTo =
            !dateTo.value ||
            eventDate <=
              new Date(
                `${dateTo.value}T23:59:59`,
              )

          return (
            matchesSearch &&
            matchesEventType &&
            matchesDepartment &&
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
        records.value

      return {
        total:
          data.length,

        movement:
          data.filter(
            item =>
              item.eventType ===
                'Transfer' ||
              item.eventType ===
                'Promotion',
          ).length,

        employmentChanges:
          data.filter(
            item =>
              item.eventType ===
                'Regularization' ||
              item.eventType ===
                'Employment Change',
          ).length,

        completed:
          data.filter(
            item =>
              item.status ===
                'Completed' ||
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
    eventType.value = ''
    department.value = ''
    status.value = ''
    dateFrom.value = ''
    dateTo.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      eventType,
      department,
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
    records,

    search,
    eventType,
    department,
    status,
    dateFrom,
    dateTo,

    currentPage,

    filteredRecords,
    paginatedRecords,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    eventTypeOptions,
    departmentOptions,
    statusOptions,

    resetFilters,
  }
}