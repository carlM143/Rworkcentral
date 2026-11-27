import {
  BarChart3,
  BriefcaseBusiness,
  CalendarClock,
  CalendarDays,
  ClipboardCheck,
  Clock3,
  HandCoins,
  House,
  Landmark,
  LayoutDashboard,
  Scale,
  Settings,
  ShieldCheck,
  Truck,
  Umbrella,
  UserRound,
  Users,
  WalletCards,
} from 'lucide-vue-next'

/**
 * Admin sidebar and the privilege each page needs.
 * Used by layouts/admin.vue (what to show) and middleware/admin.ts (what
 * can be opened). A page is allowed when the user has ANY of the listed
 * privileges of that module. Privileges come from config/privileges.php.
 */

export interface Access {
  module: string
  names: string[]
}

export interface AdminMenuChild {
  label: string
  to: string
  access: Access
}

export interface AdminMenuItem {
  label: string
  key?: string
  icon: unknown
  to?: string
  access?: Access
  children?: AdminMenuChild[]
}

const a = (module: string, ...names: string[]): Access => ({ module, names })

export const ADMIN_MENU: AdminMenuItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin', access: a('dashboard', 'dashboard.view') },
  {
    label: 'Employees', key: 'employees', icon: Users,
    children: [
      { label: 'Employee Directory', to: '/admin/employees', access: a('employees', 'directory.view') },
      { label: 'Salary Rates', to: '/admin/employees/salary-rates', access: a('employees', 'salary_rates.view') },
      { label: 'Salary Adjustments', to: '/admin/employees/salary-adjustments', access: a('employees', 'salary_adjustments.view') },
      { label: 'Transfer Department', to: '/admin/employees/transfer-department', access: a('employees', 'transfers.view') },
      { label: 'Birthdays & Anniversaries', to: '/admin/employees/celebrations', access: a('employees', 'celebrations.view') },
    ],
  },
  {
    label: 'Timekeeping', key: 'timekeeping', icon: Clock3,
    children: [
      { label: 'Time Logs', to: '/admin/time-logs', access: a('timekeeping', 'view') },
      { label: 'Time Log Correction Requests', to: '/admin/timekeeping/time-log-correction-requests', access: a('timekeeping', 'correction.request', 'correction.review') },
      { label: 'Late Adjustment', to: '/admin/late-adjustment', access: a('timekeeping', 'adjustment.request', 'adjustment.review') },
      { label: 'Manual Time In / Out', to: '/admin/manual-time-in-out', access: a('timekeeping', 'manual_time.view') },
    ],
  },
  {
    label: 'Schedules', key: 'schedules', icon: CalendarClock,
    children: [
      { label: 'Work Schedules', to: '/admin/work-schedules', access: a('schedules', 'work_schedules.view') },
      { label: 'Switch Rest Day', to: '/admin/switch-rest-day', access: a('schedules', 'rest_day_switch.view') },
    ],
  },
  {
    label: 'Payroll', key: 'payroll', icon: WalletCards,
    children: [
      { label: 'Payroll Groups', to: '/admin/payroll/payroll-group', access: a('payroll', 'payroll_groups.view') },
      { label: 'Pay Periods', to: '/admin/payroll/payroll-period', access: a('payroll', 'pay_periods.view') },
      { label: 'Payroll Readiness', to: '/admin/payroll/payroll-readiness', access: a('payroll', 'readiness.view') },
      { label: 'Employee Payroll', to: '/admin/payroll/employee-payroll', access: a('payroll', 'employee_payroll.view') },
      { label: 'Payroll History', to: '/admin/payroll/payroll-history', access: a('payroll', 'history.view') },
      { label: 'Withholding Tax', to: '/admin/payroll/withholding-tax', access: a('payroll', 'withholding_tax.view') },
    ],
  },
  {
    label: 'Compensation', key: 'compensation', icon: Scale,
    children: [
      { label: 'Wage Adjustments', to: '/admin/settings/compensation/wage-adjustments', access: a('compensation', 'wage_adjustments.view') },
      { label: 'Wage Order History', to: '/admin/settings/compensation/wage-orders', access: a('compensation', 'wage_orders.view') },
      { label: 'Regional Rates', to: '/admin/settings/compensation/regional-rates', access: a('compensation', 'regional_rates.view') },
    ],
  },
  {
    label: 'Contributions', key: 'contributions', icon: Landmark,
    children: [
      { label: 'Contribution Types', to: '/admin/contribution/types', access: a('contributions', 'types.view') },
      { label: 'Contribution Rate', to: '/admin/contribution/rate-schedules', access: a('contributions', 'rates.view') },
      { label: 'Bracket Management', to: '/admin/contribution/bracket-management', access: a('contributions', 'brackets.view') },
      { label: 'Contribution History', to: '/admin/contribution/contribution-history', access: a('contributions', 'history.view') },
      { label: 'Contribution Settings', to: '/admin/contribution/deduction-settings', access: a('contributions', 'settings.view') },
    ],
  },
  {
    label: 'Loans', key: 'loans', icon: HandCoins,
    children: [
      { label: 'Loan Types', to: '/admin/loans/types', access: a('loans', 'types.view') },
      { label: 'Employee Loans', to: '/admin/loans/employee-loans', access: a('loans', 'employee_loans.view') },
      { label: 'Loan Transactions', to: '/admin/loans/transactions', access: a('loans', 'transactions.view') },
    ],
  },
  {
    label: 'All Drivers', key: 'drivers', icon: Truck,
    children: [
      { label: 'Drivers Directory', to: '/admin/drivers', access: a('drivers', 'directory.view') },
      { label: 'Trip Tickets', to: '/admin/trip-tickets', access: a('drivers', 'trip_tickets.view') },
      { label: 'Vehicles', to: '/admin/vehicles', access: a('drivers', 'vehicles.view') },
    ],
  },
  {
    label: 'Leave Management', key: 'leave', icon: Umbrella,
    children: [
      { label: 'Leave Balances', to: '/admin/leave-management/leave-balances', access: a('leave', 'balances.view') },
      { label: 'Leave Types', to: '/admin/leave-management/leave-types', access: a('leave', 'types.view') },
      { label: 'Leave Policies', to: '/admin/leave-management/leave-policies', access: a('leave', 'policies.view') },
    ],
  },
  {
    label: 'Holiday Management', key: 'work-calendar', icon: CalendarDays,
    children: [
      { label: 'Holiday', to: '/admin/holiday-management/holiday', access: a('holidays', 'holidays.view') },
      { label: 'Holiday Coverage', to: '/admin/holiday-management/holiday-coverage', access: a('holidays', 'coverage.view') },
      { label: 'Holiday Pay', to: '/admin/holiday-management/holiday-pay', access: a('holidays', 'holiday_pay.view') },
    ],
  },
  {
    label: 'Departments', key: 'departments', icon: BriefcaseBusiness,
    children: [
      { label: 'Departments', to: '/admin/departments', access: a('departments', 'departments.view') },
      { label: 'Positions', to: '/admin/positions', access: a('departments', 'positions.view') },
      { label: 'Employment Types', to: '/admin/employment-types', access: a('departments', 'employment_types.view') },
      { label: 'Request Approvers', to: '/admin/departments/approvers', access: a('departments', 'request_approvers.view') },
    ],
  },
  {
    label: 'Approval Center', key: 'approvals', icon: ClipboardCheck,
    children: [
      { label: 'Leave Approvals', to: '/admin/approvals/leaves', access: a('approvals', 'leaves.view') },
      { label: 'Overtime Approvals', to: '/admin/approvals/overtime', access: a('approvals', 'overtime.view') },
      { label: 'Undertime Approvals', to: '/admin/approvals/undertime', access: a('approvals', 'undertime.view') },
      { label: 'OBA Approvals', to: '/admin/approvals/oba-request', access: a('approvals', 'oba.view') },
    ],
  },
  {
    label: 'Work From Home', key: 'wfh', icon: House,
    children: [
      { label: 'WFH Requests', to: '/admin/wfh/requests', access: a('wfh', 'requests.view') },
      { label: 'WFH Document Review', to: '/admin/wfh/documents', access: a('wfh', 'documents.view') },
    ],
  },
  { label: 'Evaluation Templates', icon: ClipboardCheck, to: '/admin/performance/templates', access: a('evaluation', 'templates.view') },
  {
    label: 'Employee Lifecycle', key: 'employee-lifecycle', icon: UserRound,
    children: [
      { label: 'Lifecycle Policies', to: '/admin/employee-lifecycle/policies', access: a('lifecycle', 'policies.view') },
      { label: 'Lifecycle Stages', to: '/admin/employee-lifecycle/stages', access: a('lifecycle', 'stages.view') },
      { label: 'Employee Milestones', to: '/admin/employee-lifecycle/milestones', access: a('lifecycle', 'milestones.view') },
      { label: 'Employee Offboarding', to: '/admin/employee-lifecycle/offboarding', access: a('lifecycle', 'offboarding.view') },
      { label: 'Employee History', to: '/admin/employee-lifecycle/employee-history', access: a('lifecycle', 'history.view') },
    ],
  },
  {
    label: 'Reports & Analytics', key: 'reports', icon: BarChart3,
    children: [
      { label: 'Reports Center', to: '/admin/reports/center', access: a('reports', 'center.view') },
      { label: 'Attendance Reports', to: '/admin/reports/attendance', access: a('reports', 'attendance.view') },
      { label: 'Payroll Reports', to: '/admin/reports/payroll', access: a('reports', 'payroll.view') },
      { label: '13th Month Pay', to: '/admin/13th-month-pay', access: a('reports', 'thirteenth_month.view') },
      { label: 'SSS Report', to: '/admin/reports/sss', access: a('reports', 'government.view') },
      { label: 'Pag-IBIG Report', to: '/admin/reports/pagibig', access: a('reports', 'government.view') },
      { label: 'PhilHealth Report', to: '/admin/reports/philhealth', access: a('reports', 'government.view') },
      { label: 'Wage Compliance', to: '/admin/reports/wage-compliance', access: a('reports', 'wage_compliance.view') },
      { label: 'Withholding Tax Report', to: '/admin/reports/withholding-tax', access: a('reports', 'withholding_tax.view') },
    ],
  },
]

