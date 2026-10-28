import type {
  PayrollPayBasis,
  PayrollRate,
  PayrollRateFormData,
  PayrollRateHistory,
  PayrollRateStatus,
  PayrollRateType,
} from '~/types/payrollRate'

export const usePayrollRates = () => {
  const {
    employees,
  } = useEmployees()

  /* =========================================================
     MOCK RATES
  ========================================================= */

  const rates =
    useState<PayrollRate[]>(
      'payroll-rates',
      () => [
        {
          id: 1,

          rateCode:
            'RATE-EMP-001',

          employeeId: 1,
          employeeNumber:
            'EMP-001',
          employeeName:
            'Juan Dela Cruz',

          department:
            'Operations',

          position:
            'Driver',

          rateType:
            'Employee',

          payBasis:
            'Daily',

          dailyRate:
            650,

          hourlyRate:
            81.25,

          overtimeRate:
            101.56,

          restDayRate:
            105.63,

          regularHolidayRate:
            162.5,

          specialHolidayRate:
            105.63,

          nightDifferentialRate:
            8.13,

          allowance:
            1500,

          effectiveDate:
            '2026-09-01',

          status:
            'Active',

          remarks:
            'Regular employee daily rate.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-01T08:00:00',
        },

        {
          id: 2,

          rateCode:
            'RATE-EMP-002',

          employeeId: 2,
          employeeNumber:
            'EMP-002',
          employeeName:
            'Maria Santos',

          department:
            'Human Resources',

          position:
            'HR Officer',

          rateType:
            'Employee',

          payBasis:
            'Monthly',

          monthlyRate:
            32000,

          dailyRate:
            1454.55,

          hourlyRate:
            181.82,

          overtimeRate:
            227.28,

          restDayRate:
            236.37,

          regularHolidayRate:
            363.64,

          specialHolidayRate:
            236.37,

          nightDifferentialRate:
            18.18,

          allowance:
            2500,

          effectiveDate:
            '2026-08-01',

          status:
            'Active',

          remarks:
            'Monthly HR officer compensation.',

          createdBy:
            'System Administrator',

          createdAt:
            '2026-08-01T09:00:00',
        },

        {
          id: 3,

          rateCode:
            'RATE-EMP-003',

          employeeId: 3,
          employeeNumber:
            'EMP-003',
          employeeName:
            'Pedro Reyes',

          department:
            'Finance',

          position:
            'Accountant',

          rateType:
            'Employee',

          payBasis:
            'Monthly',

          monthlyRate:
            35000,

          dailyRate:
            1590.91,

          hourlyRate:
            198.86,

          overtimeRate:
            248.58,

          restDayRate:
            258.52,

          regularHolidayRate:
            397.73,

          specialHolidayRate:
            258.52,

          nightDifferentialRate:
            19.89,

          allowance:
            3000,

          effectiveDate:
            '2026-07-01',

          status:
            'Active',

          remarks:
            'Finance department payroll rate.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-07-01T08:30:00',
        },

        {
          id: 4,

          rateCode:
            'RATE-DRV-004',

          employeeId: 7,
          employeeNumber:
            'EMP-007',
          employeeName:
            'Mark Lopez',

          department:
            'Operations',

          position:
            'Driver',

          rateType:
            'Driver',

          payBasis:
            'Trip Based',

          dailyRate:
            650,

          hourlyRate:
            81.25,

          overtimeRate:
            101.56,

          restDayRate:
            105.63,

          regularHolidayRate:
            162.5,

          specialHolidayRate:
            105.63,

          nightDifferentialRate:
            8.13,

          tripRate:
            250,

          allowance:
            1000,

          effectiveDate:
            '2026-09-01',

          status:
            'Active',

          remarks:
            'Driver rate with additional trip compensation.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-01T08:40:00',
        },

        {
          id: 5,

          rateCode:
            'RATE-DRV-005',

          employeeId: 5,
          employeeNumber:
            'EMP-005',
          employeeName:
            'Carlo Mendoza',

          department:
            'Operations',

          position:
            'Driver',

          rateType:
            'Driver',

          payBasis:
            'Trip Based',

          dailyRate:
            675,

          hourlyRate:
            84.38,

          overtimeRate:
            105.47,

          restDayRate:
            109.69,

          regularHolidayRate:
            168.75,

          specialHolidayRate:
            109.69,

          nightDifferentialRate:
            8.44,

          tripRate:
            275,

          allowance:
            1000,

          effectiveDate:
            '2026-08-15',

          status:
            'Active',

          remarks:
            'Operations driver rate.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-08-15T09:10:00',
        },

        {
          id: 6,

          rateCode:
            'RATE-EMP-006',

          employeeId: 6,
          employeeNumber:
            'EMP-006',
          employeeName:
            'Angela Flores',

          department:
            'Billing',

          position:
            'Billing Officer',

          rateType:
            'Employee',

          payBasis:
            'Daily',

          dailyRate:
            700,

          hourlyRate:
            87.5,

          overtimeRate:
            109.38,

          restDayRate:
            113.75,

          regularHolidayRate:
            175,

          specialHolidayRate:
            113.75,

          nightDifferentialRate:
            8.75,

          allowance:
            1200,

          effectiveDate:
            '2026-09-01',

          status:
            'Active',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-01T09:20:00',
        },

        {
          id: 7,

          rateCode:
            'RATE-EMP-007',

          employeeId: 10,
          employeeNumber:
            'EMP-010',
          employeeName:
            'Grace Navarro',

          department:
            'Human Resources',

          position:
            'HR Assistant',

          rateType:
            'Employee',

          payBasis:
            'Daily',

          dailyRate:
            620,

          hourlyRate:
            77.5,

          overtimeRate:
            96.88,

          restDayRate:
            100.75,

          regularHolidayRate:
            155,

          specialHolidayRate:
            100.75,

          nightDifferentialRate:
            7.75,

          allowance:
            1000,

          effectiveDate:
            '2026-10-01',

          status:
            'Scheduled',

          remarks:
            'New rate scheduled for October.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-14T10:00:00',
        },

        {
          id: 8,

          rateCode:
            'RATE-EMP-008',

          employeeId: 11,
          employeeNumber:
            'EMP-011',
          employeeName:
            'Leo Martinez',

          department:
            'Operations',

          position:
            'Dispatcher',

          rateType:
            'Employee',

          payBasis:
            'Daily',

          dailyRate:
            680,

          hourlyRate:
            85,

          overtimeRate:
            106.25,

          restDayRate:
            110.5,

          regularHolidayRate:
            170,

          specialHolidayRate:
            110.5,

          nightDifferentialRate:
            8.5,

          effectiveDate:
            '2026-05-01',

          status:
            'Inactive',

          remarks:
            'Previous rate profile retained for history.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-05-01T08:00:00',

          updatedBy:
            'Maria Santos',

          updatedAt:
            '2026-08-31T17:00:00',
        },
      ],
    )

  /* =========================================================
     RATE HISTORY
  ========================================================= */

  const histories =
    useState<PayrollRateHistory[]>(
      'payroll-rate-histories',
      () => [
        {
          id: 1,

          payrollRateId: 1,

          effectiveDate:
            '2026-09-01',

          rateType:
            'Employee',

          payBasis:
            'Daily',

          previousRate:
            'Daily ₱600.00 · Hourly ₱75.00',

          newRate:
            'Daily ₱650.00 · Hourly ₱81.25',

          changedBy:
            'Maria Santos',

          changedAt:
            '2026-09-01T08:00:00',

          remarks:
            'Annual compensation adjustment.',
        },

        {
          id: 2,

          payrollRateId: 1,

          effectiveDate:
            '2026-06-01',

          rateType:
            'Employee',

          payBasis:
            'Daily',

          previousRate:
            'Daily ₱580.00 · Hourly ₱72.50',

          newRate:
            'Daily ₱600.00 · Hourly ₱75.00',

          changedBy:
            'Maria Santos',

          changedAt:
            '2026-06-01T08:00:00',

          remarks:
            'Rate adjustment.',
        },

        {
          id: 3,

          payrollRateId: 4,

          effectiveDate:
            '2026-09-01',

          rateType:
            'Driver',

          payBasis:
            'Trip Based',

          previousRate:
            'Daily ₱625.00 · Trip ₱225.00',

          newRate:
            'Daily ₱650.00 · Trip ₱250.00',

          changedBy:
            'Maria Santos',

          changedAt:
            '2026-09-01T08:40:00',

          remarks:
            'Driver trip rate adjustment.',
        },

        {
          id: 4,

          payrollRateId: 5,

          effectiveDate:
            '2026-08-15',

          rateType:
            'Driver',

          payBasis:
            'Trip Based',

          previousRate:
            'Daily ₱650.00 · Trip ₱250.00',

          newRate:
            'Daily ₱675.00 · Trip ₱275.00',

          changedBy:
            'Maria Santos',

          changedAt:
            '2026-08-15T09:10:00',
        },

        {
          id: 5,

          payrollRateId: 8,

          effectiveDate:
            '2026-08-31',

          rateType:
            'Employee',

          payBasis:
            'Daily',

          previousRate:
            'Active',

          newRate:
            'Inactive',

          changedBy:
            'Maria Santos',

          changedAt:
            '2026-08-31T17:00:00',

          remarks:
            'Old rate profile deactivated.',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const rateType =
    ref('')

  const department =
    ref('')

  const status =
    ref('')

  const currentPage =
    ref(1)

  const perPage =
    ref(6)

  /* =========================================================
     OPTIONS
  ========================================================= */

  const rateTypeOptions:
    PayrollRateType[] = [
      'Employee',
      'Driver',
    ]

  const payBasisOptions:
    PayrollPayBasis[] = [
      'Monthly',
      'Daily',
      'Hourly',
      'Trip Based',
    ]

  const statusOptions:
    PayrollRateStatus[] = [
      'Active',
      'Inactive',
      'Scheduled',
    ]

  const departmentOptions =
    computed(() => {
      return [
        ...new Set(
          rates.value.map(
            rate =>
              rate.department,
          ),
        ),
      ].sort()
    })

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
            rate.employeeName
              .toLowerCase()
              .includes(keyword) ||
            rate.employeeNumber
              .toLowerCase()
              .includes(keyword)

          const matchesType =
            !rateType.value ||
            rate.rateType ===
              rateType.value

          const matchesDepartment =
            !department.value ||
            rate.department ===
              department.value

          const matchesStatus =
            !status.value ||
            rate.status ===
              status.value

          return (
            matchesSearch &&
            matchesType &&
            matchesDepartment &&
            matchesStatus
          )
        },
      )
    })

  /* =========================================================
     STATS
  ========================================================= */

  const stats =
    computed(() => ({
      total:
        rates.value.length,

      employees:
        rates.value.filter(
          rate =>
            rate.rateType ===
            'Employee',
        ).length,

      drivers:
        rates.value.filter(
          rate =>
            rate.rateType ===
            'Driver',
        ).length,

      active:
        rates.value.filter(
          rate =>
            rate.status ===
            'Active',
        ).length,
    }))

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages =
    computed(() => {
      return Math.max(
        1,
        Math.ceil(
          filteredRates.value.length /
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

      return filteredRates.value.slice(
        start,
        start +
          perPage.value,
      )
    })

  const showingFrom =
    computed(() => {
      if (!filteredRates.value.length) {
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

        filteredRates.value.length,
      )
    })

  /* =========================================================
     HELPERS
  ========================================================= */

  const currency = (
    value?: number,
  ) => {
    if (
      value === undefined ||
      value === null
    ) {
      return '—'
    }

    return new Intl.NumberFormat(
      'en-PH',
      {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
      },
    ).format(value)
  }

  const getRateSummary = (
    rate:
      Partial<PayrollRate>,
  ) => {
    if (
      rate.payBasis ===
      'Monthly'
    ) {
      return `Monthly ${currency(
        rate.monthlyRate,
      )} · Daily ${currency(
        rate.dailyRate,
      )}`
    }

    if (
      rate.payBasis ===
      'Hourly'
    ) {
      return `Hourly ${currency(
        rate.hourlyRate,
      )}`
    }

    if (
      rate.payBasis ===
      'Trip Based'
    ) {
      return `Daily ${currency(
        rate.dailyRate,
      )} · Trip ${currency(
        rate.tripRate,
      )}`
    }

    return `Daily ${currency(
      rate.dailyRate,
    )} · Hourly ${currency(
      rate.hourlyRate,
    )}`
  }

  const getInitialStatus = (
    effectiveDate: string,
  ): PayrollRateStatus => {
    const today =
      new Date()
        .toLocaleDateString(
          'en-CA',
        )

    return effectiveDate >
      today
      ? 'Scheduled'
      : 'Active'
  }

  /* =========================================================
     CREATE
  ========================================================= */

  const createRate = (
    data:
      PayrollRateFormData,
  ) => {
    if (
      data.employeeId ===
      null
    ) {
      return null
    }

    const employee =
      employees.value.find(
        item =>
          item.id ===
          data.employeeId,
      )

    if (!employee) {
      return null
    }

    const nextId =
      rates.value.length
        ? Math.max(
            ...rates.value.map(
              rate => rate.id,
            ),
          ) + 1
        : 1

    const employeeName =
      [
        employee.firstName,
        employee.middleName,
        employee.lastName,
      ]
        .filter(Boolean)
        .join(' ')

    const prefix =
      data.rateType ===
        'Driver'
        ? 'DRV'
        : 'EMP'

    const rate:
      PayrollRate = {
        id:
          nextId,

        rateCode:
          `RATE-${prefix}-${String(
            nextId,
          ).padStart(
            3,
            '0',
          )}`,

        employeeId:
          employee.id,

        employeeNumber:
          employee.employeeNumber,

        employeeName,

        department:
          employee.department,

        position:
          employee.position,

        rateType:
          data.rateType,

        payBasis:
          data.payBasis,

        monthlyRate:
          data.monthlyRate ??
          undefined,

        dailyRate:
          data.dailyRate ??
          undefined,

        hourlyRate:
          data.hourlyRate ??
          undefined,

        overtimeRate:
          data.overtimeRate ??
          undefined,

        restDayRate:
          data.restDayRate ??
          undefined,

        regularHolidayRate:
          data.regularHolidayRate ??
          undefined,

        specialHolidayRate:
          data.specialHolidayRate ??
          undefined,

        nightDifferentialRate:
          data.nightDifferentialRate ??
          undefined,

        tripRate:
          data.rateType ===
          'Driver'
            ? data.tripRate ??
              undefined
            : undefined,

        allowance:
          data.allowance ??
          undefined,

        effectiveDate:
          data.effectiveDate,

        status:
          getInitialStatus(
            data.effectiveDate,
          ),

        remarks:
          data.remarks ||
          undefined,

        createdBy:
          'Maria Santos',

        createdAt:
          new Date()
            .toISOString(),
      }

    rates.value.unshift(
      rate,
    )

    histories.value.unshift({
      id:
        histories.value.length
          ? Math.max(
              ...histories.value.map(
                item => item.id,
              ),
            ) + 1
          : 1,

      payrollRateId:
        rate.id,

      effectiveDate:
        rate.effectiveDate,

      rateType:
        rate.rateType,

      payBasis:
        rate.payBasis,

      previousRate:
        'No previous rate',

      newRate:
        getRateSummary(rate),

      changedBy:
        'Maria Santos',

      changedAt:
        new Date()
          .toISOString(),

      remarks:
        'Initial payroll rate created.',
    })

    return rate
  }

  /* =========================================================
     UPDATE
  ========================================================= */

  const updateRate = (
    id: number,
    data:
      PayrollRateFormData,
  ) => {
    const rate =
      rates.value.find(
        item =>
          item.id === id,
      )

    if (!rate) {
      return null
    }

    if (
      data.employeeId ===
      null
    ) {
      return null
    }

    const employee =
      employees.value.find(
        item =>
          item.id ===
          data.employeeId,
      )

    if (!employee) {
      return null
    }

    const previousSummary =
      getRateSummary(rate)

    rate.employeeId =
      employee.id

    rate.employeeNumber =
      employee.employeeNumber

    rate.employeeName =
      [
        employee.firstName,
        employee.middleName,
        employee.lastName,
      ]
        .filter(Boolean)
        .join(' ')

    rate.department =
      employee.department

    rate.position =
      employee.position

    rate.rateType =
      data.rateType

    rate.payBasis =
      data.payBasis

    rate.monthlyRate =
      data.monthlyRate ??
      undefined

    rate.dailyRate =
      data.dailyRate ??
      undefined

    rate.hourlyRate =
      data.hourlyRate ??
      undefined

    rate.overtimeRate =
      data.overtimeRate ??
      undefined

    rate.restDayRate =
      data.restDayRate ??
      undefined

    rate.regularHolidayRate =
      data.regularHolidayRate ??
      undefined

    rate.specialHolidayRate =
      data.specialHolidayRate ??
      undefined

    rate.nightDifferentialRate =
      data.nightDifferentialRate ??
      undefined

    rate.tripRate =
      data.rateType ===
      'Driver'
        ? data.tripRate ??
          undefined
        : undefined

    rate.allowance =
      data.allowance ??
      undefined

    rate.effectiveDate =
      data.effectiveDate

    if (
      rate.status !==
      'Inactive'
    ) {
      rate.status =
        getInitialStatus(
          data.effectiveDate,
        )
    }

    rate.remarks =
      data.remarks ||
      undefined

    rate.updatedBy =
      'Maria Santos'

    rate.updatedAt =
      new Date()
        .toISOString()

    histories.value.unshift({
      id:
        histories.value.length
          ? Math.max(
              ...histories.value.map(
                item => item.id,
              ),
            ) + 1
          : 1,

      payrollRateId:
        rate.id,

      effectiveDate:
        rate.effectiveDate,

      rateType:
        rate.rateType,

      payBasis:
        rate.payBasis,

      previousRate:
        previousSummary,

      newRate:
        getRateSummary(rate),

      changedBy:
        'Maria Santos',

      changedAt:
        rate.updatedAt,

      remarks:
        data.remarks ||
        'Payroll rate updated.',
    })

    return rate
  }

  /* =========================================================
     ACTIVATE
  ========================================================= */

  const activateRate = (
    id: number,
  ) => {
    const rate =
      rates.value.find(
        item =>
          item.id === id,
      )

    if (!rate) {
      return null
    }

    const previous =
      rate.status

    rate.status =
      'Active'

    rate.updatedBy =
      'Maria Santos'

    rate.updatedAt =
      new Date()
        .toISOString()

    histories.value.unshift({
      id:
        histories.value.length
          ? Math.max(
              ...histories.value.map(
                item => item.id,
              ),
            ) + 1
          : 1,

      payrollRateId:
        rate.id,

      effectiveDate:
        rate.effectiveDate,

      rateType:
        rate.rateType,

      payBasis:
        rate.payBasis,

      previousRate:
        previous,

      newRate:
        'Active',

      changedBy:
        'Maria Santos',

      changedAt:
        rate.updatedAt,

      remarks:
        'Rate profile activated.',
    })

    return rate
  }

  /* =========================================================
     DEACTIVATE
  ========================================================= */

  const deactivateRate = (
    id: number,
  ) => {
    const rate =
      rates.value.find(
        item =>
          item.id === id,
      )

    if (!rate) {
      return null
    }

    const previous =
      rate.status

    rate.status =
      'Inactive'

    rate.updatedBy =
      'Maria Santos'

    rate.updatedAt =
      new Date()
        .toISOString()

    histories.value.unshift({
      id:
        histories.value.length
          ? Math.max(
              ...histories.value.map(
                item => item.id,
              ),
            ) + 1
          : 1,

      payrollRateId:
        rate.id,

      effectiveDate:
        rate.effectiveDate,

      rateType:
        rate.rateType,

      payBasis:
        rate.payBasis,

      previousRate:
        previous,

      newRate:
        'Inactive',

      changedBy:
        'Maria Santos',

      changedAt:
        rate.updatedAt,

      remarks:
        'Rate profile deactivated.',
    })

    return rate
  }

  /* =========================================================
     HISTORY
  ========================================================= */

  const getRateHistory = (
    rateId: number,
  ) => {
    return histories.value
      .filter(
        item =>
          item.payrollRateId ===
          rateId,
      )
      .sort(
        (
          a,
          b,
        ) =>
          new Date(
            b.changedAt,
          ).getTime() -
          new Date(
            a.changedAt,
          ).getTime(),
      )
  }

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value = ''

    rateType.value = ''

    department.value = ''

    status.value = ''

    currentPage.value =
      1
  }

  watch(
    [
      search,
      rateType,
      department,
      status,
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
    rates,
    histories,

    search,
    rateType,
    department,
    status,

    currentPage,
    perPage,

    filteredRates,
    paginatedRates,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    rateTypeOptions,
    payBasisOptions,
    statusOptions,
    departmentOptions,

    currency,

    createRate,
    updateRate,

    activateRate,
    deactivateRate,

    getRateHistory,

    resetFilters,
  }
}