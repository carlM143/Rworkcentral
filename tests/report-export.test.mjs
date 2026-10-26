import { test } from 'node:test'
import assert from 'node:assert/strict'
import { attendancePeriodMatches, validReportDates, reportCsv, reportMatrix } from '../app/utils/reportExport.ts'

test('attendance only includes complete aggregate periods within the selected range', () => {
  assert.equal(attendancePeriodMatches('2026-10-01', '2026-10-15', '2026-10-01', '2026-10-15'), true)
  assert.equal(attendancePeriodMatches('2026-10-01', '2026-10-15', '2026-09-01', '2026-09-30'), false)
  assert.equal(attendancePeriodMatches('2026-10-01', '2026-10-15', '2026-10-05', '2026-10-15'), false)
  assert.equal(attendancePeriodMatches('2026-10-01', '2026-10-15', '', ''), true)
  assert.equal(validReportDates('2026-10-31', '2026-10-01'), false)
  assert.equal(validReportDates('2026-02-30', '2026-10-01'), false)
  assert.equal(validReportDates('', ''), true)
})

test('export retains numeric totals, quotes text and neutralizes formula cells', () => {
  const report = {
    title: 'Attendance', period: 'October 2026', generatedAt: '2026-10-26T04:00:00Z', sample: true,
    rows: [{ id: 1, employeeId: 4, employeeNumber: '001', employeeName: '=HYPERLINK("bad")', totalWorkedHours: 8.5, remarks: 'Line 1\n"Quoted", text' }],
    totals: { workedHours: 8.5 },
  }
  const { columns, rows } = reportMatrix(report)
  assert.equal(columns.includes('id'), false)
  assert.equal(columns.includes('employeeId'), false)
  assert.equal(rows.at(-1)[columns.indexOf('totalWorkedHours')], 8.5)
  const csv = reportCsv(report)
  assert.ok(csv.startsWith('\uFEFF'))
  assert.ok(csv.includes('"\'=HYPERLINK(""bad"")"'))
  assert.ok(csv.includes('"Line 1\n""Quoted"", text"'))
  assert.ok(csv.includes('Sample data'))
})