/** Settings: configuration areas only (users and roles have their own menu). */
export const SETTINGS_ACCESS = a('settings', 'company.view', 'qr.view', 'system.view')

/** System section of the sidebar (below Workspace). */
export const SYSTEM_MENU: AdminMenuItem[] = [
  {
    label: 'Users & Access', key: 'access', icon: ShieldCheck,
    children: [
      { label: 'System Users', to: '/admin/settings/users', access: a('settings', 'users.view') },
      { label: 'Roles & Permissions', to: '/admin/settings/roles', access: a('settings', 'roles.view') },
    ],
  },
  { label: 'Settings', icon: Settings, to: '/admin/settings', access: SETTINGS_ACCESS },
]

/** Pages outside the sidebar that also need a privilege. */
const EXTRA_PAGES: { to: string, access: Access }[] = [
  { to: '/admin/approvals/for-my-approval', access: a('approvals', 'first_level.view') },
  { to: '/admin/settings/company', access: a('settings', 'company.view') },
  { to: '/admin/settings/qr-generation', access: a('settings', 'qr.view') },
  { to: '/admin/settings/system', access: a('settings', 'system.view') },
  { to: '/admin/settings/approvals', access: a('settings', 'system.view') },
  { to: '/admin/trip-tickets/create', access: a('drivers', 'trip_tickets.create') },
  { to: '/admin/settings/compensation/wage-orders/new', access: a('compensation', 'wage_orders.create') },
]

