import type {
  SecurityRoleSummary,
  SettingsActivity,
  SettingsModule,
} from '~/types/settings'

export const useSettingsOverview = () => {
  /* =========================================================
     SETTINGS MODULES
  ========================================================= */

  const modules =
    ref<SettingsModule[]>([
      {
        id: 1,

        title:
          'Company Information',

        description:
          'Manage company profile, branch information and business details.',

        category:
          'Company',

        route:
          '/admin/settings/company',

        status:
          'Complete',

        items: [
          'Company Profile',
          'Branch Information',
          'Business Details',
        ],
      },

      {
        id: 2,

        title:
          'Users & Access',

        description:
          'Manage system users, roles, permissions and access controls.',

        category:
          'Users',

        route:
          '/admin/settings/users',

        status:
          'Complete',

        items: [
          'System Users',
          'Roles & Permissions',
          'Access Control',
        ],
      },

      {
        id: 3,

        title:
          'Timekeeping Settings',

        description:
          'Configure schedules, attendance rules, grace periods and timekeeping policies.',

        category:
          'Timekeeping',

        route:
          '/admin/settings/timekeeping',

        status:
          'Complete',

        items: [
          'Work Schedules',
          'Grace Period',
          'Late & Undertime Rules',
        ],
      },

      {
        id: 4,

        title:
          'Payroll Settings',

        description:
          'Configure payroll groups, salary rates, deductions and payroll rules.',

        category:
          'Payroll',

        route:
          '/admin/settings/payroll',

        status:
          'Complete',

        items: [
          'Payroll Groups',
          'Salary Rates',
          'Contributions',
        ],
      },

      {
        id: 5,

        title:
          'Leave & Overtime',

        description:
          'Manage leave types, leave credits, overtime rules and related policies.',

        category:
          'Leave & Overtime',

        route:
          '/admin/settings/leave-overtime',

        status:
          'Needs Review',

        items: [
          'Leave Types',
          'Leave Credits',
          'Overtime Rules',
        ],
      },

      {
        id: 6,

        title:
          'Approval Workflow',

        description:
          'Configure request approvers, approval levels and workflow routing.',

        category:
          'Approval',

        route:
          '/admin/settings/approvals',

        status:
          'Needs Review',

        items: [
          'Approval Levels',
          'Approvers',
          'Request Routing',
        ],
      },

      {
        id: 7,

        title:
          'Notifications',

        description:
          'Configure system alerts, employee notifications and reminders.',

        category:
          'Notifications',

        route:
          '/admin/settings/notifications',

        status:
          'Not Configured',

        items: [
          'Email Notifications',
          'System Alerts',
          'Reminders',
        ],
      },

      {
        id: 8,

        title:
          'System Settings',

        description:
          'Manage general HRIS preferences, security and system configuration.',

        category:
          'System',

        route:
          '/admin/settings/system',

        status:
          'Complete',

        items: [
          'General Settings',
          'Security',
          'Audit Settings',
        ],
      },
    ])

  /* =========================================================
     SYSTEM USERS / ROLES
  ========================================================= */

  const roles =
    ref<SecurityRoleSummary[]>([
      {
        role:
          'Administrator',
        users: 2,
      },
      {
        role:
          'HR Administrator',
        users: 3,
      },
      {
        role:
          'Supervisor',
        users: 4,
      },
      {
        role:
          'Employee',
        users: 12,
      },
    ])

  /* =========================================================
     STATS
  ========================================================= */

  const stats =
    computed(() => {
      const totalUsers =
        roles.value.reduce(
          (
            total,
            role,
          ) =>
            total +
            role.users,
          0,
        )

      const review =
        modules.value.filter(
          module =>
            module.status ===
              'Needs Review' ||
            module.status ===
              'Not Configured',
        ).length

      return {
        users:
          totalUsers,

        roles:
          roles.value.length,

        modules:
          modules.value.length,

        review,
      }
    })

  /* =========================================================
     CONFIGURATION STATUS
  ========================================================= */

  const configurationStatus =
    computed(() => {
      return modules.value.map(
        module => ({
          id:
            module.id,

          name:
            module.title,

          status:
            module.status,
        }),
      )
    })

  /* =========================================================
     RECENT ACTIVITY
  ========================================================= */

  const recentActivity =
    ref<SettingsActivity[]>([
      {
        id: 1,

        action:
          'Payroll Settings Updated',

        description:
          'Payroll group configuration was reviewed and updated.',

        performedBy:
          'Maria Santos',

        date:
          '2026-09-04',
      },

      {
        id: 2,

        action:
          'User Access Updated',

        description:
          'Permissions for the Supervisor role were updated.',

        performedBy:
          'Maria Santos',

        date:
          '2026-09-04',
      },

      {
        id: 3,

        action:
          'Timekeeping Rule Updated',

        description:
          'Attendance grace period settings were reviewed.',

        performedBy:
          'Claire Villanueva',

        date:
          '2026-09-03',
      },

      {
        id: 4,

        action:
          'Company Information Updated',

        description:
          'Company profile information was updated.',

        performedBy:
          'Maria Santos',

        date:
          '2026-09-02',
      },
    ])

  return {
    modules,
    roles,

    stats,

    configurationStatus,

    recentActivity,
  }
}