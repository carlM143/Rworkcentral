import type {
  PerformanceTemplate,
  PerformanceTemplateScope,
  PerformanceTemplateStatus,
  PerformanceTemplateType,
} from '~/types/performanceTemplate'

export const usePerformanceTemplates = () => {
  const templates =
    useState<PerformanceTemplate[]>(
      'performance-templates',
      () => [
        {
          id: 1,

          templateCode:
            'TPL-GEN-001',

          name:
            'General Employee Performance Review',

          type:
            'General Review',

          scope:
            'All Employees',

          description:
            'Standard company-wide employee evaluation covering work quality, attendance, teamwork, productivity and behavior.',

          sectionCount: 5,
          criteriaCount: 20,

          scoringScale:
            '1 - 5',

          passingScore: 3,

          totalWeight: 100,

          usageCount: 125,

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-01-10T09:00:00',

          updatedAt:
            '2026-09-28T10:30:00',
        },

        {
          id: 2,

          templateCode:
            'TPL-PROB-001',

          name:
            'Probationary Employee Review',

          type:
            'Probationary Review',

          scope:
            'Rank and File',

          description:
            'Evaluation template used before employee regularization to assess performance, adaptability and attendance.',

          sectionCount: 6,
          criteriaCount: 24,

          scoringScale:
            '1 - 5',

          passingScore: 3,

          totalWeight: 100,

          usageCount: 38,

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-02-01T08:30:00',

          updatedAt:
            '2026-09-30T13:10:00',
        },

        {
          id: 3,

          templateCode:
            'TPL-LEAD-001',

          name:
            'Leadership Performance Evaluation',

          type:
            'Leadership Review',

          scope:
            'Supervisory',

          description:
            'Measures leadership effectiveness, employee management, decision-making, communication and accountability.',

          sectionCount: 6,
          criteriaCount: 22,

          scoringScale:
            '1 - 5',

          passingScore: 3.2,

          totalWeight: 100,

          usageCount: 18,

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-02-15T10:00:00',

          updatedAt:
            '2026-09-26T11:00:00',
        },

        {
          id: 4,

          templateCode:
            'TPL-MGR-001',

          name:
            'Managerial Performance Review',

          type:
            'Leadership Review',

          scope:
            'Managerial',

          description:
            'Management-level assessment covering leadership, strategic planning, business results and team development.',

          sectionCount: 7,
          criteriaCount: 28,

          scoringScale:
            '1 - 5',

          passingScore: 3.5,

          totalWeight: 100,

          usageCount: 9,

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-03-01T09:00:00',

          updatedAt:
            '2026-09-25T15:30:00',
        },

        {
          id: 5,

          templateCode:
            'TPL-TECH-001',

          name:
            'Technical Employee Evaluation',

          type:
            'Technical Review',

          scope:
            'Technical',

          description:
            'Technical performance evaluation focusing on quality, technical competency, problem-solving and system reliability.',

          sectionCount: 5,
          criteriaCount: 21,

          scoringScale:
            '1 - 5',

          passingScore: 3,

          totalWeight: 100,

          usageCount: 14,

          status:
            'Active',

          createdBy:
            'IT Manager',

          createdAt:
            '2026-03-10T09:30:00',

          updatedAt:
            '2026-09-29T14:20:00',
        },

        {
          id: 6,

          templateCode:
            'TPL-DRV-001',

          name:
            'Driver Performance Evaluation',

          type:
            'Driver Review',

          scope:
            'Drivers',

          description:
            'Driver-specific evaluation covering safety, attendance, vehicle care, client service and trip compliance.',

          sectionCount: 6,
          criteriaCount: 25,

          scoringScale:
            '1 - 5',

          passingScore: 3,

          totalWeight: 100,

          usageCount: 42,

          status:
            'Active',

          createdBy:
            'Operations Manager',

          createdAt:
            '2026-04-01T08:00:00',

          updatedAt:
            '2026-09-21T09:45:00',
        },

        {
          id: 7,

          templateCode:
            'TPL-GEN-002',

          name:
            'Quarterly Employee Check-in',

          type:
            'General Review',

          scope:
            'All Employees',

          description:
            'Short-form quarterly evaluation focusing on current performance, challenges and immediate development needs.',

          sectionCount: 4,
          criteriaCount: 12,

          scoringScale:
            '1 - 5',

          passingScore: 3,

          totalWeight: 100,

          usageCount: 67,

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-05-01T10:15:00',

          updatedAt:
            '2026-10-02T11:20:00',
        },

        {
          id: 8,

          templateCode:
            'TPL-DEV-001',

          name:
            'Employee Development Review',

          type:
            'General Review',

          scope:
            'All Employees',

          description:
            'Draft template focusing on development goals, training requirements and future employee growth opportunities.',

          sectionCount: 4,
          criteriaCount: 15,

          scoringScale:
            '1 - 5',

          passingScore: 3,

          totalWeight: 100,

          usageCount: 0,

          status:
            'Draft',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-15T09:00:00',

          updatedAt:
            '2026-10-05T14:00:00',

          remarks:
            'Still under HR review.',
        },

        {
          id: 9,

          templateCode:
            'TPL-OLD-001',

          name:
            'Legacy Annual Performance Form',

          type:
            'General Review',

          scope:
            'All Employees',

          description:
            'Previous annual evaluation form retained for historical performance records.',

          sectionCount: 4,
          criteriaCount: 16,

          scoringScale:
            '1 - 5',

          passingScore: 3,

          totalWeight: 100,

          usageCount: 102,

          status:
            'Archived',

          createdBy:
            'System Administrator',

          createdAt:
            '2025-01-01T08:00:00',

          updatedAt:
            '2026-01-01T08:00:00',
        },

        {
          id: 10,

          templateCode:
            'TPL-TECH-002',

          name:
            'IT Support Performance Review',

          type:
            'Technical Review',

          scope:
            'Technical',

          description:
            'Specialized evaluation for IT support staff covering ticket resolution, response time and technical service quality.',

          sectionCount: 5,
          criteriaCount: 18,

          scoringScale:
            '1 - 5',

          passingScore: 3,

          totalWeight: 100,

          usageCount: 0,

          status:
            'Inactive',

          createdBy:
            'IT Manager',

          createdAt:
            '2026-08-01T08:30:00',

          updatedAt:
            '2026-09-18T10:20:00',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const templateType =
    ref('')

  const scope =
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

  const templateTypeOptions:
    PerformanceTemplateType[] = [
      'General Review',
      'Probationary Review',
      'Leadership Review',
      'Technical Review',
      'Driver Review',
    ]

  const scopeOptions:
    PerformanceTemplateScope[] = [
      'All Employees',
      'Rank and File',
      'Supervisory',
      'Managerial',
      'Technical',
      'Drivers',
    ]

  const statusOptions:
    PerformanceTemplateStatus[] = [
      'Draft',
      'Active',
      'Inactive',
      'Archived',
    ]

  /* =========================================================
     FILTERED
  ========================================================= */

  const filteredTemplates =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return templates.value.filter(
        item => {
          const matchesSearch =
            !keyword ||
            item.templateCode
              .toLowerCase()
              .includes(keyword) ||
            item.name
              .toLowerCase()
              .includes(keyword) ||
            item.description
              .toLowerCase()
              .includes(keyword) ||
            item.createdBy
              .toLowerCase()
              .includes(keyword)

          const matchesType =
            !templateType.value ||
            item.type ===
              templateType.value

          const matchesScope =
            !scope.value ||
            item.scope ===
              scope.value

          const matchesStatus =
            !status.value ||
            item.status ===
              status.value

          return (
            matchesSearch &&
            matchesType &&
            matchesScope &&
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
        filteredTemplates.value

      return {
        totalTemplates:
          data.length,

        activeTemplates:
          data.filter(
            item =>
              item.status ===
              'Active',
          ).length,

        draftTemplates:
          data.filter(
            item =>
              item.status ===
              'Draft',
          ).length,

        totalUsage:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.usageCount,
            0,
          ),
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
          filteredTemplates
            .value.length /
            perPage.value,
        ),
      )
    })

  const paginatedTemplates =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredTemplates
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
        filteredTemplates
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

        filteredTemplates
          .value.length,
      )
    })

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value = ''
    templateType.value = ''
    scope.value = ''
    status.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      templateType,
      scope,
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
    templates,

    search,
    templateType,
    scope,
    status,

    currentPage,

    filteredTemplates,
    paginatedTemplates,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    templateTypeOptions,
    scopeOptions,
    statusOptions,

    resetFilters,
  }
}