import type {
  BillingPeriod,
  BillingRecord,
  BillingRun,
} from '~/types/billing'

export const useBillingOverview = () => {
  const currentPeriod =
    ref<BillingPeriod>({
      id: 1,

      code: 'BILL-2026-09-A',

      dateFrom: '2026-09-01',
      dateTo: '2026-09-15',

      billingDate: '2026-09-16',

      status: 'Preparing',

      progress: 72,
    })

  /* =========================================================
     BILLING PREVIEW
  ========================================================= */

  const billingRecords =
    ref<BillingRecord[]>([
      {
        id: 1,

        clientCode: 'CL-001',
        clientName: 'Davao Logistics Corp.',

        department: 'Operations',

        employees: 5,

        regularHours: 440,
        overtimeHours: 18,

        regularAmount: 132000,
        overtimeAmount: 10800,
        adjustments: 1500,

        totalAmount: 144300,

        status: 'Ready',
      },

      {
        id: 2,

        clientCode: 'CL-002',
        clientName: 'Mindanao Distribution Inc.',

        department: 'Operations',

        employees: 3,

        regularHours: 264,
        overtimeHours: 11,

        regularAmount: 79200,
        overtimeAmount: 6600,
        adjustments: 0,

        totalAmount: 85800,

        status: 'For Review',
      },

      {
        id: 3,

        clientCode: 'CL-003',
        clientName: 'Southline Trading',

        department: 'Billing',

        employees: 2,

        regularHours: 176,
        overtimeHours: 4,

        regularAmount: 52800,
        overtimeAmount: 2400,
        adjustments: -500,

        totalAmount: 54700,

        status: 'Ready',
      },

      {
        id: 4,

        clientCode: 'CL-004',
        clientName: 'Metro Service Solutions',

        department: 'Operations',

        employees: 4,

        regularHours: 330,
        overtimeHours: 6,

        regularAmount: 99000,
        overtimeAmount: 3600,
        adjustments: 0,

        totalAmount: 102600,

        status: 'With Issue',

        issue: 'Incomplete employee time logs',
      },

      {
        id: 5,

        clientCode: 'CL-005',
        clientName: 'Prime Fleet Services',

        department: 'Operations',

        employees: 2,

        regularHours: 176,
        overtimeHours: 8,

        regularAmount: 52800,
        overtimeAmount: 4800,
        adjustments: 750,

        totalAmount: 58350,

        status: 'Ready',
      },
    ])

  /* =========================================================
     STATS
  ========================================================= */

  const stats = computed(() => {
    const totalAmount =
      billingRecords.value.reduce(
        (
          total,
          record,
        ) =>
          total +
          record.totalAmount,
        0,
      )

    const issues =
      billingRecords.value.filter(
        record =>
          record.status ===
          'With Issue',
      ).length

    return {
      period:
        currentPeriod.value.code,

      clients:
        billingRecords.value.length,

      amount:
        totalAmount,

      issues,
    }
  })

  /* =========================================================
     BREAKDOWN
  ========================================================= */

  const statusBreakdown =
    computed(() => ({
      ready:
        billingRecords.value.filter(
          record =>
            record.status === 'Ready',
        ).length,

      review:
        billingRecords.value.filter(
          record =>
            record.status ===
            'For Review',
        ).length,

      issues:
        billingRecords.value.filter(
          record =>
            record.status ===
            'With Issue',
        ).length,

      completed:
        billingRecords.value.filter(
          record =>
            record.status ===
            'Completed',
        ).length,
    }))

  /* =========================================================
     ISSUES
  ========================================================= */

  const issues = computed(() => [
    {
      id: 1,
      label: 'Incomplete Time Logs',
      count: 1,
      tone: 'danger',
    },
    {
      id: 2,
      label: 'Pending OT',
      count: 2,
      tone: 'warning',
    },
    {
      id: 3,
      label: 'Pending Adjustments',
      count: 1,
      tone: 'warning',
    },
    {
      id: 4,
      label: 'Missing Billing Rate',
      count: 0,
      tone: 'neutral',
    },
  ])

  /* =========================================================
     HISTORY
  ========================================================= */

  const recentRuns =
    ref<BillingRun[]>([
      {
        id: 1,

        period:
          'Aug 16 - Aug 31, 2026',

        clients: 5,

        totalAmount: 432500,

        billingDate:
          '2026-09-01',

        status: 'Completed',
      },

      {
        id: 2,

        period:
          'Aug 1 - Aug 15, 2026',

        clients: 5,

        totalAmount: 418900,

        billingDate:
          '2026-08-16',

        status: 'Completed',
      },

      {
        id: 3,

        period:
          'Jul 16 - Jul 31, 2026',

        clients: 4,

        totalAmount: 389400,

        billingDate:
          '2026-08-01',

        status: 'Paid',
      },
    ])

  return {
    currentPeriod,

    billingRecords,

    stats,

    statusBreakdown,

    issues,

    recentRuns,
  }
}