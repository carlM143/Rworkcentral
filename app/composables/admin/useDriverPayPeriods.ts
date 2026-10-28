import type {
  DriverPayPeriod,
  DriverPayPeriodFormData,
  DriverPayPeriodStatus,
} from '~/types/driverPayPeriod'

export const useDriverPayPeriods = () => {
  /* =========================================================
     MOCK DATA
  ========================================================= */

  const periods =
    useState<
      DriverPayPeriod[]
    >(
      'driver-pay-periods',
      () => [
        {
          id: 1,

          periodCode:
            'DRV-PP-2026-0915',

          periodName:
            'September 1–15, 2026',

          payrollType:
            'Driver Payroll',

          startDate:
            '2026-09-01',

          endDate:
            '2026-09-15',

          cutoffDate:
            '2026-09-15',

          payDate:
            '2026-09-20',

          totalDrivers:
            24,

          pendingDrivers:
            0,

          processedDrivers:
            24,

          completedDrivers:
            24,

          grossAmount:
            325000,

          totalDeductions:
            42500,

          netAmount:
            282500,

          status:
            'Processing',

          remarks:
            'First driver payroll cutoff for September 2026.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-08-28T09:15:00',

          openedBy:
            'Maria Santos',

          openedAt:
            '2026-09-01T08:00:00',

          processingBy:
            'Maria Santos',

          processingAt:
            '2026-09-15T10:30:00',
        },

        {
          id: 2,

          periodCode:
            'DRV-PP-2026-0930',

          periodName:
            'September 16–30, 2026',

          payrollType:
            'Driver Payroll',

          startDate:
            '2026-09-16',

          endDate:
            '2026-09-30',

          cutoffDate:
            '2026-09-30',

          payDate:
            '2026-10-05',

          totalDrivers:
            24,

          pendingDrivers:
            24,

          processedDrivers:
            0,

          completedDrivers:
            0,

          grossAmount:
            0,

          totalDeductions:
            0,

          netAmount:
            0,

          status:
            'Open',

          remarks:
            'Second driver payroll cutoff for September 2026.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-10T11:00:00',

          openedBy:
            'Maria Santos',

          openedAt:
            '2026-09-16T08:00:00',
        },

        {
          id: 3,

          periodCode:
            'DRV-PP-2026-0831',

          periodName:
            'August 16–31, 2026',

          payrollType:
            'Driver Payroll',

          startDate:
            '2026-08-16',

          endDate:
            '2026-08-31',

          cutoffDate:
            '2026-08-31',

          payDate:
            '2026-09-05',

          totalDrivers:
            23,

          pendingDrivers:
            0,

          processedDrivers:
            23,

          completedDrivers:
            23,

          grossAmount:
            301500,

          totalDeductions:
            39850,

          netAmount:
            261650,

          status:
            'Closed',

          remarks:
            'Completed second August driver payroll cutoff.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-08-12T09:00:00',

          openedBy:
            'Maria Santos',

          openedAt:
            '2026-08-16T08:00:00',

          processingBy:
            'Maria Santos',

          processingAt:
            '2026-08-31T10:15:00',

          closedBy:
            'Maria Santos',

          closedAt:
            '2026-09-01T14:30:00',
        },

        {
          id: 4,

          periodCode:
            'DRV-PP-2026-0815',

          periodName:
            'August 1–15, 2026',

          payrollType:
            'Driver Payroll',

          startDate:
            '2026-08-01',

          endDate:
            '2026-08-15',

          cutoffDate:
            '2026-08-15',

          payDate:
            '2026-08-20',

          totalDrivers:
            23,

          pendingDrivers:
            0,

          processedDrivers:
            23,

          completedDrivers:
            23,

          grossAmount:
            298700,

          totalDeductions:
            38600,

          netAmount:
            260100,

          status:
            'Closed',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-07-28T13:00:00',

          openedBy:
            'Maria Santos',

          openedAt:
            '2026-08-01T08:00:00',

          processingBy:
            'Maria Santos',

          processingAt:
            '2026-08-15T09:30:00',

          closedBy:
            'Maria Santos',

          closedAt:
            '2026-08-16T15:00:00',
        },

        {
          id: 5,

          periodCode:
            'DRV-PP-2026-0731',

          periodName:
            'July 16–31, 2026',

          payrollType:
            'Driver Payroll',

          startDate:
            '2026-07-16',

          endDate:
            '2026-07-31',

          cutoffDate:
            '2026-07-31',

          payDate:
            '2026-08-05',

          totalDrivers:
            22,

          pendingDrivers:
            0,

          processedDrivers:
            22,

          completedDrivers:
            22,

          grossAmount:
            286000,

          totalDeductions:
            37100,

          netAmount:
            248900,

          status:
            'Closed',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-07-12T10:00:00',

          openedBy:
            'Maria Santos',

          openedAt:
            '2026-07-16T08:00:00',

          closedBy:
            'Maria Santos',

          closedAt:
            '2026-08-01T13:30:00',
        },

        {
          id: 6,

          periodCode:
            'DRV-PP-2026-1015',

          periodName:
            'October 1–15, 2026',

          payrollType:
            'Driver Payroll',

          startDate:
            '2026-10-01',

          endDate:
            '2026-10-15',

          cutoffDate:
            '2026-10-15',

          payDate:
            '2026-10-20',

          totalDrivers:
            24,

          pendingDrivers:
            24,

          processedDrivers:
            0,

          completedDrivers:
            0,

          grossAmount:
            0,

          totalDeductions:
            0,

          netAmount:
            0,

          status:
            'Draft',

          remarks:
            'Upcoming first October cutoff.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-16T09:30:00',
        },

        {
          id: 7,

          periodCode:
            'DRV-PP-2026-0630',

          periodName:
            'June 16–30, 2026',

          payrollType:
            'Driver Payroll',

          startDate:
            '2026-06-16',

          endDate:
            '2026-06-30',

          cutoffDate:
            '2026-06-30',

          payDate:
            '2026-07-05',

          totalDrivers:
            21,

          pendingDrivers:
            0,

          processedDrivers:
            0,

          completedDrivers:
            0,

          grossAmount:
            0,

          totalDeductions:
            0,

          netAmount:
            0,

          status:
            'Cancelled',

          remarks:
            'Period recreated due to incorrect cutoff configuration.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-06-12T10:30:00',

          cancelledBy:
            'Maria Santos',

          cancelledAt:
            '2026-06-13T09:00:00',

          cancellationReason:
            'Incorrect cutoff date. A replacement period was created.',
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

  const year =
    ref('')

  const month =
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

  const statusOptions:
    DriverPayPeriodStatus[] = [
      'Draft',
      'Open',
      'Processing',
      'Closed',
      'Cancelled',
    ]

  const monthOptions = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const yearOptions =
    computed(() => {
      return [
        ...new Set(
          periods.value.map(
            period =>
              new Date(
                `${period.startDate}T00:00:00`,
              )
                .getFullYear()
                .toString(),
          ),
        ),
      ].sort(
        (
          a,
          b,
        ) =>
          Number(b) -
          Number(a),
      )
    })

  /* =========================================================
     FILTERED
  ========================================================= */

  const filteredPeriods =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return periods.value.filter(
        period => {
          const startDate =
            new Date(
              `${period.startDate}T00:00:00`,
            )

          const periodYear =
            startDate
              .getFullYear()
              .toString()

          const periodMonth =
            monthOptions[
              startDate.getMonth()
            ]

          const matchesSearch =
            !keyword ||
            period.periodCode
              .toLowerCase()
              .includes(keyword) ||
            period.periodName
              .toLowerCase()
              .includes(keyword)

          const matchesStatus =
            !status.value ||
            period.status ===
              status.value

          const matchesYear =
            !year.value ||
            periodYear ===
              year.value

          const matchesMonth =
            !month.value ||
            periodMonth ===
              month.value

          const matchesFrom =
            !dateFrom.value ||
            period.startDate >=
              dateFrom.value

          const matchesTo =
            !dateTo.value ||
            period.endDate <=
              dateTo.value

          return (
            matchesSearch &&
            matchesStatus &&
            matchesYear &&
            matchesMonth &&
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
      return {
        total:
          periods.value.length,

        open:
          periods.value.filter(
            period =>
              period.status ===
              'Open',
          ).length,

        processing:
          periods.value.filter(
            period =>
              period.status ===
              'Processing',
          ).length,

        closed:
          periods.value.filter(
            period =>
              period.status ===
              'Closed',
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
          filteredPeriods
            .value.length /
            perPage.value,
        ),
      )
    })

  const paginatedPeriods =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredPeriods
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
        !filteredPeriods
          .value.length
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

        filteredPeriods
          .value.length,
      )
    })

  /* =========================================================
     PERIOD CODE
  ========================================================= */

  const generatePeriodCode = (
    endDate: string,
  ) => {
    const date =
      new Date(
        `${endDate}T00:00:00`,
      )

    const year =
      date.getFullYear()

    const month =
      String(
        date.getMonth() +
          1,
      ).padStart(
        2,
        '0',
      )

    const day =
      String(
        date.getDate(),
      ).padStart(
        2,
        '0',
      )

    return `DRV-PP-${year}-${month}${day}`
  }

  /* =========================================================
     CREATE
  ========================================================= */

  const createPeriod = (
    data:
      DriverPayPeriodFormData,
  ) => {
    const nextId =
      periods.value.length
        ? Math.max(
            ...periods.value.map(
              period =>
                period.id,
            ),
          ) + 1
        : 1

    const period:
      DriverPayPeriod = {
        id:
          nextId,

        periodCode:
          generatePeriodCode(
            data.endDate,
          ),

        periodName:
          data.periodName,

        payrollType:
          'Driver Payroll',

        startDate:
          data.startDate,

        endDate:
          data.endDate,

        cutoffDate:
          data.cutoffDate,

        payDate:
          data.payDate,

        totalDrivers:
          24,

        pendingDrivers:
          24,

        processedDrivers:
          0,

        completedDrivers:
          0,

        grossAmount:
          0,

        totalDeductions:
          0,

        netAmount:
          0,

        status:
          'Draft',

        remarks:
          data.remarks ||
          undefined,

        createdBy:
          'Maria Santos',

        createdAt:
          new Date()
            .toISOString(),
      }

    periods.value.unshift(
      period,
    )

    return period
  }

  /* =========================================================
     UPDATE
  ========================================================= */

  const updatePeriod = (
    id: number,

    data:
      DriverPayPeriodFormData,
  ) => {
    const period =
      periods.value.find(
        item =>
          item.id === id,
      )

    if (!period) {
      return null
    }

    period.periodName =
      data.periodName

    period.startDate =
      data.startDate

    period.endDate =
      data.endDate

    period.cutoffDate =
      data.cutoffDate

    period.payDate =
      data.payDate

    period.periodCode =
      generatePeriodCode(
        data.endDate,
      )

    period.remarks =
      data.remarks ||
      undefined

    return period
  }

  /* =========================================================
     OPEN
  ========================================================= */

  const openPeriod = (
    id: number,
  ) => {
    const period =
      periods.value.find(
        item =>
          item.id === id,
      )

    if (!period) {
      return null
    }

    period.status =
      'Open'

    period.openedBy =
      'Maria Santos'

    period.openedAt =
      new Date()
        .toISOString()

    return period
  }

  /* =========================================================
     PROCESS
  ========================================================= */

  const processPeriod = (
    id: number,
  ) => {
    const period =
      periods.value.find(
        item =>
          item.id === id,
      )

    if (!period) {
      return null
    }

    period.status =
      'Processing'

    period.processingBy =
      'Maria Santos'

    period.processingAt =
      new Date()
        .toISOString()

    /*
      Mock processing result.
      Later these values will come from
      actual pending driver payroll records.
    */

    period.processedDrivers =
      period.totalDrivers

    period.completedDrivers =
      period.totalDrivers

    period.pendingDrivers =
      0

    if (
      period.grossAmount ===
      0
    ) {
      period.grossAmount =
        period.totalDrivers *
        13500

      period.totalDeductions =
        period.totalDrivers *
        1750

      period.netAmount =
        period.grossAmount -
        period.totalDeductions
    }

    return period
  }

  /* =========================================================
     CLOSE
  ========================================================= */

  const closePeriod = (
    id: number,
  ) => {
    const period =
      periods.value.find(
        item =>
          item.id === id,
      )

    if (!period) {
      return null
    }

    if (
      period.pendingDrivers >
      0
    ) {
      return null
    }

    period.status =
      'Closed'

    period.closedBy =
      'Maria Santos'

    period.closedAt =
      new Date()
        .toISOString()

    return period
  }

  /* =========================================================
     CANCEL
  ========================================================= */

  const cancelPeriod = (
    id: number,

    reason: string,
  ) => {
    const period =
      periods.value.find(
        item =>
          item.id === id,
      )

    if (!period) {
      return null
    }

    period.status =
      'Cancelled'

    period.cancelledBy =
      'Maria Santos'

    period.cancelledAt =
      new Date()
        .toISOString()

    period.cancellationReason =
      reason

    return period
  }

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value =
      ''

    status.value =
      ''

    year.value =
      ''

    month.value =
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
      status,
      year,
      month,
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
    periods,

    search,
    status,
    year,
    month,
    dateFrom,
    dateTo,

    currentPage,
    perPage,

    filteredPeriods,
    paginatedPeriods,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    statusOptions,
    yearOptions,
    monthOptions,

    generatePeriodCode,

    createPeriod,
    updatePeriod,

    openPeriod,
    processPeriod,
    closePeriod,
    cancelPeriod,

    resetFilters,
  }
}