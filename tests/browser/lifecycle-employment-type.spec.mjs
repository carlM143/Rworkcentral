import { test, expect } from '@playwright/test'

test('milestone change type dialog saves evaluation proof and records the effective date', async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('rworkcentral-auth', '1')
    sessionStorage.setItem('rworkcentral-token', 'lifecycle-test')
    sessionStorage.setItem('rworkcentral-user', JSON.stringify({ id: 1, name: 'HR Administrator', role: 'admin' }))
  })
  const errors = []; page.on('pageerror', error => errors.push(error.message))
  const employee = { employeeId: 1, employeeNumber: 'EMP-001', employeeName: 'Test Employee', employmentId: 10, employmentTypeId: 1, employmentType: 'Probationary', dateHired: '2026-01-31' }
  let milestone = { ...employee, id: 7, department: 'Operations', stageName: 'Probationary → Regular', stageCode: 'M6_REGULARIZATION', dueDate: '2026-07-31', reviewWindowStart: '2026-04-30', reviewWindowEnd: '2026-07-31', status: 'pending', requiresAttachment: true }
  let history = []
  let uploads = 0
  await page.route('**/api/admin/employees/1/lifecycle-evaluations', route => {
    expect(route.request().method()).toBe('POST')
    expect(route.request().postData()).toContain('evaluation.pdf')
    uploads++
    return route.fulfill({ json: { data: { id: 42 } } })
  })
  await page.route('**/api/admin/employment-types**', route => route.fulfill({ json: { data: [
    { id: 1, name: 'Part-Time', status: 'active' },
    { id: 2, name: 'Contractual', status: 'active' },
    { id: 3, name: 'Regular', status: 'active' },
    { id: 4, name: 'Probationary', status: 'active' },
    { id: 5, name: 'Training', status: 'active' },
  ] } }))
  await page.route('**/api/admin/lifecycle/**', async route => {
    const path = new URL(route.request().url()).pathname
    if (path.endsWith('/employment-type-changes')) {
      if (route.request().method() === 'POST') {
        const data = route.request().postDataJSON()
        expect(data).toEqual({
          employment_id: 10, previous_type_id: 1, employment_type_id: 3, effective_date: '2026-08-01',
          evaluation: { milestone_id: 7, remarks: '', evaluation_document_id: 42, status: 'completed' },
        })
        expect(uploads).toBe(1)
        milestone = { ...milestone, employmentType: 'Regular', status: 'completed', attachmentName: 'evaluation.pdf', evaluationDocumentId: 42 }
        employee.employmentType = 'Regular'; employee.employmentTypeId = 3
        history = [{ id: 1, previous_type_name: 'Probationary', new_type_name: 'Regular', reason: '', effective_date: data.effective_date, changed_by_name: 'HR Administrator', created_at: '2026-11-12 12:00:00' }]
        return route.fulfill({ json: { data: employee } })
      }
      return route.fulfill({ json: { data: history } })
    }
    if (path.endsWith('/milestones')) return route.fulfill({ json: { data: [milestone] } })
    if (path.endsWith('/employees')) return route.fulfill({ json: { data: [employee] } })
    if (path.endsWith('/policies')) return route.fulfill({ json: { data: [
      { id: 1, name: 'Probationary Regularization Policy', employment_type_id: 1, status: true },
      { id: 2, name: 'Regular Employee Career & Milestone Policy', employment_type_id: 3, status: true },
    ] } })
    if (path.endsWith('/stages')) return route.fulfill({ json: { data: [
      { id: 5, lifecycle_policy_id: 2, stage_name: '1st Year Service Anniversary', months_after_hire: 12, sort_order: 1, status: true },
      { id: 6, lifecycle_policy_id: 2, stage_name: '2nd Year Career Progression Review', months_after_hire: 24, sort_order: 2, status: true },
    ] } })
    return route.fulfill({ json: { data: [] } })
  })
  await page.goto('/admin/employee-lifecycle/milestones')
  await expect(page.getByRole('row').filter({ hasText: 'Test Employee' })).toContainText('Apr 30, 2026 – Jul 31, 2026')
  await page.getByRole('button', { name: 'Actions for Test Employee: Probationary → Regular' }).click()
  await page.getByRole('menuitem', { name: 'Change Type', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Change Employment Type' })
  await expect(dialog.getByRole('combobox', { name: 'Employee', exact: true })).toBeDisabled()
  await expect(dialog.getByRole('button', { name: /upload proof/i })).toBeVisible()
  await expect(dialog).toContainText('Current employment type: Probationary')
  await expect(dialog).toContainText('Hired Jan 31, 2026')
  await dialog.getByRole('combobox', { name: 'Change type to' }).selectOption('3')
  await expect(dialog).toContainText('New lifecycle plan — Regular')
  await expect(dialog).toContainText('1st Year Service Anniversary')
  await expect(dialog).toContainText('Jan 31, 2027')
  await expect(dialog).toContainText('2nd Year Career Progression Review')
  await expect(dialog).toContainText('Jan 31, 2028')
  await expect(dialog.getByLabel('Reason for change')).toHaveCount(0)
  const saveType = dialog.getByRole('button', { name: 'Save Employment Type' })
  await expect(saveType).toBeDisabled()
  await dialog.getByLabel('Effective Date').fill('2026-08-01')
  await expect(saveType).toBeDisabled()
  await dialog.locator('input[type=file]').setInputFiles({ name: 'evaluation.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n') })
  await expect(dialog.getByRole('button', { name: 'Save Evaluation', exact: true })).toHaveCount(0)
  await expect(saveType).toBeEnabled()
  expect(uploads).toBe(0)
  await saveType.click()
  await expect(dialog).not.toBeVisible()
  await expect(page.getByRole('row').filter({ hasText: 'Test Employee' })).toContainText('Completed')
  await page.getByRole('button', { name: 'Change Employment Type', exact: true }).click()
  await dialog.getByRole('combobox', { name: 'Employee', exact: true }).selectOption('1')
  await expect(dialog).toContainText('Current employment type: Regular')
  await expect(dialog).toContainText('Probationary → Regular')
  await expect(dialog).toContainText('Effective Aug 1, 2026')
  expect(errors).toEqual([])
})
