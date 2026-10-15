import type {
  Client,
  ClientActivity,
} from '~/types/client'

export const useClientsOverview = () => {
  const clients =
    ref<Client[]>([
      {
        id: 1,

        code: 'CL-001',

        name:
          'Davao Logistics Corp.',

        industry:
          'Logistics',

        contactPerson:
          'James Villanueva',

        email:
          'admin@davaologistics.example.com',

        phone:
          '09171230001',

        address:
          'Davao City',

        branches: 2,

        assignedEmployees: 5,

        contractStart:
          '2026-01-01',

        contractEnd:
          '2026-12-31',

        contractStatus:
          'Active',

        status:
          'Active',

        billingRateStatus:
          'Configured',

        currentBilling:
          144300,
      },

      {
        id: 2,

        code: 'CL-002',

        name:
          'Mindanao Distribution Inc.',

        industry:
          'Distribution',

        contactPerson:
          'Carla Mendoza',

        email:
          'operations@mindanaodistribution.example.com',

        phone:
          '09171230002',

        address:
          'Panabo City',

        branches: 3,

        assignedEmployees: 3,

        contractStart:
          '2026-02-01',

        contractEnd:
          '2026-10-31',

        contractStatus:
          'Expiring Soon',

        status:
          'Active',

        billingRateStatus:
          'Configured',

        currentBilling:
          85800,
      },

      {
        id: 3,

        code: 'CL-003',

        name:
          'Southline Trading',

        industry:
          'Trading',

        contactPerson:
          'Martin Lopez',

        email:
          'accounts@southline.example.com',

        phone:
          '09171230003',

        address:
          'Tagum City',

        branches: 1,

        assignedEmployees: 2,

        contractStart:
          '2026-03-15',

        contractEnd:
          '2027-03-14',

        contractStatus:
          'Active',

        status:
          'Active',

        billingRateStatus:
          'Configured',

        currentBilling:
          54700,
      },

      {
        id: 4,

        code: 'CL-004',

        name:
          'Metro Service Solutions',

        industry:
          'Business Services',

        contactPerson:
          'Andrea Garcia',

        email:
          'hr@metroservices.example.com',

        phone:
          '09171230004',

        address:
          'Davao City',

        branches: 2,

        assignedEmployees: 4,

        contractStart:
          '2026-04-01',

        contractEnd:
          '2026-12-31',

        contractStatus:
          'Active',

        status:
          'For Review',

        billingRateStatus:
          'Incomplete',

        currentBilling:
          102600,
      },

      {
        id: 5,

        code: 'CL-005',

        name:
          'Prime Fleet Services',

        industry:
          'Transport Services',

        contactPerson:
          'Robert Santos',

        email:
          'admin@primefleet.example.com',

        phone:
          '09171230005',

        address:
          'Digos City',

        branches: 1,

        assignedEmployees: 2,

        contractStart:
          '2025-08-01',

        contractEnd:
          '2026-07-31',

        contractStatus:
          'Expired',

        status:
          'Inactive',

        billingRateStatus:
          'Configured',

        currentBilling:
          0,
      },
    ])

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const status =
    ref('')

  const contractStatus =
    ref('')

  const currentPage =
    ref(1)

  const perPage =
    ref(6)

  const filteredClients =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return clients.value.filter(
        client => {
          const matchesSearch =
            !keyword ||
            client.name
              .toLowerCase()
              .includes(keyword) ||
            client.code
              .toLowerCase()
              .includes(keyword) ||
            client.contactPerson
              .toLowerCase()
              .includes(keyword)

          const matchesStatus =
            !status.value ||
            client.status ===
              status.value

          const matchesContract =
            !contractStatus.value ||
            client.contractStatus ===
              contractStatus.value

          return (
            matchesSearch &&
            matchesStatus &&
            matchesContract
          )
        },
      )
    })

  /* =========================================================
     STATS
  ========================================================= */

  const stats =
    computed(() => {
      const active =
        clients.value.filter(
          client =>
            client.status ===
            'Active',
        )

      const employees =
        active.reduce(
          (
            total,
            client,
          ) =>
            total +
            client.assignedEmployees,
          0,
        )

      const billing =
        clients.value.reduce(
          (
            total,
            client,
          ) =>
            total +
            client.currentBilling,
          0,
        )

      const review =
        clients.value.filter(
          client =>
            client.status ===
              'For Review' ||
            client.contractStatus ===
              'Expiring Soon' ||
            client.billingRateStatus ===
              'Incomplete',
        ).length

      return {
        total:
          clients.value.length,

        active:
          active.length,

        employees,

        billing,

        review,
      }
    })

  /* =========================================================
     CONTRACT ALERTS
  ========================================================= */

  const contractAlerts =
    computed(() => {
      return clients.value.filter(
        client =>
          client.contractStatus ===
            'Expiring Soon' ||
          client.contractStatus ===
            'Expired',
      )
    })

  /* =========================================================
     BILLING ISSUES
  ========================================================= */

  const billingIssues =
    computed(() => {
      return clients.value.filter(
        client =>
          client.billingRateStatus ===
          'Incomplete',
      )
    })

  /* =========================================================
     RECENT ACTIVITY
  ========================================================= */

  const recentActivity =
    ref<ClientActivity[]>([
      {
        id: 1,

        clientName:
          'Davao Logistics Corp.',

        action:
          'Billing Prepared',

        description:
          'Current billing preview was generated.',

        date:
          '2026-09-03',
      },

      {
        id: 2,

        clientName:
          'Metro Service Solutions',

        action:
          'Billing Rate Review',

        description:
          'Billing rate configuration requires completion.',

        date:
          '2026-09-03',
      },

      {
        id: 3,

        clientName:
          'Mindanao Distribution Inc.',

        action:
          'Contract Reminder',

        description:
          'Client contract is approaching expiration.',

        date:
          '2026-09-02',
      },

      {
        id: 4,

        clientName:
          'Southline Trading',

        action:
          'Employee Assignment',

        description:
          'Employee assignment information was updated.',

        date:
          '2026-09-01',
      },
    ])

  /* =========================================================
     OPTIONS
  ========================================================= */

  const statusOptions = [
    'Active',
    'For Review',
    'Inactive',
  ]

  const contractOptions = [
    'Active',
    'Expiring Soon',
    'Expired',
  ]

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages =
    computed(() => {
      return Math.max(
        1,
        Math.ceil(
          filteredClients.value.length /
            perPage.value,
        ),
      )
    })

  const paginatedClients =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredClients.value.slice(
        start,
        start +
          perPage.value,
      )
    })

  const showingFrom =
    computed(() => {
      if (
        !filteredClients.value.length
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

        filteredClients.value.length,
      )
    })

  const resetFilters = () => {
    search.value = ''
    status.value = ''
    contractStatus.value = ''

    currentPage.value = 1
  }

  const getClientById = (
    id: number | string,
  ) => {
    return clients.value.find(
      client =>
        client.id ===
        Number(id),
    )
  }

  watch(
    [
      search,
      status,
      contractStatus,
    ],
    () => {
      currentPage.value = 1
    },
  )

  return {
    clients,

    search,
    status,
    contractStatus,

    currentPage,

    filteredClients,
    paginatedClients,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    contractAlerts,
    billingIssues,
    recentActivity,

    statusOptions,
    contractOptions,

    resetFilters,
    getClientById,
  }
}