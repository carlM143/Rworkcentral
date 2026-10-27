import type { Ref } from 'vue'
import { exportReport, printReport } from '~/utils/reportExport'
import type { ReportDocument, ReportFormat, ReportRow } from '~/utils/reportExport'
import type { RecentReport, ReportCategory } from '~/types/report'

export interface ReportArchiveItem extends RecentReport {
  document: ReportDocument
}

export const useReportArchive = () => useState<ReportArchiveItem[]>('report-session-archive', () => [])

export const reportCategoryFor = (title: string): ReportCategory => {
  if (/SSS|Pag-IBIG|PhilHealth/i.test(title)) return 'Government'
  if (/attendance/i.test(title)) return 'Timekeeping'
  if (/billing/i.test(title)) return 'Billing'
  return 'Payroll'
}

export const useReportActions = <T extends object>(options: {
  title: string
  category: ReportCategory
  rows: Ref<T[]>
  period: () => string
  totals?: Ref<object>
  filters?: () => Record<string, string>
  validate?: () => string
}) => {
  const toast = useToast()
  const archive = useReportArchive()
  const busy = ref(false)
  const preview = ref<ReportDocument | null>(null)
  const selectedRecord = ref<ReportRow | null>(null)
  const snapshot = (): ReportDocument | null => {
    const problem = options.validate?.()
    if (problem) { toast.error('Check report filters', problem); return null }
    if (!options.rows.value.length) { toast.info('No matching records', 'Change or reset your filters to include records.'); return null }
    return JSON.parse(JSON.stringify({
      title: options.title, period: options.period(), rows: options.rows.value,
      totals: options.totals?.value,
      filters: Object.fromEntries(Object.entries(options.filters?.() ?? {}).filter(([, value]) => value)),
      generatedAt: new Date().toISOString(), sample: true,
    }))
  }
  const generate = () => { preview.value = snapshot() }
  const viewRecord = (record: T) => { selectedRecord.value = { ...record } as ReportRow }
  const download = async (format: ReportFormat = 'Excel', saved?: ReportDocument) => {
    if (busy.value) return
    const report = saved ?? snapshot()
    if (!report) return
    busy.value = true
    try {
      await exportReport(report, format)
      archive.value.unshift({
        id: Date.now(), title: report.title, category: saved ? reportCategoryFor(report.title) : options.category, period: report.period,
        generatedBy: 'Current session', generatedAt: report.generatedAt,
        format, status: 'Completed', document: report,
      })
      archive.value = archive.value.slice(0, 30)
      toast.success('Report downloaded', `${report.rows.length} records exported as ${format}.`)
    } catch (error) {
      toast.error('Export failed', error instanceof Error ? error.message : 'Please try again.')
    } finally { busy.value = false }
  }
  const print = (saved?: ReportDocument) => {
    const report = saved ?? snapshot()
    if (!report) return
    try { printReport(report) } catch (error) {
      toast.error('Unable to print', error instanceof Error ? error.message : 'Please try again.')
    }
  }
  return { busy, preview, selectedRecord, generate, viewRecord, download, print }
}
