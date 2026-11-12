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
    { employeeId: 2, employeeNumber: 'EMP-002', employeeName: 'Ben Employee', department: 'Finance', position: 'Accountant', employmentType: 'Contractual', dateHired: '2026-03-01' },
  ]
  await page.route('**/api/admin/lifecycle/employees**', route => {
    const path = new URL(route.request().url()).pathname
    if (path.endsWith('/history')) {
      const employee = path.includes('/1/history') ? employees[0] : employees[1]
      const events = employee.employeeId === 1 ? [
        { id: 'hire-1', category: 'Employment', title: 'Employment record — Probationary', date: '2026-01-01', description: 'Hire date recorded.', actor: null, status: 'Probationary' },
        { id: 'change-1', category: 'Employment Type Change', title: 'Probationary → Regular', date: '2026-07-01', description: 'Qualified after evaluation', actor: 'HR Administrator', status: 'Regular' },
      ] : []
      return route.fulfill({ json: { data: { employee, events } } })
    }
    return route.fulfill({ json: { data: employees } })
  })
  await page.goto('/admin/employee-lifecycle/employee-history')
  await page.getByRole('link', { name: 'Ana Employee', exact: true }).click()
  await expect(page).toHaveURL(/employee=1/)
  await expect(page.getByRole('heading', { name: 'Probationary → Regular' })).toBeVisible()
  await expect(page.getByText('Qualified after evaluation')).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Probationary → Regular' })).toBeVisible()
  await page.getByRole('link', { name: 'Back to Employees' }).click()
  await page.getByRole('link', { name: 'Ben Employee', exact: true }).click()
  await expect(page.getByText('No lifecycle history recorded for this employee yet.')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Probationary → Regular' })).toHaveCount(0)
  expect(errors).toEqual([])
})
