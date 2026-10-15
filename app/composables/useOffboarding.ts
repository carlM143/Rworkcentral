import type {
  FinalPayStatus,
  OffboardingRecord,
  OffboardingStatus,
  OffboardingType,
} from '~/types/offboarding'

export const useOffboarding = () => {
  const records =
    useState<OffboardingRecord[]>(
      'employee-lifecycle-offboarding',
      () => [
        {
          id: 1,

          offboardingNumber:
            'OFF-2026-001',

          employeeId: 21,
          employeeNumber:
            'EMP-021',

          employeeName:
            'Jerome Villanueva',

          department:
            'Information Technology',

          position:
            'IT Support',

          offboardingType:
            'Resignation',

          noticeDate:
            '2026-09-20',

          lastWorkingDay:
            '2026-10-20',

          separationDate:
            '2026-10-21',

          initiatedBy:
            'Maria Santos',

          reason:
            'Employee submitted voluntary resignation for a new career opportunity.',

          checklist: {
            hrClearance: true,
            departmentClearance: true,
            financeClearance: false,
            itClearance: true,
            assetReturn: true,
            exitInterview: false,
          },

          completedTasks: 4,
          totalTasks: 6,
          clearanceProgress: 67,

          finalPayStatus:
            'Not Started',

          exitInterviewDate:
            '2026-10-18',

          approvedBy:
            'General Manager',

          status:
            'Clearance In Progress',

          remarks:
            'Finance clearance and exit interview still pending.',

          createdAt:
            '2026-09-20T09:00:00',

          updatedAt:
            '2026-10-07T14:30:00',
        },

        {
          id: 2,

          offboardingNumber:
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

          offboardingType:
            'End of Contract',

          noticeDate:
            '2026-09-25',

          lastWorkingDay:
            '2026-10-15',

          separationDate:
            '2026-10-16',

          initiatedBy:
            'Billing Supervisor',

          reason:
            'Fixed-term employment contract has reached its scheduled end date.',

          checklist: {
            hrClearance: true,
            departmentClearance: true,
            financeClearance: true,
            itClearance: true,
            assetReturn: true,
            exitInterview: true,
          },

          completedTasks: 6,
          totalTasks: 6,
          clearanceProgress: 100,

          finalPayStatus:
            'Ready for Release',

          exitInterviewDate:
            '2026-10-14',

          approvedBy:
            'Maria Santos',

          status:
            'Ready for Final Pay',

          remarks:
            'Clearance complete. Final pay is ready for release.',

          createdAt:
            '2026-09-25T08:00:00',

          updatedAt:
            '2026-10-07T11:00:00',
        },

        {
          id: 3,

          offboardingNumber:
            'OFF-2026-003',

          employeeId: 11,
          employeeNumber:
            'EMP-011',

          employeeName:
            'Leo Martinez',

          department:
            'Operations',

          position:
            'Driver',

          offboardingType:
            'End of Contract',

          noticeDate:
            '2026-10-01',

          lastWorkingDay:
            '2026-10-31',

          separationDate:
            '2026-11-01',

          initiatedBy:
            'Operations Manager',

          reason:
            'Project-based assignment will end after client contract completion.',

          checklist: {
            hrClearance: false,
            departmentClearance: false,
            financeClearance: false,
            itClearance: true,
            assetReturn: false,
            exitInterview: false,
          },

          completedTasks: 1,
          totalTasks: 6,
          clearanceProgress: 17,

          finalPayStatus:
            'Not Started',

          status:
            'Pending Clearance',

          remarks:
            'Clearance process will begin one week before last working day.',

          createdAt:
            '2026-10-01T10:15:00',

          updatedAt:
            '2026-10-07T09:00:00',
        },

        {
          id: 4,

          offboardingNumber:
            'OFF-2026-004',

          employeeId: 6,
          employeeNumber:
            'EMP-006',

          employeeName:
            'Angela Flores',

          department:
            'Billing',

          position:
            'Billing Staff',

          offboardingType:
            'Resignation',

          noticeDate:
            '2026-10-03',

          lastWorkingDay:
            '2026-11-02',

          separationDate:
            '2026-11-03',

          initiatedBy:
            'Maria Santos',

          reason:
            'Employee submitted resignation due to relocation.',

          checklist: {
            hrClearance: false,
            departmentClearance: false,
            financeClearance: false,
            itClearance: false,
            assetReturn: false,
            exitInterview: false,
          },

          completedTasks: 0,
          totalTasks: 6,
          clearanceProgress: 0,

          finalPayStatus:
            'Not Started',

          status:
            'Draft',

          remarks:
            'Offboarding record still being prepared.',

          createdAt:
            '2026-10-03T13:00:00',

          updatedAt:
            '2026-10-03T13:00:00',
        },

        {
          id: 5,

          offboardingNumber:
            'OFF-2026-005',

          employeeId: 19,
          employeeNumber:
            'EMP-019',

          employeeName:
            'John Paul Garcia',

          department:
            'Operations',

          position:
            'Driver',

          offboardingType:
            'Termination',

          noticeDate:
            '2026-09-28',

          lastWorkingDay:
            '2026-09-30',

          separationDate:
            '2026-10-01',

          initiatedBy:
            'Operations Manager',

          reason:
            'Employment separation following management review and due process.',

          checklist: {
            hrClearance: true,
            departmentClearance: true,
            financeClearance: true,
            itClearance: true,
            assetReturn: true,
            exitInterview: false,
          },

          completedTasks: 5,
          totalTasks: 6,
          clearanceProgress: 83,

          finalPayStatus:
            'For Review',

          approvedBy:
            'General Manager',

          status:
            'For Review',

          remarks:
            'Final pay computation is being reviewed.',

          createdAt:
            '2026-09-28T08:30:00',

          updatedAt:
            '2026-10-07T15:00:00',
        },

        {
          id: 6,

          offboardingNumber:
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

          offboardingType:
            'Retirement',

          noticeDate:
            '2026-08-15',

          lastWorkingDay:
            '2026-09-30',

          separationDate:
            '2026-10-01',

          initiatedBy:
            'Maria Santos',

          reason:
            'Employee has reached voluntary retirement after long service.',

          checklist: {
            hrClearance: true,
            departmentClearance: true,
            financeClearance: true,
            itClearance: true,
            assetReturn: true,
            exitInterview: true,
          },

          completedTasks: 6,
          totalTasks: 6,
          clearanceProgress: 100,

          finalPayStatus:
            'Released',

          exitInterviewDate:
            '2026-09-28',

          approvedBy:
            'General Manager',

          status:
            'Completed',

          remarks:
            'Offboarding and retirement benefits successfully completed.',

          createdAt:
            '2026-08-15T08:00:00',

          updatedAt:
            '2026-10-01T16:00:00',
        },

        {
          id: 7,

          offboardingNumber:
            'OFF-2026-007',

          employeeId: 25,
          employeeNumber:
            'EMP-025',

          employeeName:
            'Melissa Tan',

          department:
            'Finance',

          position:
            'Accounting Assistant',

          offboardingType:
            'Resignation',

          noticeDate:
            '2026-09-10',

          lastWorkingDay:
            '2026-10-10',

          separationDate:
            '2026-10-11',

          initiatedBy:
            'Finance Manager',

          reason:
            'Employee resigned to pursue graduate studies.',

          checklist: {
            hrClearance: true,
            departmentClearance: true,
            financeClearance: true,
            itClearance: true,
            assetReturn: true,
            exitInterview: true,
          },

          completedTasks: 6,
          totalTasks: 6,
          clearanceProgress: 100,

          finalPayStatus:
            'For Processing',

          exitInterviewDate:
            '2026-10-08',

          approvedBy:
            'Maria Santos',

          status:
            'Ready for Final Pay',

          createdAt:
            '2026-09-10T09:00:00',

          updatedAt:
            '2026-10-07T16:00:00',
        },

        {
          id: 8,

          offboardingNumber:
            'OFF-2026-008',

          employeeId: 27,
          employeeNumber:
            'EMP-027',

          employeeName:
            'Daniel Cruz',

          department:
            'Information Technology',

          position:
            'Junior Developer',

          offboardingType:
            'Resignation',

          noticeDate:
            '2026-10-05',

          lastWorkingDay:
            '2026-11-04',

          separationDate:
            '2026-11-05',

          initiatedBy:
            'IT Manager',

          reason:
            'Employee submitted voluntary resignation.',

          checklist: {
            hrClearance: false,
            departmentClearance: false,
            financeClearance: false,
            itClearance: false,
            assetReturn: false,
            exitInterview: false,
          },

          completedTasks: 0,
          totalTasks: 6,
          clearanceProgress: 0,

          finalPayStatus:
            'Not Started',

          status:
            'Pending Clearance',

          createdAt:
            '2026-10-05T14:00:00',

          updatedAt:
            '2026-10-07T08:30:00',
        },

        {
          id: 9,

          offboardingNumber:
            'OFF-2026-009',

          employeeId: 28,
          employeeNumber:
            'EMP-028',

          employeeName:
            'Sarah Mendoza',

          department:
            'Human Resources',

          position:
            'Recruitment Assistant',

          offboardingType:
            'End of Contract',

          noticeDate:
            '2026-09-15',

          lastWorkingDay:
            '2026-10-15',

          separationDate:
            '2026-10-16',

          initiatedBy:
            'Maria Santos',

          reason:
            'Temporary recruitment support contract has ended.',

          checklist: {
            hrClearance: true,
            departmentClearance: true,
            financeClearance: false,
            itClearance: true,
            assetReturn: true,
            exitInterview: true,
          },

          completedTasks: 5,
          totalTasks: 6,
          clearanceProgress: 83,

          finalPayStatus:
            'For Processing',

          exitInterviewDate:
            '2026-10-13',

          approvedBy:
            'General Manager',

          status:
            'Clearance In Progress',

          remarks:
            'Finance clearance remains pending.',

          createdAt:
            '2026-09-15T11:00:00',

          updatedAt:
            '2026-10-07T13:45:00',
        },

        {
          id: 10,

          offboardingNumber:
            'OFF-2026-010',

          employeeId: 30,
          employeeNumber:
            'EMP-030',

          employeeName:
            'Ramon Bautista',

          department:
            'Operations',

          position:
            'Operations Staff',

          offboardingType:
            'Redundancy',

          noticeDate:
            '2026-10-01',

          lastWorkingDay:
            '2026-10-31',

          separationDate:
            '2026-11-01',

          initiatedBy:
            'General Manager',

          reason:
            'Position affected by operational restructuring.',

          checklist: {
            hrClearance: true,
            departmentClearance: false,
            financeClearance: false,
            itClearance: false,
            assetReturn: false,
            exitInterview: false,
          },

          completedTasks: 1,
          totalTasks: 6,
          clearanceProgress: 17,

          finalPayStatus:
            'Not Started',

          approvedBy:
            'General Manager',

          status:
            'Pending Clearance',

          remarks:
            'HR has initiated the separation process.',

          createdAt:
            '2026-10-01T08:00:00',

          updatedAt:
            '2026-10-07T15:30:00',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const offboardingType =
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

  const offboardingTypeOptions:
    OffboardingType[] = [
      'Resignation',
      'End of Contract',
      'Retirement',
      'Termination',
      'Redundancy',
    ]

  const statusOptions:
    OffboardingStatus[] = [
      'Draft',
      'Pending Clearance',
      'Clearance In Progress',
      'For Review',
      'Ready for Final Pay',
      'Completed',
      'Cancelled',
    ]

  const finalPayStatusOptions:
    FinalPayStatus[] = [
      'Not Started',
      'For Processing',
      'For Review',
      'Ready for Release',
      'Released',
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
     FILTERED
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
            item.offboardingNumber
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
            item.reason
              .toLowerCase()
              .includes(keyword)

          const matchesType =
            !offboardingType.value ||
            item.offboardingType ===
              offboardingType.value

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

        active:
          data.filter(
            item =>
              item.status ===
                'Pending Clearance' ||
              item.status ===
                'Clearance In Progress' ||
              item.status ===
                'For Review',
          ).length,

        finalPay:
          data.filter(
            item =>
              item.status ===
              'Ready for Final Pay',
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
    offboardingType.value = ''
    department.value = ''
    status.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      offboardingType,
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

  return {
    records,

    search,
    offboardingType,
    department,
    status,

    currentPage,

    filteredRecords,
    paginatedRecords,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    offboardingTypeOptions,
    departmentOptions,
    statusOptions,
    finalPayStatusOptions,

    resetFilters,
  }
}