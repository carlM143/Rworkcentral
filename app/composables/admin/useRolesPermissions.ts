import type {
  PermissionMatrixRow,
  RoleActivity,
  RoleDefinition,
} from '~/types/rolePermission'

import type {
  SystemUserRole,
} from '~/types/userAccess'

export const useRolesPermissions = () => {
  /* =========================================================
     ROLES
  ========================================================= */

  const roles =
    ref<RoleDefinition[]>([
      {
        id: 1,

        name:
          'Administrator',

        description:
          'Full access to all HRIS modules, settings and administrative functions.',

        type:
          'System',

        userCount: 2,

        status:
          'Active',
      },

      {
        id: 2,

        name:
          'HR Administrator',

        description:
          'Manages employee records, HR workflows, payroll support and reports.',

        type:
          'System',

        userCount: 3,

        status:
          'Active',
      },

      {
        id: 3,

        name:
          'Supervisor',

        description:
          'Reviews team attendance, leave, overtime and employee requests.',

        type:
          'System',

        userCount: 4,

        status:
          'Active',
      },

      {
        id: 4,

        name:
          'Employee',

        description:
          'Employee self-service access to personal HR records and requests.',

        type:
          'System',

        userCount: 15,

        status:
          'Active',
      },
    ])

  /* =========================================================
     PERMISSION MATRIX
  ========================================================= */

  const permissionMatrix =
    ref<PermissionMatrixRow[]>([
      {
        id: 1,
        module: 'Dashboard',

        permissions: {
          Administrator:
            'Full Access',

          'HR Administrator':
            'Full Access',

          Supervisor:
            'View',

          Employee:
            'Self Only',
        },
      },

      {
        id: 2,
        module: 'Employees',

        permissions: {
          Administrator:
            'Full Access',

          'HR Administrator':
            'Manage',

          Supervisor:
            'View',

          Employee:
            'Self Only',
        },
      },

      {
        id: 3,
        module: 'Timekeeping',

        permissions: {
          Administrator:
            'Full Access',

          'HR Administrator':
            'Manage',

          Supervisor:
            'Manage',

          Employee:
            'Self Only',
        },
      },

      {
        id: 4,
        module: 'Payroll',

        permissions: {
          Administrator:
            'Full Access',

          'HR Administrator':
            'Manage',

          Supervisor:
            'No Access',

          Employee:
            'Self Only',
        },
      },

      {
        id: 5,
        module: 'Clients',

        permissions: {
          Administrator:
            'Full Access',

          'HR Administrator':
            'Manage',

          Supervisor:
            'View',

          Employee:
            'No Access',
        },
      },

      {
        id: 6,
        module: 'Billing',

        permissions: {
          Administrator:
            'Full Access',

          'HR Administrator':
            'Manage',

          Supervisor:
            'No Access',

          Employee:
            'No Access',
        },
      },

      {
        id: 7,
        module: 'Leave Management',

        permissions: {
          Administrator:
            'Full Access',

          'HR Administrator':
            'Manage',

          Supervisor:
            'Approve',

          Employee:
            'Self Only',
        },
      },

      {
        id: 8,
        module: 'Overtime',

        permissions: {
          Administrator:
            'Full Access',

          'HR Administrator':
            'Manage',

          Supervisor:
            'Approve',

          Employee:
            'Self Only',
        },
      },

      {
        id: 9,
        module: 'Departments',

        permissions: {
          Administrator:
            'Full Access',

          'HR Administrator':
            'Manage',

          Supervisor:
            'View',

          Employee:
            'No Access',
        },
      },

      {
        id: 10,
        module: 'Approval Center',

        permissions: {
          Administrator:
            'Full Access',

          'HR Administrator':
            'Approve',

          Supervisor:
            'Approve',

          Employee:
            'No Access',
        },
      },

      {
        id: 11,
        module: 'Documents',

        permissions: {
          Administrator:
            'Full Access',

          'HR Administrator':
            'Manage',

          Supervisor:
            'View',

          Employee:
            'Self Only',
        },
      },

      {
        id: 12,
        module: 'Performance',

        permissions: {
          Administrator:
            'Full Access',

          'HR Administrator':
            'Manage',

          Supervisor:
            'Manage',

          Employee:
            'Self Only',
        },
      },

      {
        id: 13,
        module: 'Employee Lifecycle',

        permissions: {
          Administrator:
            'Full Access',

          'HR Administrator':
            'Manage',

          Supervisor:
            'View',

          Employee:
            'No Access',
        },
      },

      {
        id: 14,
        module: 'Reports & Analytics',

        permissions: {
          Administrator:
            'Full Access',

          'HR Administrator':
            'Manage',

          Supervisor:
            'View',

          Employee:
            'No Access',
        },
      },

      {
        id: 15,
        module: 'Settings',

        permissions: {
          Administrator:
            'Full Access',

          'HR Administrator':
            'View',

          Supervisor:
            'No Access',

          Employee:
            'No Access',
        },
      },
    ])

  /* =========================================================
     SELECTED ROLE
  ========================================================= */

  const selectedRole =
    ref<SystemUserRole>(
      'Administrator',
    )

  /* =========================================================
     STATS
  ========================================================= */

  const stats =
    computed(() => ({
      totalRoles:
        roles.value.length,

      activeRoles:
        roles.value.filter(
          role =>
            role.status ===
            'Active',
        ).length,

      assignedUsers:
        roles.value.reduce(
          (
            total,
            role,
          ) =>
            total +
            role.userCount,
          0,
        ),

      customRoles:
        roles.value.filter(
          role =>
            role.type ===
            'Custom',
        ).length,
    }))

  /* =========================================================
     SELECTED ROLE SUMMARY
  ========================================================= */

  const selectedRoleDetails =
    computed(() => {
      return roles.value.find(
        role =>
          role.name ===
          selectedRole.value,
      )
    })

  const selectedRolePermissions =
    computed(() => {
      return permissionMatrix.value.map(
        row => ({
          module:
            row.module,

          permission:
            row.permissions[
              selectedRole.value
            ],
        }),
      )
    })

  /* =========================================================
     PERMISSION COUNTS
  ========================================================= */

  const permissionSummary =
    computed(() => {
      const permissions =
        selectedRolePermissions.value

      return {
        fullAccess:
          permissions.filter(
            item =>
              item.permission ===
              'Full Access',
          ).length,

        manage:
          permissions.filter(
            item =>
              item.permission ===
              'Manage',
          ).length,

        approve:
          permissions.filter(
            item =>
              item.permission ===
              'Approve',
          ).length,

        restricted:
          permissions.filter(
            item =>
              item.permission ===
              'No Access',
          ).length,
      }
    })

  /* =========================================================
     RECENT ACTIVITY
  ========================================================= */

  const recentActivity =
    ref<RoleActivity[]>([
      {
        id: 1,

        action:
          'HR Administrator Updated',

        description:
          'Employee and payroll permissions were reviewed.',

        performedBy:
          'Daniel Cruz',

        date:
          '2026-09-05',
      },

      {
        id: 2,

        action:
          'Supervisor Permissions Updated',

        description:
          'Leave and overtime approval access was updated.',

        performedBy:
          'Maria Santos',

        date:
          '2026-09-04',
      },

      {
        id: 3,

        action:
          'Employee Access Reviewed',

        description:
          'Employee self-service permissions were verified.',

        performedBy:
          'Maria Santos',

        date:
          '2026-09-03',
      },
    ])

  return {
    roles,

    permissionMatrix,

    selectedRole,

    selectedRoleDetails,
    selectedRolePermissions,

    permissionSummary,

    stats,

    recentActivity,
  }
}