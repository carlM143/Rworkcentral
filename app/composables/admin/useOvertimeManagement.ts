import type {
  OvertimeRequest,
  OvertimeRequestStatus,
  OvertimeDepartmentSummary,
} from '~/types/overtime'

export const useOvertimeManagement = () => {
  const {
    employees,
  } = useEmployees()

  const currentDate =
    '2026-09-03'

  /* =========================================================
     EMPLOYEE
  ========================================================= */

  const employeeById = (
    id: number,
  ) => {
    return employees.value.find(
      employee =>
        employee.id === id,
    )
  }

  const createOvertimeRequest = (
    data: {
      id: number

      employeeId: number

      date: string

      timeFrom: string
      timeTo: string

      hours: number

      reason: string

      status: OvertimeRequestStatus

      filedAt: string

      approvedBy?: string
    },
  ): OvertimeRequest => {
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
      id:
        data.id,

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

      date:
        data.date,

      timeFrom:
        data.timeFrom,

      timeTo:
        data.timeTo,

      hours:
        data.hours,

      reason:
        data.reason,

      status:
        data.status,

      filedAt:
        data.filedAt,

      approvedBy:
        data.approvedBy,
    }
  }

  /* =========================================================
     MOCK REQUESTS
  ========================================================= */

  const overtimeRequests =
    ref<OvertimeRequest[]>([
      createOvertimeRequest({
        id: 1,

        employeeId: 1,

        date:
          '2026-09-03',

        timeFrom:
          '5:00 PM',

        timeTo:
          '7:00 PM',

        hours: 2,

        reason:
          'Extended delivery assignment',

        status:
          'Approved',

        filedAt:
          '2026-09-02',

        approvedBy:
          'Leo Martinez',
      }),

      createOvertimeRequest({
        id: 2,

        employeeId: 2,

        date:
          '2026-09-04',

        timeFrom:
          '5:00 PM',

        timeTo:
          '7:30 PM',

        hours: 2.5,

        reason:
          'Payroll preparation support',

        status:
          'Pending',

        filedAt:
          '2026-09-03',
      }),

      createOvertimeRequest({
        id: 3,

        employeeId: 3,

        date:
          '2026-09-03',

        timeFrom:
          '5:00 PM',

        timeTo:
          '6:30 PM',

        hours: 1.5,

        reason:
          'Month-end financial reconciliation',

        status:
          'Approved',

        filedAt:
          '2026-09-02',

        approvedBy:
          'Maria Santos',
      }),

      createOvertimeRequest({
        id: 4,

        employeeId: 4,

        date:
          '2026-09-05',

        timeFrom:
          '5:00 PM',

        timeTo:
          '8:00 PM',

        hours: 3,

        reason:
          'Dispatch support for additional trips',

        status:
          'Pending',

        filedAt:
          '2026-09-03',
      }),

      createOvertimeRequest({
        id: 5,

        employeeId: 5,

        date:
          '2026-09-02',

        timeFrom:
          '5:00 PM',

        timeTo:
          '8:00 PM',

        hours: 3,

        reason:
          'Late return from assigned trip',

        status:
          'Approved',

        filedAt:
          '2026-09-01',

        approvedBy:
          'Leo Martinez',
      }),

      createOvertimeRequest({
        id: 6,

        employeeId: 6,

        date:
          '2026-09-01',

        timeFrom:
          '5:00 PM',

        timeTo:
          '6:00 PM',

        hours: 1,

        reason:
          'Billing reconciliation',

        status:
          'Rejected',

        filedAt:
          '2026-08-31',
      }),

      createOvertimeRequest({
        id: 7,

        employeeId: 7,

        date:
          '2026-09-03',

        timeFrom:
          '5:00 PM',

        timeTo:
          '7:00 PM',

        hours: 2,

        reason:
          'Additional field assignment',

        status:
          'Approved',

        filedAt:
          '2026-09-02',

        approvedBy:
          'Leo Martinez',
      }),

      createOvertimeRequest({
        id: 8,

        employeeId: 9,

        date:
          '2026-09-06',

        timeFrom:
          '5:00 PM',

        timeTo:
          '7:00 PM',

        hours: 2,

        reason:
          'Payroll processing',

        status:
          'Pending',

        filedAt:
          '2026-09-03',
      }),
    ])

  /* =========================================================
     STATS
  ========================================================= */

  const stats = computed(() => {
    const pending =
      overtimeRequests.value.filter(
        request =>
          request.status ===
          'Pending',
      ).length

    const approvedThisMonth =
      overtimeRequests.value.filter(
        request =>
          request.status ===
            'Approved' &&
          request.date.startsWith(
            '2026-09',
          ),
      ).length

    const approvedHours =
      overtimeRequests.value
        .filter(
          request =>
            request.status ===
            'Approved',
        )
        .reduce(
          (
            total,
            request,
          ) =>
            total +
            request.hours,
          0,
        )

    const rejected =
      overtimeRequests.value.filter(
        request =>
          request.status ===
          'Rejected' &&
          request.date.startsWith(
            '2026-09',
          ),
      ).length

    return {
      pending,
      approvedThisMonth,
      approvedHours,
      rejected,
    }
  })

  /* =========================================================
     PENDING
  ========================================================= */

  const pendingRequests =
    computed(() => {
      return overtimeRequests.value.filter(
        request =>
          request.status ===
          'Pending',
      )
    })

  /* =========================================================
     TODAY'S OT
  ========================================================= */

  const todayOvertime =
    computed(() => {
      return overtimeRequests.value.filter(
        request =>
          request.status ===
            'Approved' &&
          request.date ===
            currentDate,
      )
    })

  /* =========================================================
     RECENT
  ========================================================= */

  const recentRequests =
    computed(() => {
      return [
        ...overtimeRequests.value,
      ].sort(
        (
          a,
          b,
        ) =>
          b.filedAt.localeCompare(
            a.filedAt,
          ),
      )
    })

  /* =========================================================
     DEPARTMENT SUMMARY
  ========================================================= */

  const departmentSummary =
    computed<OvertimeDepartmentSummary[]>(
      () => {
        const names =
          [
            ...new Set(
              overtimeRequests.value.map(
                request =>
                  request.department,
              ),
            ),
          ]

        return names.map(
          department => {
            const requests =
              overtimeRequests.value.filter(
                request =>
                  request.department ===
                  department,
              )

            const employeeIds =
              new Set(
                requests.map(
                  request =>
                    request.employeeId,
                ),
              )

            const approvedHours =
              requests
                .filter(
                  request =>
                    request.status ===
                    'Approved',
                )
                .reduce(
                  (
                    total,
                    request,
                  ) =>
                    total +
                    request.hours,
                  0,
                )

            return {
              department,

              employees:
                employeeIds.size,

              requests:
                requests.length,

              approvedHours,
            }
          },
        )
      },
    )

  return {
    overtimeRequests,

    stats,

    pendingRequests,
    todayOvertime,

    recentRequests,

    departmentSummary,
  }
}