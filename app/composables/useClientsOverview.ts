import type {
  Client,
  ClientActivity,
} from '~/types/client'

export const useClientsOverview = () => {
  const clients =
    useState<Client[]>(
      'clients-overview',
      () => [
        {
          id: 1,

          code:
            'CL-001',

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
        },

        {
          id: 2,

          code:
            'CL-002',

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
        },

        {
          id: 3,

          code:
            'CL-003',

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
        },

        {
          id: 4,

          code:
            'CL-004',

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
        },

        {
          id: 5,

          code:
            'CL-005',

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
        },
      ],
    )

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

  /* =========================================================
     FILTERED
  ========================================================= */

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

      return {
        total:
          clients.value.length,

        active:
          active.length,

        employees:
          active.reduce(
            (
              total,
              client,
            ) =>
              total +
              client.assignedEmployees,
            0,
          ),
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
     ACTIVITY
  ========================================================= */

  const recentActivity =
    useState<ClientActivity[]>(
      'clients-overview-activity',
      () => [
        {
          id: 1,

          clientName:
            'Davao Logistics Corp.',

          action:
            'Employee Assignment',

          description:
            'Employee deployment information was updated.',

          date:
            '2026-09-03',
        },

        {
          id: 2,

          clientName:
            'Metro Service Solutions',

          action:
            'Contract Review',

          description:
            'Client contract information was reviewed by HR.',

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
      ],
    )

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

  /* =========================================================
     CREATE
  ========================================================= */

  const createClient = (
    data:
      Omit<
        Client,
        | 'id'
        | 'assignedEmployees'
      >,
  ) => {
    const nextId =
      clients.value.length
        ? Math.max(
            ...clients.value.map(
              item =>
                item.id,
            ),
          ) + 1
        : 1

    const client:
      Client = {
        id:
          nextId,

        ...data,

        assignedEmployees:
          0,
      }

    clients.value.unshift(
      client,
    )

    recentActivity.value.unshift({
      id:
        Date.now(),

      clientName:
        client.name,

      action:
        'Client Added',

      description:
        'New client account was registered.',

      date:
        new Date()
          .toISOString()
          .slice(
            0,
            10,
          ),
    })

    return client
  }

  /* =========================================================
     UPDATE
  ========================================================= */

  const updateClient = (
    id: number,
    data:
      Partial<Client>,
  ) => {
    const index =
      clients.value.findIndex(
        client =>
          client.id === id,
      )

    if (
      index === -1
    ) {
      return null
    }

    clients.value[index] = {
      ...clients.value[index],
      ...data,
      id,
    }

    const updated =
      clients.value[index]

    recentActivity.value.unshift({
      id:
        Date.now(),

      clientName:
        updated.name,

      action:
        'Client Updated',

      description:
        'Client account information was updated.',

      date:
        new Date()
          .toISOString()
          .slice(
            0,
            10,
          ),
    })

    return updated
  }

  /* =========================================================
     HELPERS
  ========================================================= */

  const resetFilters = () => {
    search.value = ''
    status.value = ''
    contractStatus.value = ''

    currentPage.value =
      1
  }

  const getClientById = (
    id:
      number |
      string,
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
      currentPage.value =
        1
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
    recentActivity,

    statusOptions,
    contractOptions,

    createClient,
    updateClient,

    resetFilters,
    getClientById,
  }
}