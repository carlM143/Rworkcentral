import type { ReportDocument, ReportRow } from '~/utils/reportExport'

// Report pages and the center read the same sources; downloads contain report
// records, never the metadata used to describe a report card.
export const useReportLibrary = () => {
  const attendance = useAttendanceReport()
  const payroll = usePayrollReport()
  const billing = useBillingReport()
  const thirteenth = useThirteenthMonthPay()
  const sss = useSssReport()
  const pagibig = usePagibigReport()
  const philhealth = usePhilhealthReport()
  const wages = useWageManagement()
  const sources: Record<string, { title: string; rows: () => object[]; totals?: () => object; period: () => string }> = {
    '/admin/reports/attendance': { title: 'Attendance Report', rows: () => attendance.filteredRecords.value, totals: () => attendance.totals.value, period: () => `${attendance.dateFrom.value} to ${attendance.dateTo.value}` },
    '/admin/reports/payroll': { title: 'Payroll Report', rows: () => payroll.filteredRecords.value, totals: () => payroll.totals.value, period: () => payroll.period.value || 'All pay periods' },
    '/admin/reports/billing': { title: 'Billing Report', rows: () => billing.filteredRecords.value, totals: () => billing.totals.value, period: () => billing.period.value || 'All billing periods' },
    '/admin/13th-month-pay': { title: '13th Month Pay', rows: () => thirteenth.filteredRecords.value, totals: () => thirteenth.totals.value, period: () => thirteenth.year.value || 'All years' },
    '/admin/reports/sss': { title: 'SSS Report', rows: () => sss.filteredRecords.value, totals: () => sss.totals.value, period: () => `${sss.month.value} ${sss.year.value}` },
    '/admin/reports/pagibig': { title: 'Pag-IBIG Report', rows: () => pagibig.filteredRecords.value, totals: () => pagibig.totals.value, period: () => `${pagibig.month.value} ${pagibig.year.value}` },
    '/admin/reports/philhealth': { title: 'PhilHealth Report', rows: () => philhealth.filteredRecords.value, totals: () => philhealth.totals.value, period: () => `${philhealth.month.value} ${philhealth.year.value}` },
    '/admin/reports/wage-compliance': { title: 'Wage Compliance Report', rows: () => wages.complianceRecords.value, period: () => 'Current wage review' },
  }
  const documentFor = (route?: string): ReportDocument | null => {
    const source = route ? sources[route] : undefined
    if (!source) return null
    return JSON.parse(JSON.stringify({
      title: source.title, period: source.period(), rows: source.rows() as ReportRow[],
      totals: source.totals?.(), generatedAt: new Date().toISOString(), sample: true,
    }))
  }
  return { documentFor, attendance, payroll, billing, sources }
}
