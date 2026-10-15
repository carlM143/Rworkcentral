import type {
  AccessActivity,
  SystemUser,
  SystemUserRole,
  SystemUserStatus,
} from '~/types/userAccess'

export const useUsersAccess = () => {
  const {
    employees,
  } = useEmployees()

  /* =========================================================
     EMPLOYEE PORTAL ACCOUNTS
  ========================================================= */

  const employeeAccounts: SystemUser[] =
    employees.value.map(
      (
        employee,
        index,
      ) => ({
        id:
          100 +
          employee.id,

        employeeId:
          employee.id,

        employeeNumber:
          employee.employeeNumber,

        name: [
          employee.firstName,
          employee.middleName,
          employee.lastName,
        ]
          .filter(Boolean)
          .join(' '),

        email:
          employee.email,

        role:
          'Employee',

        department:
          employee.department,

        status:
          index === 7
            ? 'Invited'
            : 'Active',

        twoFactorEnabled:
          false,

        lastLogin:
          index === 7
            ? undefined
            : `2026-09-0${Math.min(
                index + 1,
                5,
              )}T08:30:00`,
      }),
    )

  /* =========================================================
     ADMINISTRATIVE ACCOUNTS
  ========================================================= */

  const administrativeAccounts:
    SystemUser[] = [
      {
        id: 1,

        name:
          'Daniel Cruz',

        email:
          'daniel.cruz@rworkcentral.local',

        role:
          'Administrator',

        department:
          'System Administration',

        status:
          'Active',

        twoFactorEnabled:
          true,

        lastLogin:
          '2026-09-05T08:10:00',
      },

      {
        id: 2,

        name:
          'Patricia Lim',

        email:
          'patricia.lim@rworkcentral.local',

        role:
          'Administrator',

        department:
          'System Administration',

        status:
          'Active',

        twoFactorEnabled:
          true,

        lastLogin:
          '2026-09-04T16:20:00',
      },

      {
        id: 3,

        name:
          'Maria Santos',

        email:
          'maria.hr@rworkcentral.local',

        role:
          'HR Administrator',

        department:
          'Human Resources',

        status:
          'Active',

        twoFactorEnabled:
          true,

        lastLogin:
          '2026-09-05T08:25:00',
      },

      {
        id: 4,

        name:
          'Claire Villanueva',

        email:
          'claire.hr@rworkcentral.local',

        role:
          'HR Administrator',

        department:
          'Human Resources',

        status:
          'Active',

        twoFactorEnabled:
          true,

        lastLogin:
          '2026-09-04T15:45:00',
      },

      {
        id: 5,

        name:
          'Jenny Ramos',

        email:
          'jenny.hr@rworkcentral.local',

        role:
          'HR Administrator',

        department:
          'Human Resources',

        status:
          'Active',

        twoFactorEnabled:
          false,

        lastLogin:
          '2026-09-04T14:40:00',
      },

      {
        id: 6,

        name:
          'Leo Martinez',

        email:
          'leo.supervisor@rworkcentral.local',

        role:
          'Supervisor',

        department:
          'Operations',

        status:
          'Active',

        twoFactorEnabled:
          true,

        lastLogin:
          '2026-09-05T07:55:00',
      },

      {
        id: 7,

        name:
          'Carlo Mendoza',

        email:
          'carlo.supervisor@rworkcentral.local',

        role:
          'Supervisor',

        department:
          'Operations',

        status:
          'Active',

        twoFactorEnabled:
          false,

        lastLogin:
          '2026-09-04T17:05:00',
      },

      {
        id: 8,

        name:
          'Ana Garcia',

        email:
          'ana.supervisor@rworkcentral.local',

        role:
          'Supervisor',

        department:
          'Operations',

        status:
          'Disabled',

        twoFactorEnabled:
          false,

        lastLogin:
          '2026-08-28T11:30:00',
      },

      {
        id: 9,

        name:
          'Mark Lopez',

        email:
          'mark.supervisor@rworkcentral.local',

        role:
          'Supervisor',

        department:
          'Operations',

        status:
          'Active',

        twoFactorEnabled:
          true,

        lastLogin:
          '2026-09-04T13:15:00',
      },
    ]

  /* =========================================================
     ALL SYSTEM USERS
  ========================================================= */

  const users =
    ref<SystemUser[]>([
      ...administrativeAccounts,
      ...employeeAccounts,
    ])

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const role =
    ref('')

  const status =
    ref('')

  const currentPage =
    ref(1)

  const perPage =
    ref(7)

  const filteredUsers =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return users.value.filter(
        user => {
          const matchesSearch =
            !keyword ||
            user.name
              .toLowerCase()
              .includes(keyword) ||
            user.email
              .toLowerCase()
              .includes(keyword) ||
            user.employeeNumber
              ?.toLowerCase()
              .includes(keyword)

          const matchesRole =
            !role.value ||
            user.role ===
              role.value

          const matchesStatus =
            !status.value ||
            user.status ===
              status.value

          return (
            matchesSearch &&
            matchesRole &&
            matchesStatus
          )
        },
      )
    })

  /* =========================================================
     STATS
  ========================================================= */

  const stats =
    computed(() => ({
      total:
        users.value.length,

      active:
        users.value.filter(
          user =>
            user.status ===
            'Active',
        ).length,

      roles:
        new Set(
          users.value.map(
            user =>
              user.role,
          ),
        ).size,

      disabled:
        users.value.filter(
          user =>
            user.status ===
            'Disabled',
        ).length,
    }))

  /* =========================================================
     ROLE SUMMARY
  ========================================================= */

  const roleSummary =
    computed(() => {
      const roles:
        SystemUserRole[] = [
          'Administrator',
          'HR Administrator',
          'Supervisor',
          'Employee',
        ]

      return roles.map(
        currentRole => ({
          role:
            currentRole,

          count:
            users.value.filter(
              user =>
                user.role ===
                currentRole,
            ).length,
        }),
      )
    })

  /* =========================================================
     SECURITY ISSUES
  ========================================================= */

  const securityIssues =
    computed(() => ({
      invited:
        users.value.filter(
          user =>
            user.status ===
            'Invited',
        ).length,

      disabled:
        users.value.filter(
          user =>
            user.status ===
            'Disabled',
        ).length,

      withoutTwoFactor:
        users.value.filter(
          user =>
            user.role !==
              'Employee' &&
            !user.twoFactorEnabled &&
            user.status ===
              'Active',
        ).length,
    }))

  /* =========================================================
     RECENT ACTIVITY
  ========================================================= */

  const recentActivity =
    ref<AccessActivity[]>([
      {
        id: 1,

        userName:
          'Maria Santos',

        action:
          'Role Permissions Updated',

        description:
          'HR Administrator permissions were reviewed and updated.',

        performedBy:
          'Daniel Cruz',

        date:
          '2026-09-05',
      },

      {
        id: 2,

        userName:
          'Jenny Ramos',

        action:
          'Security Review Required',

        description:
          'Two-factor authentication has not yet been enabled.',

        performedBy:
          'System',

        date:
          '2026-09-04',
      },

      {
        id: 3,

        userName:
          'Ana Garcia',

        action:
          'Account Disabled',

        description:
          'Supervisor system access was temporarily disabled.',

        performedBy:
          'Maria Santos',

        date:
          '2026-09-04',
      },

      {
        id: 4,

        userName:
          'Jenny Ramos',

        action:
          'Employee Account Invited',

        description:
          'Employee portal invitation was sent.',

        performedBy:
          'Maria Santos',

        date:
          '2026-09-03',
      },
    ])

  /* =========================================================
     OPTIONS
  ========================================================= */

  const roleOptions:
    SystemUserRole[] = [
      'Administrator',
      'HR Administrator',
      'Supervisor',
      'Employee',
    ]

  const statusOptions:
    SystemUserStatus[] = [
      'Active',
      'Invited',
      'Disabled',
    ]

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages =
    computed(() => {
      return Math.max(
        1,
        Math.ceil(
          filteredUsers.value.length /
            perPage.value,
        ),
      )
    })

  const paginatedUsers =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredUsers.value.slice(
        start,
        start +
          perPage.value,
      )
    })

  const showingFrom =
    computed(() => {
      if (
        !filteredUsers.value.length
      ) {
        return 0
      }

      return (
        (
          currentPage.value -
          1
        ) *
          perPage.value +
        1
      )
    })

  const showingTo =
    computed(() => {
      return Math.min(
        currentPage.value *
          perPage.value,

        filteredUsers.value.length,
      )
    })

  const resetFilters = () => {
    search.value = ''
    role.value = ''
    status.value = ''

    currentPage.value = 1
  }

  watch(
    [
      search,
      role,
      status,
    ],
    () => {
      currentPage.value = 1
    },
  )

  watch(
    totalPages,
    () => {
      if (
        currentPage.value >
        totalPages.value
      ) {
        currentPage.value =
          totalPages.value
      }
    },
  )

  return {
    users,

    search,
    role,
    status,

    currentPage,

    filteredUsers,
    paginatedUsers,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    roleSummary,
    securityIssues,

    recentActivity,

    roleOptions,
    statusOptions,

    resetFilters,
  }
}