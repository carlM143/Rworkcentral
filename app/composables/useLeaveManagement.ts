import type {
  LeaveRequest,
  LeaveRequestStatus,
  LeaveTypeName,
  LeaveBalanceSummary,
} from '~/types/leave'

export const useLeaveManagement = () => {
  const {
    employees,
  } = useEmployees()

  /* =========================================================
     CURRENT DATE
  ========================================================= */

  const currentDate =
    '2026-09-03'

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

  const createLeaveRequest = (
    data: {
      id: number
      employeeId: number

      leaveType: LeaveTypeName

      dateFrom: string
      dateTo: string

      days: number

      reason?: string

      status: LeaveRequestStatus

      filedAt: string
    },
  ): LeaveRequest => {
    const employee =
      employeeById(
        data.employeeId,
      )

    if (!employee) {
      throw new Error(
        `Employee ${data.employeeId} not found`,
      )
    }

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

      leaveType:
        data.leaveType,

      dateFrom:
        data.dateFrom,

      dateTo:
        data.dateTo,

      days:
        data.days,

      reason:
        data.reason,

      status:
        data.status,

      filedAt:
        data.filedAt,
    }
  }

  /* =========================================================
     MOCK LEAVE REQUESTS
  ========================================================= */

  const leaveRequests =
    ref<LeaveRequest[]>([
      createLeaveRequest({
        id: 1,
        employeeId: 1,

        leaveType:
          'Vacation Leave',

        dateFrom:
          '2026-09-08',

        dateTo:
          '2026-09-09',

        days: 2,

        reason:
          'Personal appointment',

        status:
          'Pending',

        filedAt:
          '2026-09-02',
      }),

      createLeaveRequest({
        id: 2,
        employeeId: 2,

        leaveType:
          'Sick Leave',

        dateFrom:
          '2026-09-02',

        dateTo:
          '2026-09-04',

        days: 3,

        reason:
          'Medical recovery',

        status:
          'Approved',

        filedAt:
          '2026-09-01',
      }),

      createLeaveRequest({
        id: 3,
        employeeId: 3,

        leaveType:
          'Vacation Leave',

        dateFrom:
          '2026-09-15',

        dateTo:
          '2026-09-16',

        days: 2,

        reason:
          'Family event',

        status:
          'Pending',

        filedAt:
          '2026-09-02',
      }),

      createLeaveRequest({
        id: 4,
        employeeId: 4,

        leaveType:
          'Emergency Leave',

        dateFrom:
          '2026-08-28',

        dateTo:
          '2026-08-28',

        days: 1,

        reason:
          'Family emergency',

        status:
          'Approved',

        filedAt:
          '2026-08-28',
      }),

      createLeaveRequest({
        id: 5,
        employeeId: 6,

        leaveType:
          'Sick Leave',

        dateFrom:
          '2026-09-03',

        dateTo:
          '2026-09-03',

        days: 1,

        reason:
          'Not feeling well',

        status:
          'Approved',

        filedAt:
          '2026-09-03',
      }),

      createLeaveRequest({
        id: 6,
        employeeId: 8,

        leaveType:
          'Vacation Leave',

        dateFrom:
          '2026-08-20',

        dateTo:
          '2026-08-21',

        days: 2,

        reason:
          'Personal leave',

        status:
          'Rejected',

        filedAt:
          '2026-08-15',
      }),

      createLeaveRequest({
        id: 7,
        employeeId: 9,

        leaveType:
          'Vacation Leave',

        dateFrom:
          '2026-09-10',

        dateTo:
          '2026-09-12',

        days: 3,

        reason:
          'Family vacation',

        status:
          'Approved',

        filedAt:
          '2026-08-30',
      }),
    ])

  /* =========================================================
     LEAVE BALANCES
  ========================================================= */

  const leaveBalances =
    ref<LeaveBalanceSummary[]>([
      {
        id: 1,

        leaveType:
          'Vacation Leave',

        total: 120,
        used: 36,
        available: 84,
      },

      {
        id: 2,

        leaveType:
          'Sick Leave',

        total: 120,
        used: 21,
        available: 99,
      },

      {
        id: 3,

        leaveType:
          'Emergency Leave',

        total: 60,
        used: 8,
        available: 52,
      },

      {
        id: 4,

        leaveType:
          'Special Leave',

        total: 24,
        used: 2,
        available: 22,
      },
    ])

  /* =========================================================
     STATS
  ========================================================= */

  const stats = computed(() => {
    const pending =
      leaveRequests.value.filter(
        request =>
          request.status ===
          'Pending',
      ).length

    const approvedThisMonth =
      leaveRequests.value.filter(
        request =>
          request.status ===
            'Approved' &&
          request.dateFrom.startsWith(
            '2026-09',
          ),
      ).length

    const onLeave =
      leaveRequests.value.filter(
        request =>
          request.status ===
            'Approved' &&
          request.dateFrom <=
            currentDate &&
          request.dateTo >=
            currentDate,
      ).length

    const remainingCredits =
      leaveBalances.value.reduce(
        (
          total,
          leave,
        ) =>
          total +
          leave.available,
        0,
      )

    return {
      pending,
      approvedThisMonth,
      onLeave,
      remainingCredits,
    }
  })

  /* =========================================================
     CURRENTLY ON LEAVE
  ========================================================= */

  const employeesOnLeave =
    computed(() => {
      return leaveRequests.value.filter(
        request =>
          request.status ===
            'Approved' &&
          request.dateFrom <=
            currentDate &&
          request.dateTo >=
            currentDate,
      )
    })

  /* =========================================================
     PENDING REQUESTS
  ========================================================= */

  const pendingRequests =
    computed(() => {
      return leaveRequests.value.filter(
        request =>
          request.status ===
          'Pending',
      )
    })

  /* =========================================================
     RECENT REQUESTS
  ========================================================= */

  const recentRequests =
    computed(() => {
      return [
        ...leaveRequests.value,
      ].sort(
        (a, b) =>
          b.filedAt.localeCompare(
            a.filedAt,
          ),
      )
    })

  return {
    leaveRequests,
    leaveBalances,

    stats,

    employeesOnLeave,
    pendingRequests,

    recentRequests,
  }
}