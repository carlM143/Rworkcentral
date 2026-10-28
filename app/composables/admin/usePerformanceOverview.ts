import type {
  EvaluationStatus,
  EvaluationType,
  PerformanceActivity,
  PerformanceCycle,
  PerformanceEvaluation,
} from '~/types/performance'

export const usePerformanceOverview = () => {
  const {
    employees,
  } = useEmployees()

  /* =========================================================
     CURRENT CYCLE
  ========================================================= */

  const currentCycle =
    ref<PerformanceCycle>({
      id: 1,

      name:
        '2026 Annual Performance Review',

      dateFrom:
        '2026-09-01',

      dateTo:
        '2026-09-30',

      totalEmployees: 12,

      completedEmployees: 4,

      progress: 33,

      status:
        'Active',
    })

  /* =========================================================
     EMPLOYEE HELPER
  ========================================================= */

  const employeeById = (
    id: number,
  ) => {
    return employees.value.find(
      employee =>
        employee.id === id,
    )
  }

  const createEvaluation = (
    data: {
      id: number
      employeeId: number

      evaluator: string

      evaluationType: EvaluationType

      dueDate: string

      score?: number
      rating?: string

      status: EvaluationStatus
    },
  ): PerformanceEvaluation => {
    const employee =
      employeeById(
        data.employeeId,
      )

    if (!employee) {
      throw new Error(
        `Employee ${data.employeeId} not found`,
      )
    }

    return {
      id:
        data.id,

      employeeId:
        employee.id,

      employeeNumber:
        employee.employeeNumber,

      employeeName: [
        employee.firstName,
        employee.middleName,
        employee.lastName,
      ]
        .filter(Boolean)
        .join(' '),

      department:
        employee.department,

      position:
        employee.position,

      evaluator:
        data.evaluator,

      evaluationType:
        data.evaluationType,

      dueDate:
        data.dueDate,

      score:
        data.score,

      rating:
        data.rating,

      status:
        data.status,
    }
  }

  /* =========================================================
     MOCK EVALUATIONS
  ========================================================= */

  const evaluations =
    ref<PerformanceEvaluation[]>([
      createEvaluation({
        id: 1,
        employeeId: 1,

        evaluator:
          'Leo Martinez',

        evaluationType:
          'Annual',

        dueDate:
          '2026-09-15',

        score: 92,

        rating:
          'Outstanding',

        status:
          'Completed',
      }),

      createEvaluation({
        id: 2,
        employeeId: 2,

        evaluator:
          'Claire Villanueva',

        evaluationType:
          'Annual',

        dueDate:
          '2026-09-15',

        score: 88,

        rating:
          'Very Good',

        status:
          'Completed',
      }),

      createEvaluation({
        id: 3,
        employeeId: 3,

        evaluator:
          'Maria Santos',

        evaluationType:
          'Annual',

        dueDate:
          '2026-09-18',

        status:
          'In Progress',
      }),

      createEvaluation({
        id: 4,
        employeeId: 4,

        evaluator:
          'Leo Martinez',

        evaluationType:
          'Annual',

        dueDate:
          '2026-09-10',

        status:
          'Not Started',
      }),

      createEvaluation({
        id: 5,
        employeeId: 5,

        evaluator:
          'Leo Martinez',

        evaluationType:
          'Annual',

        dueDate:
          '2026-09-15',

        score: 84,

        rating:
          'Very Good',

        status:
          'Completed',
      }),

      createEvaluation({
        id: 6,
        employeeId: 6,

        evaluator:
          'Maria Santos',

        evaluationType:
          'Annual',

        dueDate:
          '2026-09-12',

        status:
          'In Progress',
      }),

      createEvaluation({
        id: 7,
        employeeId: 7,

        evaluator:
          'Leo Martinez',

        evaluationType:
          'Probationary',

        dueDate:
          '2026-09-08',

        status:
          'Overdue',
      }),

      createEvaluation({
        id: 8,
        employeeId: 8,

        evaluator:
          'Claire Villanueva',

        evaluationType:
          'Annual',

        dueDate:
          '2026-09-20',

        status:
          'Not Started',
      }),

      createEvaluation({
        id: 9,
        employeeId: 9,

        evaluator:
          'Maria Santos',

        evaluationType:
          'Annual',

        dueDate:
          '2026-09-15',

        score: 90,

        rating:
          'Outstanding',

        status:
          'Completed',
      }),

      createEvaluation({
        id: 10,
        employeeId: 10,

        evaluator:
          'Maria Santos',

        evaluationType:
          'Probationary',

        dueDate:
          '2026-09-25',

        status:
          'Not Started',
      }),
    ])

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const department =
    ref('')

  const status =
    ref('')

  const currentPage =
    ref(1)

  const perPage =
    ref(6)

  const filteredEvaluations =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return evaluations.value.filter(
        evaluation => {
          const matchesSearch =
            !keyword ||
            evaluation.employeeName
              .toLowerCase()
              .includes(keyword) ||
            evaluation.employeeNumber
              .toLowerCase()
              .includes(keyword)

          const matchesDepartment =
            !department.value ||
            evaluation.department ===
              department.value

          const matchesStatus =
            !status.value ||
            evaluation.status ===
              status.value

          return (
            matchesSearch &&
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
      const completed =
        evaluations.value.filter(
          item =>
            item.status ===
            'Completed',
        ).length

      const ongoing =
        evaluations.value.filter(
          item =>
            item.status ===
            'In Progress',
        ).length

      const overdue =
        evaluations.value.filter(
          item =>
            item.status ===
            'Overdue',
        ).length

      const scored =
        evaluations.value.filter(
          item =>
            item.score !== undefined,
        )

      const averageScore =
        scored.length
          ? scored.reduce(
              (
                total,
                item,
              ) =>
                total +
                (item.score ?? 0),
              0,
            ) /
            scored.length
          : 0

      return {
        total:
          evaluations.value.length,

        completed,

        ongoing,

        overdue,

        averageScore:
          Number(
            averageScore.toFixed(1),
          ),
      }
    })

  /* =========================================================
     DUE SOON
  ========================================================= */

  const dueSoon =
    computed(() => {
      return evaluations.value
        .filter(
          item =>
            item.status !==
              'Completed' &&
            item.status !==
              'Overdue',
        )
        .sort(
          (
            a,
            b,
          ) =>
            a.dueDate.localeCompare(
              b.dueDate,
            ),
        )
        .slice(0, 4)
    })

  /* =========================================================
     RATINGS
  ========================================================= */

  const ratingSummary =
    computed(() => ({
      outstanding:
        evaluations.value.filter(
          item =>
            item.rating ===
            'Outstanding',
        ).length,

      veryGood:
        evaluations.value.filter(
          item =>
            item.rating ===
            'Very Good',
        ).length,

      completed:
        evaluations.value.filter(
          item =>
            item.status ===
            'Completed',
        ).length,

      unscored:
        evaluations.value.filter(
          item =>
            item.score === undefined,
        ).length,
    }))

  /* =========================================================
     ACTIVITY
  ========================================================= */

  const recentActivity =
    ref<PerformanceActivity[]>([
      {
        id: 1,

        employeeName:
          'Juan Dela Cruz',

        action:
          'Evaluation Completed',

        description:
          'Annual performance evaluation completed with a score of 92.',

        date:
          '2026-09-04',
      },

      {
        id: 2,

        employeeName:
          'Robert Castillo',

        action:
          'Evaluation Completed',

        description:
          'Annual performance evaluation completed with a score of 90.',

        date:
          '2026-09-04',
      },

      {
        id: 3,

        employeeName:
          'Pedro Reyes',

        action:
          'Evaluation Started',

        description:
          'Annual evaluation is currently in progress.',

        date:
          '2026-09-03',
      },
    ])

  /* =========================================================
     OPTIONS
  ========================================================= */

  const departments =
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
    EvaluationStatus[] = [
      'Not Started',
      'In Progress',
      'Completed',
      'Overdue',
    ]

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages =
    computed(() => {
      return Math.max(
        1,
        Math.ceil(
          filteredEvaluations.value.length /
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

      return filteredEvaluations.value.slice(
        start,
        start +
          perPage.value,
      )
    })

  const showingFrom =
    computed(() => {
      if (
        !filteredEvaluations.value.length
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

        filteredEvaluations.value.length,
      )
    })

  const resetFilters = () => {
    search.value = ''
    department.value = ''
    status.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      department,
      status,
    ],
    () => {
      currentPage.value = 1
    },
  )

  return {
    currentCycle,

    evaluations,

    search,
    department,
    status,

    currentPage,

    filteredEvaluations,
    paginatedEvaluations,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    dueSoon,
    ratingSummary,

    recentActivity,

    departments,
    statusOptions,

    resetFilters,
  }
}