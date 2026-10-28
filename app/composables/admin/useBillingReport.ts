import type {
  BillingReportRecord,
  BillingReportStatus,
} from '~/types/billingReport'

export const useBillingReport = () => {
  const records =
    useState<BillingReportRecord[]>(
      'billing-report-records',
      () => [
        {
          id: 1,

          billingNumber: 'BIL-2026-1001',
          clientCode: 'CLI-001',
          clientName: 'ABC Logistics Corporation',

          billingPeriod: 'October 1-15, 2026',

          periodStart: '2026-10-01',
          periodEnd: '2026-10-15',

          employeesBilled: 18,

          baseAmount: 185000,
          overtimeAmount: 26500,
          holidayAmount: 12000,
          allowances: 15000,
          addOns: 5500,
          adjustments: 2500,

          grossBilling: 246500,

          deductions: 3500,
          credits: 1500,

          netBilling: 241500,

          invoiceNumber: 'INV-2026-1001',
          invoiceDate: '2026-10-16',

          dueDate: '2026-10-31',
          paidDate: '2026-10-28',

          status: 'Paid',
        },

        {
          id: 2,

          billingNumber: 'BIL-2026-1002',
          clientCode: 'CLI-002',
          clientName: 'Northstar Manufacturing Inc.',

          billingPeriod: 'October 1-15, 2026',

          periodStart: '2026-10-01',
          periodEnd: '2026-10-15',

          employeesBilled: 12,

          baseAmount: 126000,
          overtimeAmount: 18500,
          holidayAmount: 7500,
          allowances: 10000,
          addOns: 3000,
          adjustments: 0,

          grossBilling: 165000,

          deductions: 2500,
          credits: 0,

          netBilling: 162500,

          invoiceNumber: 'INV-2026-1002',
          invoiceDate: '2026-10-16',

          dueDate: '2026-10-31',

          status: 'Completed',
        },

        {
          id: 3,

          billingNumber: 'BIL-2026-1003',
          clientCode: 'CLI-003',
          clientName: 'Metro Retail Solutions',

          billingPeriod: 'October 1-15, 2026',

          periodStart: '2026-10-01',
          periodEnd: '2026-10-15',

          employeesBilled: 9,

          baseAmount: 94500,
          overtimeAmount: 12750,
          holidayAmount: 0,
          allowances: 8500,
          addOns: 2000,
          adjustments: -1500,

          grossBilling: 116250,

          deductions: 1000,
          credits: 500,

          netBilling: 114750,

          invoiceNumber: 'INV-2026-1003',
          invoiceDate: '2026-10-16',

          dueDate: '2026-10-30',

          status: 'For Review',
        },

        {
          id: 4,

          billingNumber: 'BIL-2026-1004',
          clientCode: 'CLI-004',
          clientName: 'Prime Warehousing Services',

          billingPeriod: 'October 1-15, 2026',

          periodStart: '2026-10-01',
          periodEnd: '2026-10-15',

          employeesBilled: 15,

          baseAmount: 157500,
          overtimeAmount: 21000,
          holidayAmount: 9500,
          allowances: 12000,
          addOns: 4500,
          adjustments: 1000,

          grossBilling: 205500,

          deductions: 4000,
          credits: 0,

          netBilling: 201500,

          status: 'Pending',
        },

        {
          id: 5,

          billingNumber: 'BIL-2026-1005',
          clientCode: 'CLI-005',
          clientName: 'Eastpoint Distribution Corp.',

          billingPeriod: 'October 1-15, 2026',

          periodStart: '2026-10-01',
          periodEnd: '2026-10-15',

          employeesBilled: 11,

          baseAmount: 115500,
          overtimeAmount: 14500,
          holidayAmount: 6000,
          allowances: 9000,
          addOns: 2500,
          adjustments: 0,

          grossBilling: 147500,

          deductions: 1500,
          credits: 1000,

          netBilling: 145000,

          invoiceNumber: 'INV-2026-1005',
          invoiceDate: '2026-10-16',

          dueDate: '2026-10-31',

          status: 'Completed',
        },

        {
          id: 6,

          billingNumber: 'BIL-2026-1006',
          clientCode: 'CLI-006',
          clientName: 'Bluewave Industrial Services',

          billingPeriod: 'October 1-15, 2026',

          periodStart: '2026-10-01',
          periodEnd: '2026-10-15',

          employeesBilled: 7,

          baseAmount: 73500,
          overtimeAmount: 8500,
          holidayAmount: 3500,
          allowances: 6500,
          addOns: 1500,
          adjustments: -500,

          grossBilling: 93000,

          deductions: 500,
          credits: 0,

          netBilling: 92500,

          status: 'Draft',
        },

        {
          id: 7,

          billingNumber: 'BIL-2026-1007',
          clientCode: 'CLI-007',
          clientName: 'Westfield Transport Group',

          billingPeriod: 'October 1-15, 2026',

          periodStart: '2026-10-01',
          periodEnd: '2026-10-15',

          employeesBilled: 14,

          baseAmount: 147000,
          overtimeAmount: 24500,
          holidayAmount: 8500,
          allowances: 11500,
          addOns: 4000,
          adjustments: 2000,

          grossBilling: 197500,

          deductions: 2500,
          credits: 1500,

          netBilling: 193500,

          invoiceNumber: 'INV-2026-1007',
          invoiceDate: '2026-10-16',

          dueDate: '2026-11-01',

          status: 'Completed',
        },

        {
          id: 8,

          billingNumber: 'BIL-2026-1008',
          clientCode: 'CLI-008',
          clientName: 'Sunrise Food Corporation',

          billingPeriod: 'October 1-15, 2026',

          periodStart: '2026-10-01',
          periodEnd: '2026-10-15',

          employeesBilled: 10,

          baseAmount: 105000,
          overtimeAmount: 11500,
          holidayAmount: 5000,
          allowances: 8000,
          addOns: 3000,
          adjustments: 500,

          grossBilling: 133000,

          deductions: 1200,
          credits: 800,

          netBilling: 131000,

          invoiceNumber: 'INV-2026-1008',
          invoiceDate: '2026-10-16',

          dueDate: '2026-10-30',
          paidDate: '2026-10-25',

          status: 'Paid',
        },

        {
          id: 9,

          billingNumber: 'BIL-2026-1009',
          clientCode: 'CLI-009',
          clientName: 'Global Pacific Trading',

          billingPeriod: 'October 1-15, 2026',

          periodStart: '2026-10-01',
          periodEnd: '2026-10-15',

          employeesBilled: 6,

          baseAmount: 63000,
          overtimeAmount: 7200,
          holidayAmount: 0,
          allowances: 5500,
          addOns: 1500,
          adjustments: 0,

          grossBilling: 77200,

          deductions: 700,
          credits: 0,

          netBilling: 76500,

          status: 'Pending',
        },

        {
          id: 10,

          billingNumber: 'BIL-2026-1010',
          clientCode: 'CLI-010',
          clientName: 'Crown Facilities Management',

          billingPeriod: 'October 1-15, 2026',

          periodStart: '2026-10-01',
          periodEnd: '2026-10-15',

          employeesBilled: 13,

          baseAmount: 136500,
          overtimeAmount: 17500,
          holidayAmount: 7000,
          allowances: 10500,
          addOns: 3200,
          adjustments: -1000,

          grossBilling: 173700,

          deductions: 2200,
          credits: 500,

          netBilling: 171000,

          invoiceNumber: 'INV-2026-1010',
          invoiceDate: '2026-10-16',

          dueDate: '2026-10-31',

          status: 'For Review',
        },
      ],
    )

  const search = ref('')
  const client = ref('')
  const period = ref('October 1-15, 2026')
  const status = ref('')

  const currentPage = ref(1)
  const perPage = ref(6)

  const clientOptions =
    computed(() => {
      return [
        ...new Set(
          records.value.map(
            item =>
              item.clientName,
          ),
        ),
      ].sort()
    })

  const periodOptions =
    computed(() => {
      return [
        ...new Set(
          records.value.map(
            item =>
              item.billingPeriod,
          ),
        ),
      ]
    })

  const statusOptions:
    BillingReportStatus[] = [
      'Draft',
      'Pending',
      'For Review',
      'Completed',
      'Paid',
    ]

  const filteredRecords =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return records.value.filter(
        item => {
          const matchesSearch =
            !keyword ||
            item.billingNumber
              .toLowerCase()
              .includes(keyword) ||
            item.clientCode
              .toLowerCase()
              .includes(keyword) ||
            item.clientName
              .toLowerCase()
              .includes(keyword) ||
            (
              item.invoiceNumber || ''
            )
              .toLowerCase()
              .includes(keyword)

          const matchesClient =
            !client.value ||
            item.clientName ===
              client.value

          const matchesPeriod =
            !period.value ||
            item.billingPeriod ===
              period.value

          const matchesStatus =
            !status.value ||
            item.status ===
              status.value

          return (
            matchesSearch &&
            matchesClient &&
            matchesPeriod &&
            matchesStatus
          )
        },
      )
    })

  const stats =
    computed(() => {
      const data =
        filteredRecords.value

      return {
        clients:
          data.length,

        grossBilling:
          data.reduce(
            (sum, item) =>
              sum +
              item.grossBilling,
            0,
          ),

        deductions:
          data.reduce(
            (sum, item) =>
              sum +
              item.deductions +
              item.credits,
            0,
          ),

        netBilling:
          data.reduce(
            (sum, item) =>
              sum +
              item.netBilling,
            0,
          ),
      }
    })

  const totals =
    computed(() => {
      const data =
        filteredRecords.value

      return {
        employeesBilled:
          data.reduce(
            (sum, item) =>
              sum +
              item.employeesBilled,
            0,
          ),

        baseAmount:
          data.reduce(
            (sum, item) =>
              sum +
              item.baseAmount,
            0,
          ),

        overtimeAmount:
          data.reduce(
            (sum, item) =>
              sum +
              item.overtimeAmount,
            0,
          ),

        holidayAmount:
          data.reduce(
            (sum, item) =>
              sum +
              item.holidayAmount,
            0,
          ),

        allowances:
          data.reduce(
            (sum, item) =>
              sum +
              item.allowances,
            0,
          ),

        addOns:
          data.reduce(
            (sum, item) =>
              sum +
              item.addOns,
            0,
          ),

        adjustments:
          data.reduce(
            (sum, item) =>
              sum +
              item.adjustments,
            0,
          ),

        grossBilling:
          data.reduce(
            (sum, item) =>
              sum +
              item.grossBilling,
            0,
          ),

        deductions:
          data.reduce(
            (sum, item) =>
              sum +
              item.deductions,
            0,
          ),

        credits:
          data.reduce(
            (sum, item) =>
              sum +
              item.credits,
            0,
          ),

        netBilling:
          data.reduce(
            (sum, item) =>
              sum +
              item.netBilling,
            0,
          ),
      }
    })

  const totalPages =
    computed(() => {
      return Math.max(
        1,
        Math.ceil(
          filteredRecords.value.length /
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

      return filteredRecords.value.slice(
        start,
        start +
          perPage.value,
      )
    })

  const showingFrom =
    computed(() => {
      if (
        filteredRecords.value.length ===
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
        filteredRecords.value.length,
      )
    })

  const resetFilters = () => {
    search.value = ''
    client.value = ''
    status.value = ''

    period.value =
      'October 1-15, 2026'

    currentPage.value = 1
  }

  watch(
    [
      search,
      client,
      period,
      status,
    ],
    () => {
      currentPage.value = 1
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
    client,
    period,
    status,

    currentPage,

    filteredRecords,
    paginatedRecords,

    stats,
    totals,

    totalPages,
    showingFrom,
    showingTo,

    clientOptions,
    periodOptions,
    statusOptions,

    resetFilters,
  }
}