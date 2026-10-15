import type {
  BillingAdjustment,
  BillingAdjustmentStatus,
  BillingAdjustmentType,
} from '~/types/billingAdjustment'

export const useBillingAdjustments = () => {
  /* =========================================================
     MOCK DATA
  ========================================================= */

  const adjustments =
    useState<BillingAdjustment[]>(
      'billing-adjustments',
      () => [
        {
          id: 1,

          adjustmentNumber:
            'ADJ-2026-09-001',

          billingRecordId: 1,

          billingNumber:
            'BILL-2026-09-A-001',

          batchCode:
            'BILL-2026-09-A',

          clientId: 1,

          clientCode:
            'CL-001',

          clientName:
            'Davao Logistics Corp.',

          periodStart:
            '2026-09-01',

          periodEnd:
            '2026-09-15',

          adjustmentType:
            'Add Billing',

          amount: 1500,

          reason:
            'Additional approved overtime billing',

          remarks:
            'Approved OT hours were submitted after initial billing preparation.',

          status:
            'Applied',

          requestedBy:
            'Maria Santos',

          requestedAt:
            '2026-09-16T09:20:00',

          reviewedBy:
            'Finance Admin',

          reviewedAt:
            '2026-09-16T10:15:00',

          appliedBy:
            'Finance Admin',

          appliedAt:
            '2026-09-16T10:30:00',
        },

        {
          id: 2,

          adjustmentNumber:
            'ADJ-2026-09-002',

          billingRecordId: 3,

          billingNumber:
            'BILL-2026-09-A-003',

          batchCode:
            'BILL-2026-09-A',

          clientId: 3,

          clientCode:
            'CL-003',

          clientName:
            'Southline Trading',

          periodStart:
            '2026-09-01',

          periodEnd:
            '2026-09-15',

          adjustmentType:
            'Deduction',

          amount: -500,

          reason:
            'Correction for excess billed hours',

          remarks:
            'Four hours were included incorrectly in the first computation.',

          status:
            'Applied',

          requestedBy:
            'Maria Santos',

          requestedAt:
            '2026-09-16T09:45:00',

          reviewedBy:
            'Finance Admin',

          reviewedAt:
            '2026-09-16T10:20:00',

          appliedBy:
            'Finance Admin',

          appliedAt:
            '2026-09-16T10:35:00',
        },

        {
          id: 3,

          adjustmentNumber:
            'ADJ-2026-09-003',

          billingRecordId: 5,

          billingNumber:
            'BILL-2026-09-A-005',

          batchCode:
            'BILL-2026-09-A',

          clientId: 5,

          clientCode:
            'CL-005',

          clientName:
            'Prime Fleet Services',

          periodStart:
            '2026-09-01',

          periodEnd:
            '2026-09-15',

          adjustmentType:
            'Overtime Adjustment',

          amount: 750,

          reason:
            'Additional approved overtime',

          status:
            'Approved',

          requestedBy:
            'Maria Santos',

          requestedAt:
            '2026-09-16T10:00:00',

          reviewedBy:
            'Finance Admin',

          reviewedAt:
            '2026-09-16T11:10:00',
        },

        {
          id: 4,

          adjustmentNumber:
            'ADJ-2026-09-004',

          billingRecordId: 4,

          billingNumber:
            'BILL-2026-09-A-004',

          batchCode:
            'BILL-2026-09-A',

          clientId: 4,

          clientCode:
            'CL-004',

          clientName:
            'Metro Service Solutions',

          periodStart:
            '2026-09-01',

          periodEnd:
            '2026-09-15',

          adjustmentType:
            'Correction',

          amount: 1250,

          reason:
            'Incomplete employee time logs',

          remarks:
            'Adjustment pending final validation of missing time entries.',

          status:
            'For Review',

          requestedBy:
            'Maria Santos',

          requestedAt:
            '2026-09-16T10:30:00',
        },

        {
          id: 5,

          adjustmentNumber:
            'ADJ-2026-09-005',

          billingRecordId: 2,

          billingNumber:
            'BILL-2026-09-A-002',

          batchCode:
            'BILL-2026-09-A',

          clientId: 2,

          clientCode:
            'CL-002',

          clientName:
            'Mindanao Distribution Inc.',

          periodStart:
            '2026-09-01',

          periodEnd:
            '2026-09-15',

          adjustmentType:
            'Rate Adjustment',

          amount: 2100,

          reason:
            'Updated approved driver billing rate',

          remarks:
            'Rate adjustment effective within the current billing period.',

          status:
            'Pending',

          requestedBy:
            'Maria Santos',

          requestedAt:
            '2026-09-16T11:00:00',
        },

        {
          id: 6,

          adjustmentNumber:
            'ADJ-2026-08-016',

          billingRecordId: 6,

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

          adjustmentType:
            'Manual Adjustment',

          amount: 900,

          reason:
            'Night differential billing correction',

          status:
            'Applied',

          requestedBy:
            'Maria Santos',

          requestedAt:
            '2026-09-01T09:20:00',

          reviewedBy:
            'Finance Admin',

          reviewedAt:
            '2026-09-01T10:00:00',

          appliedBy:
            'Finance Admin',

          appliedAt:
            '2026-09-01T10:20:00',
        },

        {
          id: 7,

          adjustmentNumber:
            'ADJ-2026-08-017',

          billingRecordId: 7,

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

          adjustmentType:
            'Add Billing',

          amount: 1200,

          reason:
            'Additional approved allowance billing',

          status:
            'Approved',

          requestedBy:
            'Maria Santos',

          requestedAt:
            '2026-09-01T09:40:00',

          reviewedBy:
            'Finance Admin',

          reviewedAt:
            '2026-09-01T11:00:00',
        },

        {
          id: 8,

          adjustmentNumber:
            'ADJ-2026-08-018',

          billingRecordId: 7,

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

          adjustmentType:
            'Deduction',

          amount: -800,

          reason:
            'Duplicate billing correction',

          status:
            'Rejected',

          requestedBy:
            'Maria Santos',

          requestedAt:
            '2026-09-01T10:00:00',

          reviewedBy:
            'Finance Admin',

          reviewedAt:
            '2026-09-01T11:20:00',

          remarks:
            'No duplicate billing found after validation.',
        },

        {
          id: 9,

          adjustmentNumber:
            'ADJ-2026-09-006',

          billingRecordId: 8,

          billingNumber:
            'BILL-2026-09-B-001',

          batchCode:
            'BILL-2026-09-B',

          clientId: 3,

          clientCode:
            'CL-003',

          clientName:
            'Southline Trading',

          periodStart:
            '2026-09-16',

          periodEnd:
            '2026-09-30',

          adjustmentType:
            'Manual Adjustment',

          amount: 350,

          reason:
            'Manual billing correction',

          status:
            'Pending',

          requestedBy:
            'Maria Santos',

          requestedAt:
            '2026-09-17T09:00:00',
        },

        {
          id: 10,

          adjustmentNumber:
            'ADJ-2026-09-007',

          billingRecordId: 10,

          billingNumber:
            'BILL-2026-09-B-003',

          batchCode:
            'BILL-2026-09-B',

          clientId: 7,

          clientCode:
            'CL-007',

          clientName:
            'Pacific Warehousing Services',

          periodStart:
            '2026-09-16',

          periodEnd:
            '2026-09-30',

          adjustmentType:
            'Rate Adjustment',

          amount: 1800,

          reason:
            'New approved warehouse rate',

          status:
            'For Review',

          requestedBy:
            'Maria Santos',

          requestedAt:
            '2026-09-17T09:30:00',
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

  const adjustmentType =
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
          adjustments.value.map(
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
          adjustments.value.map(
            item =>
              item.clientName,
          ),
        ),
      ].sort()
    })

  const typeOptions:
    BillingAdjustmentType[] = [
      'Add Billing',
      'Deduction',
      'Correction',
      'Overtime Adjustment',
      'Rate Adjustment',
      'Manual Adjustment',
    ]

  const statusOptions:
    BillingAdjustmentStatus[] = [
      'Pending',
      'For Review',
      'Approved',
      'Rejected',
      'Applied',
    ]

  /* =========================================================
     FILTERED
  ========================================================= */

  const filteredAdjustments =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return adjustments.value.filter(
        item => {
          const matchesSearch =
            !keyword ||
            item.adjustmentNumber
              .toLowerCase()
              .includes(keyword) ||
            item.billingNumber
              .toLowerCase()
              .includes(keyword) ||
            item.clientCode
              .toLowerCase()
              .includes(keyword) ||
            item.clientName
              .toLowerCase()
              .includes(keyword) ||
            item.reason
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

          const matchesType =
            !adjustmentType.value ||
            item.adjustmentType ===
              adjustmentType.value

          const matchesStatus =
            !status.value ||
            item.status ===
              status.value

          const requestedDate =
            item.requestedAt.slice(
              0,
              10,
            )

          const matchesFrom =
            !dateFrom.value ||
            requestedDate >=
              dateFrom.value

          const matchesTo =
            !dateTo.value ||
            requestedDate <=
              dateTo.value

          return (
            matchesSearch &&
            matchesBatch &&
            matchesClient &&
            matchesType &&
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
        filteredAdjustments.value

      return {
        totalAdjustments:
          data.length,

        pendingReview:
          data.filter(
            item =>
              item.status ===
                'Pending' ||
              item.status ===
                'For Review',
          ).length,

        approved:
          data.filter(
            item =>
              item.status ===
                'Approved' ||
              item.status ===
                'Applied',
          ).length,

        netAdjustment:
          data
            .filter(
              item =>
                item.status !==
                'Rejected',
            )
            .reduce(
              (
                total,
                item,
              ) =>
                total +
                item.amount,
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
          filteredAdjustments
            .value.length /
            perPage.value,
        ),
      )
    })

  const paginatedAdjustments =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredAdjustments
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
        filteredAdjustments
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

        filteredAdjustments
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

    adjustmentType.value =
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
      adjustmentType,
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
    adjustments,

    search,
    batch,
    client,
    adjustmentType,
    status,
    dateFrom,
    dateTo,

    currentPage,
    perPage,

    filteredAdjustments,
    paginatedAdjustments,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    batchOptions,
    clientOptions,
    typeOptions,
    statusOptions,

    resetFilters,
  }
}