import type {
  ReportModule,
  RecentReport,
  AnalyticsSummary,
} from '~/types/report'

export const useReportsOverview = () => {
  /* =========================================================
     REPORT MODULES
  ========================================================= */

  const reportModules =
    ref<ReportModule[]>([
      {
        id: 1,

        title:
          'Employee Reports',

        description:
          'Employee masterlist, department, employment status and workforce reports.',

        category:
          'Employees',

        route:
          '/reports/employees',

        reports: 6,
      },

      {
        id: 2,

        title:
          'Attendance Reports',

        description:
          'Daily attendance, DTR, late, undertime and absenteeism reports.',

        category:
          'Timekeeping',

        route:
          '/reports/attendance',

        reports: 8,
      },

      {
        id: 3,

        title:
          'Payroll Reports',

        description:
          'Payroll summaries, payroll transactions, deductions and compensation reports.',

        category:
          'Payroll',

        route:
          '/reports/payroll',

        reports: 9,
      },

      {
        id: 5,

        title:
          'Leave & Overtime Reports',

        description:
          'Leave utilization, overtime hours and employee request summaries.',

        category:
          'Leave & Overtime',

        route:
          '/reports/leave-overtime',

        reports: 5,
      },

      {
        id: 6,

        title:
          'Government Reports',

        description:
          'SSS, PhilHealth, Pag-IBIG and statutory remittance reports.',

        category:
          'Government',

        route:
          '/reports/government',

        reports: 8,
      },
    ])

  /* =========================================================
     RECENT GENERATED REPORTS
  ========================================================= */

  const recentReports =
    ref<RecentReport[]>([
      {
        id: 1,

        title:
          'Payroll Transaction Summary',

        category:
          'Payroll',

        period:
          'Sep 1 - Sep 15, 2026',

        generatedBy:
          'Maria Santos',

        generatedAt:
          '2026-09-04T08:15:00',

        format:
          'PDF',

        status:
          'Completed',
      },

      {
        id: 2,

        title:
          'Daily Attendance Report',

        category:
          'Timekeeping',

        period:
          'Sep 3, 2026',

        generatedBy:
          'Maria Santos',

        generatedAt:
          '2026-09-04T08:05:00',

        format:
          'Excel',

        status:
          'Completed',
      },

      {
        id: 4,

        title:
          'Leave Utilization Report',

        category:
          'Leave & Overtime',

        period:
          'September 2026',

        generatedBy:
          'Claire Villanueva',

        generatedAt:
          '2026-09-03T15:10:00',

        format:
          'Excel',

        status:
          'Completed',
      },

      {
        id: 5,

        title:
          'SSS Contribution Report',

        category:
          'Government',

        period:
          'September 2026',

        generatedBy:
          'Robert Castillo',

        generatedAt:
          '2026-09-03T14:00:00',

        format:
          'PDF',

        status:
          'Pending',
      },
    ])

  /* =========================================================
     STATS
  ========================================================= */

  const stats =
    computed(() => {
      const totalReports =
        reportModules.value.reduce(
          (
            total,
            module,
          ) =>
            total +
            module.reports,
          0,
        )

      const generatedThisMonth =
        recentReports.value.filter(
          report =>
            report.generatedAt.startsWith(
              '2026-09',
            ),
        ).length

      const completed =
        recentReports.value.filter(
          report =>
            report.status ===
            'Completed',
        ).length

      const pending =
        recentReports.value.filter(
          report =>
            report.status ===
            'Pending',
        ).length

      return {
        totalReports,
        generatedThisMonth,
        completed,
        pending,
      }
    })

  /* =========================================================
     BUSINESS ANALYTICS
  ========================================================= */

  const analytics =
    ref<AnalyticsSummary[]>([
      {
        label:
          'Attendance Rate',

        value:
          '91.7%',

        description:
          'Current workforce attendance',
      },

      {
        label:
          'Payroll Gross',

        value:
          '₱82,500',

        description:
          'Current payroll preview',
      },

      {
        label:
          'Approved OT',

        value:
          '8.5 hrs',

        description:
          'Approved overtime this period',
      },
    ])

  /* =========================================================
     FREQUENT REPORTS
  ========================================================= */

  const frequentReports = [
    {
      label:
        'Daily Attendance',

      route:
        '/reports/attendance',
    },

    {
      label:
        'Payroll Summary',

      route:
        '/reports/payroll',
    },

    {
      label:
        'Government Remittance',

      route:
        '/reports/government',
    },
  ]

  return {
    reportModules,

    recentReports,

    stats,

    analytics,

    frequentReports,
  }
}