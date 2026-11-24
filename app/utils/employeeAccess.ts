/**
 * Employee portal pages and the privilege each needs
 * (Roles & Permissions › Employee Portal). Used by layouts/employee.vue
 * (what to show) and middleware/employee.ts (what can be opened).
 */

export const EMPLOYEE_MODULE = 'employee_portal'

/** Path prefix → feature key (privilege "<feature>.view"). Longest prefix wins. */
const PAGES: { to: string, feature: string }[] = [
  { to: '/employee', feature: 'dashboard' },
  { to: '/employee/attendance', feature: 'attendance' },
  { to: '/employee/attendance-qr-code', feature: 'scan_qr' },
  { to: '/employee/calendar', feature: 'calendar' },
  { to: '/employee/leave-credit', feature: 'leave_credits' },
  { to: '/employee/leave', feature: 'leave' },
  { to: '/employee/undertime', feature: 'undertime' },
  { to: '/employee/overtime', feature: 'overtime' },
  { to: '/employee/requests/timelog-correction-request', feature: 'time_log_corrections' },
  { to: '/employee/requests/work-from-home', feature: 'wfh' },
  { to: '/employee/requests/oba-requests', feature: 'oba' },
  { to: '/employee/payslips', feature: 'payslips' },
  { to: '/employee/loans', feature: 'loans' },
]

/** Pages every employee-portal user may open. */
const OPEN_PAGES = ['/employee/login', '/employee/profile', '/employee/no-access', '/employee/requests']

/** Feature a path needs, or null when any employee-portal user may open it. */
export const employeeFeatureForPath = (path: string): string | null => {
  const clean = path.replace(/\/+$/, '') || '/'
  if (OPEN_PAGES.some(p => clean === p)) return null

  const match = PAGES
    .filter(p => clean === p.to || (p.to !== '/employee' && clean.startsWith(`${p.to}/`)))
    .sort((a, b) => b.to.length - a.to.length)[0]

  return match?.feature ?? null
}

/** First employee page the user can open (landing page without the Dashboard). */
export const firstEmployeePath = (can: (module: string, name: string) => boolean): string | null =>
  PAGES.find(p => can(EMPLOYEE_MODULE, `${p.feature}.view`))?.to ?? null
