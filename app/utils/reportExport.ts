export type ReportRow = Record<string, unknown>
export type ReportFormat = 'Excel' | 'PDF' | 'CSV'

export interface ReportDocument {
  title: string
  period: string
  rows: ReportRow[]
  totals?: ReportRow
  filters?: Record<string, string>
  generatedAt: string
  sample: boolean
}

const labels: Record<string, string> = {
  sss: 'SSS', sssNumber: 'SSS Number', pagibig: 'Pag-IBIG', philHealth: 'PhilHealth',
  ecContribution: 'EC Contribution', workedHours: 'Total Worked Hours',
  referenceNumber: 'Reference Number', pin: 'PhilHealth PIN',
}

export const reportLabel = (key: string) => labels[key]
  ?? key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase())

export const reportColumns = (rows: ReportRow[]) =>
  [...new Set(rows.flatMap(row => Object.keys(row)))].filter(key =>
    key !== 'id' && key !== 'employeeId',
  )

export const reportValue = (value: unknown): string => {
  if (value == null || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return new Intl.NumberFormat('en-PH', { maximumFractionDigits: 2 }).format(value)
  return String(value)
}

export const reportTimestamp = (value: string) => new Intl.DateTimeFormat('en-PH', {
  timeZone: 'Asia/Manila', dateStyle: 'medium', timeStyle: 'short',
}).format(new Date(value))

export const reportMatrix = (report: ReportDocument) => {
  const columns = reportColumns(report.rows)
  const rows = report.rows.map(row => columns.map(key => row[key] ?? ''))
  if (report.totals && rows.length) {
    const totals = { ...report.totals }
    if ('workedHours' in totals) totals.totalWorkedHours = totals.workedHours
    rows.push(columns.map((key, index) => index === 0 ? 'TOTAL (ALL FILTERED RECORDS)' : totals[key] ?? ''))
  }
  return { columns, rows }
}

// Spreadsheet programs must treat user-entered text as text, never formulas.
export const csvCell = (value: unknown) => {
  let text = value == null ? '' : String(value)
  if (typeof value === 'string' && /^[\s]*[=+\-@]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

export const reportCsv = (report: ReportDocument) => {
  const { columns, rows } = reportMatrix(report)
  const metadata = [
    [report.title], ['Period', report.period],
    ['Generated (Asia/Manila)', reportTimestamp(report.generatedAt)],
    ['Data', report.sample ? 'Sample data' : 'Report data'],
    ...Object.entries(report.filters ?? {}), [],
  ]
  return '\uFEFF' + [...metadata, columns.map(reportLabel), ...rows]
    .map(row => row.map(csvCell).join(',')).join('\r\n')
}

export const reportFilename = (report: ReportDocument, extension: string) =>
  `${report.title}-${report.period}`.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() + `.${extension}`

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const exportReport = async (report: ReportDocument, format: ReportFormat) => {
  if (!report.rows.length) throw new Error('There are no matching records to export.')
  const { columns, rows } = reportMatrix(report)
  if (format === 'CSV') {
    downloadBlob(new Blob([reportCsv(report)], { type: 'text/csv;charset=utf-8' }), reportFilename(report, 'csv'))
    return
  }
  if (format === 'Excel') {
    const { Workbook } = await import('exceljs')
    const workbook = new Workbook()
    const sheet = workbook.addWorksheet('Report')
    sheet.addRow([report.title])
    sheet.addRow(['Period', report.period])
    sheet.addRow(['Generated (Asia/Manila)', reportTimestamp(report.generatedAt)])
    sheet.addRow(['Data', report.sample ? 'Sample data' : 'Report data'])
    Object.entries(report.filters ?? {}).forEach(filter => sheet.addRow(filter))
    sheet.addRow([])
    const header = sheet.addRow(columns.map(reportLabel))
    header.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF164B9B' } }
    rows.forEach(row => sheet.addRow(row))
    sheet.columns.forEach((column, index) => {
      column.width = Math.min(42, Math.max(18, reportLabel(columns[index] ?? '').length + 4))
      column.numFmt = '#,##0.00;[Red]-#,##0.00'
    })
    sheet.views = [{ state: 'frozen', ySplit: header.number }]
    sheet.autoFilter = { from: { row: header.number, column: 1 }, to: { row: header.number + report.rows.length, column: columns.length } }
    if (report.totals) sheet.lastRow!.font = { bold: true }
    const buffer = await workbook.xlsx.writeBuffer()
    downloadBlob(new Blob([buffer as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), reportFilename(report, 'xlsx'))
    return
  }
  const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a3' })
  pdf.setFontSize(16)
  pdf.text(report.title, 30, 32)
  pdf.setFontSize(9)
  const summary = [report.period, report.sample ? 'Sample data' : 'Report data', reportTimestamp(report.generatedAt),
    ...Object.entries(report.filters ?? {}).map(([key, value]) => `${key}: ${value}`)].join(' | ')
  const lines = pdf.splitTextToSize(summary, pdf.internal.pageSize.getWidth() - 60)
  pdf.text(lines, 30, 50)
  autoTable(pdf, {
    head: [columns.map(reportLabel)], body: rows.map(row => row.map(value => reportValue(value))),
    startY: 58 + lines.length * 11, margin: 30,
    styles: { fontSize: 8, cellPadding: 5, minCellWidth: 65 },
    headStyles: { fillColor: [22, 75, 155] },
    horizontalPageBreak: true,
    horizontalPageBreakRepeat: columns.includes('employeeNumber') ? columns.indexOf('employeeNumber') : 0,
    didDrawPage: () => {
      pdf.setFontSize(8)
      pdf.text(`${report.sample ? 'Sample data | ' : ''}Page ${pdf.getNumberOfPages()}`, 30, pdf.internal.pageSize.getHeight() - 12)
    },
  })
  pdf.save(reportFilename(report, 'pdf'))
}

export const exportReportWorkbook = async (reports: ReportDocument[]) => {
  if (!reports.length) throw new Error('No available report records to export.')
  const { Workbook } = await import('exceljs')
  const workbook = new Workbook()
  reports.forEach((report, index) => {
    const sheet = workbook.addWorksheet(`${index + 1} ${report.title}`.replace(/[\\/*?:\[\]]/g, '').slice(0, 31))
    const { columns, rows } = reportMatrix(report)
    sheet.addRow([report.title])
    sheet.addRow(['Period', report.period])
    sheet.addRow(['Data', report.sample ? 'Sample data' : 'Report data'])
    sheet.addRow(['Generated (Asia/Manila)', reportTimestamp(report.generatedAt)])
    sheet.addRow([])
    const header = sheet.addRow(columns.map(reportLabel))
    header.font = { bold: true }
    rows.forEach(row => sheet.addRow(row))
    sheet.columns.forEach(column => { column.width = 24 })
    sheet.views = [{ state: 'frozen', ySplit: header.number }]
  })
  const buffer = await workbook.xlsx.writeBuffer()
  downloadBlob(new Blob([buffer as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'available-reports.xlsx')
}

export const printReport = (report: ReportDocument) => {
  if (!report.rows.length) throw new Error('There are no matching records to print.')
  const popup = window.open('', '_blank', 'width=1200,height=850')
  if (!popup) throw new Error('Allow popups for this site to print the report.')
  const escape = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  )
  const { columns, rows } = reportMatrix(report)
  popup.document.write(`<!doctype html><html><head><title>${escape(report.title)}</title>
    <style>@page{size:A3 landscape;margin:12mm}body{font-family:Arial;font-size:9px}table{border-collapse:collapse;width:100%}td,th{padding:5px;border:1px solid #ccc;text-align:left}thead{display:table-header-group}tr{break-inside:avoid}h1{font-size:18px}</style></head><body>
    <h1>${escape(report.title)}</h1><p>${escape(report.period)} | ${report.sample ? 'Sample data | ' : ''}${escape(reportTimestamp(report.generatedAt))}</p>
    <p>${escape(Object.entries(report.filters ?? {}).map(([key, value]) => `${key}: ${value}`).join(' | '))}</p>
    <table><thead><tr>${columns.map(key => `<th>${escape(reportLabel(key))}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(row => `<tr>${row.map(value => `<td>${escape(reportValue(value))}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`)
  popup.document.close()
  popup.focus()
  popup.setTimeout(() => popup.print(), 300)
}

export const attendancePeriodMatches = (start: string, end: string, from: string, to: string) =>
  // Aggregated attendance rows cannot be split or prorated into partial periods.
  (!from || start >= from) && (!to || end <= to) && (!from || !to || from <= to)

export const validReportDates = (from: string, to: string) => {
  const valid = (value: string) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
  return valid(from) && valid(to) && (!from || !to || from <= to)
}
