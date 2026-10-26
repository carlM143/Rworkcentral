import type { ReportModule, AnalyticsSummary } from '~/types/report'

export const useReportsOverview = () => {
  const archive = useReportArchive()
  const { reports } = useReportsCenter()
  const { attendance, payroll, billing } = useReportLibrary()
  const recentReports = computed(() => archive.value.slice(0, 10))
  const groups = [
    ['Employee Reports', 'Employees', 'Employee', 'Employee masterlist and workforce reports.'],
    ['Attendance Reports', 'Timekeeping', 'Timekeeping', 'Employee attendance and worked hours.'],
    ['Payroll Reports', 'Payroll', 'Payroll', 'Payroll, 13th month pay and wage compliance.'],
    ['Billing Reports', 'Billing', 'Billing', 'Client billing summaries and transactions.'],
    ['Leave & Overtime Reports', 'Leave & Overtime', 'Leave & Overtime', 'Leave utilization and overtime summaries.'],
    ['Government Reports', 'Government', 'Statutory', 'SSS, PhilHealth and Pag-IBIG contributions.'],
  ] as const
  const reportModules = computed<ReportModule[]>(() => groups.map(([title, category, group, description], index) => ({
    id: index + 1, title, category, description, route: '/admin/reports/center?category=' + encodeURIComponent(group),
    reports: reports.value.filter(report => report.category === group && report.availability === 'Available').length,
  })))
  const stats = computed(() => {
    const month = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit' })
    return { totalReports: reports.value.filter(report => report.availability === 'Available').length,
      generatedThisMonth: archive.value.filter(report => month.format(new Date(report.generatedAt)) === month.format(new Date())).length,
      completed: archive.value.length, pending: 0 }
  })
  const money = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)
  const analytics = computed<AnalyticsSummary[]>(() => [
    { label: 'Attendance Rate', value: attendance.stats.value.averageAttendance + '%', description: 'Sample attendance reporting period' },
    { label: 'Payroll Gross', value: money(payroll.totals.value.grossPay), description: payroll.period.value },
    { label: 'Current Billing', value: money(billing.totals.value.netBilling), description: billing.period.value },
    { label: 'Overtime Hours', value: attendance.totals.value.overtimeHours + ' hrs', description: 'Sample attendance reporting period' },
  ])
  const frequentReports = [
    { label: 'Attendance Report', route: '/admin/reports/attendance' },
    { label: 'Payroll Summary', route: '/admin/reports/payroll' },
    { label: 'Billing Summary', route: '/admin/reports/billing' },
    { label: 'Government Remittance', route: '/admin/reports/center?category=Statutory' },
  ]
  return { reportModules, recentReports, stats, analytics, frequentReports }
}