/** Pages every admin-portal user may open. */
const OPEN_PAGES = ['/admin/settings/my-account', '/admin/notifications', '/admin/no-access']

const ALL_PAGES: { to: string, access: Access }[] = [
  ...[...ADMIN_MENU, ...SYSTEM_MENU].flatMap(item => [
    ...(item.to && item.access ? [{ to: item.to, access: item.access }] : []),
    ...(item.children ?? []).map(c => ({ to: c.to, access: c.access })),
  ]),
  ...EXTRA_PAGES,
]

/**
 * First page (menu order) the user can open: the landing page for roles
 * without the Dashboard, e.g. a Supervisor lands on "For My Approval".
 */
export const firstAllowedPath = (canAny: (module: string, names: string[]) => boolean): string | null => {
  for (const item of [...ADMIN_MENU, ...SYSTEM_MENU]) {
    if (item.to && item.access && canAny(item.access.module, item.access.names)) return item.to
    const child = item.children?.find(c => canAny(c.access.module, c.access.names))
    if (child) return child.to
  }
  return null
}

/**
 * The privilege a path needs (closest page by path), or null when any admin
 * user may open it. "/admin" only matches the dashboard itself.
 */
export const accessForPath = (path: string): Access | null => {
  const clean = path.replace(/\/+$/, '') || '/'
  if (OPEN_PAGES.some(p => clean === p || clean.startsWith(`${p}/`))) return null

  const match = ALL_PAGES
    .filter(p => clean === p.to || (p.to !== '/admin' && clean.startsWith(`${p.to}/`)))
    .sort((x, y) => y.to.length - x.to.length)[0]

  return match?.access ?? null
}
