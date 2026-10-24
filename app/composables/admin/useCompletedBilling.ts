import type {
  CompletedBilling,
  CompletedBillingPaymentStatus,
} from '~/types/completedBilling'

export const useCompletedBilling = () => {
  /* =========================================================
     MOCK DATA
  ========================================================= */

  const billings =
    useState<CompletedBilling[]>(
      'completed-billing',
      () => [
        {
          id: 1,

          billingNumber:
            'BILL-2026-08-B-001',

          batchCode:
            'BILL-2026-08-B',

          clientId: 1,

          clientCode:
            'CL-001',

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

          billingStatus:
            'Completed',

          paymentStatus:
            'Paid',

          amountPaid: 140800,
          outstandingAmount: 0,

          referenceNumber:
            'INV-2026-0901-001',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-09-01T10:20:00',

          paidAt:
            '2026-09-10T09:30:00',

          remarks:
            'Billing fully settled.',
        },

        {
          id: 2,

          billingNumber:
            'BILL-2026-08-B-002',

          batchCode:
            'BILL-2026-08-B',

          clientId: 2,

          clientCode:
            'CL-002',

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

          billingStatus:
            'Completed',

          paymentStatus:
            'Partially Paid',

          amountPaid: 50000,
          outstandingAmount: 35200,

          referenceNumber:
            'INV-2026-0901-002',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-09-01T10:35:00',

          paidAt:
            '2026-09-12T11:10:00',

          remarks:
            'Partial payment received.',
        },

        {
          id: 3,

          billingNumber:
            'BILL-2026-08-B-003',

          batchCode:
            'BILL-2026-08-B',

          clientId: 3,

          clientCode:
            'CL-003',

          clientName:
            'Southline Trading',

          periodStart:
            '2026-08-16',

          periodEnd:
            '2026-08-31',

          billingDate:
            '2026-09-01',

          employeeCount: 2,

          regularHours: 176,
          overtimeHours: 6,

          regularAmount: 52800,
          overtimeAmount: 3600,
          holidayAmount: 0,
          nightDifferentialAmount: 0,
          allowances: 0,
          adjustments: -500,

          subtotal: 56400,
          totalBilling: 55900,

          billingStatus:
            'Completed',

          paymentStatus:
            'Paid',

          amountPaid: 55900,
          outstandingAmount: 0,

          referenceNumber:
            'INV-2026-0901-003',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-09-01T10:50:00',

          paidAt:
            '2026-09-08T08:45:00',
        },

        {
          id: 4,

          billingNumber:
            'BILL-2026-08-B-004',

          batchCode:
            'BILL-2026-08-B',

          clientId: 4,

          clientCode:
            'CL-004',

          clientName:
            'Metro Service Solutions',

          periodStart:
            '2026-08-16',

          periodEnd:
            '2026-08-31',

          billingDate:
            '2026-09-01',

          employeeCount: 4,

          regularHours: 340,
          overtimeHours: 7,

          regularAmount: 102000,
          overtimeAmount: 4200,
          holidayAmount: 0,
          nightDifferentialAmount: 0,
          allowances: 0,
          adjustments: 0,

          subtotal: 106200,
          totalBilling: 106200,

          billingStatus:
            'Completed',

          paymentStatus:
            'Unpaid',

          amountPaid: 0,
          outstandingAmount: 106200,

          referenceNumber:
            'INV-2026-0901-004',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-09-01T11:05:00',

          remarks:
            'Invoice issued. Awaiting payment.',
        },

        {
          id: 5,

          billingNumber:
            'BILL-2026-08-A-001',

          batchCode:
            'BILL-2026-08-A',

          clientId: 1,

          clientCode:
            'CL-001',

          clientName:
            'Davao Logistics Corp.',

          periodStart:
            '2026-08-01',

          periodEnd:
            '2026-08-15',

          billingDate:
            '2026-08-16',

          employeeCount: 5,

          regularHours: 440,
          overtimeHours: 20,

          regularAmount: 132000,
          overtimeAmount: 12000,
          holidayAmount: 0,
          nightDifferentialAmount: 0,
          allowances: 0,
          adjustments: 1500,

          subtotal: 144000,
          totalBilling: 145500,

          billingStatus:
            'Completed',

          paymentStatus:
            'Paid',

          amountPaid: 145500,
          outstandingAmount: 0,

          referenceNumber:
            'INV-2026-0816-001',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-08-16T09:30:00',

          paidAt:
            '2026-08-25T10:00:00',
        },

        {
          id: 6,

          billingNumber:
            'BILL-2026-08-A-002',

          batchCode:
            'BILL-2026-08-A',

          clientId: 5,

          clientCode:
            'CL-005',

          clientName:
            'Prime Fleet Services',

          periodStart:
            '2026-08-01',

          periodEnd:
            '2026-08-15',

          billingDate:
            '2026-08-16',

          employeeCount: 2,

          regularHours: 176,
          overtimeHours: 10,

          regularAmount: 52800,
          overtimeAmount: 6000,
          holidayAmount: 0,
          nightDifferentialAmount: 0,
          allowances: 0,
          adjustments: 750,

          subtotal: 58800,
          totalBilling: 59550,

          billingStatus:
            'Completed',

          paymentStatus:
            'Paid',

          amountPaid: 59550,
          outstandingAmount: 0,

          referenceNumber:
            'INV-2026-0816-005',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-08-16T09:45:00',

          paidAt:
            '2026-08-27T14:30:00',
        },

        {
          id: 7,

          billingNumber:
            'BILL-2026-07-B-001',

          batchCode:
            'BILL-2026-07-B',

          clientId: 2,

          clientCode:
            'CL-002',

          clientName:
            'Mindanao Distribution Inc.',

          periodStart:
            '2026-07-16',

          periodEnd:
            '2026-07-31',

          billingDate:
            '2026-08-01',

          employeeCount: 3,

          regularHours: 264,
          overtimeHours: 12,

          regularAmount: 79200,
          overtimeAmount: 7200,
          holidayAmount: 0,
          nightDifferentialAmount: 500,
          allowances: 0,
          adjustments: 0,

          subtotal: 86900,
          totalBilling: 86900,

          billingStatus:
            'Completed',

          paymentStatus:
            'Partially Paid',

          amountPaid: 65000,
          outstandingAmount: 21900,

          referenceNumber:
            'INV-2026-0801-002',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-08-01T09:15:00',

          paidAt:
            '2026-08-10T13:20:00',
        },

        {
          id: 8,

          billingNumber:
            'BILL-2026-07-B-002',

          batchCode:
            'BILL-2026-07-B',

          clientId: 7,

          clientCode:
            'CL-007',

          clientName:
            'Pacific Warehousing Services',

          periodStart:
            '2026-07-16',

          periodEnd:
            '2026-07-31',

          billingDate:
            '2026-08-01',

          employeeCount: 6,

          regularHours: 520,
          overtimeHours: 16,

          regularAmount: 156000,
          overtimeAmount: 9600,
          holidayAmount: 0,
          nightDifferentialAmount: 1200,
          allowances: 0,
          adjustments: 1800,

          subtotal: 166800,
          totalBilling: 168600,

          billingStatus:
            'Completed',

          paymentStatus:
            'Unpaid',

          amountPaid: 0,
          outstandingAmount: 168600,

          referenceNumber:
            'INV-2026-0801-007',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-08-01T09:30:00',

          remarks:
            'Awaiting client payment.',
        },

        {
          id: 9,

          billingNumber:
            'BILL-2026-07-A-001',

          batchCode:
            'BILL-2026-07-A',

          clientId: 3,

          clientCode:
            'CL-003',

          clientName:
            'Southline Trading',

          periodStart:
            '2026-07-01',

          periodEnd:
            '2026-07-15',

          billingDate:
            '2026-07-16',

          employeeCount: 2,

          regularHours: 176,
          overtimeHours: 5,

          regularAmount: 52800,
          overtimeAmount: 3000,
          holidayAmount: 0,
          nightDifferentialAmount: 0,
          allowances: 0,
          adjustments: 0,

          subtotal: 55800,
          totalBilling: 55800,

          billingStatus:
            'Completed',

          paymentStatus:
            'Paid',

          amountPaid: 55800,
          outstandingAmount: 0,

          referenceNumber:
            'INV-2026-0716-003',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-07-16T10:00:00',

          paidAt:
            '2026-07-24T10:45:00',
        },

        {
          id: 10,

          billingNumber:
            'BILL-2026-07-A-002',

          batchCode:
            'BILL-2026-07-A',

          clientId: 4,

          clientCode:
            'CL-004',

          clientName:
            'Metro Service Solutions',

          periodStart:
            '2026-07-01',

          periodEnd:
            '2026-07-15',

          billingDate:
            '2026-07-16',

          employeeCount: 4,

          regularHours: 352,
          overtimeHours: 8,

          regularAmount: 105600,
          overtimeAmount: 4800,
          holidayAmount: 0,
          nightDifferentialAmount: 0,
          allowances: 0,
          adjustments: -1000,

          subtotal: 110400,
          totalBilling: 109400,

          billingStatus:
            'Completed',

          paymentStatus:
            'Paid',

          amountPaid: 109400,
          outstandingAmount: 0,

          referenceNumber:
            'INV-2026-0716-004',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-07-16T10:15:00',

          paidAt:
            '2026-07-28T09:50:00',
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

  const paymentStatus =
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
          billings.value.map(
            item =>
              item.batchCode,
          ),
        ),
      ].sort()
    })

  const clientOptions =
    computed(() => {
      return [
        ...new Set(
          billings.value.map(
            item =>
              item.clientName,
          ),
        ),
      ].sort()
    })

  const paymentStatusOptions:
    CompletedBillingPaymentStatus[] = [
      'Unpaid',
      'Partially Paid',
      'Paid',
    ]

  /* =========================================================
     FILTERED
  ========================================================= */

  const filteredBillings =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return billings.value.filter(
        item => {
          const matchesSearch =
            !keyword ||
            item.billingNumber
              .toLowerCase()
              .includes(keyword) ||
            item.batchCode
              .toLowerCase()
              .includes(keyword) ||
            item.clientCode
              .toLowerCase()
              .includes(keyword) ||
            item.clientName
              .toLowerCase()
              .includes(keyword) ||
            (
              item.referenceNumber ??
              ''
            )
              .toLowerCase()
              .includes(keyword)

          const matchesBatch =
            !batch.value ||
            item.batchCode ===
              batch.value

          const matchesClient =
            !client.value ||
            item.clientName ===
              client.value

          const matchesPayment =
            !paymentStatus.value ||
            item.paymentStatus ===
              paymentStatus.value

          const completedDate =
            item.completedAt.slice(
              0,
              10,
            )

          const matchesFrom =
            !dateFrom.value ||
            completedDate >=
              dateFrom.value

          const matchesTo =
            !dateTo.value ||
            completedDate <=
              dateTo.value

          return (
            matchesSearch &&
            matchesBatch &&
            matchesClient &&
            matchesPayment &&
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
        filteredBillings.value

      return {
        completedBillings:
          data.length,

        totalBilling:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.totalBilling,
            0,
          ),

        paidAmount:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.amountPaid,
            0,
          ),

        outstandingAmount:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.outstandingAmount,
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
          filteredBillings
            .value.length /
            perPage.value,
        ),
      )
    })

  const paginatedBillings =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredBillings
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
        filteredBillings
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

        filteredBillings
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

    paymentStatus.value =
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
      paymentStatus,
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
    billings,

    search,
    batch,
    client,
    paymentStatus,
    dateFrom,
    dateTo,

    currentPage,
    perPage,

    filteredBillings,
    paginatedBillings,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    batchOptions,
    clientOptions,
    paymentStatusOptions,

    resetFilters,
  }
}