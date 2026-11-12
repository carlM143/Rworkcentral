import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('rworkcentral-auth', '1')
    sessionStorage.setItem('rworkcentral-token', 'lifecycle-test')
    sessionStorage.setItem('rworkcentral-user', JSON.stringify({ id: 1, name: 'HR Administrator', role: 'admin' }))
  })
})

test('offboarding creates an API record, survives reload and exports filtered results', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message))
  const employee = { employeeId: 1, employeeNumber: 'EMP-001', employeeName: 'Test Employee', department: 'Operations', position: 'Coordinator' }
  let records = []
  await page.route('**/api/admin/lifecycle/employees', route => route.fulfill({ json: { data: [employee] } }))
  await page.route('**/api/admin/lifecycle/offboarding', async route => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON()
      records = [{ ...body, ...employee, id: 1, offboardingNumber: 'OFF-000001', initiatedBy: 'HR Administrator', completedTasks: 0, totalTasks: 6, clearanceProgress: 0 }]
      return route.fulfill({ json: { data: records[0] } })
    }
    return route.fulfill({ json: { data: records } })
  })
  await page.goto('/admin/employee-lifecycle/offboarding')
  await page.getByRole('button', { name: 'Start Offboarding', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('combobox', { name: 'Employee *', exact: true }).selectOption('1')
  await dialog.getByLabel('Notice date').fill('2026-11-01')
  await dialog.getByLabel('Last working day').fill('2026-11-30')
  await dialog.getByLabel('Separation date').fill('2026-12-01')
  await dialog.getByLabel('Reason').fill('Relocation')
  await dialog.getByRole('button', { name: 'Save Offboarding' }).click()
  await expect(dialog).toHaveCount(0)
  await expect(page.locator('tbody')).toContainText('Test Employee')
  await page.reload()
  await expect(page.locator('tbody')).toContainText('OFF-000001')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export', exact: true }).click()
  expect((await download).suggestedFilename()).toBe('employee-offboarding.csv')
  expect(errors).toEqual([])
})

test('milestones automatically display detected employees without manual creation', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message))
  const milestones = [{ id: 1, employeeId: 1, employeeNumber: 'EMP-001', employeeName: 'Test Employee', department: 'Operations', position: 'Coordinator', employmentType: 'Probationary', stageName: 'Review', stageCode: 'REVIEW', policyName: 'Probation', dueDate: '2026-12-01', status: 'pending' }]
  await page.route('**/api/admin/employment-types**', route => route.fulfill({ json: { data: [
    { id: 1, name: 'Part-Time', status: 'active' },
    { id: 2, name: 'Contractual', status: 'active' },
    { id: 3, name: 'Regular', status: 'active' },
    { id: 4, name: 'Probationary', status: 'active' },
    { id: 5, name: 'Training', status: 'active' },
  ] } }))
  await page.route('**/api/admin/lifecycle/**', async route => {
    const path = new URL(route.request().url()).pathname.split('/').pop()
    if (path === 'employees') return route.fulfill({ json: { data: [{ employeeId: 1, employeeName: 'Test Employee', employeeNumber: 'EMP-001' }] } })
    if (path === 'stages') return route.fulfill({ json: { data: [{ id: 1, lifecycle_policy_id: 1, stage_name: 'Review', stage_code: 'REVIEW', status: true, lifecycle_policy: { name: 'Probation' } }] } })
    if (path === 'milestones') {
      expect(route.request().method()).toBe('GET')
      return route.fulfill({ json: { data: milestones } })
    }
    return route.fulfill({ json: { data: [] } })
  })
  await page.goto('/admin/employee-lifecycle/milestones')
  await expect(page.getByRole('button', { name: 'Add Milestone', exact: true })).toHaveCount(0)
  await expect(page.locator('tbody')).toContainText('Test Employee')
  await expect(page.getByRole('button', { name: 'Change Type', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Upload Proof', exact: true })).toBeVisible()
  const employmentTypeFilter = page.getByRole('combobox', { name: 'Filter by employment type' })
  await expect(employmentTypeFilter.locator('option')).toHaveCount(6)
  await expect(employmentTypeFilter.locator('option')).toContainText(['All Employment Types', 'Contractual', 'Part-Time', 'Probationary', 'Regular', 'Training'])
  expect(errors).toEqual([])
})
