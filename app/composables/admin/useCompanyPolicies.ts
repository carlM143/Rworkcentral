import type {
  CompanyPolicy,
  CompanyPolicyCategory,
  CompanyPolicyStatus,
} from '~/types/companyPolicy'

export const useCompanyPolicies = () => {
  const policies =
    useState<CompanyPolicy[]>(
      'company-policies',
      () => [
        {
          id: 1,

          policyNumber:
            'POL-001',

          title:
            'Employee Code of Conduct',

          category:
            'Code of Conduct',

          summary:
            'Defines expected employee behavior, professional standards, workplace conduct and disciplinary expectations.',

          version:
            'v2.1',

          effectiveDate:
            '2026-01-01',

          reviewDate:
            '2027-01-01',

          acknowledgmentRequired:
            true,

          acknowledgedEmployees:
            118,

          totalEmployees:
            125,

          status:
            'Published',

          owner:
            'Human Resources',

          createdAt:
            '2025-12-10T09:00:00',

          updatedAt:
            '2026-09-20T10:30:00',
        },

        {
          id: 2,

          policyNumber:
            'POL-002',

          title:
            'Attendance and Timekeeping Policy',

          category:
            'Attendance',

          summary:
            'Covers official work schedules, time in and out rules, late arrivals, absences and time log corrections.',

          version:
            'v3.0',

          effectiveDate:
            '2026-02-01',

          reviewDate:
            '2027-02-01',

          acknowledgmentRequired:
            true,

          acknowledgedEmployees:
            123,

          totalEmployees:
            125,

          status:
            'Published',

          owner:
            'Human Resources',

          createdAt:
            '2026-01-15T08:30:00',

          updatedAt:
            '2026-09-28T11:20:00',
        },

        {
          id: 3,

          policyNumber:
            'POL-003',

          title:
            'Leave Management Policy',

          category:
            'Leave',

          summary:
            'Defines leave eligibility, leave credits, filing procedures, approval rules and leave documentation requirements.',

          version:
            'v2.3',

          effectiveDate:
            '2026-03-01',

          reviewDate:
            '2027-03-01',

          acknowledgmentRequired:
            true,

          acknowledgedEmployees:
            119,

          totalEmployees:
            125,

          status:
            'Published',

          owner:
            'Human Resources',

          createdAt:
            '2026-02-10T09:15:00',

          updatedAt:
            '2026-09-25T13:00:00',
        },

        {
          id: 4,

          policyNumber:
            'POL-004',

          title:
            'Payroll and Compensation Policy',

          category:
            'Payroll',

          summary:
            'Explains payroll periods, salary processing, deductions, overtime treatment, adjustments and payroll release.',

          version:
            'v1.8',

          effectiveDate:
            '2026-01-15',

          reviewDate:
            '2027-01-15',

          acknowledgmentRequired:
            false,

          acknowledgedEmployees:
            0,

          totalEmployees:
            125,

          status:
            'Published',

          owner:
            'Finance',

          createdAt:
            '2026-01-05T10:00:00',

          updatedAt:
            '2026-09-27T09:45:00',
        },

        {
          id: 5,

          policyNumber:
            'POL-005',

          title:
            'Occupational Health and Safety Policy',

          category:
            'Health & Safety',

          summary:
            'Provides company safety standards, incident reporting procedures, emergency response and workplace health requirements.',

          version:
            'v2.0',

          effectiveDate:
            '2026-04-01',

          reviewDate:
            '2027-04-01',

          acknowledgmentRequired:
            true,

          acknowledgedEmployees:
            121,

          totalEmployees:
            125,

          status:
            'Published',

          owner:
            'Administration',

          createdAt:
            '2026-03-10T08:45:00',

          updatedAt:
            '2026-09-22T14:30:00',
        },

        {
          id: 6,

          policyNumber:
            'POL-006',

          title:
            'Information Security Policy',

          category:
            'Information Security',

          summary:
            'Defines password security, acceptable system use, confidential information handling and cybersecurity responsibilities.',

          version:
            'v1.5',

          effectiveDate:
            '2026-05-01',

          reviewDate:
            '2027-05-01',

          acknowledgmentRequired:
            true,

          acknowledgedEmployees:
            114,

          totalEmployees:
            125,

          status:
            'Published',

          owner:
            'Information Technology',

          createdAt:
            '2026-04-10T13:00:00',

          updatedAt:
            '2026-09-30T10:20:00',
        },

        {
          id: 7,

          policyNumber:
            'POL-007',

          title:
            'Work From Home Policy',

          category:
            'Remote Work',

          summary:
            'Sets eligibility, request procedures, work expectations and approval requirements for remote and hybrid work arrangements.',

          version:
            'v1.1',

          effectiveDate:
            '2026-06-01',

          reviewDate:
            '2027-06-01',

          acknowledgmentRequired:
            true,

          acknowledgedEmployees:
            106,

          totalEmployees:
            125,

          status:
            'Published',

          owner:
            'Human Resources',

          createdAt:
            '2026-05-15T09:30:00',

          updatedAt:
            '2026-09-21T11:10:00',
        },

        {
          id: 8,

          policyNumber:
            'POL-008',

          title:
            'Employee Data Privacy Policy',

          category:
            'General',

          summary:
            'Explains collection, processing, storage and protection of employee personal and employment information.',

          version:
            'v1.0',

          effectiveDate:
            '2026-11-01',

          reviewDate:
            '2027-11-01',

          acknowledgmentRequired:
            true,

          acknowledgedEmployees:
            0,

          totalEmployees:
            125,

          status:
            'Draft',

          owner:
            'Human Resources',

          createdAt:
            '2026-09-15T10:00:00',

          updatedAt:
            '2026-10-03T09:20:00',
        },

        {
          id: 9,

          policyNumber:
            'POL-009',

          title:
            'Employee Workplace Guidelines',

          category:
            'General',

          summary:
            'General guidelines covering workplace use, office facilities, employee responsibilities and internal procedures.',

          version:
            'v1.4',

          effectiveDate:
            '2025-01-01',

          acknowledgmentRequired:
            false,

          acknowledgedEmployees:
            0,

          totalEmployees:
            125,

          status:
            'Archived',

          owner:
            'Administration',

          createdAt:
            '2024-12-01T08:00:00',

          updatedAt:
            '2026-01-01T08:00:00',
        },

        {
          id: 10,

          policyNumber:
            'POL-010',

          title:
            'Overtime Management Policy',

          category:
            'Attendance',

          summary:
            'Defines overtime eligibility, filing requirements, approval workflow and approved overtime processing.',

          version:
            'v2.0',

          effectiveDate:
            '2026-07-01',

          reviewDate:
            '2027-07-01',

          acknowledgmentRequired:
            true,

          acknowledgedEmployees:
            117,

          totalEmployees:
            125,

          status:
            'Published',

          owner:
            'Human Resources',

          createdAt:
            '2026-06-12T09:00:00',

          updatedAt:
            '2026-09-29T15:10:00',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const category =
    ref('')

  const status =
    ref('')

  const acknowledgment =
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

  const categoryOptions:
    CompanyPolicyCategory[] = [
      'General',
      'Attendance',
      'Leave',
      'Payroll',
      'Code of Conduct',
      'Health & Safety',
      'Information Security',
      'Remote Work',
    ]

  const statusOptions:
    CompanyPolicyStatus[] = [
      'Draft',
      'Published',
      'Archived',
    ]

  const acknowledgmentOptions = [
    'Required',
    'Not Required',
  ]

  /* =========================================================
     FILTERED
  ========================================================= */

  const filteredPolicies =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return policies.value.filter(
        item => {
          const matchesSearch =
            !keyword ||
            item.policyNumber
              .toLowerCase()
              .includes(keyword) ||
            item.title
              .toLowerCase()
              .includes(keyword) ||
            item.summary
              .toLowerCase()
              .includes(keyword) ||
            item.owner
              .toLowerCase()
              .includes(keyword)

          const matchesCategory =
            !category.value ||
            item.category ===
              category.value

          const matchesStatus =
            !status.value ||
            item.status ===
              status.value

          const matchesAcknowledgment =
            !acknowledgment.value ||
            (
              acknowledgment.value ===
                'Required' &&
              item.acknowledgmentRequired
            ) ||
            (
              acknowledgment.value ===
                'Not Required' &&
              !item.acknowledgmentRequired
            )

          return (
            matchesSearch &&
            matchesCategory &&
            matchesStatus &&
            matchesAcknowledgment
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
        filteredPolicies.value

      const published =
        data.filter(
          item =>
            item.status ===
            'Published',
        )

      const requiringAcknowledgment =
        published.filter(
          item =>
            item.acknowledgmentRequired,
        )

      const pendingAcknowledgments =
        requiringAcknowledgment.reduce(
          (
            total,
            item,
          ) =>
            total +
            Math.max(
              0,
              item.totalEmployees -
                item.acknowledgedEmployees,
            ),
          0,
        )

      return {
        totalPolicies:
          data.length,

        published:
          published.length,

        drafts:
          data.filter(
            item =>
              item.status ===
              'Draft',
          ).length,

        pendingAcknowledgments,
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
          filteredPolicies
            .value.length /
            perPage.value,
        ),
      )
    })

  const paginatedPolicies =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredPolicies
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
        filteredPolicies
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

        filteredPolicies
          .value.length,
      )
    })

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value = ''
    category.value = ''
    status.value = ''
    acknowledgment.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      category,
      status,
      acknowledgment,
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
    policies,

    search,
    category,
    status,
    acknowledgment,

    currentPage,

    filteredPolicies,
    paginatedPolicies,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    categoryOptions,
    statusOptions,
    acknowledgmentOptions,

    resetFilters,
  }
}