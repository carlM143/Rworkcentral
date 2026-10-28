import type {
  PerformanceEvaluation,
  PerformanceEvaluationStatus,
  PerformanceRecommendation,
} from '~/types/performanceEvaluation'

export const usePerformanceEvaluations = () => {
  const evaluations =
    useState<PerformanceEvaluation[]>(
      'performance-evaluations',
      () => [
        {
          id: 1,

          evaluationNumber:
            'EVAL-2026-001',

          cycleCode:
            'PC-2026-Q3',

          cycleName:
            '2026 Q3 Performance Check-in',

          employeeId: 1,
          employeeNumber:
            'EMP-001',

          employeeName:
            'Juan Dela Cruz',

          department:
            'Operations',

          position:
            'Driver',

          evaluatorName:
            'Carlos Ramirez',

          evaluatorPosition:
            'Operations Supervisor',

          evaluationPeriodStart:
            '2026-07-01',

          evaluationPeriodEnd:
            '2026-09-30',

          dueDate:
            '2026-10-15',

          progress: 75,

          overallScore: 4.1,

          recommendation:
            'Exceeds Expectations',

          status:
            'In Progress',

          remarks:
            'Final supervisor comments pending.',
        },

        {
          id: 2,

          evaluationNumber:
            'EVAL-2026-002',

          cycleCode:
            'PC-2026-Q3',

          cycleName:
            '2026 Q3 Performance Check-in',

          employeeId: 2,
          employeeNumber:
            'EMP-002',

          employeeName:
            'Maria Santos',

          department:
            'Human Resources',

          position:
            'HR Administrator',

          evaluatorName:
            'General Manager',

          evaluatorPosition:
            'General Manager',

          evaluationPeriodStart:
            '2026-07-01',

          evaluationPeriodEnd:
            '2026-09-30',

          dueDate:
            '2026-10-15',

          progress: 100,

          overallScore: 4.7,

          recommendation:
            'Outstanding',

          status:
            'Completed',

          completedAt:
            '2026-10-05T14:30:00',

          remarks:
            'Evaluation completed.',
        },

        {
          id: 3,

          evaluationNumber:
            'EVAL-2026-003',

          cycleCode:
            'PC-2026-Q3',

          cycleName:
            '2026 Q3 Performance Check-in',

          employeeId: 3,
          employeeNumber:
            'EMP-003',

          employeeName:
            'Pedro Reyes',

          department:
            'Finance',

          position:
            'Finance Staff',

          evaluatorName:
            'Robert Castillo',

          evaluatorPosition:
            'Finance Officer',

          evaluationPeriodStart:
            '2026-07-01',

          evaluationPeriodEnd:
            '2026-09-30',

          dueDate:
            '2026-10-15',

          progress: 50,

          overallScore: 3.5,

          recommendation:
            'Meets Expectations',

          status:
            'In Progress',
        },

        {
          id: 4,

          evaluationNumber:
            'EVAL-2026-004',

          cycleCode:
            'PC-2026-Q3',

          cycleName:
            '2026 Q3 Performance Check-in',

          employeeId: 4,
          employeeNumber:
            'EMP-004',

          employeeName:
            'Ana Garcia',

          department:
            'Operations',

          position:
            'Operations Staff',

          evaluatorName:
            'Carlos Ramirez',

          evaluatorPosition:
            'Operations Supervisor',

          evaluationPeriodStart:
            '2026-07-01',

          evaluationPeriodEnd:
            '2026-09-30',

          dueDate:
            '2026-10-15',

          progress: 100,

          overallScore: 3.8,

          recommendation:
            'Meets Expectations',

          status:
            'For Review',

          remarks:
            'Waiting for HR final review.',
        },

        {
          id: 5,

          evaluationNumber:
            'EVAL-2026-005',

          cycleCode:
            'PC-2026-Q3',

          cycleName:
            '2026 Q3 Performance Check-in',

          employeeId: 5,
          employeeNumber:
            'EMP-005',

          employeeName:
            'Carlo Mendoza',

          department:
            'IT',

          position:
            'Software Developer',

          evaluatorName:
            'IT Manager',

          evaluatorPosition:
            'IT Manager',

          evaluationPeriodStart:
            '2026-07-01',

          evaluationPeriodEnd:
            '2026-09-30',

          dueDate:
            '2026-10-15',

          progress: 100,

          overallScore: 4.5,

          recommendation:
            'Outstanding',

          status:
            'Acknowledged',

          completedAt:
            '2026-10-03T11:00:00',

          acknowledgedAt:
            '2026-10-04T09:15:00',
        },

        {
          id: 6,

          evaluationNumber:
            'EVAL-2026-006',

          cycleCode:
            'PC-2026-Q3',

          cycleName:
            '2026 Q3 Performance Check-in',

          employeeId: 6,
          employeeNumber:
            'EMP-006',

          employeeName:
            'Angela Flores',

          department:
            'Billing',

          position:
            'Billing Staff',

          evaluatorName:
            'Billing Supervisor',

          evaluatorPosition:
            'Billing Supervisor',

          evaluationPeriodStart:
            '2026-07-01',

          evaluationPeriodEnd:
            '2026-09-30',

          dueDate:
            '2026-10-15',

          progress: 25,

          recommendation:
            'Pending',

          status:
            'In Progress',
        },

        {
          id: 7,

          evaluationNumber:
            'EVAL-2026-007',

          cycleCode:
            'PC-2026-Q3',

          cycleName:
            '2026 Q3 Performance Check-in',

          employeeId: 7,
          employeeNumber:
            'EMP-007',

          employeeName:
            'Mark Lopez',

          department:
            'IT',

          position:
            'IT Support',

          evaluatorName:
            'IT Manager',

          evaluatorPosition:
            'IT Manager',

          evaluationPeriodStart:
            '2026-07-01',

          evaluationPeriodEnd:
            '2026-09-30',

          dueDate:
            '2026-10-15',

          progress: 0,

          recommendation:
            'Pending',

          status:
            'Pending',
        },

        {
          id: 8,

          evaluationNumber:
            'EVAL-2026-008',

          cycleCode:
            'PC-PROB-OCT26',

          cycleName:
            'October 2026 Probationary Review',

          employeeId: 8,
          employeeNumber:
            'EMP-008',

          employeeName:
            'Jenny Ramos',

          department:
            'Human Resources',

          position:
            'HR Staff',

          evaluatorName:
            'Maria Santos',

          evaluatorPosition:
            'HR Administrator',

          evaluationPeriodStart:
            '2026-07-01',

          evaluationPeriodEnd:
            '2026-10-31',

          dueDate:
            '2026-11-05',

          progress: 30,

          overallScore: 3.2,

          recommendation:
            'Meets Expectations',

          status:
            'In Progress',
        },

        {
          id: 9,

          evaluationNumber:
            'EVAL-2026-009',

          cycleCode:
            'PC-2026-H1',

          cycleName:
            '2026 First Half Performance Review',

          employeeId: 9,
          employeeNumber:
            'EMP-009',

          employeeName:
            'Robert Castillo',

          department:
            'Finance',

          position:
            'Finance Officer',

          evaluatorName:
            'Finance Manager',

          evaluatorPosition:
            'Finance Manager',

          evaluationPeriodStart:
            '2026-01-01',

          evaluationPeriodEnd:
            '2026-06-30',

          dueDate:
            '2026-07-31',

          progress: 100,

          overallScore: 4.3,

          recommendation:
            'Exceeds Expectations',

          status:
            'Acknowledged',

          completedAt:
            '2026-07-20T09:30:00',

          acknowledgedAt:
            '2026-07-21T08:45:00',
        },

        {
          id: 10,

          evaluationNumber:
            'EVAL-2026-010',

          cycleCode:
            'PC-2026-H1',

          cycleName:
            '2026 First Half Performance Review',

          employeeId: 10,
          employeeNumber:
            'EMP-010',

          employeeName:
            'Grace Navarro',

          department:
            'Human Resources',

          position:
            'HR Staff',

          evaluatorName:
            'Maria Santos',

          evaluatorPosition:
            'HR Administrator',

          evaluationPeriodStart:
            '2026-01-01',

          evaluationPeriodEnd:
            '2026-06-30',

          dueDate:
            '2026-07-31',

          progress: 100,

          overallScore: 2.8,

          recommendation:
            'Needs Improvement',

          status:
            'Completed',

          completedAt:
            '2026-07-28T13:00:00',

          remarks:
            'Development plan recommended.',
        },

        {
          id: 11,

          evaluationNumber:
            'EVAL-2026-011',

          cycleCode:
            'PC-2026-Q3',

          cycleName:
            '2026 Q3 Performance Check-in',

          employeeId: 11,
          employeeNumber:
            'EMP-011',

          employeeName:
            'Leo Martinez',

          department:
            'Operations',

          position:
            'Driver',

          evaluatorName:
            'Carlos Ramirez',

          evaluatorPosition:
            'Operations Supervisor',

          evaluationPeriodStart:
            '2026-07-01',

          evaluationPeriodEnd:
            '2026-09-30',

          dueDate:
            '2026-10-15',

          progress: 90,

          overallScore: 4.0,

          recommendation:
            'Exceeds Expectations',

          status:
            'For Review',
        },

        {
          id: 12,

          evaluationNumber:
            'EVAL-2026-012',

          cycleCode:
            'PC-2026-Q3',

          cycleName:
            '2026 Q3 Performance Check-in',

          employeeId: 12,
          employeeNumber:
            'EMP-012',

          employeeName:
            'Claire Villanueva',

          department:
            'Operations',

          position:
            'Operations Coordinator',

          evaluatorName:
            'Operations Manager',

          evaluatorPosition:
            'Operations Manager',

          evaluationPeriodStart:
            '2026-07-01',

          evaluationPeriodEnd:
            '2026-09-30',

          dueDate:
            '2026-10-15',

          progress: 100,

          overallScore: 4.6,

          recommendation:
            'Outstanding',

          status:
            'Completed',

          completedAt:
            '2026-10-06T09:20:00',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const cycle =
    ref('')

  const department =
    ref('')

  const status =
    ref('')

  const recommendation =
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

  const cycleOptions =
    computed(() => {
      return [
        ...new Set(
          evaluations.value.map(
            item =>
              item.cycleName,
          ),
        ),
      ]
    })

  const departmentOptions =
    computed(() => {
      return [
        ...new Set(
          evaluations.value.map(
            item =>
              item.department,
          ),
        ),
      ].sort()
    })

  const statusOptions:
    PerformanceEvaluationStatus[] = [
      'Pending',
      'In Progress',
      'For Review',
      'Completed',
      'Acknowledged',
    ]

  const recommendationOptions:
    PerformanceRecommendation[] = [
      'Pending',
      'Needs Improvement',
      'Meets Expectations',
      'Exceeds Expectations',
      'Outstanding',
    ]

  /* =========================================================
     FILTERED
  ========================================================= */

  const filteredEvaluations =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return evaluations.value.filter(
        item => {
          const matchesSearch =
            !keyword ||
            item.evaluationNumber
              .toLowerCase()
              .includes(keyword) ||
            item.employeeNumber
              .toLowerCase()
              .includes(keyword) ||
            item.employeeName
              .toLowerCase()
              .includes(keyword) ||
            item.evaluatorName
              .toLowerCase()
              .includes(keyword)

          const matchesCycle =
            !cycle.value ||
            item.cycleName ===
              cycle.value

          const matchesDepartment =
            !department.value ||
            item.department ===
              department.value

          const matchesStatus =
            !status.value ||
            item.status ===
              status.value

          const matchesRecommendation =
            !recommendation.value ||
            item.recommendation ===
              recommendation.value

          return (
            matchesSearch &&
            matchesCycle &&
            matchesDepartment &&
            matchesStatus &&
            matchesRecommendation
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
        filteredEvaluations.value

      const scored =
        data.filter(
          item =>
            item.overallScore !==
            undefined,
        )

      const totalScore =
        scored.reduce(
          (
            total,
            item,
          ) =>
            total +
            (
              item.overallScore ??
              0
            ),
          0,
        )

      return {
        totalEvaluations:
          data.length,

        inProgress:
          data.filter(
            item =>
              item.status ===
                'In Progress' ||
              item.status ===
                'For Review',
          ).length,

        completed:
          data.filter(
            item =>
              item.status ===
                'Completed' ||
              item.status ===
                'Acknowledged',
          ).length,

        averageScore:
          scored.length > 0
            ? Number(
                (
                  totalScore /
                  scored.length
                ).toFixed(2),
              )
            : 0,
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
          filteredEvaluations
            .value.length /
            perPage.value,
        ),
      )
    })

  const paginatedEvaluations =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredEvaluations
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
        filteredEvaluations
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

        filteredEvaluations
          .value.length,
      )
    })

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value = ''
    cycle.value = ''
    department.value = ''
    status.value = ''
    recommendation.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      cycle,
      department,
      status,
      recommendation,
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
    evaluations,

    search,
    cycle,
    department,
    status,
    recommendation,

    currentPage,

    filteredEvaluations,
    paginatedEvaluations,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    cycleOptions,
    departmentOptions,
    statusOptions,
    recommendationOptions,

    resetFilters,
  }
}