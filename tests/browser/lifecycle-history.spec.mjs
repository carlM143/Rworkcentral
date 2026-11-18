import { test, expect } from '@playwright/test'

test('selecting an employee opens only their timeline and supports direct links', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(() => {
    sessionStorage.setItem('rworkcentral-auth', '1')
    sessionStorage.setItem('rworkcentral-token', 'history-test')
    sessionStorage.setItem('rworkcentral-user', JSON.stringify({ id: 1, name: 'HR Administrator', role: 'admin' }))
  })
  const employees = [
    { employeeId: 1, employeeNumber: 'EMP-001', employeeName: 'Ana Employee', department: 'Operations', position: 'Coordinator', employmentType: 'Regular', dateHired: '2026-01-01' },
    { employeeId: 2, employeeNumber: 'EMP-002', employeeName: 'Ben Employee', department: 'Finance', position: 'Accountant', employmentType: 'Probationary', dateHired: '2026-03-01' },
  ]
  await page.route('**/api/admin/employees/1/lifecycle-evaluations/17', route =>
    route.fulfill({ contentType: 'application/pdf', body: '%PDF-1.4\n' }))
  await page.route('**/api/admin/lifecycle/employees**', route => {
    const url = new URL(route.request().url())
    const path = url.pathname
    if (path.endsWith('/history')) {
      const employee = path.includes('/1/history') ? employees[0] : employees[1]
      const events = employee.employeeId === 1 ? [
        { id: 'hire-1', category: 'Employment', title: 'Employment record — Probationary', date: '2026-01-01', description: 'Hire date recorded.', actor: null, status: 'Probationary' },
        { id: 'change-1', category: 'Employment Type Change', title: 'Probationary → Regular', date: '2026-07-01', description: 'Qualified after evaluation', actor: 'HR Administrator', status: 'Regular' },
        { id: 'milestone-1', category: 'Milestone', title: 'Regularization Evaluation', date: '2026-07-01', dateLabel: 'Last updated', status: 'Completed', attachmentName: 'evaluation.pdf', evaluationDocumentId: 17 },
      ] : [
        { id: 'hire-2', category: 'Employment', title: 'Employment record — Probationary', date: '2026-03-01', dateLabel: 'Hire date', status: 'Probationary' },
      ]
      const pendingMilestones = employee.employeeId === 2 ? [
        { id: 8, stageName: 'Probationary Review', policyName: 'Regularization Policy', reviewWindowStart: '2026-06-01', reviewWindowEnd: '2026-09-01' },
      ] : []
      return route.fulfill({ json: { data: { employee, events, pendingMilestones } } })
    }
    expect(url.searchParams.get('lifecycle_activity')).toBe('1')
    return route.fulfill({ json: { data: [employees[1], employees[0]] } })
  })
  await page.goto('/admin/employee-lifecycle/employee-history')
  await expect(page.locator('tbody tr').first()).toContainText('Ben Employee')
  const typeFilter = page.getByRole('combobox', { name: 'Filter by employment type' })
  await typeFilter.selectOption('Probationary')
  await expect(page.getByRole('link', { name: 'Ana Employee', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'Reset' }).click()
  await page.getByRole('link', { name: 'Ana Employee', exact: true }).click()
  await expect(page).toHaveURL(/employee=1/)
  await expect(page.getByRole('heading', { name: 'Probationary → Regular' })).toBeVisible()
  await expect(page.getByText('Qualified after evaluation')).toBeVisible()
  await expect(page.getByText('No pending milestones for this employee.')).toBeVisible()
  const timeline = page.getByRole('region', { name: 'Lifecycle Timeline' })
  await expect(timeline.getByText('Completed', { exact: true })).toHaveCount(1)
  const download = page.waitForEvent('download')
  await timeline.getByRole('button', { name: 'Download proof: evaluation.pdf' }).click()
  expect((await download).suggestedFilename()).toBe('evaluation.pdf')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Probationary → Regular' })).toBeVisible()
  await page.getByRole('link', { name: 'Back to Employees' }).click()
  await page.getByRole('link', { name: 'Ben Employee', exact: true }).click()
  const pending = page.getByRole('region', { name: 'Pending Milestones' })
  await expect(pending.getByRole('heading', { name: 'Probationary Review' })).toBeVisible()
  await expect(pending.getByText('Jun 1, 2026 – Sep 1, 2026')).toBeVisible()
  await expect(timeline.getByText('Completed', { exact: true })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Probationary → Regular' })).toHaveCount(0)
  expect(errors).toEqual([])
})
