import type {
  ReportAvailability,
  ReportCategory,
  ReportCenterItem,
} from '~/types/reportCenter'

export const useReportsCenter = () => {
  const reports =
    useState<ReportCenterItem[]>(
      'reports-center-items',
      () => [
        {
          id: 1,

          code:
            'RPT-EMP-001',

          title:
            'Employee Masterlist',

          description:
            'Complete employee listing with employment, department, position and status information.',

          category:
            'Employee',

          frequency:
            'On Demand',

          route:
            '/reports/employee-masterlist',

          availability:
            'Available',

          exportFormats:
            [
              'Excel',
              'PDF',
              'CSV',
            ],

          lastGenerated:
            '2026-10-07T14:20:00',

          generatedCount:
            38,

          iconKey:
            'users',

          featured:
            true,
        },

        {
          id: 2,

          code:
            'RPT-ATT-001',

          title:
            'Attendance Report',

          description:
            'Employee attendance summary including present, absent, late and undertime records.',

          category:
            'Timekeeping',

          frequency:
            'Monthly',

          route:
            '/reports/attendance',

          availability:
            'Available',

          exportFormats:
            [
              'Excel',
              'PDF',
              'CSV',
            ],

          lastGenerated:
            '2026-10-07T16:00:00',

          generatedCount:
            72,

          iconKey:
            'clock',

          featured:
            true,
        },

        {
          id: 3,

          code:
            'RPT-TIM-002',

          title:
            'Time Log Report',

          description:
            'Detailed employee time-in, time-out, late, undertime and worked-hours records.',

          category:
            'Timekeeping',

          frequency:
            'Daily',

          availability:
            'Available',

          exportFormats:
            [
              'Excel',
              'CSV',
            ],

          lastGenerated:
            '2026-10-08T08:10:00',

          generatedCount:
            105,

          iconKey:
            'timer',
        },

        {
          id: 4,

          code:
            'RPT-OT-001',

          title:
            'Overtime Report',

          description:
            'Approved overtime hours, overtime type, employee and department summary.',

          category:
            'Leave & Overtime',

          frequency:
            'Monthly',

          availability:
            'Available',

          exportFormats:
            [
              'Excel',
              'PDF',
            ],

          lastGenerated:
            '2026-10-05T11:30:00',

          generatedCount:
            44,

          iconKey:
            'timer-reset',
        },

        {
          id: 5,

          code:
            'RPT-LVE-001',

          title:
            'Leave Utilization Report',

          description:
            'Filed, approved and used leave credits with employee leave balance summary.',

          category:
            'Leave & Overtime',

          frequency:
            'Monthly',

          availability:
            'Available',

          exportFormats:
            [
              'Excel',
              'PDF',
            ],

          lastGenerated:
            '2026-10-04T14:00:00',

          generatedCount:
            31,

          iconKey:
            'umbrella',
        },

        {
          id: 6,

          code:
            'RPT-PAY-001',

          title:
            'Payroll Summary',

          description:
            'Payroll totals, gross pay, deductions, net pay and payroll status per pay period.',

          category:
            'Payroll',

          frequency:
            'Monthly',

          route:
            '/reports/payroll',

          availability:
            'Available',

          exportFormats:
            [
              'Excel',
              'PDF',
              'CSV',
            ],

          lastGenerated:
            '2026-10-06T10:30:00',

          generatedCount:
            63,

          iconKey:
            'wallet',

          featured:
            true,
        },

        {
          id: 7,

          code:
            'RPT-PAY-002',

          title:
            'Payroll Register',

          description:
            'Detailed payroll register per employee including earnings and deductions.',

          category:
            'Payroll',

          frequency:
            'Monthly',

          availability:
            'Available',

          exportFormats:
            [
              'Excel',
              'PDF',
            ],

          lastGenerated:
            '2026-10-06T10:45:00',

          generatedCount:
            49,

          iconKey:
            'receipt',
        },

        {
          id: 8,

          code:
            '',

          title:
            '',

          description:
            'Client billing totals, billing period, adjustments and completed billing records.',

          category:
            'Billing',

          frequency:
            'Monthly',

          route:
            '/reports/billing',

          availability:
            'Available',

          exportFormats:
            [
              'Excel',
              'PDF',
            ],

          lastGenerated:
            '2026-10-06T15:10:00',

          generatedCount:
            41,

          iconKey:
            'building',
        },

        {
          id: 9,

          code:
            '',

          title:
            '',

          description:
            'Detailed billing information grouped by client, employee assignment and rate.',

          category:
            'Billing',

          frequency:
            'Monthly',

          availability:
            'Available',

          exportFormats:
            [
              'Excel',
              'CSV',
            ],

          generatedCount:
            27,

          iconKey:
            'file',
        },

        {
          id: 10,

          code:
            'RPT-13M-001',

          title:
            '13th Month Pay Report',

          description:
            'Employee 13th month pay computation, eligible basic pay and payable amount.',

          category:
            'Payroll',

          frequency:
            'Annual',

          route:
            '/13th-month-pay',

          availability:
            'Available',

          exportFormats:
            [
              'Excel',
              'PDF',
            ],

          lastGenerated:
            '2025-12-15T09:30:00',

          generatedCount:
            12,

          iconKey:
            'gift',
        },

        {
          id: 11,

          code:
            'RPT-SSS-001',

          title:
            'SSS Contribution Report',

          description:
            'Employee and employer SSS contribution summary for remittance preparation.',

          category:
            'Statutory',

          frequency:
            'Monthly',

          route:
            '/reports/sss',

          availability:
            'Available',

          exportFormats:
            [
              'Excel',
              'PDF',
            ],

          lastGenerated:
            '2026-10-03T08:30:00',

          generatedCount:
            35,

          iconKey:
            'shield',
        },

        {
          id: 12,

          code:
            'RPT-PGI-001',

          title:
            'Pag-IBIG Contribution Report',

          description:
            'Monthly Pag-IBIG employee and employer contribution summary.',

          category:
            'Statutory',

          frequency:
            'Monthly',

          route:
            '/reports/pagibig',

          availability:
            'Available',

          exportFormats:
            [
              'Excel',
              'PDF',
            ],

          lastGenerated:
            '2026-10-03T09:00:00',

          generatedCount:
            34,

          iconKey:
            'home',
        },

        {
          id: 13,

          code:
            'RPT-PHL-001',

          title:
            'PhilHealth Contribution Report',

          description:
            'Monthly PhilHealth premium contribution report by employee.',

          category:
            'Statutory',

          frequency:
            'Monthly',

          route:
            '/reports/philhealth',

          availability:
            'Available',

          exportFormats:
            [
              'Excel',
              'PDF',
            ],

          lastGenerated:
            '2026-10-03T09:20:00',

          generatedCount:
            34,

          iconKey:
            'heart',
        },

        {
          id: 14,

          code:
            'RPT-LFC-001',

          title:
            'Employee Lifecycle Report',

          description:
            'Consolidated onboarding, regularization, transfer, promotion and offboarding activity.',

          category:
            'Lifecycle',

          frequency:
            'Quarterly',

          availability:
            'Available',

          exportFormats:
            [
              'Excel',
              'PDF',
            ],

          lastGenerated:
            '2026-10-01T13:00:00',

          generatedCount:
            18,

          iconKey:
            'history',
        },

        {
          id: 15,

          code:
            'RPT-HCT-001',

          title:
            'Headcount Trend Analysis',

          description:
            'Historical employee headcount changes by department and employment type.',

          category:
            'Employee',

          frequency:
            'Monthly',

          availability:
            'Coming Soon',

          exportFormats:
            [
              'Excel',
              'PDF',
            ],

          generatedCount:
            0,

          iconKey:
            'chart',
        },

        {
          id: 16,

          code:
            'RPT-CST-001',

          title:
            'Workforce Cost Analysis',

          description:
            'Combined payroll and workforce cost analytics by department and client.',

          category:
            'Payroll',

          frequency:
            'Quarterly',

          availability:
            'Coming Soon',

          exportFormats:
            [
              'Excel',
              'PDF',
            ],

          generatedCount:
            0,

          iconKey:
            'chart',
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

  const availability =
    ref('')

  /* =========================================================
     OPTIONS
  ========================================================= */

  const categoryOptions:
    ReportCategory[] = [
      'Employee',
      'Timekeeping',
      'Payroll',
      'Statutory',
      'Leave & Overtime',
      'Lifecycle',
    ]

  const availabilityOptions:
    ReportAvailability[] = [
      'Available',
      'Coming Soon',
      'Restricted',
    ]

  /* =========================================================
     FILTERED
  ========================================================= */

  const filteredReports =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return reports.value.filter(
        report => {
          const matchesSearch =
            !keyword ||
            report.title
              .toLowerCase()
              .includes(keyword) ||
            report.code
              .toLowerCase()
              .includes(keyword) ||
            report.description
              .toLowerCase()
              .includes(keyword)

          const matchesCategory =
            !category.value ||
            report.category ===
              category.value

          const matchesAvailability =
            !availability.value ||
            report.availability ===
              availability.value

          return (
            matchesSearch &&
            matchesCategory &&
            matchesAvailability
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
        reports.value

      return {
        total:
          data.length,

        available:
          data.filter(
            item =>
              item.availability ===
              'Available',
          ).length,

        statutory:
          data.filter(
            item =>
              item.category ===
              'Statutory',
          ).length,

        generated:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.generatedCount,
            0,
          ),
      }
    })

  const featuredReports =
    computed(() => {
      return reports.value.filter(
        item =>
          item.featured &&
          item.availability ===
            'Available',
      )
    })

  const resetFilters = () => {
    search.value = ''
    category.value = ''
    availability.value = ''
  }

  return {
    reports,

    search,
    category,
    availability,

    filteredReports,
    featuredReports,

    stats,

    categoryOptions,
    availabilityOptions,

    resetFilters,
  }
}