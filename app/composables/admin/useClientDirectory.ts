import type {
  Client,
  ClientStatus,
  ContractStatus,
} from '~/types/client'

/*
|--------------------------------------------------------------------------
| CLIENT DIRECTORY RECORD
|--------------------------------------------------------------------------
|
| Pick lang tayo ng existing fields mula sa Client type.
| Dinagdagan natin ng UI-only fields para sa directory.
|
*/

export type ClientDirectoryRecord =
  Pick<
    Client,
    | 'id'
    | 'code'
    | 'name'
    | 'industry'
    | 'contactPerson'
    | 'email'
    | 'phone'
    | 'address'
    | 'branches'
  > & {
    assignedEmployees: number
    status: ClientStatus
    contractStatus: ContractStatus
    dateStarted: string
  }

export const useClientDirectory = () => {
  /* =========================================================
     MOCK DATA
  ========================================================= */

  const clients =
    useState<ClientDirectoryRecord[]>(
      'client-directory',
      () => [
        {
          id: 1,

          code:
            'CL-001',

          name:
            'Davao Transport Services Inc.',

          industry:
            'Transportation',

          contactPerson:
            'John Ramirez',

          email:
            'john.ramirez@davaotransport.ph',

          phone:
            '0917 123 4567',

          address:
            'Davao City, Davao del Sur',

          branches: 4,

          assignedEmployees: 24,

          status:
            'Active',

          contractStatus:
            'Active',

          dateStarted:
            '2024-01-15',
        },

        {
          id: 2,

          code:
            'CL-002',

          name:
            'Prime Logistics Solutions',

          industry:
            'Logistics',

          contactPerson:
            'Angela Cruz',

          email:
            'angela.cruz@primelogistics.ph',

          phone:
            '0918 456 7821',

          address:
            'Tagum City, Davao del Norte',

          branches: 3,

          assignedEmployees: 18,

          status:
            'Active',

          contractStatus:
            'Expiring Soon',

          dateStarted:
            '2024-03-08',
        },

        {
          id: 3,

          code:
            'CL-003',

          name:
            'Mindanao Retail Group',

          industry:
            'Retail',

          contactPerson:
            'Michael Torres',

          email:
            'michael@mindanaoretail.ph',

          phone:
            '0917 852 1100',

          address:
            'Davao City, Davao del Sur',

          branches: 7,

          assignedEmployees: 36,

          status:
            'Active',

          contractStatus:
            'Active',

          dateStarted:
            '2023-11-20',
        },

        {
          id: 4,

          code:
            'CL-004',

          name:
            'Southern Food Corporation',

          industry:
            'Food & Beverage',

          contactPerson:
            'Karen Villanueva',

          email:
            'karen@southernfood.ph',

          phone:
            '0920 455 2211',

          address:
            'General Santos City',

          branches: 5,

          assignedEmployees: 21,

          status:
            'For Review',

          contractStatus:
            'Expiring Soon',

          dateStarted:
            '2025-02-10',
        },

        {
          id: 5,

          code:
            'CL-005',

          name:
            'Greenfield Manufacturing Corp.',

          industry:
            'Manufacturing',

          contactPerson:
            'Robert Lim',

          email:
            'robert.lim@greenfield.ph',

          phone:
            '0919 900 7712',

          address:
            'Panabo City, Davao del Norte',

          branches: 2,

          assignedEmployees: 14,

          status:
            'Active',

          contractStatus:
            'Active',

          dateStarted:
            '2024-07-01',
        },

        {
          id: 6,

          code:
            'CL-006',

          name:
            'Metro Property Management',

          industry:
            'Real Estate',

          contactPerson:
            'Patricia Santos',

          email:
            'patricia@metroproperty.ph',

          phone:
            '0916 332 1029',

          address:
            'Davao City, Davao del Sur',

          branches: 2,

          assignedEmployees: 9,

          status:
            'Inactive',

          contractStatus:
            'Expired',

          dateStarted:
            '2023-08-16',
        },

        {
          id: 7,

          code:
            'CL-007',

          name:
            'Pacific Warehousing Services',

          industry:
            'Warehousing',

          contactPerson:
            'Daniel Mendoza',

          email:
            'daniel@pacificwarehouse.ph',

          phone:
            '0917 663 8812',

          address:
            'Cagayan de Oro City',

          branches: 3,

          assignedEmployees: 16,

          status:
            'Active',

          contractStatus:
            'Active',

          dateStarted:
            '2025-05-12',
        },

        {
          id: 8,

          code:
            'CL-008',

          name:
            'Golden Care Medical Services',

          industry:
            'Healthcare',

          contactPerson:
            'Jennifer Ramos',

          email:
            'jennifer@goldencare.ph',

          phone:
            '0921 509 7721',

          address:
            'Digos City, Davao del Sur',

          branches: 2,

          assignedEmployees: 11,

          status:
            'For Review',

          contractStatus:
            'Active',

          dateStarted:
            '2026-01-05',
        },

        {
          id: 9,

          code:
            'CL-009',

          name:
            'Northpoint Distribution Inc.',

          industry:
            'Distribution',

          contactPerson:
            'Carlo Reyes',

          email:
            'carlo@northpoint.ph',

          phone:
            '0918 441 2085',

          address:
            'Davao City, Davao del Sur',

          branches: 4,

          assignedEmployees: 27,

          status:
            'Active',

          contractStatus:
            'Expiring Soon',

          dateStarted:
            '2024-09-18',
        },

        {
          id: 10,

          code:
            'CL-010',

          name:
            'BluePeak Construction',

          industry:
            'Construction',

          contactPerson:
            'Mark Flores',

          email:
            'mark@bluepeak.ph',

          phone:
            '0915 701 3366',

          address:
            'Davao City, Davao del Sur',

          branches: 1,

          assignedEmployees: 8,

          status:
            'Inactive',

          contractStatus:
            'Expired',

          dateStarted:
            '2023-05-25',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const industry =
    ref('')

  const status =
    ref('')

  const contractStatus =
    ref('')

  /* =========================================================
     PAGINATION
  ========================================================= */

  const currentPage =
    ref(1)

  const perPage =
    ref(6)

  /* =========================================================
     OPTIONS
  ========================================================= */

  const industryOptions =
    computed(() => {
      return [
        ...new Set(
          clients.value
            .map(
              client =>
                client.industry,
            )
            .filter(
              (
                value,
              ): value is string =>
                Boolean(value),
            ),
        ),
      ].sort()
    })

  const statusOptions:
    ClientStatus[] = [
      'Active',
      'For Review',
      'Inactive',
    ]

  const contractStatusOptions:
    ContractStatus[] = [
      'Active',
      'Expiring Soon',
      'Expired',
    ]

  /* =========================================================
     FILTERED CLIENTS
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
            client.code
              .toLowerCase()
              .includes(keyword) ||
            client.name
              .toLowerCase()
              .includes(keyword) ||
            client.contactPerson
              .toLowerCase()
              .includes(keyword) ||
            (
              client.email ??
              ''
            )
              .toLowerCase()
              .includes(keyword) ||
            (
              client.phone ??
              ''
            )
              .toLowerCase()
              .includes(keyword) ||
            (
              client.address ??
              ''
            )
              .toLowerCase()
              .includes(keyword)

          const matchesIndustry =
            !industry.value ||
            client.industry ===
              industry.value

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
            matchesIndustry &&
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
      const records =
        filteredClients.value

      return {
        totalClients:
          records.length,

        activeClients:
          records.filter(
            client =>
              client.status ===
              'Active',
          ).length,

        inactiveClients:
          records.filter(
            client =>
              client.status ===
              'Inactive',
          ).length,

        assignedEmployees:
          records.reduce(
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
     PAGINATION
  ========================================================= */

  const totalPages =
    computed(() => {
      return Math.max(
        1,
        Math.ceil(
          filteredClients
            .value.length /
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

      return filteredClients
        .value
        .slice(
          start,
          start +
            perPage.value,
        )
    })

  const showingFrom =
    computed(() => {
      if (
        filteredClients
          .value.length ===
        0
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

        filteredClients
          .value.length,
      )
    })

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value =
      ''

    industry.value =
      ''

    status.value =
      ''

    contractStatus.value =
      ''

    currentPage.value =
      1
  }

  watch(
    [
      search,
      industry,
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
    value => {
      if (
        currentPage.value >
        value
      ) {
        currentPage.value =
          value
      }
    },
  )

  return {
    clients,

    search,
    industry,
    status,
    contractStatus,

    currentPage,
    perPage,

    filteredClients,
    paginatedClients,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    industryOptions,
    statusOptions,
    contractStatusOptions,

    resetFilters,
  }
}