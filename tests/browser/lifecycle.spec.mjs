import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('rworkcentral-auth', '1')
    sessionStorage.setItem('rworkcentral-token', 'lifecycle-test')
    sessionStorage.setItem('rworkcentral-user', JSON.stringify({ id: 1, name: 'HR Administrator', role: 'admin' }))
  })
})

test('adding a lifecycle stage does not require a stage code', async ({ page }) => {
  const policy = { id: 1, name: 'Probation', status: true }
  const stages = []
  await page.route('**/api/admin/employment-types**', route => route.fulfill({ json: { data: [] } }))
  await page.route('**/api/admin/lifecycle/policies', route => route.fulfill({ json: { data: [policy] } }))
  await page.route('**/api/admin/lifecycle/stages', async route => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON()
      expect(body.stage_name).toBe('Follow-up Review')
      expect(body).not.toHaveProperty('stage_code')
      expect(body.months_after_hire).toBe(2)
      expect(body.end_month_after_hire).toBeNull()
      const stage = { ...body, id: 1, stage_code: 'STG_FOLLOW_UP_REVIEW', lifecycle_policy: policy }
      stages.push(stage)
      return route.fulfill({ json: { data: stage } })
    }
    return route.fulfill({ json: { data: stages } })
  })
  await page.goto('/admin/employee-lifecycle/stages')
  await page.getByRole('button', { name: 'Add Stage' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByLabel(/stage code/i)).toHaveCount(0)
  await dialog.getByLabel('Stage Name').fill('Follow-up Review')
  const start = dialog.getByLabel('Start Month')
  const save = dialog.getByRole('button', { name: 'Save Stage' })
  await start.fill('')
  await expect(save).toBeDisabled()
  await start.fill('2')
  await expect(dialog.getByLabel('End Month')).toHaveValue('')
  await save.click()
  await expect(page.getByRole('row').filter({ hasText: 'Follow-up Review' })).toContainText('STG_FOLLOW_UP_REVIEW')
})

test('HR can edit the probationary review window in Lifecycle Stages', async ({ page }) => {
  const policy = {
    id: 1, name: 'Probationary Regularization Policy', employment_type_id: 2,
    employment_type: { name: 'Probationary' }, status: true, stages_count: 1,
  }
  let stage = {
    id: 7, lifecycle_policy_id: 1, stage_name: 'Probationary → Regular', stage_code: 'M6_REGULARIZATION',
    months_after_hire: 3, end_month_after_hire: 6, sort_order: 1, status: true,
    requires_attachment: true, is_managed_regularization: true,
  }
  await page.route('**/api/admin/employment-types**', route => route.fulfill({ json: { data: [{ id: 2, name: 'Probationary' }] } }))
  await page.route('**/api/admin/lifecycle/stages', route => route.fulfill({ json: { data: [
    { ...stage, lifecycle_policy: policy },
    { ...stage, id: 8, stage_name: '3rd Month Review', stage_code: 'M3_EVAL', is_managed_regularization: false, lifecycle_policy: policy },
  ] } }))
  await page.route('**/api/admin/lifecycle/policies', route => route.fulfill({ json: { data: [{ ...policy, regularization_stage: stage }] } }))
  await page.route('**/api/admin/lifecycle/stages/7', async route => {
    expect(route.request().method()).toBe('PUT')
    const data = route.request().postDataJSON()
    expect(data.months_after_hire).toBe(2)
    expect(data.end_month_after_hire).toBe(5)
    stage = { ...stage, months_after_hire: 2, end_month_after_hire: 5 }
    await route.fulfill({ json: { data: { ...stage, lifecycle_policy: policy } } })
  })
  await page.goto('/admin/employee-lifecycle/stages')
  const row = page.getByRole('row').filter({ hasText: stage.stage_name })
  await expect(row).toContainText('3–6 months')
  await expect(page.getByRole('row').filter({ hasText: '3rd Month Review' })).toHaveCount(0)
  await row.getByRole('button', { name: 'Edit Stage' }).click()
  const start = page.getByLabel('Start Month')
  const end = page.getByLabel('End Month')
  const save = page.getByRole('button', { name: 'Save Stage' })
  await expect(start).toHaveValue('3')
  await expect(end).toHaveValue('6')
  await start.fill('2')
  await end.fill('1')
  await expect(save).toBeDisabled()
  await end.fill('5')
  await save.click()
  await expect(row).toContainText('2–5 months')
  await page.goto('/admin/employee-lifecycle/policies')
  await page.getByRole('button', { name: 'Edit Policy' }).click()
  await expect(page.getByLabel('Start Month')).toHaveCount(0)
  await expect(page.getByLabel('End Month')).toHaveCount(0)
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
  const milestones = [{ id: 1, employeeId: 1, employeeNumber: '001', employeeName: 'Test Employee', department: 'Operations', position: 'Coordinator', employmentType: 'Probationary', stageName: 'Review', stageCode: 'REVIEW', policyName: 'Probation', dueDate: '2026-12-01', status: 'pending', remarks: 'Schedule a follow-up review' }]
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
  const row = page.getByRole('row').filter({ hasText: 'Test Employee' })
  await expect(row).toContainText('Review')
  await expect(row).toContainText('Pending')
  await expect(row).not.toContainText('Coordinator')
  await expect(row).not.toContainText('EMP-001')
  await expect(row).not.toContainText('No attachment')
  await expect(row.getByRole('button')).toHaveCount(1)
  await row.getByRole('button', { name: 'Actions for Test Employee: Review' }).click()
  const menu = page.getByRole('menu')
  for (const name of ['View Details', 'Employee History', 'Change Type']) {
    await expect(menu.getByRole('menuitem', { name, exact: true })).toBeVisible()
  }
  await expect(menu.getByRole('menuitem', { name: /proof/i })).toHaveCount(0)
  await expect(menu.getByRole('menuitem', { name: 'Set Review Period' })).toHaveCount(0)
  await menu.getByRole('menuitem', { name: 'View Details' }).click()
  const details = page.getByRole('dialog', { name: 'Milestone Details' })
  await expect(details).toContainText('EMP-001')
  await expect(details).toContainText('Coordinator')
  await expect(details).toContainText('No attachment')
  await expect(details).toContainText('Schedule a follow-up review')
  await page.keyboard.press('Escape')
  await expect(details).not.toBeVisible()
  const employmentTypeFilter = page.getByRole('combobox', { name: 'Filter by employment type' })
  await expect(employmentTypeFilter.locator('option')).toHaveCount(6)
  await expect(employmentTypeFilter.locator('option')).toContainText(['All Employment Types', 'Contractual', 'Part-Time', 'Probationary', 'Regular', 'Training'])
  expect(errors).toEqual([])
})
