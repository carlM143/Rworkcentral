import type {
  PayrollPeriod,
  PayrollPreviewRecord,
  PayrollRun,
} from '~/types/payroll'

export const usePayrollDashboard = () => {
  const {
    employees,
  } = useEmployees()

  /* =========================================================
     CURRENT PERIOD
  ========================================================= */

  const currentPeriod =
    ref<PayrollPeriod>({
      id: 1,

      code: 'PAY-2026-09-A',

      dateFrom: '2026-09-01',
      dateTo: '2026-09-15',

      payrollDate: '2026-09-15',

      type: 'Semi-Monthly',

      status: 'Preparing',

      progress: 68,
    })

  /* =========================================================
     EMPLOYEE HELPER
  ========================================================= */

  const employeeById = (
    id: number,
  ) => {
    return employees.value.find(
      employee =>
        employee.id === id,
    )
  }

  const createPayroll = (
    data: {
      id: number
      employeeId: number

      basicPay: number
      overtimePay?: number
      allowance?: number
      deductions?: number

      status:
        | 'Ready'
        | 'With Issue'
        | 'For Review'
        | 'Completed'

      issue?: string
    },
  ): PayrollPreviewRecord => {
    const employee =
      employeeById(
        data.employeeId,
      )

    if (!employee) {
      throw new Error(
        `Employee ${data.employeeId} not found`,
      )
    }

    const overtimePay =
      data.overtimePay ?? 0

    const allowance =
      data.allowance ?? 0

    const deductions =
      data.deductions ?? 0

    const netPay =
      data.basicPay +
      overtimePay +
      allowance -
      deductions

    return {
      id: data.id,

      employeeId:
        employee.id,

      employeeNumber:
        employee.employeeNumber,

      employeeName: [
        employee.firstName,
        employee.middleName,
        employee.lastName,
      ]
        .filter(Boolean)
        .join(' '),

      department:
        employee.department,

      position:
        employee.position,

      basicPay:
        data.basicPay,

      overtimePay,

      allowance,

      deductions,

      netPay,

      status:
        data.status,

      issue:
        data.issue,
    }
  }

  /* =========================================================
     PAYROLL PREVIEW
  ========================================================= */

  const payrollRecords =
    ref<PayrollPreviewRecord[]>([
      createPayroll({
        id: 1,
        employeeId: 1,

        basicPay: 10000,
        overtimePay: 750,
        allowance: 500,
        deductions: 850,

        status: 'Ready',
      }),

      createPayroll({
        id: 2,
        employeeId: 2,

        basicPay: 12500,
        overtimePay: 0,
        allowance: 750,
        deductions: 1100,

        status: 'Ready',
      }),

      createPayroll({
        id: 3,
        employeeId: 3,

        basicPay: 9500,
        overtimePay: 300,
        allowance: 500,
        deductions: 780,

        status: 'For Review',
      }),

      createPayroll({
        id: 4,
        employeeId: 4,

        basicPay: 8000,
        deductions: 450,

        status: 'With Issue',

        issue:
          'Missing time log',
      }),

      createPayroll({
        id: 5,
        employeeId: 5,

        basicPay: 10000,
        overtimePay: 1200,
        allowance: 500,
        deductions: 900,

        status: 'Ready',
      }),

      createPayroll({
        id: 6,
        employeeId: 6,

        basicPay: 10500,
        overtimePay: 250,
        allowance: 750,
        deductions: 920,

        status: 'Ready',
      }),

      createPayroll({
        id: 7,
        employeeId: 7,

        basicPay: 7500,
        deductions: 350,

        status: 'With Issue',

        issue:
          'Incomplete attendance',
      }),

      createPayroll({
        id: 8,
        employeeId: 8,

        basicPay: 8500,
        allowance: 500,
        deductions: 460,

        status: 'For Review',
      }),
    ])

  /* =========================================================
     STATS
  ========================================================= */

  const stats = computed(() => {
    const grossPay =
      payrollRecords.value.reduce(
        (
          total,
          record,
        ) => {
          return (
            total +
            record.basicPay +
            record.overtimePay +
            record.allowance
          )
        },
        0,
      )

    const issues =
      payrollRecords.value.filter(
        record =>
          record.status ===
          'With Issue',
      ).length

    return {
      period:
        currentPeriod.value.code,

      employees:
        payrollRecords.value.length,

      grossPay,

      issues,
    }
  })

  /* =========================================================
     STATUS BREAKDOWN
  ========================================================= */

  const statusBreakdown =
    computed(() => {
      return {
        ready:
          payrollRecords.value.filter(
            record =>
              record.status ===
              'Ready',
          ).length,

        review:
          payrollRecords.value.filter(
            record =>
              record.status ===
              'For Review',
          ).length,

        issues:
          payrollRecords.value.filter(
            record =>
              record.status ===
              'With Issue',
          ).length,
      }
    })

  /* =========================================================
     ISSUES
  ========================================================= */

  const issues = computed(() => {
    return [
      {
        id: 1,
        label:
          'Missing Time Logs',
        count: 1,
        type: 'danger',
      },

      {
        id: 2,
        label:
          'Incomplete Attendance',
        count: 1,
        type: 'warning',
      },

      {
        id: 3,
        label:
          'Pending Adjustments',
        count: 2,
        type: 'warning',
      },

      {
        id: 4,
        label:
          'Missing Payroll Rate',
        count: 0,
        type: 'neutral',
      },
    ]
  })

  /* =========================================================
     RECENT PAYROLL RUNS
  ========================================================= */

  const recentPayrollRuns =
    ref<PayrollRun[]>([
      {
        id: 1,

        period:
          'Aug 16 - Aug 31, 2026',

        payrollDate:
          '2026-08-31',

        employees: 12,

        grossPay: 189500,
        netPay: 164250,

        status: 'Completed',
      },

      {
        id: 2,

        period:
          'Aug 1 - Aug 15, 2026',

        payrollDate:
          '2026-08-15',

        employees: 12,

        grossPay: 187800,
        netPay: 162900,

        status: 'Completed',
      },

      {
        id: 3,

        period:
          'Jul 16 - Jul 31, 2026',

        payrollDate:
          '2026-07-31',

        employees: 11,

        grossPay: 176400,
        netPay: 153200,

        status: 'Completed',
      },
    ])

  return {
    currentPeriod,

    payrollRecords,

    stats,

    statusBreakdown,

    issues,

    recentPayrollRuns,
  }
}