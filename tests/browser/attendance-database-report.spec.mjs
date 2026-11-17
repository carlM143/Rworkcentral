import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import ExcelJS from 'exceljs'

test('database report lists employees without logs and exports all rows and daily details', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(() => {
    sessionStorage.setItem('rworkcentral-auth', '1')
    sessionStorage.setItem('rworkcentral-token', 'report-test')
    sessionStorage.setItem('rworkcentral-user', JSON.stringify({ id: 1, name: 'Administrator', role: 'admin' }))
  })
  const rows = Array.from({ length: 17 }, (_, i) => ({
    id: i + 1, employeeNumber: `EMP-${i + 1}`, employeeName: `Employee ${i + 1}`, department: 'Operations', location: 'Main', position: 'Staff',
    active: true, hasLogs: i !== 0, scheduledDays: 10, presentDays: i ? 9 : 0, absentDays: i ? 1 : 10, leaveDays: 0,
    lateCount: 0, lateMinutes: 0, undertimeMinutes: 0, workedMinutes: i ? 4320 : 0, overtimeMinutes: 0, missingPunchDays: 0,
  }))
  const requests = []
  await page.route('**/api/admin/reports/attendance?*', route => {
    const params = new URL(route.request().url()).searchParams
    requests.push(Object.fromEntries(params))
    let data = rows.filter(row => !params.get('employee_id') || row.id === Number(params.get('employee_id')))
    if (params.get('search')) data = data.filter(r => r.employeeName === params.get('search'))
    if (params.get('details') === '1') data = data.map(row => ({ ...row, days: [{
      date: '2026-11-09', status: row.hasLogs ? 'Present' : 'Absent', scheduledIn: '2026-11-09 08:00:00', scheduledOut: '2026-11-09 17:00:00',
      timeIn: null, timeOut: null, source: '', correction: '', holiday: '', leaveDays: 0, lateMinutes: 0, undertimeMinutes: 0, workedMinutes: 0, overtimeMinutes: 0, remarks: '',
    }] }))
    const totals = { employees: data.length }
    for (const key of ['scheduledDays', 'presentDays', 'absentDays', 'leaveDays', 'lateCount', 'lateMinutes', 'undertimeMinutes', 'workedMinutes', 'overtimeMinutes', 'missingPunchDays']) totals[key] = data.reduce((sum, r) => sum + r[key], 0)
    return route.fulfill({ json: { data, totals, options: { departments: [{ id: 1, name: 'Operations' }], locations: [{ id: 1, name: 'Main' }] }, period: { start: params.get('start'), end: params.get('end') }, generatedAt: '2026-11-17T12:00:00Z' } })
  })
  await page.goto('/admin/reports/attendance')
  await expect(page.locator('.table-panel tbody tr')).toHaveCount(15)
  await expect(page.locator('.table-panel').getByText('No attendance records', { exact: true })).toBeVisible()
  await expect(page.locator('.period')).toContainText('All 17 matching employees')
  await page.getByRole('combobox', { name: /^Format/ }).selectOption('csv')
  const csvPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export report', exact: true }).click()
  const csv = await readFile(await (await csvPromise).path(), 'utf8')
  expect(csv).toContain('Employee 17')
  expect(csv).toContain('Generated at')
  await page.getByRole('combobox', { name: /^Format/ }).selectOption('xlsx')
  const excelPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export report', exact: true }).click()
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(await (await excelPromise).path())
  expect(JSON.stringify(workbook.worksheets[0].getSheetValues())).toContain('Employee 17')
  await page.getByRole('button', { name: 'View daily' }).first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.locator('tbody')).toContainText('2026-11-09')
  const dailyPromise = page.waitForEvent('download')
  await dialog.getByRole('button', { name: 'Export employee daily details' }).click()
  expect((await dailyPromise).suggestedFilename()).toContain('attendance-daily')
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  await page.getByLabel('Employee', { exact: true }).fill('Employee 17')
  await page.getByRole('button', { name: 'Apply filters' }).click()
  await expect(page.locator('.table-panel tbody tr')).toHaveCount(1)
  await expect(page.locator('.period')).toContainText('All 1 matching employees')
  expect(requests.some(r => r.employee_id === '1' && r.details === '1')).toBe(true)
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  expect(errors).toEqual([])
})
