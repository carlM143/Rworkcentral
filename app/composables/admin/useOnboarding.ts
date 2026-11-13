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
          onboardingNumber: 'ONB-2026-001',
          employeeId: 1,
          employeeNumber: 'EMP-1001',
          employeeName: 'Roger Perez Jr.',
          email: 'roger.perez@rworkcentral.test',
          department: 'R Web Solutions',
          position: 'Web Developer',
          employmentType: 'Probationary',
          dateHired: '2026-10-12',
          onboardingStartDate: '2026-10-12',
          targetCompletionDate: '2026-10-19',
          assignedHr: 'HR Administrator',
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
          status: 'In Progress',
          remarks: 'Pending policy acknowledgment and department endorsement.',
          createdAt: '2026-10-10T08:00:00',
          updatedAt: '2026-10-15T14:20:00',
        },
        {
          id: 2,
          onboardingNumber: 'ONB-2026-002',
          employeeId: 5,
          employeeNumber: 'EMP-1005',
          employeeName: 'Mark Villanueva',
          email: 'mark.villanueva@rworkcentral.test',
          department: 'Airpro',
          position: 'Junior Technician',
          employmentType: 'Probationary',
          dateHired: '2026-08-12',
          onboardingStartDate: '2026-08-12',
          targetCompletionDate: '2026-08-19',
          assignedHr: 'HR Administrator',
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
          status: 'In Progress',
          remarks: 'Scheduled for technical and safety orientation.',
          createdAt: '2026-08-10T09:00:00',
          updatedAt: '2026-08-16T11:30:00',
        },
        {
          id: 3,
          onboardingNumber: 'ONB-2026-003',
          employeeId: 9,
          employeeNumber: 'EMP-1009',
          employeeName: 'Daniel Aquino',
          email: 'daniel.aquino@rworkcentral.test',
          department: 'Airpro',
          position: 'IT Support Specialist',
          employmentType: 'Probationary',
          dateHired: '2026-09-12',
          onboardingStartDate: '2026-09-12',
          targetCompletionDate: '2026-09-19',
          assignedHr: 'HR Administrator',
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
          status: 'In Progress',
          remarks: 'Company account setup in progress.',
          createdAt: '2026-09-10T10:00:00',
          updatedAt: '2026-09-14T15:00:00',
        },
        {
          id: 4,
          onboardingNumber: 'ONB-2026-004',
          employeeId: 10,
          employeeNumber: 'EMP-1010',
          employeeName: 'Bea Navarro Castillo',
          email: 'bea.castillo@rworkcentral.test',
          department: 'Airpro',
          position: 'Field Technician',
          employmentType: 'Probationary',
          dateHired: '2026-06-12',
          onboardingStartDate: '2026-06-12',
          targetCompletionDate: '2026-06-19',
          assignedHr: 'HR Administrator',
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
          status: 'In Progress',
          remarks: 'Field assignment endorsement scheduled.',
          createdAt: '2026-06-10T08:30:00',
          updatedAt: '2026-06-16T13:45:00',
        },
        {
          id: 5,
          onboardingNumber: 'ONB-2026-005',
          employeeId: 7,
          employeeNumber: 'EMP-1007',
          employeeName: 'Joshua Ramos',
          email: 'joshua.ramos@rworkcentral.test',
          department: 'R Web Solutions',
          position: 'Software Developer',
          employmentType: 'Probationary',
          dateHired: '2026-07-12',
          onboardingStartDate: '2026-07-12',
          targetCompletionDate: '2026-07-19',
          assignedHr: 'HR Administrator',
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
          status: 'In Progress',
          remarks: 'Undergoing software engineering workspace setup.',
          createdAt: '2026-07-10T09:15:00',
          updatedAt: '2026-07-16T16:00:00',
        },
        {
          id: 6,
          onboardingNumber: 'ONB-2026-006',
          employeeId: 6,
          employeeNumber: 'EMP-1006',
          employeeName: 'Kristine Bautista',
          email: 'kristine.bautista@rworkcentral.test',
          department: 'R Web Solutions',
          position: 'UI/UX Designer',
          employmentType: 'Regular',
          dateHired: '2025-09-12',
          onboardingStartDate: '2025-09-12',
          targetCompletionDate: '2025-09-19',
          assignedHr: 'HR Administrator',
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
          status: 'In Progress',
          remarks: 'Orientation and brand guide review ongoing.',
          createdAt: '2025-09-10T08:00:00',
          updatedAt: '2025-09-15T11:00:00',
        },
        {
          id: 7,
          onboardingNumber: 'ONB-2026-007',
          employeeId: 4,
          employeeNumber: 'EMP-1004',
          employeeName: 'Angela Mae Flores',
          email: 'angela.flores@rworkcentral.test',
          department: 'Airpro',
          position: 'Field Technician',
          employmentType: 'Regular',
          dateHired: '2023-11-12',
          onboardingStartDate: '2023-11-12',
          targetCompletionDate: '2023-11-19',
          assignedHr: 'HR Administrator',
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
          status: 'For Completion',
          remarks: 'Department endorsement pending.',
          createdAt: '2023-11-10T08:00:00',
          updatedAt: '2023-11-18T10:00:00',
        },
        {
          id: 8,
          onboardingNumber: 'ONB-2026-008',
          employeeId: 8,
          employeeNumber: 'EMP-1008',
          employeeName: 'Patricia Garcia',
          email: 'patricia.garcia@rworkcentral.test',
          department: 'R Web Solutions',
          position: 'Web Development Manager',
          employmentType: 'Regular',
          dateHired: '2022-09-12',
          onboardingStartDate: '2022-09-12',
          targetCompletionDate: '2022-09-19',
          assignedHr: 'HR Administrator',
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
          status: 'For Completion',
          remarks: 'Executive sign-off and endorsement in progress.',
          createdAt: '2022-09-10T08:00:00',
          updatedAt: '2022-09-17T14:30:00',
        },
        {
          id: 9,
          onboardingNumber: 'ONB-2026-009',
          employeeId: 2,
          employeeNumber: 'EMP-1002',
          employeeName: 'Maria Santos',
          email: 'maria.santos@rworkcentral.test',
          department: 'R Web Solutions',
          position: 'Project Coordinator',
          employmentType: 'Regular',
          dateHired: '2025-03-12',
          onboardingStartDate: '2025-03-12',
          targetCompletionDate: '2025-03-19',
          assignedHr: 'HR Administrator',
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
          status: 'Completed',
          remarks: 'Onboarding successfully completed.',
          createdAt: '2025-03-10T08:00:00',
          updatedAt: '2025-03-19T17:00:00',
        },
        {
          id: 10,
          onboardingNumber: 'ONB-2026-010',
          employeeId: 3,
          employeeNumber: 'EMP-1003',
          employeeName: 'Carlo Mendoza',
          email: 'carlo.mendoza@rworkcentral.test',
          department: 'Airpro',
          position: 'Lead Technician',
          employmentType: 'Regular',
          dateHired: '2024-07-12',
          onboardingStartDate: '2024-07-12',
          targetCompletionDate: '2024-07-19',
          assignedHr: 'HR Administrator',
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
          status: 'Completed',
          remarks: 'Onboarding successfully completed.',
          createdAt: '2024-07-10T08:00:00',
          updatedAt: '2024-07-19T16:30:00',
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
      'Part-Time',
      'Training',
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

      const inProgress =
        data.filter(
          item =>
            item.status ===
              'In Progress',
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
          inProgress.length,

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