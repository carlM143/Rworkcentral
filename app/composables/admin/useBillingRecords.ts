import type {
  BillingRecord,
  BillingRecordStatus,
} from '~/types/billingRecord'

export const useBillingRecords = () => {
  /* =========================================================
     MOCK DATA
  ========================================================= */

  const records =
    useState<BillingRecord[]>(
      'billing-records',
      () => [
        {
          id: 1,

          billingNumber:
            'BILL-2026-09-A-001',

          batchCode:
            'BILL-2026-09-A',

          clientId: 1,
          clientCode: 'CL-001',
          clientName:
            'Davao Logistics Corp.',

          periodStart:
            '2026-09-01',

          periodEnd:
            '2026-09-15',

          billingDate:
            '2026-09-16',

          employeeCount: 5,

          regularHours: 440,
          overtimeHours: 18,

          regularAmount: 132000,
          overtimeAmount: 10800,
          holidayAmount: 0,
          nightDifferentialAmount: 0,
          allowances: 0,
          adjustments: 1500,

          subtotal: 142800,
          totalBilling: 144300,

          issueCount: 0,

          status:
            'Ready',

          preparedBy:
            'Maria Santos',

          preparedAt:
            '2026-09-16T08:30:00',

          remarks:
            'Billing computation validated.',
        },

        {
          id: 2,

          billingNumber:
            'BILL-2026-09-A-002',

          batchCode:
            'BILL-2026-09-A',

          clientId: 2,
          clientCode: 'CL-002',
          clientName:
            'Mindanao Distribution Inc.',

          periodStart:
            '2026-09-01',

          periodEnd:
            '2026-09-15',

          billingDate:
            '2026-09-16',

          employeeCount: 3,

          regularHours: 264,
          overtimeHours: 11,

          regularAmount: 79200,
          overtimeAmount: 6600,
          holidayAmount: 0,
          nightDifferentialAmount: 0,
          allowances: 0,
          adjustments: 0,

          subtotal: 85800,
          totalBilling: 85800,

          issueCount: 0,

          status:
            'For Review',

          preparedBy:
            'Maria Santos',

          preparedAt:
            '2026-09-16T08:45:00',

          remarks:
            'Waiting for billing review.',
        },

        {
          id: 3,

          billingNumber:
            'BILL-2026-09-A-003',

          batchCode:
            'BILL-2026-09-A',

          clientId: 3,
          clientCode: 'CL-003',
          clientName:
            'Southline Trading',

          periodStart:
            '2026-09-01',

          periodEnd:
            '2026-09-15',

          billingDate:
            '2026-09-16',

          employeeCount: 2,

          regularHours: 176,
          overtimeHours: 4,

          regularAmount: 52800,
          overtimeAmount: 2400,
          holidayAmount: 0,
          nightDifferentialAmount: 0,
          allowances: 0,
          adjustments: -500,

          subtotal: 55200,
          totalBilling: 54700,

          issueCount: 0,

          status:
            'Ready',

          preparedBy:
            'Maria Santos',

          preparedAt:
            '2026-09-16T09:00:00',
        },

        {
          id: 4,

          billingNumber:
            'BILL-2026-09-A-004',

          batchCode:
            'BILL-2026-09-A',

          clientId: 4,
          clientCode: 'CL-004',
          clientName:
            'Metro Service Solutions',

          periodStart:
            '2026-09-01',

          periodEnd:
            '2026-09-15',

          billingDate:
            '2026-09-16',

          employeeCount: 4,

          regularHours: 330,
          overtimeHours: 6,

          regularAmount: 99000,
          overtimeAmount: 3600,
          holidayAmount: 0,
          nightDifferentialAmount: 0,
          allowances: 0,
          adjustments: 0,

          subtotal: 102600,
          totalBilling: 102600,

          issueCount: 1,

          status:
            'With Issue',

          preparedBy:
            'Maria Santos',

          preparedAt:
            '2026-09-16T09:15:00',

          remarks:
            'Incomplete employee time logs.',
        },

        {
          id: 5,

          billingNumber:
            'BILL-2026-09-A-005',

          batchCode:
            'BILL-2026-09-A',

          clientId: 5,
          clientCode: 'CL-005',
          clientName:
            'Prime Fleet Services',

          periodStart:
            '2026-09-01',

          periodEnd:
            '2026-09-15',

          billingDate:
            '2026-09-16',

          employeeCount: 2,

          regularHours: 176,
          overtimeHours: 8,

          regularAmount: 52800,
          overtimeAmount: 4800,
          holidayAmount: 0,
          nightDifferentialAmount: 0,
          allowances: 0,
          adjustments: 750,

          subtotal: 57600,
          totalBilling: 58350,

          issueCount: 0,

          status:
            'Ready',

          preparedBy:
            'Maria Santos',

          preparedAt:
            '2026-09-16T09:30:00',
        },

        {
          id: 6,

          billingNumber:
            'BILL-2026-08-B-001',

          batchCode:
            'BILL-2026-08-B',

          clientId: 1,
          clientCode: 'CL-001',
          clientName:
            'Davao Logistics Corp.',

          periodStart:
            '2026-08-16',

          periodEnd:
            '2026-08-31',

          billingDate:
            '2026-09-01',

          employeeCount: 5,

          regularHours: 430,
          overtimeHours: 14,

          regularAmount: 129000,
          overtimeAmount: 8400,
          holidayAmount: 2500,
          nightDifferentialAmount: 900,
          allowances: 0,
          adjustments: 0,

          subtotal: 140800,
          totalBilling: 140800,

          issueCount: 0,

          status:
            'Ready',

          preparedBy:
            'Maria Santos',

          preparedAt:
            '2026-09-01T08:10:00',
        },

        {
          id: 7,

          billingNumber:
            'BILL-2026-08-B-002',

          batchCode:
            'BILL-2026-08-B',

          clientId: 2,
          clientCode: 'CL-002',
          clientName:
            'Mindanao Distribution Inc.',

          periodStart:
            '2026-08-16',

          periodEnd:
            '2026-08-31',

          billingDate:
            '2026-09-01',

          employeeCount: 3,

          regularHours: 260,
          overtimeHours: 9,

          regularAmount: 78000,
          overtimeAmount: 5400,
          holidayAmount: 0,
          nightDifferentialAmount: 600,
          allowances: 0,
          adjustments: 1200,

          subtotal: 84000,
          totalBilling: 85200,

          issueCount: 0,

          status:
            'For Review',

          preparedBy:
            'Maria Santos',

          preparedAt:
            '2026-09-01T08:25:00',
        },

        {
          id: 8,

          billingNumber:
            'BILL-2026-09-B-001',

          batchCode:
            'BILL-2026-09-B',

          clientId: 3,
          clientCode: 'CL-003',
          clientName:
            'Southline Trading',

          periodStart:
            '2026-09-16',

          periodEnd:
            '2026-09-30',

          billingDate:
            '2026-10-01',

          employeeCount: 2,

          regularHours: 24,
          overtimeHours: 0,

          regularAmount: 7200,
          overtimeAmount: 0,
          holidayAmount: 0,
          nightDifferentialAmount: 0,
          allowances: 0,
          adjustments: 0,

          subtotal: 7200,
          totalBilling: 7200,

          issueCount: 0,

          status:
            'Preparing',

          preparedBy:
            'Maria Santos',

          preparedAt:
            '2026-09-17T08:30:00',

          remarks:
            'Billing period currently in progress.',
        },

        {
          id: 9,

          billingNumber:
            'BILL-2026-09-B-002',

          batchCode:
            'BILL-2026-09-B',

          clientId: 4,
          clientCode: 'CL-004',
          clientName:
            'Metro Service Solutions',

          periodStart:
            '2026-09-16',

          periodEnd:
            '2026-09-30',

          billingDate:
            '2026-10-01',

          employeeCount: 4,

          regularHours: 48,
          overtimeHours: 2,

          regularAmount: 14400,
          overtimeAmount: 1200,
          holidayAmount: 0,
          nightDifferentialAmount: 0,
          allowances: 0,
          adjustments: 0,

          subtotal: 15600,
          totalBilling: 15600,

          issueCount: 0,

          status:
            'Preparing',

          preparedBy:
            'Maria Santos',

          preparedAt:
            '2026-09-17T08:40:00',
        },

        {
          id: 10,

          billingNumber:
            'BILL-2026-09-B-003',

          batchCode:
            'BILL-2026-09-B',

          clientId: 7,
          clientCode: 'CL-007',
          clientName:
            'Pacific Warehousing Services',

          periodStart:
            '2026-09-16',

          periodEnd:
            '2026-09-30',

          billingDate:
            '2026-10-01',

          employeeCount: 6,

          regularHours: 72,
          overtimeHours: 4,

          regularAmount: 21600,
          overtimeAmount: 2400,
          holidayAmount: 0,
          nightDifferentialAmount: 500,
          allowances: 0,
          adjustments: 0,

          subtotal: 24500,
          totalBilling: 24500,

          issueCount: 0,

          status:
            'Preparing',

          preparedBy:
            'Maria Santos',

          preparedAt:
            '2026-09-17T08:50:00',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const batch =
    ref('')

  const client =
    ref('')

  const status =
    ref('')

  const dateFrom =
    ref('')

  const dateTo =
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

  const batchOptions =
    computed(() => {
      return [
        ...new Set(
          records.value.map(
            record =>
              record.batchCode,
          ),
        ),
      ].sort()
    })

  const clientOptions =
    computed(() => {
      return [
        ...new Set(
          records.value.map(
            record =>
              record.clientName,
          ),
        ),
      ].sort()
    })

  const statusOptions:
    BillingRecordStatus[] = [
      'Preparing',
      'For Review',
      'With Issue',
      'Ready',
    ]

  /* =========================================================
     FILTERED
  ========================================================= */

  const filteredRecords =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return records.value.filter(
        record => {
          const matchesSearch =
            !keyword ||
            record.billingNumber
              .toLowerCase()
              .includes(keyword) ||
            record.batchCode
              .toLowerCase()
              .includes(keyword) ||
            record.clientCode
              .toLowerCase()
              .includes(keyword) ||
            record.clientName
              .toLowerCase()
              .includes(keyword)

          const matchesBatch =
            !batch.value ||
            record.batchCode ===
              batch.value

          const matchesClient =
            !client.value ||
            record.clientName ===
              client.value

          const matchesStatus =
            !status.value ||
            record.status ===
              status.value

          const matchesFrom =
            !dateFrom.value ||
            record.periodStart >=
              dateFrom.value

          const matchesTo =
            !dateTo.value ||
            record.periodEnd <=
              dateTo.value

          return (
            matchesSearch &&
            matchesBatch &&
            matchesClient &&
            matchesStatus &&
            matchesFrom &&
            matchesTo
          )
        },
      )
    })

  /* =========================================================
     STATS
  ========================================================= */

  const stats =
    computed(() => {
      const data =
        filteredRecords.value

      return {
        totalRecords:
          data.length,

        ready:
          data.filter(
            record =>
              record.status ===
              'Ready',
          ).length,

        reviewOrIssues:
          data.filter(
            record =>
              record.status ===
                'For Review' ||
              record.status ===
                'With Issue',
          ).length,

        totalBilling:
          data.reduce(
            (
              total,
              record,
            ) =>
              total +
              record.totalBilling,
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
          filteredRecords
            .value.length /
            perPage.value,
        ),
      )
    })

  const paginatedRecords =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredRecords
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
        filteredRecords
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

        filteredRecords
          .value.length,
      )
    })

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value =
      ''

    batch.value =
      ''

    client.value =
      ''

    status.value =
      ''

    dateFrom.value =
      ''

    dateTo.value =
      ''

    currentPage.value =
      1
  }

  watch(
    [
      search,
      batch,
      client,
      status,
      dateFrom,
      dateTo,
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
    records,

    search,
    batch,
    client,
    status,
    dateFrom,
    dateTo,

    currentPage,
    perPage,

    filteredRecords,
    paginatedRecords,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    batchOptions,
    clientOptions,
    statusOptions,

    resetFilters,
  }
}