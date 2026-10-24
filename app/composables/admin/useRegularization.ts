import type {
  EvaluationStatus,
  Recommendation,
  RegularizationRecord,
  RegularizationStatus,
} from '~/types/regularization'

export const useRegularization = () => {
  const records =
    useState<RegularizationRecord[]>(
      'employee-regularization-records',
      () => [
        {
          id: 1,

          regularizationNumber:
            'REG-2026-001',

          employeeId: 13,
          employeeNumber:
            'EMP-013',

          employeeName:
            'Joshua Fernandez',

          department:
            'Operations',

          position:
            'Driver',

          dateHired:
            '2026-04-15',

          probationEndDate:
            '2026-10-15',

          targetRegularizationDate:
            '2026-10-16',

          probationMonths: 6,

          evaluationStatus:
            'Completed',

          evaluationScore: 4.3,

          recommendation:
            'For Regularization',

          reviewedBy:
            'Carlos Ramirez',

          approvedBy:
            'Maria Santos',

          approvalDate:
            '2026-10-06',

          effectiveDate:
            '2026-10-16',

          documentsComplete:
            true,

          status:
            'Approved',

          remarks:
            'Recommended for regularization based on performance and attendance.',

          createdAt:
            '2026-09-20T08:00:00',

          updatedAt:
            '2026-10-06T15:00:00',
        },

        {
          id: 2,

          regularizationNumber:
            'REG-2026-002',

          employeeId: 14,
          employeeNumber:
            'EMP-014',

          employeeName:
            'Nicole Bautista',

          department:
            'Human Resources',

          position:
            'HR Assistant',

          dateHired:
            '2026-05-01',

          probationEndDate:
            '2026-11-01',

          targetRegularizationDate:
            '2026-11-02',

          probationMonths: 6,

          evaluationStatus:
            'In Progress',

          evaluationScore: 3.9,

          recommendation:
            'Pending',

          reviewedBy:
            'Maria Santos',

          documentsComplete:
            true,

          status:
            'For Evaluation',

          remarks:
            'Supervisor evaluation is currently ongoing.',

          createdAt:
            '2026-10-01T10:00:00',

          updatedAt:
            '2026-10-07T09:30:00',
        },

        {
          id: 3,

          regularizationNumber:
            'REG-2026-003',

          employeeId: 15,
          employeeNumber:
            'EMP-015',

          employeeName:
            'Kevin Ramos',

          department:
            'Information Technology',

          position:
            'Junior Developer',

          dateHired:
            '2026-04-20',

          probationEndDate:
            '2026-10-20',

          targetRegularizationDate:
            '2026-10-21',

          probationMonths: 6,

          evaluationStatus:
            'Completed',

          evaluationScore: 4.6,

          recommendation:
            'For Regularization',

          reviewedBy:
            'IT Manager',

          documentsComplete:
            true,

          status:
            'Recommended',

          remarks:
            'Strong technical performance and good attendance record.',

          createdAt:
            '2026-09-18T09:00:00',

          updatedAt:
            '2026-10-07T13:20:00',
        },

        {
          id: 4,

          regularizationNumber:
            'REG-2026-004',

          employeeId: 16,
          employeeNumber:
            'EMP-016',

          employeeName:
            'Samantha Cruz',

          department:
            'Finance',

          position:
            'Accounting Staff',

          dateHired:
            '2026-05-10',

          probationEndDate:
            '2026-11-10',

          targetRegularizationDate:
            '2026-11-11',

          probationMonths: 6,

          evaluationStatus:
            'Pending',

          recommendation:
            'Pending',

          documentsComplete:
            false,

          status:
            'For Evaluation',

          remarks:
            'Awaiting performance evaluation and document completion.',

          createdAt:
            '2026-10-02T08:15:00',

          updatedAt:
            '2026-10-06T11:00:00',
        },

        {
          id: 5,

          regularizationNumber:
            'REG-2026-005',

          employeeId: 17,
          employeeNumber:
            'EMP-017',

          employeeName:
            'Miguel Torres',

          department:
            'Billing',

          position:
            'Billing Assistant',

          dateHired:
            '2026-04-01',

          probationEndDate:
            '2026-10-01',

          targetRegularizationDate:
            '2026-10-02',

          probationMonths: 6,

          evaluationStatus:
            'Completed',

          evaluationScore: 3.0,

          recommendation:
            'Extend Probation',

          reviewedBy:
            'Billing Supervisor',

          approvedBy:
            'Maria Santos',

          approvalDate:
            '2026-09-28',

          documentsComplete:
            true,

          status:
            'Extended',

          remarks:
            'Probation extended for 60 days due to performance concerns.',

          createdAt:
            '2026-09-12T09:30:00',

          updatedAt:
            '2026-10-01T10:00:00',
        },

        {
          id: 6,

          regularizationNumber:
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

          dateHired:
            '2026-03-15',

          probationEndDate:
            '2026-09-15',

          targetRegularizationDate:
            '2026-09-16',

          probationMonths: 6,

          evaluationStatus:
            'Completed',

          evaluationScore: 4.5,

          recommendation:
            'For Regularization',

          reviewedBy:
            'Operations Manager',

          approvedBy:
            'Maria Santos',

          approvalDate:
            '2026-09-10',

          effectiveDate:
            '2026-09-16',

          documentsComplete:
            true,

          status:
            'Regularized',

          remarks:
            'Regularization completed successfully.',

          createdAt:
            '2026-08-20T08:00:00',

          updatedAt:
            '2026-09-16T08:30:00',
        },

        {
          id: 7,

          regularizationNumber:
            'REG-2026-007',

          employeeId: 19,
          employeeNumber:
            'EMP-019',

          employeeName:
            'John Paul Garcia',

          department:
            'Operations',

          position:
            'Driver',

          dateHired:
            '2026-04-25',

          probationEndDate:
            '2026-10-25',

          targetRegularizationDate:
            '2026-10-26',

          probationMonths: 6,

          evaluationStatus:
            'Completed',

          evaluationScore: 2.4,

          recommendation:
            'Not Recommended',

          reviewedBy:
            'Carlos Ramirez',

          documentsComplete:
            true,

          status:
            'Not Recommended',

          remarks:
            'Performance and attendance requirements were not met.',

          createdAt:
            '2026-09-25T08:45:00',

          updatedAt:
            '2026-10-07T15:10:00',
        },

        {
          id: 8,

          regularizationNumber:
            'REG-2026-008',

          employeeId: 20,
          employeeNumber:
            'EMP-020',

          employeeName:
            'Patricia Lim',

          department:
            'Finance',

          position:
            'Payroll Assistant',

          dateHired:
            '2026-05-15',

          probationEndDate:
            '2026-11-15',

          targetRegularizationDate:
            '2026-11-16',

          probationMonths: 6,

          evaluationStatus:
            'In Progress',

          evaluationScore: 3.7,

          recommendation:
            'Pending',

          reviewedBy:
            'Finance Manager',

          documentsComplete:
            true,

          status:
            'For Review',

          remarks:
            'Evaluation is being reviewed by the department head.',

          createdAt:
            '2026-10-03T09:00:00',

          updatedAt:
            '2026-10-07T14:00:00',
        },

        {
          id: 9,

          regularizationNumber:
            'REG-2026-009',

          employeeId: 21,
          employeeNumber:
            'EMP-021',

          employeeName:
            'Jerome Villanueva',

          department:
            'Information Technology',

          position:
            'IT Support',

          dateHired:
            '2026-04-12',

          probationEndDate:
            '2026-10-12',

          targetRegularizationDate:
            '2026-10-13',

          probationMonths: 6,

          evaluationStatus:
            'Completed',

          evaluationScore: 4.0,

          recommendation:
            'For Regularization',

          reviewedBy:
            'IT Manager',

          documentsComplete:
            false,

          status:
            'Recommended',

          remarks:
            'For HR review. One document still pending.',

          createdAt:
            '2026-09-20T10:00:00',

          updatedAt:
            '2026-10-07T16:00:00',
        },

        {
          id: 10,

          regularizationNumber:
            'REG-2026-010',

          employeeId: 22,
          employeeNumber:
            'EMP-022',

          employeeName:
            'Camille Reyes',

          department:
            'Human Resources',

          position:
            'Recruitment Assistant',

          dateHired:
            '2026-05-20',

          probationEndDate:
            '2026-11-20',

          targetRegularizationDate:
            '2026-11-21',

          probationMonths: 6,

          evaluationStatus:
            'Pending',

          recommendation:
            'Pending',

          documentsComplete:
            true,

          status:
            'For Evaluation',

          remarks:
            'Evaluation schedule has not yet started.',

          createdAt:
            '2026-10-05T08:00:00',

          updatedAt:
            '2026-10-07T09:00:00',
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

  const evaluationStatus =
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
          records.value.map(
            item =>
              item.department,
          ),
        ),
      ].sort()
    })

  const evaluationStatusOptions:
    EvaluationStatus[] = [
      'Pending',
      'In Progress',
      'Completed',
    ]

  const recommendationOptions:
    Recommendation[] = [
      'Pending',
      'For Regularization',
      'Extend Probation',
      'Not Recommended',
    ]

  const statusOptions:
    RegularizationStatus[] = [
      'For Evaluation',
      'For Review',
      'Recommended',
      'Approved',
      'Regularized',
      'Extended',
      'Not Recommended',
    ]

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
            item.regularizationNumber
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
              .includes(keyword)

          const matchesDepartment =
            !department.value ||
            item.department ===
              department.value

          const matchesEvaluation =
            !evaluationStatus.value ||
            item.evaluationStatus ===
              evaluationStatus.value

          const matchesStatus =
            !status.value ||
            item.status ===
              status.value

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesEvaluation &&
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

        dueSoon:
          data.filter(
            item =>
              item.status ===
                'For Evaluation' ||
              item.status ===
                'For Review',
          ).length,

        recommended:
          data.filter(
            item =>
              item.status ===
                'Recommended' ||
              item.status ===
                'Approved',
          ).length,

        regularized:
          data.filter(
            item =>
              item.status ===
              'Regularized',
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
    department.value = ''
    evaluationStatus.value = ''
    status.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      department,
      evaluationStatus,
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
    department,
    evaluationStatus,
    status,

    currentPage,

    filteredRecords,
    paginatedRecords,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    departmentOptions,
    evaluationStatusOptions,
    recommendationOptions,
    statusOptions,

    resetFilters,
  }
}