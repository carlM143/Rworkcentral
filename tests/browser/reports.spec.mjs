import { test, expect } from '@playwright/test'
import fs from 'node:fs/promises'
import ExcelJS from 'exceljs'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('rworkcentral-auth', '1')
    sessionStorage.setItem('rworkcentral-token', 'reports-ui-test')
    sessionStorage.setItem('rworkcentral-user', JSON.stringify({ id: 1, name: 'Report Tester', role: 'admin' }))
    window.print = () => { window.__printed = true }
  })
})

const reports = [
  ['/admin/reports/attendance', 'Attendance Report'],
  ['/admin/reports/payroll', 'Payroll Report'],
  ['/admin/13th-month-pay', '13th Month Pay'],
  ['/admin/reports/sss', 'SSS Report'],
  ['/admin/reports/pagibig', 'Pag-IBIG Report'],
  ['/admin/reports/philhealth', 'PhilHealth Report'],
  ['/admin/reports/billing', 'Billing Report'],
  ['/admin/reports/wage-compliance', 'Wage Compliance Report'],
]

for (const [route, title] of reports) {
  test(`${title}: filters, details, preview, Excel and PDF downloads`, async ({ page }) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(route)
    const content = page.locator('.page-content')
    await expect(content.locator('tbody tr').first()).toBeVisible()
    const initialName = (await content.locator('tbody tr').first().innerText()).split('\n').map(s => s.trim()).find(Boolean)
    const search = content.locator('input[placeholder^="Search"]').first()
    const nextPage = content.locator('.pagination-button.arrow').last()
    if (await nextPage.isEnabled()) {
      await nextPage.click()
      await expect(content.locator('tbody tr').first()).not.toContainText(initialName)
    }
    await search.fill('no-matching-report-record-12345')
    await expect(content).toContainText(/No .*records (found|match)/)
    await content.getByRole('button', { name: 'Reset', exact: true }).click()
    await expect(content.locator('tbody tr').first()).toContainText(initialName)
    await search.fill(initialName)
    await expect(content.locator('tbody tr')).toHaveCount(1)
    const view = content.getByRole('button', { name: /View report details|^View$/ }).first()
    await view.click()
    const dialog = page.locator('dialog[open]')
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText(initialName)
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(view).toBeFocused()
    if (route.includes('wage-compliance')) await content.getByRole('button', { name: 'Export Report', exact: true }).click()
    else await content.getByRole('button', { name: /Generate/ }).click()
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText('Sample data preview')
    const excelEvent = page.waitForEvent('download')
    await dialog.getByRole('button', { name: 'Excel', exact: true }).click()
    const excel = await excelEvent
    expect(excel.suggestedFilename()).toMatch(/\.xlsx$/)
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(await excel.path())
    expect(workbook.worksheets[0].getRow(1).getCell(1).value).toBe(title)
    expect(workbook.worksheets[0].rowCount).toBeGreaterThan(6)
    expect(workbook.worksheets[0].getColumn(1).values.filter(value => value === 'TOTAL (ALL FILTERED RECORDS)')).toHaveLength(route.includes('wage-compliance') ? 0 : 1)
    const pdfEvent = page.waitForEvent('download')
    await dialog.getByRole('button', { name: 'PDF', exact: true }).click()
    const pdf = await pdfEvent
    const bytes = await fs.readFile(await pdf.path())
    expect(bytes.subarray(0, 5).toString()).toBe('%PDF-')
    if (route === '/admin/reports/payroll') {
      const popupEvent = page.waitForEvent('popup')
      await dialog.getByRole('button', { name: 'Print', exact: true }).click()
      const popup = await popupEvent
      await expect(popup.locator('tbody tr')).toHaveCount(2)
      await expect(popup.locator('body')).toContainText(initialName)
      await popup.close()
    }
    await dialog.getByRole('button', { name: 'Close', exact: true }).click()
    expect(errors).toEqual([])
  })
}

test('attendance rejects reversed dates and never fabricates another period', async ({ page }) => {
  await page.goto('/admin/reports/attendance')
  const dates = page.locator('.page-content input[type="date"]')
  await dates.nth(0).fill('2026-10-20')
  await dates.nth(1).fill('2026-10-01')
  await page.getByRole('button', { name: /Generate/ }).click()
  await expect(page.getByText('Check report filters')).toBeVisible()
  await dates.nth(0).fill('2026-09-01')
  await dates.nth(1).fill('2026-09-30')
  await expect(page.getByText('No attendance records found')).toBeVisible()
})

test('center exports real worksheets and overview re-downloads archived snapshots', async ({ page }) => {
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/admin/reports/center')
  await page.getByRole('button', { name: 'Available Reports', exact: true }).click()
  await expect(page.locator('.report-card')).toHaveCount(8)
  const event = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export Available Reports', exact: true }).click()
  const file = await event
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(await file.path())
  expect(workbook.worksheets).toHaveLength(8)
  expect(workbook.worksheets.every(sheet => sheet.rowCount > 6)).toBe(true)
  // Navigate using the app router to retain this session's generated snapshots.
  await page.locator('a[href="/admin/reports"]').click()
  await expect(page.locator('.reports-table tbody tr')).toHaveCount(8)
  const recent = page.waitForEvent('download')
  await page.locator('.download-button').first().click()
  expect((await recent).suggestedFilename()).toMatch(/\.xlsx$/)
  await page.getByRole('button', { name: 'Browse Reports', exact: true }).click()
  await expect(page).toHaveURL(/\/admin\/reports\/center/)
  expect(errors).toEqual([])
})

test('report center previews actual report data and exports CSV', async ({ page }) => {
  await page.goto('/admin/reports/center')
  const card = page.locator('.report-card').filter({ has: page.getByRole('heading', { name: 'Attendance Report', exact: true }) })
  await card.getByRole('button', { name: 'Export', exact: true }).click()
  const dialog = page.locator('dialog[open]')
  await expect(dialog.locator('tbody tr')).toHaveCount(12)
  const downloadEvent = page.waitForEvent('download')
  await dialog.getByRole('button', { name: 'CSV', exact: true }).click()
  const download = await downloadEvent
  const csv = await fs.readFile(await download.path(), 'utf8')
  expect(csv).toContain('Employee Number')
  expect(csv).toContain('EMP-001')
  expect(csv).toContain('TOTAL (ALL FILTERED RECORDS)')
})

test('statutory month filter and mobile report dialog work', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/admin/reports/sss')
  const month = page.locator('.page-content select').filter({ has: page.locator('option[value="October"]') })
  await month.selectOption('September')
  await expect(page.getByText('No SSS records found')).toBeVisible()
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await page.getByRole('button', { name: /Generate/ }).click()
  const dialog = page.locator('dialog[open]')
  await expect(dialog).toBeVisible()
  const bounds = await dialog.boundingBox()
  expect(bounds.x).toBeGreaterThanOrEqual(0)
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390)
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
})
