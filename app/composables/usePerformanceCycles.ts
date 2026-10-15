import type {
  PerformanceCycle,
  PerformanceCycleStatus,
  PerformanceCycleType,
} from '~/types/performanceCycle'

export const usePerformanceCycles = () => {
  const cycles =
    useState<PerformanceCycle[]>(
      'performance-cycles',
      () => [
        {
          id: 1,

          cycleCode:
            'PC-2026-ANNUAL',

          name:
            '2026 Annual Performance Review',

          type:
            'Annual Review',

          evaluationYear: 2026,

          performancePeriodStart:
            '2026-01-01',

          performancePeriodEnd:
            '2026-12-31',

          evaluationStart:
            '2026-12-01',

          evaluationEnd:
            '2027-01-15',

          totalEmployees: 125,

          completedEvaluations: 0,
          pendingEvaluations: 125,

          status:
            'Scheduled',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-08-01T09:00:00',

          updatedAt:
            '2026-09-28T10:30:00',

          remarks:
            'Company-wide annual performance evaluation.',
        },

        {
          id: 2,

          cycleCode:
            'PC-2026-H1',

          name:
            '2026 First Half Performance Review',

          type:
            'Semi-Annual Review',

          evaluationYear: 2026,

          performancePeriodStart:
            '2026-01-01',

          performancePeriodEnd:
            '2026-06-30',

          evaluationStart:
            '2026-07-01',

          evaluationEnd:
            '2026-07-31',

          totalEmployees: 118,

          completedEvaluations: 118,
          pendingEvaluations: 0,

          status:
            'Completed',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-05-15T08:30:00',

          updatedAt:
            '2026-08-01T11:00:00',
        },

        {
          id: 3,

          cycleCode:
            'PC-2026-H2',

          name:
            '2026 Second Half Performance Review',

          type:
            'Semi-Annual Review',

          evaluationYear: 2026,

          performancePeriodStart:
            '2026-07-01',

          performancePeriodEnd:
            '2026-12-31',

          evaluationStart:
            '2026-12-15',

          evaluationEnd:
            '2027-01-31',

          totalEmployees: 125,

          completedEvaluations: 0,
          pendingEvaluations: 125,

          status:
            'Draft',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-15T09:00:00',

          updatedAt:
            '2026-10-01T14:20:00',
        },

        {
          id: 4,

          cycleCode:
            'PC-2026-Q1',

          name:
            '2026 Q1 Performance Check-in',

          type:
            'Quarterly Review',

          evaluationYear: 2026,

          performancePeriodStart:
            '2026-01-01',

          performancePeriodEnd:
            '2026-03-31',

          evaluationStart:
            '2026-04-01',

          evaluationEnd:
            '2026-04-15',

          totalEmployees: 110,

          completedEvaluations: 108,
          pendingEvaluations: 2,

          status:
            'Completed',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-03-01T09:00:00',

          updatedAt:
            '2026-04-20T10:00:00',
        },

        {
          id: 5,

          cycleCode:
            'PC-2026-Q2',

          name:
            '2026 Q2 Performance Check-in',

          type:
            'Quarterly Review',

          evaluationYear: 2026,

          performancePeriodStart:
            '2026-04-01',

          performancePeriodEnd:
            '2026-06-30',

          evaluationStart:
            '2026-07-01',

          evaluationEnd:
            '2026-07-15',

          totalEmployees: 118,

          completedEvaluations: 116,
          pendingEvaluations: 2,

          status:
            'Completed',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-06-01T09:30:00',

          updatedAt:
            '2026-07-20T13:00:00',
        },

        {
          id: 6,

          cycleCode:
            'PC-2026-Q3',

          name:
            '2026 Q3 Performance Check-in',

          type:
            'Quarterly Review',

          evaluationYear: 2026,

          performancePeriodStart:
            '2026-07-01',

          performancePeriodEnd:
            '2026-09-30',

          evaluationStart:
            '2026-10-01',

          evaluationEnd:
            '2026-10-20',

          totalEmployees: 125,

          completedEvaluations: 67,
          pendingEvaluations: 58,

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-01T08:45:00',

          updatedAt:
            '2026-10-06T10:15:00',

          remarks:
            'Evaluation currently ongoing.',
        },

        {
          id: 7,

          cycleCode:
            'PC-2026-Q4',

          name:
            '2026 Q4 Performance Check-in',

          type:
            'Quarterly Review',

          evaluationYear: 2026,

          performancePeriodStart:
            '2026-10-01',

          performancePeriodEnd:
            '2026-12-31',

          evaluationStart:
            '2027-01-02',

          evaluationEnd:
            '2027-01-20',

          totalEmployees: 125,

          completedEvaluations: 0,
          pendingEvaluations: 125,

          status:
            'Scheduled',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-25T11:00:00',

          updatedAt:
            '2026-10-02T08:30:00',
        },

        {
          id: 8,

          cycleCode:
            'PC-PROB-SEP26',

          name:
            'September 2026 Probationary Review',

          type:
            'Probationary Review',

          evaluationYear: 2026,

          performancePeriodStart:
            '2026-06-01',

          performancePeriodEnd:
            '2026-09-30',

          evaluationStart:
            '2026-09-20',

          evaluationEnd:
            '2026-10-05',

          totalEmployees: 12,

          completedEvaluations: 12,
          pendingEvaluations: 0,

          status:
            'Completed',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-10T09:15:00',

          updatedAt:
            '2026-10-05T16:20:00',
        },

        {
          id: 9,

          cycleCode:
            'PC-PROB-OCT26',

          name:
            'October 2026 Probationary Review',

          type:
            'Probationary Review',

          evaluationYear: 2026,

          performancePeriodStart:
            '2026-07-01',

          performancePeriodEnd:
            '2026-10-31',

          evaluationStart:
            '2026-10-20',

          evaluationEnd:
            '2026-11-05',

          totalEmployees: 8,

          completedEvaluations: 0,
          pendingEvaluations: 8,

          status:
            'Scheduled',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-10-01T10:00:00',

          updatedAt:
            '2026-10-04T09:45:00',
        },

        {
          id: 10,

          cycleCode:
            'PC-2025-ANNUAL',

          name:
            '2025 Annual Performance Review',

          type:
            'Annual Review',

          evaluationYear: 2025,

          performancePeriodStart:
            '2025-01-01',

          performancePeriodEnd:
            '2025-12-31',

          evaluationStart:
            '2025-12-01',

          evaluationEnd:
            '2026-01-15',

          totalEmployees: 102,

          completedEvaluations: 102,
          pendingEvaluations: 0,

          status:
            'Archived',

          createdBy:
            'Maria Santos',

          createdAt:
            '2025-10-01T08:00:00',

          updatedAt:
            '2026-02-01T08:00:00',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const cycleType =
    ref('')

  const evaluationYear =
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

  const cycleTypeOptions:
    PerformanceCycleType[] = [
      'Annual Review',
      'Semi-Annual Review',
      'Quarterly Review',
      'Probationary Review',
    ]

  const yearOptions =
    computed(() => {
      return [
        ...new Set(
          cycles.value.map(
            item =>
              String(
                item.evaluationYear,
              ),
          ),
        ),
      ].sort(
        (
          a,
          b,
        ) =>
          Number(b) -
          Number(a),
      )
    })

  const statusOptions:
    PerformanceCycleStatus[] = [
      'Draft',
      'Scheduled',
      'Active',
      'Completed',
      'Archived',
    ]

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredCycles =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return cycles.value.filter(
        item => {
          const matchesSearch =
            !keyword ||
            item.cycleCode
              .toLowerCase()
              .includes(keyword) ||
            item.name
              .toLowerCase()
              .includes(keyword) ||
            (
              item.remarks ??
              ''
            )
              .toLowerCase()
              .includes(keyword)

          const matchesType =
            !cycleType.value ||
            item.type ===
              cycleType.value

          const matchesYear =
            !evaluationYear.value ||
            String(
              item.evaluationYear,
            ) ===
              evaluationYear.value

          const matchesStatus =
            !status.value ||
            item.status ===
              status.value

          return (
            matchesSearch &&
            matchesType &&
            matchesYear &&
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
        filteredCycles.value

      const activeCycles =
        data.filter(
          item =>
            item.status ===
            'Active',
        )

      const activeEmployees =
        activeCycles.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.totalEmployees,
          0,
        )

      const activeCompleted =
        activeCycles.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.completedEvaluations,
          0,
        )

      const completionRate =
        activeEmployees > 0
          ? Math.round(
              (
                activeCompleted /
                activeEmployees
              ) *
                100,
            )
          : 0

      return {
        totalCycles:
          data.length,

        activeCycles:
          activeCycles.length,

        scheduledCycles:
          data.filter(
            item =>
              item.status ===
              'Scheduled',
          ).length,

        completionRate,
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
          filteredCycles
            .value.length /
            perPage.value,
        ),
      )
    })

  const paginatedCycles =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredCycles
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
        filteredCycles
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

        filteredCycles
          .value.length,
      )
    })

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value = ''
    cycleType.value = ''
    evaluationYear.value = ''
    status.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      cycleType,
      evaluationYear,
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
    cycles,

    search,
    cycleType,
    evaluationYear,
    status,

    currentPage,

    filteredCycles,
    paginatedCycles,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    cycleTypeOptions,
    yearOptions,
    statusOptions,

    resetFilters,
  }
}