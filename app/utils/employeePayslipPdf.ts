import { payslipBank, payslipTotals, type EmployeePayslip, type PayslipLine } from './employeePayslip'

// Dependency-free landscape A4 PDF. ASCII streams keep byte offsets exact;
// standard PDF Helvetica fonts transliterate accented Latin characters.
export const employeePayslipPdf = (
  slip: EmployeePayslip,
  profile: { name: string; employeeId: string; position: string; department: string; location?: string },
): Uint8Array => {
  const width = 842
  const height = 595
  const margin = 24
  const contentWidth = width - margin * 2
  const commands: string[] = []
  const ascii = (value: string) => value.replace(/[–—]/g, '-').replace(/·/g, '-').replace(/•/g, '*').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7e]/g, '?')
  const escape = (value: string) => ascii(value).replace(/[\\()]/g, '\\$&')
  const measure = (value: string, size: number) => [...ascii(value)].reduce((sum, char) => {
    if (/\d/.test(char)) return sum + .556 * size
    if (/[ .,:'!|]/.test(char)) return sum + .278 * size
    if (char === 'P') return sum + .667 * size
    if (char === 'H') return sum + .722 * size
    if (/[MW@mw]/.test(char)) return sum + size
    return sum + (/[A-Z]/.test(char) ? .74 : .6) * size
  }, 0)
  const wrap = (value: string, maxWidth: number, size: number) => {
    const lines: string[] = []
    let current = ''
    for (const word of ascii(value).split(/\s+/)) {
      if (current && measure(`${current} ${word}`, size) > maxWidth) { lines.push(current); current = '' }
      for (const char of (current ? ` ${word}` : word)) {
        if (measure(current + char, size) > maxWidth && current) { lines.push(current); current = '' }
        current += char
      }
    }
    if (current || !lines.length) lines.push(current)
    return lines
  }
  const text = (value: string, x: number, top: number, size = 9, bold = false, color = '0.08 0.13 0.2') => {
    commands.push(`${color} rg BT /${bold ? 'F2' : 'F1'} ${size} Tf 1 0 0 1 ${x} ${height - top - size} Tm (${escape(value)}) Tj ET`)
  }
  const box = (x: number, top: number, w: number, h: number, color = '1 1 1') => {
    commands.push(`${color} rg ${x} ${height - top - h} ${w} ${h} re f 0.84 0.87 0.91 RG 0.5 w ${x} ${height - top - h} ${w} ${h} re S`)
  }
  const money = (amount: number) => `PHP ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`
  const rightText = (value: string, right: number, top: number, size = 9, bold = false) => text(value, right - measure(value, size), top, size, bold)
  const totals = payslipTotals(slip)
  text('RWorkCentral Inc.', margin, 18, 16, true)
  rightText('EMPLOYEE PAYSLIP', width - margin, 23, 11, true)

  let top = 52
  const names = wrap(profile.name.toUpperCase(), 510, 12)
  const identity = wrap(`${profile.employeeId} - ${profile.position} - ${profile.department}${profile.location ? ` - ${profile.location}` : ''}`, 510, 8)
  const bank = wrap(payslipBank(slip), 225, 9)
  const identityHeight = Math.max(48, names.length * 15 + identity.length * 11 + 18, bank.length * 12 + 30)
  box(margin, top, contentWidth, identityHeight, '0.035 0.17 0.35')
  names.forEach((line, index) => text(line, margin + 10, top + 9 + index * 15, 12, true, '1 1 1'))
  identity.forEach((line, index) => text(line, margin + 10, top + 11 + names.length * 15 + index * 11, 8, false, '0.78 0.86 0.96'))
  text('BANK INFORMATION', width - margin - 235, top + 8, 7, true, '0.78 0.86 0.96')
  bank.forEach((line, index) => text(line, width - margin - 235, top + 22 + index * 12, 9, false, '1 1 1'))
  top += identityHeight

  const metadataWidths = [285, 300, contentWidth - 585]
  const metadata = [
    { label: 'PAY PERIOD', value: slip.period, extra: '', color: '1 1 1' },
    { label: 'PAYROLL SCOPE', value: slip.payrollScope, extra: '', color: '0.93 0.95 1' },
    { label: 'BATCH / REFERENCE', value: slip.batch, extra: `Released: ${slip.releasedAt}`, color: '1 1 1' },
  ]
  let x = margin
  metadata.forEach((field, index) => {
    const w = metadataWidths[index]!
    box(x, top, w, 48, field.color)
    text(field.label, x + 9, top + 7, 7, true, '0.43 0.48 0.55')
    wrap(field.value, w - 18, 9).forEach((line, lineIndex) => text(line, x + 9, top + 20 + lineIndex * 10, 9, true))
    if (field.extra) text(field.extra, x + 9, top + 35, 7)
    x += w
  })
  top += 48

  const metrics = [
    { label: 'WORKED', value: `${slip.daysWorked} Days`, color: '1 1 1' },
    { label: 'DAILY RATE', value: money(slip.dailyRate), color: '1 1 1' },
    { label: 'GROSS EARNINGS', value: money(totals.gross), color: '1 1 1' },
    { label: 'TOTAL DEDUCTIONS', value: money(totals.totalDeductions), color: '1 0.96 0.92' },
    { label: 'NET PAY', value: money(totals.net), color: '0.91 0.99 0.95' },
  ]
  const metricWidth = contentWidth / metrics.length
  metrics.forEach((metric, index) => {
    const left = margin + index * metricWidth
    box(left, top, metricWidth, 52, metric.color)
    text(metric.label, left + 10, top + 8, 7, true, '0.43 0.48 0.55')
    text(metric.value, left + 10, top + 26, 13, true)
  })
  top += 52

  const groups: { title: string; rows: PayslipLine[]; empty: string; total: number }[] = [
    { title: 'EARNINGS & ALLOWANCES', rows: slip.earnings, empty: 'No earnings', total: totals.gross },
    { title: 'BENEFITS / CONTRIBUTIONS', rows: slip.benefits, empty: 'No contributions', total: totals.benefits },
    { title: 'OTHER DEDUCTIONS', rows: slip.deductions, empty: 'No other deductions', total: totals.deductions },
    { title: 'LOANS', rows: slip.loans, empty: 'No loans', total: totals.loans },
  ]
  const columnWidth = contentWidth / 4
  const layouts = groups.map(group => group.rows.map(row => ({ row, labels: wrap(row.label, columnWidth - 88, 8) })))
  const bodyHeight = Math.max(80, ...layouts.map(rows => rows.reduce((sum, item) => sum + Math.max(12, item.labels.length * 11) + 9, 0) + 32))
  groups.forEach((group, index) => {
    const left = margin + index * columnWidth
    box(left, top, columnWidth, 23, '0.95 0.96 0.98')
    text(group.title, left + 8, top + 8, 7, true)
    box(left, top + 23, columnWidth, bodyHeight)
    let rowTop = top + 33
    if (!group.rows.length) text(group.empty, left + 8, rowTop, 8, false, '0.5 0.55 0.61')
    layouts[index]!.forEach(item => {
      item.labels.forEach((line, labelIndex) => text(line, left + 8, rowTop + labelIndex * 11, 8))
      rightText(money(item.row.amount), left + columnWidth - 8, rowTop, 8, true)
      rowTop += Math.max(12, item.labels.length * 11) + 9
    })
    text('Total', left + 8, top + 23 + bodyHeight - 19, 8, true)
    rightText(money(group.total), left + columnWidth - 8, top + 23 + bodyHeight - 19, 8, true)
  })
  top += 23 + bodyHeight
  const remarks = wrap(slip.remarks, contentWidth - 90, 8)
  const remarksHeight = Math.max(30, remarks.length * 11 + 16)
  if (top + remarksHeight > height - 52) throw new Error('Payslip content exceeds the supported page size.')
  box(margin, top, contentWidth, remarksHeight, '1 0.98 0.91')
  text('REMARKS', margin + 8, top + 9, 7, true)
  remarks.forEach((line, index) => text(line, margin + 75, top + 8 + index * 11, 8))
  text('Benefits are employee contributions included in deductions. Figures are frontend references, not verified payroll or statutory calculations.', margin, height - 37, 7)
  rightText('Page 1 of 1', width - margin, height - 22, 7)

  const stream = commands.join('\n') + '\n'
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}endstream`,
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n` })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  pdf += offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return new TextEncoder().encode(pdf)
}
