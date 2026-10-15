import type {
  AttendanceEmploymentType,
  AttendanceReportRecord,
  AttendanceReportStatus,
} from '~/types/attendanceReport'

export const useAttendanceReport = () => {
  const records =
    useState<AttendanceReportRecord[]>(
      'attendance-report-records',
      () => [
        {
          id: 1,

          employeeId: 1,
          employeeNumber: 'EMP-001',
          employeeName: 'Juan Dela Cruz',

          department: 'Operations',
          position: 'Driver',

          employmentType: 'Regular',

          periodStart: '2026-10-01',
          periodEnd: '2026-10-15',

          scheduledDays: 11,
          presentDays: 11,
          absentDays: 0,
          leaveDays: 0,

          lateCount: 1,
          lateMinutes: 12,

          undertimeCount: 0,
          undertimeMinutes: 0,

          overtimeHours: 8.5,

          totalWorkedHours: 96.5,

          attendanceRate: 100,

          status: 'Excellent',
        },

        {
          id: 2,

          employeeId: 2,
          employeeNumber: 'EMP-002',
          employeeName: 'Maria Santos',

          department: 'Human Resources',
          position: 'HR Administrator',

          employmentType: 'Regular',

          periodStart: '2026-10-01',
          periodEnd: '2026-10-15',

          scheduledDays: 11,
          presentDays: 10,
          absentDays: 0,
          leaveDays: 1,

          lateCount: 0,
          lateMinutes: 0,

          undertimeCount: 0,
          undertimeMinutes: 0,

          overtimeHours: 2,

          totalWorkedHours: 82,

          attendanceRate: 100,

          status: 'Excellent',
        },

        {
          id: 3,

          employeeId: 3,
          employeeNumber: 'EMP-003',
          employeeName: 'Pedro Reyes',

          department: 'Finance',
          position: 'Finance Staff',

          employmentType: 'Regular',

          periodStart: '2026-10-01',
          periodEnd: '2026-10-15',

          scheduledDays: 11,
          presentDays: 10,
          absentDays: 1,
          leaveDays: 0,

          lateCount: 2,
          lateMinutes: 28,

          undertimeCount: 1,
          undertimeMinutes: 35,

          overtimeHours: 4,

          totalWorkedHours: 82.4,

          attendanceRate: 90.91,

          status: 'Good',
        },

        {
          id: 4,

          employeeId: 4,
          employeeNumber: 'EMP-004',
          employeeName: 'Ana Garcia',

          department: 'Operations',
          position: 'Operations Staff',

          employmentType: 'Probationary',

          periodStart: '2026-10-01',
          periodEnd: '2026-10-15',

          scheduledDays: 11,
          presentDays: 9,
          absentDays: 1,
          leaveDays: 1,

          lateCount: 3,
          lateMinutes: 46,

          undertimeCount: 1,
          undertimeMinutes: 30,

          overtimeHours: 1.5,

          totalWorkedHours: 73,

          attendanceRate: 90.91,

          status: 'Good',
        },

        {
          id: 5,

          employeeId: 5,
          employeeNumber: 'EMP-005',
          employeeName: 'Carlo Mendoza',

          department: 'Information Technology',
          position: 'Software Developer',

          employmentType: 'Regular',

          periodStart: '2026-10-01',
          periodEnd: '2026-10-15',

          scheduledDays: 11,
          presentDays: 11,
          absentDays: 0,
          leaveDays: 0,

          lateCount: 0,
          lateMinutes: 0,

          undertimeCount: 0,
          undertimeMinutes: 0,

          overtimeHours: 12,

          totalWorkedHours: 100,

          attendanceRate: 100,

          status: 'Excellent',
        },

        {
          id: 6,

          employeeId: 6,
          employeeNumber: 'EMP-006',
          employeeName: 'Angela Flores',

          department: 'Billing',
          position: 'Billing Staff',

          employmentType: 'Probationary',

          periodStart: '2026-10-01',
          periodEnd: '2026-10-15',

          scheduledDays: 11,
          presentDays: 8,
          absentDays: 2,
          leaveDays: 1,

          lateCount: 4,
          lateMinutes: 65,

          undertimeCount: 2,
          undertimeMinutes: 54,

          overtimeHours: 0,

          totalWorkedHours: 63.8,

          attendanceRate: 81.82,

          status: 'Needs Attention',
        },

        {
          id: 7,

          employeeId: 7,
          employeeNumber: 'EMP-007',
          employeeName: 'Mark Lopez',

          department: 'Information Technology',
          position: 'IT Support',

          employmentType: 'Contractual',

          periodStart: '2026-10-01',
          periodEnd: '2026-10-15',

          scheduledDays: 11,
          presentDays: 10,
          absentDays: 0,
          leaveDays: 1,

          lateCount: 1,
          lateMinutes: 8,

          undertimeCount: 0,
          undertimeMinutes: 0,

          overtimeHours: 6,

          totalWorkedHours: 86,

          attendanceRate: 100,

          status: 'Excellent',
        },

        {
          id: 8,

          employeeId: 8,
          employeeNumber: 'EMP-008',
          employeeName: 'Jenny Ramos',

          department: 'Human Resources',
          position: 'HR Officer',

          employmentType: 'Regular',

          periodStart: '2026-10-01',
          periodEnd: '2026-10-15',

          scheduledDays: 11,
          presentDays: 10,
          absentDays: 1,
          leaveDays: 0,

          lateCount: 1,
          lateMinutes: 15,

          undertimeCount: 0,
          undertimeMinutes: 0,

          overtimeHours: 3,

          totalWorkedHours: 82.75,

          attendanceRate: 90.91,

          status: 'Good',
        },

        {
          id: 9,

          employeeId: 9,
          employeeNumber: 'EMP-009',
          employeeName: 'Robert Castillo',

          department: 'Finance',
          position: 'Finance Officer',

          employmentType: 'Regular',

          periodStart: '2026-10-01',
          periodEnd: '2026-10-15',

          scheduledDays: 11,
          presentDays: 11,
          absentDays: 0,
          leaveDays: 0,

          lateCount: 2,
          lateMinutes: 20,

          undertimeCount: 0,
          undertimeMinutes: 0,

          overtimeHours: 5.5,

          totalWorkedHours: 93.2,

          attendanceRate: 100,

          status: 'Excellent',
        },

        {
          id: 10,

          employeeId: 10,
          employeeNumber: 'EMP-010',
          employeeName: 'Grace Navarro',

          department: 'Human Resources',
          position: 'Recruitment Coordinator',

          employmentType: 'Regular',

          periodStart: '2026-10-01',
          periodEnd: '2026-10-15',

          scheduledDays: 11,
          presentDays: 9,
          absentDays: 0,
          leaveDays: 2,

          lateCount: 1,
          lateMinutes: 10,

          undertimeCount: 1,
          undertimeMinutes: 25,

          overtimeHours: 2.5,

          totalWorkedHours: 74.1,

          attendanceRate: 100,

          status: 'Excellent',
        },

        {
          id: 11,

          employeeId: 11,
          employeeNumber: 'EMP-011',
          employeeName: 'Leo Martinez',

          department: 'Operations',
          position: 'Driver',

          employmentType: 'Project-Based',

          periodStart: '2026-10-01',
          periodEnd: '2026-10-15',

          scheduledDays: 11,
          presentDays: 7,
          absentDays: 4,
          leaveDays: 0,

          lateCount: 5,
          lateMinutes: 95,

          undertimeCount: 3,
          undertimeMinutes: 88,

          overtimeHours: 0,

          totalWorkedHours: 54.7,

          attendanceRate: 63.64,

          status: 'Critical',
        },

        {
          id: 12,

          employeeId: 12,
          employeeNumber: 'EMP-012',
          employeeName: 'Claire Villanueva',

          department: 'Operations',
          position: 'Operations Coordinator',

          employmentType: 'Regular',

          periodStart: '2026-10-01',
          periodEnd: '2026-10-15',

          scheduledDays: 11,
          presentDays: 10,
          absentDays: 1,
          leaveDays: 0,

          lateCount: 2,
          lateMinutes: 17,

          undertimeCount: 1,
          undertimeMinutes: 20,

          overtimeHours: 4.5,

          totalWorkedHours: 84.3,

          attendanceRate: 90.91,

          status: 'Good',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const department =
    ref('')

  const employmentType =
    ref('')

  const status =
    ref('')

  const dateFrom =
    ref('2026-10-01')

  const dateTo =
    ref('2026-10-15')

  /* =========================================================
     PAGINATION
  ========================================================= */

  const currentPage =
    ref(1)

  const perPage =
    ref(7)

  /* =========================================================
     OPTIONS
  ========================================================= */

  const departmentOptions =
    computed(() => {
      return [
        ...new Set(
          records.value.map(
            item =>
              item.department,
          ),
        ),
      ].sort()
    })

  const employmentTypeOptions:
    AttendanceEmploymentType[] = [
      'Regular',
      'Probationary',
      'Contractual',
      'Project-Based',
    ]

  const statusOptions:
    AttendanceReportStatus[] = [
      'Excellent',
      'Good',
      'Needs Attention',
      'Critical',
    ]

  /* =========================================================
     FILTER
  ========================================================= */

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
            item.employeeName
              .toLowerCase()
              .includes(keyword) ||
            item.employeeNumber
              .toLowerCase()
              .includes(keyword) ||
            item.position
              .toLowerCase()
              .includes(keyword)

          const matchesDepartment =
            !department.value ||
            item.department ===
              department.value

          const matchesEmploymentType =
            !employmentType.value ||
            item.employmentType ===
              employmentType.value

          const matchesStatus =
            !status.value ||
            item.status ===
              status.value

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesEmploymentType &&
            matchesStatus
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

      const totalEmployees =
        data.length

      const totalAbsences =
        data.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.absentDays,
          0,
        )

      const lateIncidents =
        data.reduce(
          (
            total,
            item,
          ) =>
            total +
            item.lateCount,
          0,
        )

      const averageAttendance =
        totalEmployees > 0
          ? Number(
              (
                data.reduce(
                  (
                    total,
                    item,
                  ) =>
                    total +
                    item.attendanceRate,
                  0,
                ) /
                totalEmployees
              ).toFixed(2),
            )
          : 0

      return {
        totalEmployees,
        averageAttendance,
        totalAbsences,
        lateIncidents,
      }
    })

  /* =========================================================
     TOTALS
  ========================================================= */

  const totals =
    computed(() => {
      const data =
        filteredRecords.value

      return {
        scheduledDays:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.scheduledDays,
            0,
          ),

        presentDays:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.presentDays,
            0,
          ),

        absentDays:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.absentDays,
            0,
          ),

        leaveDays:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.leaveDays,
            0,
          ),

        lateCount:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.lateCount,
            0,
          ),

        undertimeCount:
          data.reduce(
            (
              total,
              item,
            ) =>
              total +
              item.undertimeCount,
            0,
          ),

        overtimeHours:
          Number(
            data.reduce(
              (
                total,
                item,
              ) =>
                total +
                item.overtimeHours,
              0,
            ).toFixed(2),
          ),

        workedHours:
          Number(
            data.reduce(
              (
                total,
                item,
              ) =>
                total +
                item.totalWorkedHours,
              0,
            ).toFixed(2),
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
          .value.length === 0
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
    search.value = ''
    department.value = ''
    employmentType.value = ''
    status.value = ''

    dateFrom.value =
      '2026-10-01'

    dateTo.value =
      '2026-10-15'

    currentPage.value = 1
  }

  watch(
    [
      search,
      department,
      employmentType,
      status,
      dateFrom,
      dateTo,
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
    department,
    employmentType,
    status,
    dateFrom,
    dateTo,

    currentPage,

    filteredRecords,
    paginatedRecords,

    stats,
    totals,

    totalPages,
    showingFrom,
    showingTo,

    departmentOptions,
    employmentTypeOptions,
    statusOptions,

    resetFilters,
  }
}