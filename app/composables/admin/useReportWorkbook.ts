import { exportReportWorkbook } from '~/utils/reportExport'
import type { ReportDocument } from '~/utils/reportExport'

export const useReportWorkbook = () => {
  const archive = useReportArchive()
  const { success } = useToast()
  const exportWorkbook = async (reports: ReportDocument[]) => {
    await exportReportWorkbook(reports)
    const base = Date.now()
    reports.forEach((report, index) => {
      archive.value.unshift({
        id: base + index, title: report.title, category: reportCategoryFor(report.title),
        period: report.period, generatedBy: 'Current session', generatedAt: report.generatedAt,
        format: 'Excel', status: 'Completed', document: report,
      })
    })
    archive.value = archive.value.slice(0, 30)
    success('Reports downloaded', `${reports.length} reports included in one Excel workbook.`)
  }
  return { exportWorkbook }
}
