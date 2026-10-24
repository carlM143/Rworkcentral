import type {
  DocumentCategory,
  DocumentCategoryScope,
  DocumentCategoryStatus,
} from '~/types/documentCategory'

export const useDocumentCategories = () => {
  const categories =
    useState<DocumentCategory[]>(
      'document-categories',
      () => [
        {
          id: 1,

          code:
            'GOV-ID',

          name:
            'Government IDs',

          description:
            'Government-issued employee identification and registration documents.',

          scope:
            'Employee',

          documentCount: 74,

          requiresExpiryDate:
            true,

          requiresDocumentNumber:
            true,

          isRequired:
            true,

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-01-05T09:00:00',

          updatedAt:
            '2026-09-28T10:30:00',
        },

        {
          id: 2,

          code:
            'EMP-CONT',

          name:
            'Employment Contracts',

          description:
            'Employment contracts, job agreements and employment-related legal documents.',

          scope:
            'Employee',

          documentCount: 42,

          requiresExpiryDate:
            true,

          requiresDocumentNumber:
            false,

          isRequired:
            true,

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-01-05T09:10:00',

          updatedAt:
            '2026-09-29T11:20:00',
        },

        {
          id: 3,

          code:
            'CERT',

          name:
            'Certificates',

          description:
            'Professional certificates, training certificates and employee qualifications.',

          scope:
            'Employee',

          documentCount: 56,

          requiresExpiryDate:
            true,

          requiresDocumentNumber:
            true,

          isRequired:
            false,

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-01-05T09:20:00',

          updatedAt:
            '2026-09-24T14:00:00',
        },

        {
          id: 4,

          code:
            'MED-REC',

          name:
            'Medical Records',

          description:
            'Medical certificates, fit-to-work documents and employee health-related records.',

          scope:
            'Employee',

          documentCount: 31,

          requiresExpiryDate:
            true,

          requiresDocumentNumber:
            false,

          isRequired:
            false,

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-01-05T09:30:00',

          updatedAt:
            '2026-09-20T09:15:00',
        },

        {
          id: 5,

          code:
            'CO-FORM',

          name:
            'Company Forms',

          description:
            'Internal forms, acknowledgements and standard company documents.',

          scope:
            'Both',

          documentCount: 63,

          requiresExpiryDate:
            false,

          requiresDocumentNumber:
            false,

          isRequired:
            false,

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-01-10T10:00:00',

          updatedAt:
            '2026-09-25T13:45:00',
        },

        {
          id: 6,

          code:
            'POLICY',

          name:
            'Company Policies',

          description:
            'Company policies, employee handbook documents and official policy acknowledgements.',

          scope:
            'Company',

          documentCount: 18,

          requiresExpiryDate:
            false,

          requiresDocumentNumber:
            false,

          isRequired:
            true,

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-02-01T08:30:00',

          updatedAt:
            '2026-09-30T10:10:00',
        },

        {
          id: 7,

          code:
            'DISC',

          name:
            'Disciplinary Documents',

          description:
            'Notice to explain, written warnings and other disciplinary-related documents.',

          scope:
            'Employee',

          documentCount: 15,

          requiresExpiryDate:
            false,

          requiresDocumentNumber:
            false,

          isRequired:
            false,

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-02-10T09:00:00',

          updatedAt:
            '2026-09-21T15:30:00',
        },

        {
          id: 8,

          code:
            'PERF',

          name:
            'Performance Documents',

          description:
            'Performance evaluations, appraisal forms and employee performance records.',

          scope:
            'Employee',

          documentCount: 28,

          requiresExpiryDate:
            false,

          requiresDocumentNumber:
            false,

          isRequired:
            false,

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-02-15T10:30:00',

          updatedAt:
            '2026-09-18T08:45:00',
        },

        {
          id: 9,

          code:
            'CLIENT-REQ',

          name:
            'Client Requirements',

          description:
            'Employee documents and requirements submitted for client deployment or accreditation.',

          scope:
            'Employee',

          documentCount: 48,

          requiresExpiryDate:
            true,

          requiresDocumentNumber:
            true,

          isRequired:
            true,

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-03-01T08:00:00',

          updatedAt:
            '2026-09-27T11:10:00',
        },

        {
          id: 10,

          code:
            'OLD-OTHER',

          name:
            'Legacy Documents',

          description:
            'Previous document classification retained for historical employee files.',

          scope:
            'Both',

          documentCount: 7,

          requiresExpiryDate:
            false,

          requiresDocumentNumber:
            false,

          isRequired:
            false,

          status:
            'Inactive',

          createdBy:
            'System Administrator',

          createdAt:
            '2025-01-01T08:00:00',

          updatedAt:
            '2026-01-01T08:00:00',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const scope =
    ref('')

  const requirement =
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

  const scopeOptions:
    DocumentCategoryScope[] = [
      'Employee',
      'Company',
      'Both',
    ]

  const requirementOptions = [
    'Required',
    'Optional',
  ]

  const statusOptions:
    DocumentCategoryStatus[] = [
      'Active',
      'Inactive',
    ]

  /* =========================================================
     FILTERED
  ========================================================= */

  const filteredCategories =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return categories.value.filter(
        item => {
          const matchesSearch =
            !keyword ||
            item.code
              .toLowerCase()
              .includes(keyword) ||
            item.name
              .toLowerCase()
              .includes(keyword) ||
            item.description
              .toLowerCase()
              .includes(keyword)

          const matchesScope =
            !scope.value ||
            item.scope ===
              scope.value

          const matchesRequirement =
            !requirement.value ||
            (
              requirement.value ===
                'Required' &&
              item.isRequired
            ) ||
            (
              requirement.value ===
                'Optional' &&
              !item.isRequired
            )

          const matchesStatus =
            !status.value ||
            item.status ===
              status.value

          return (
            matchesSearch &&
            matchesScope &&
            matchesRequirement &&
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
        filteredCategories.value

      return {
        totalCategories:
          data.length,

        activeCategories:
          data.filter(
            item =>
              item.status ===
              'Active',
          ).length,

        requiredCategories:
          data.filter(
            item =>
              item.isRequired &&
              item.status ===
                'Active',
          ).length,

        totalDocuments:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.documentCount,
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
          filteredCategories
            .value.length /
            perPage.value,
        ),
      )
    })

  const paginatedCategories =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredCategories
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
        filteredCategories
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

        filteredCategories
          .value.length,
      )
    })

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value = ''
    scope.value = ''
    requirement.value = ''
    status.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      scope,
      requirement,
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
    categories,

    search,
    scope,
    requirement,
    status,

    currentPage,

    filteredCategories,
    paginatedCategories,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    scopeOptions,
    requirementOptions,
    statusOptions,

    resetFilters,
  }
}