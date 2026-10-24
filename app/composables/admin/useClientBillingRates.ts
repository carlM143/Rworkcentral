import type {
  ClientBillingRate,
  ClientBillingRateStatus,
  ClientBillingRateType,
} from '~/types/clientBillingRate'

export const useClientBillingRates = () => {
  /* =========================================================
     MOCK DATA
  ========================================================= */

  const rates =
    useState<ClientBillingRate[]>(
      'client-billing-rates',
      () => [
        {
          id: 1,

          rateCode:
            'BR-2026-001',

          clientId: 1,
          clientCode: 'CL-001',
          clientName:
            'Davao Transport Services Inc.',

          positionOrService:
            'Driver',

          rateType:
            'Daily',

          regularRate: 1250,
          overtimeRate: 195.31,
          holidayRate: 2500,
          nightDifferentialRate: 19.53,

          effectiveDate:
            '2026-09-01',

          status:
            'Active',

          remarks:
            'Standard daily driver billing rate.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-08-25T09:00:00',
        },

        {
          id: 2,

          rateCode:
            'BR-2026-002',

          clientId: 1,
          clientCode: 'CL-001',
          clientName:
            'Davao Transport Services Inc.',

          positionOrService:
            'Dispatcher',

          rateType:
            'Daily',

          regularRate: 1100,
          overtimeRate: 171.88,
          holidayRate: 2200,
          nightDifferentialRate: 17.19,

          effectiveDate:
            '2026-09-01',

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-08-25T09:15:00',
        },

        {
          id: 3,

          rateCode:
            'BR-2026-003',

          clientId: 2,
          clientCode: 'CL-002',
          clientName:
            'Prime Logistics Solutions',

          positionOrService:
            'Driver',

          rateType:
            'Per Trip',

          regularRate: 850,
          overtimeRate: 0,
          holidayRate: 1275,
          nightDifferentialRate: 85,

          effectiveDate:
            '2026-08-01',

          status:
            'Active',

          remarks:
            'Billing per completed delivery trip.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-07-25T10:00:00',
        },

        {
          id: 4,

          rateCode:
            'BR-2026-004',

          clientId: 3,
          clientCode: 'CL-003',
          clientName:
            'Mindanao Retail Group',

          positionOrService:
            'Administrative Staff',

          rateType:
            'Monthly',

          regularRate: 28500,
          overtimeRate: 170,
          holidayRate: 1450,
          nightDifferentialRate: 17,

          effectiveDate:
            '2026-07-01',

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-06-20T08:30:00',
        },

        {
          id: 5,

          rateCode:
            'BR-2026-005',

          clientId: 4,
          clientCode: 'CL-004',
          clientName:
            'Southern Food Corporation',

          positionOrService:
            'Warehouse Helper',

          rateType:
            'Hourly',

          regularRate: 145,
          overtimeRate: 181.25,
          holidayRate: 290,
          nightDifferentialRate: 14.5,

          effectiveDate:
            '2026-09-01',

          endDate:
            '2026-12-31',

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-08-21T13:20:00',
        },

        {
          id: 6,

          rateCode:
            'BR-2026-006',

          clientId: 5,
          clientCode: 'CL-005',
          clientName:
            'Greenfield Manufacturing Corp.',

          positionOrService:
            'Production Staff',

          rateType:
            'Daily',

          regularRate: 975,
          overtimeRate: 152.34,
          holidayRate: 1950,
          nightDifferentialRate: 15.23,

          effectiveDate:
            '2026-10-01',

          status:
            'Scheduled',

          remarks:
            'New rate effective October 2026.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-15T09:00:00',
        },

        {
          id: 7,

          rateCode:
            'BR-2026-007',

          clientId: 7,
          clientCode: 'CL-007',
          clientName:
            'Pacific Warehousing Services',

          positionOrService:
            'Warehouse Operations',

          rateType:
            'Fixed',

          regularRate: 85000,
          overtimeRate: 0,
          holidayRate: 0,
          nightDifferentialRate: 0,

          effectiveDate:
            '2026-09-01',

          endDate:
            '2026-09-30',

          status:
            'Active',

          remarks:
            'Fixed monthly project billing.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-08-28T15:10:00',
        },

        {
          id: 8,

          rateCode:
            'BR-2026-008',

          clientId: 8,
          clientCode: 'CL-008',
          clientName:
            'Golden Care Medical Services',

          positionOrService:
            'Office Staff',

          rateType:
            'Monthly',

          regularRate: 26000,
          overtimeRate: 160,
          holidayRate: 1350,
          nightDifferentialRate: 16,

          effectiveDate:
            '2026-10-01',

          status:
            'Scheduled',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-16T10:30:00',
        },

        {
          id: 9,

          rateCode:
            'BR-2025-021',

          clientId: 6,
          clientCode: 'CL-006',
          clientName:
            'Metro Property Management',

          positionOrService:
            'Utility Staff',

          rateType:
            'Daily',

          regularRate: 850,
          overtimeRate: 132.81,
          holidayRate: 1700,
          nightDifferentialRate: 13.28,

          effectiveDate:
            '2025-01-01',

          endDate:
            '2025-12-31',

          status:
            'Expired',

          createdBy:
            'Maria Santos',

          createdAt:
            '2024-12-15T11:00:00',
        },

        {
          id: 10,

          rateCode:
            'BR-2026-009',

          clientId: 9,
          clientCode: 'CL-009',
          clientName:
            'Northpoint Distribution Inc.',

          positionOrService:
            'Delivery Assistant',

          rateType:
            'Daily',

          regularRate: 950,
          overtimeRate: 148.44,
          holidayRate: 1900,
          nightDifferentialRate: 14.84,

          effectiveDate:
            '2026-05-01',

          status:
            'Inactive',

          remarks:
            'Rate temporarily disabled.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-04-20T14:20:00',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const client =
    ref('')

  const rateType =
    ref('')

  const status =
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

  const clientOptions =
    computed(() => {
      return [
        ...new Set(
          rates.value.map(
            rate =>
              rate.clientName,
          ),
        ),
      ].sort()
    })

  const rateTypeOptions:
    ClientBillingRateType[] = [
      'Hourly',
      'Daily',
      'Monthly',
      'Per Trip',
      'Fixed',
    ]

  const statusOptions:
    ClientBillingRateStatus[] = [
      'Active',
      'Scheduled',
      'Expired',
      'Inactive',
    ]

  /* =========================================================
     FILTERED
  ========================================================= */

  const filteredRates =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return rates.value.filter(
        rate => {
          const matchesSearch =
            !keyword ||
            rate.rateCode
              .toLowerCase()
              .includes(keyword) ||
            rate.clientCode
              .toLowerCase()
              .includes(keyword) ||
            rate.clientName
              .toLowerCase()
              .includes(keyword) ||
            rate.positionOrService
              .toLowerCase()
              .includes(keyword)

          const matchesClient =
            !client.value ||
            rate.clientName ===
              client.value

          const matchesType =
            !rateType.value ||
            rate.rateType ===
              rateType.value

          const matchesStatus =
            !status.value ||
            rate.status ===
              status.value

          return (
            matchesSearch &&
            matchesClient &&
            matchesType &&
            matchesStatus
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
        filteredRates.value

      return {
        totalRates:
          records.length,

        activeRates:
          records.filter(
            rate =>
              rate.status ===
              'Active',
          ).length,

        clientsWithRates:
          new Set(
            records.map(
              rate =>
                rate.clientId,
            ),
          ).size,

        scheduledRates:
          records.filter(
            rate =>
              rate.status ===
              'Scheduled',
          ).length,
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
          filteredRates
            .value.length /
            perPage.value,
        ),
      )
    })

  const paginatedRates =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredRates
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
        filteredRates
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

        filteredRates
          .value.length,
      )
    })

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value =
      ''

    client.value =
      ''

    rateType.value =
      ''

    status.value =
      ''

    currentPage.value =
      1
  }

  watch(
    [
      search,
      client,
      rateType,
      status,
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
    rates,

    search,
    client,
    rateType,
    status,

    currentPage,
    perPage,

    filteredRates,
    paginatedRates,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    clientOptions,
    rateTypeOptions,
    statusOptions,

    resetFilters,
  }
}