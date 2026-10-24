import type {
  OnboardingEmployee,
  OnboardingStatus,
  EmploymentType,
} from '~/types/onboarding'

export const useOnboarding = () => {
  const onboardingRecords =
    useState<OnboardingEmployee[]>(
      'employee-onboarding-records',
      () => [
        {
          id: 1,

          onboardingNumber:
            'ONB-2026-001',

          employeeId: 13,
          employeeNumber:
            'EMP-013',

          employeeName:
            'Joshua Fernandez',

          email:
            'joshua.fernandez@rworkcentral.com',

          department:
            'Operations',

          position:
            'Driver',

          employmentType:
            'Probationary',

          dateHired:
            '2026-10-01',

          onboardingStartDate:
            '2026-10-01',

          targetCompletionDate:
            '2026-10-08',

          assignedHr:
            'Maria Santos',

          checklist: {
            documents: true,
            employeeProfile: true,
            companyAccount: true,
            orientation: true,
            policyAcknowledgment: false,
            departmentEndorsement: false,
          },

          completedTasks: 4,
          totalTasks: 6,
          progress: 67,

          status:
            'In Progress',

          remarks:
            'Pending policy acknowledgment and department endorsement.',

          createdAt:
            '2026-09-28T08:00:00',

          updatedAt:
            '2026-10-07T14:20:00',
        },

        {
          id: 2,

          onboardingNumber:
            'ONB-2026-002',

          employeeId: 14,
          employeeNumber:
            'EMP-014',

          employeeName:
            'Nicole Bautista',

          email:
            'nicole.bautista@rworkcentral.com',

          department:
            'Human Resources',

          position:
            'HR Assistant',

          employmentType:
            'Probationary',

          dateHired:
            '2026-10-03',

          onboardingStartDate:
            '2026-10-03',

          targetCompletionDate:
            '2026-10-10',

          assignedHr:
            'Maria Santos',

          checklist: {
            documents: true,
            employeeProfile: true,
            companyAccount: true,
            orientation: true,
            policyAcknowledgment: true,
            departmentEndorsement: true,
          },

          completedTasks: 6,
          totalTasks: 6,
          progress: 100,

          status:
            'Completed',

          remarks:
            'Onboarding successfully completed.',

          createdAt:
            '2026-09-30T10:00:00',

          updatedAt:
            '2026-10-07T09:30:00',
        },

        {
          id: 3,

          onboardingNumber:
            'ONB-2026-003',

          employeeId: 15,
          employeeNumber:
            'EMP-015',

          employeeName:
            'Kevin Ramos',

          email:
            'kevin.ramos@rworkcentral.com',

          department:
            'Information Technology',

          position:
            'Junior Developer',

          employmentType:
            'Probationary',

          dateHired:
            '2026-10-06',

          onboardingStartDate:
            '2026-10-06',

          targetCompletionDate:
            '2026-10-13',

          assignedHr:
            'Jenny Ramos',

          checklist: {
            documents: true,
            employeeProfile: true,
            companyAccount: true,
            orientation: false,
            policyAcknowledgment: false,
            departmentEndorsement: false,
          },

          completedTasks: 3,
          totalTasks: 6,
          progress: 50,

          status:
            'In Progress',

          remarks:
            'Scheduled for orientation.',

          createdAt:
            '2026-10-01T11:00:00',

          updatedAt:
            '2026-10-07T13:00:00',
        },

        {
          id: 4,

          onboardingNumber:
            'ONB-2026-004',

          employeeId: 16,
          employeeNumber:
            'EMP-016',

          employeeName:
            'Samantha Cruz',

          email:
            'samantha.cruz@rworkcentral.com',

          department:
            'Finance',

          position:
            'Accounting Staff',

          employmentType:
            'Probationary',

          dateHired:
            '2026-10-08',

          onboardingStartDate:
            '2026-10-08',

          targetCompletionDate:
            '2026-10-15',

          assignedHr:
            'Maria Santos',

          checklist: {
            documents: false,
            employeeProfile: false,
            companyAccount: false,
            orientation: false,
            policyAcknowledgment: false,
            departmentEndorsement: false,
          },

          completedTasks: 0,
          totalTasks: 6,
          progress: 0,

          status:
            'Not Started',

          createdAt:
            '2026-10-05T08:00:00',

          updatedAt:
            '2026-10-05T08:00:00',
        },

        {
          id: 5,

          onboardingNumber:
            'ONB-2026-005',

          employeeId: 17,
          employeeNumber:
            'EMP-017',

          employeeName:
            'Miguel Torres',

          email:
            'miguel.torres@rworkcentral.com',

          department:
            'Billing',

          position:
            'Billing Assistant',

          employmentType:
            'Contractual',

          dateHired:
            '2026-09-29',

          onboardingStartDate:
            '2026-09-29',

          targetCompletionDate:
            '2026-10-06',

          assignedHr:
            'Jenny Ramos',

          checklist: {
            documents: true,
            employeeProfile: true,
            companyAccount: true,
            orientation: true,
            policyAcknowledgment: true,
            departmentEndorsement: false,
          },

          completedTasks: 5,
          totalTasks: 6,
          progress: 83,

          status:
            'For Completion',

          remarks:
            'Department endorsement pending.',

          createdAt:
            '2026-09-27T09:00:00',

          updatedAt:
            '2026-10-07T10:45:00',
        },

        {
          id: 6,

          onboardingNumber:
            'ONB-2026-006',

          employeeId: 18,
          employeeNumber:
            'EMP-018',

          employeeName:
            'Andrea Mendoza',

          email:
            'andrea.mendoza@rworkcentral.com',

          department:
            'Operations',

          position:
            'Operations Coordinator',

          employmentType:
            'Regular',

          dateHired:
            '2026-09-22',

          onboardingStartDate:
            '2026-09-22',

          targetCompletionDate:
            '2026-09-29',

          assignedHr:
            'Maria Santos',

          checklist: {
            documents: true,
            employeeProfile: true,
            companyAccount: true,
            orientation: true,
            policyAcknowledgment: true,
            departmentEndorsement: true,
          },

          completedTasks: 6,
          totalTasks: 6,
          progress: 100,

          status:
            'Completed',

          createdAt:
            '2026-09-19T08:15:00',

          updatedAt:
            '2026-09-29T16:00:00',
        },

        {
          id: 7,

          onboardingNumber:
            'ONB-2026-007',

          employeeId: 19,
          employeeNumber:
            'EMP-019',

          employeeName:
            'John Paul Garcia',

          email:
            'jp.garcia@rworkcentral.com',

          department:
            'Operations',

          position:
            'Driver',

          employmentType:
            'Project-Based',

          dateHired:
            '2026-10-02',

          onboardingStartDate:
            '2026-10-02',

          targetCompletionDate:
            '2026-10-09',

          assignedHr:
            'Jenny Ramos',

          checklist: {
            documents: true,
            employeeProfile: true,
            companyAccount: false,
            orientation: false,
            policyAcknowledgment: false,
            departmentEndorsement: false,
          },

          completedTasks: 2,
          totalTasks: 6,
          progress: 33,

          status:
            'On Hold',

          remarks:
            'Waiting for client deployment confirmation.',

          createdAt:
            '2026-09-30T13:20:00',

          updatedAt:
            '2026-10-06T15:00:00',
        },

        {
          id: 8,

          onboardingNumber:
            'ONB-2026-008',

          employeeId: 20,
          employeeNumber:
            'EMP-020',

          employeeName:
            'Patricia Lim',

          email:
            'patricia.lim@rworkcentral.com',

          department:
            'Finance',

          position:
            'Payroll Assistant',

          employmentType:
            'Probationary',

          dateHired:
            '2026-10-07',

          onboardingStartDate:
            '2026-10-07',

          targetCompletionDate:
            '2026-10-14',

          assignedHr:
            'Maria Santos',

          checklist: {
            documents: true,
            employeeProfile: true,
            companyAccount: false,
            orientation: false,
            policyAcknowledgment: false,
            departmentEndorsement: false,
          },

          completedTasks: 2,
          totalTasks: 6,
          progress: 33,

          status:
            'In Progress',

          createdAt:
            '2026-10-03T08:30:00',

          updatedAt:
            '2026-10-07T16:30:00',
        },

        {
          id: 9,

          onboardingNumber:
            'ONB-2026-009',

          employeeId: 21,
          employeeNumber:
            'EMP-021',

          employeeName:
            'Jerome Villanueva',

          email:
            'jerome.villanueva@rworkcentral.com',

          department:
            'Information Technology',

          position:
            'IT Support',

          employmentType:
            'Contractual',

          dateHired:
            '2026-10-01',

          onboardingStartDate:
            '2026-10-01',

          targetCompletionDate:
            '2026-10-08',

          assignedHr:
            'Jenny Ramos',

          checklist: {
            documents: true,
            employeeProfile: true,
            companyAccount: true,
            orientation: true,
            policyAcknowledgment: true,
            departmentEndorsement: false,
          },

          completedTasks: 5,
          totalTasks: 6,
          progress: 83,

          status:
            'For Completion',

          createdAt:
            '2026-09-28T08:45:00',

          updatedAt:
            '2026-10-07T11:20:00',
        },

        {
          id: 10,

          onboardingNumber:
            'ONB-2026-010',

          employeeId: 22,
          employeeNumber:
            'EMP-022',

          employeeName:
            'Camille Reyes',

          email:
            'camille.reyes@rworkcentral.com',

          department:
            'Human Resources',

          position:
            'Recruitment Assistant',

          employmentType:
            'Probationary',

          dateHired:
            '2026-10-08',

          onboardingStartDate:
            '2026-10-08',

          targetCompletionDate:
            '2026-10-15',

          assignedHr:
            'Maria Santos',

          checklist: {
            documents: false,
            employeeProfile: true,
            companyAccount: false,
            orientation: false,
            policyAcknowledgment: false,
            departmentEndorsement: false,
          },

          completedTasks: 1,
          totalTasks: 6,
          progress: 17,

          status:
            'In Progress',

          createdAt:
            '2026-10-06T14:00:00',

          updatedAt:
            '2026-10-07T17:00:00',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const department =
    ref('')

  const employmentType =
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

  const departmentOptions =
    computed(() => {
      return [
        ...new Set(
          onboardingRecords.value.map(
            item =>
              item.department,
          ),
        ),
      ].sort()
    })

  const employmentTypeOptions:
    EmploymentType[] = [
      'Regular',
      'Probationary',
      'Contractual',
      'Project-Based',
    ]

  const statusOptions:
    OnboardingStatus[] = [
      'Not Started',
      'In Progress',
      'For Completion',
      'Completed',
      'On Hold',
    ]

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredRecords =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return onboardingRecords.value.filter(
        item => {
          const matchesSearch =
            !keyword ||
            item.onboardingNumber
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
            item.assignedHr
              .toLowerCase()
              .includes(keyword)

          const matchesDepartment =
            !department.value ||
            item.department ===
              department.value

          const matchesEmploymentType =
            !employmentType.value ||
            item.employmentType ===
              employmentType.value

          const matchesStatus =
            !status.value ||
            item.status ===
              status.value

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesEmploymentType &&
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
        onboardingRecords.value

      const active =
        data.filter(
          item =>
            item.status ===
              'In Progress' ||
            item.status ===
              'For Completion',
        )

      const averageProgress =
        data.length > 0
          ? Math.round(
              data.reduce(
                (
                  total,
                  item,
                ) =>
                  total +
                  item.progress,
                0,
              ) /
                data.length,
            )
          : 0

      return {
        total:
          data.length,

        active:
          active.length,

        forCompletion:
          data.filter(
            item =>
              item.status ===
              'For Completion',
          ).length,

        completed:
          data.filter(
            item =>
              item.status ===
              'Completed',
          ).length,

        averageProgress,
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
    department.value = ''
    employmentType.value = ''
    status.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      department,
      employmentType,
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

  return {
    onboardingRecords,

    search,
    department,
    employmentType,
    status,

    currentPage,

    filteredRecords,
    paginatedRecords,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    departmentOptions,
    employmentTypeOptions,
    statusOptions,

    resetFilters,
  }
}