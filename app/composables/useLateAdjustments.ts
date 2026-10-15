import type {
  LateAdjustmentFormData,
  LateAdjustmentRecord,
  LateAdjustmentStatus,
} from '~/types/lateAdjustment'

export const useLateAdjustments = () => {
  /* =========================================================
     SHARED MOCK DATA
  ========================================================= */

  const adjustments =
    useState<
      LateAdjustmentRecord[]
    >(
      'late-adjustments',
      () => [
        {
          id: 1,

          timeLogId: 2,

          employeeId: 2,
          employeeNumber:
            'EMP-002',
          employeeName:
            'Maria Santos',

          department:
            'Human Resources',

          position:
            'HR Officer',

          attendanceDate:
            '2026-09-03',

          schedule:
            '8:00 AM - 5:00 PM',

          actualTimeIn:
            '8:08 AM',

          originalLateMinutes: 8,

          adjustedLateMinutes: 0,

          reason:
            'Employee attended an approved HR coordination meeting before reporting to the office.',

          status:
            'Approved',

          requestedAt:
            '2026-09-03T10:30:00',

          requestedBy:
            'Maria Santos',

          reviewedAt:
            '2026-09-03T13:40:00',

          reviewedBy:
            'HR Administrator',

          reviewNotes:
            'Verified against the approved meeting schedule.',
        },

        {
          id: 2,

          timeLogId: 7,

          employeeId: 7,
          employeeNumber:
            'EMP-007',
          employeeName:
            'Mark Lopez',

          department:
            'Operations',

          position:
            'Driver',

          attendanceDate:
            '2026-09-03',

          schedule:
            '8:00 AM - 5:00 PM',

          actualTimeIn:
            '8:15 AM',

          originalLateMinutes: 15,

          adjustedLateMinutes: 5,

          reason:
            'Verified transport delay caused by an assigned company vehicle issue.',

          status:
            'Pending',

          requestedAt:
            '2026-09-03T11:15:00',

          requestedBy:
            'Maria Santos',
        },

        {
          id: 3,

          timeLogId: 13,

          employeeId: 1,
          employeeNumber:
            'EMP-001',
          employeeName:
            'Juan Dela Cruz',

          department:
            'Operations',

          position:
            'Driver',

          attendanceDate:
            '2026-09-01',

          schedule:
            '8:00 AM - 5:00 PM',

          actualTimeIn:
            '8:04 AM',

          originalLateMinutes: 4,

          adjustedLateMinutes: 0,

          reason:
            'Grace period approved after verification of gate entry record.',

          status:
            'Approved',

          requestedAt:
            '2026-09-01T09:20:00',

          requestedBy:
            'Maria Santos',

          reviewedAt:
            '2026-09-01T11:45:00',

          reviewedBy:
            'HR Administrator',
        },

        {
          id: 4,

          timeLogId: 16,

          employeeId: 5,
          employeeNumber:
            'EMP-005',
          employeeName:
            'Carlo Mendoza',

          department:
            'Operations',

          position:
            'Driver',

          attendanceDate:
            '2026-09-04',

          schedule:
            '8:00 AM - 5:00 PM',

          actualTimeIn:
            '8:12 AM',

          originalLateMinutes: 12,

          adjustedLateMinutes: 5,

          reason:
            'Employee was assigned to collect company documents before reporting to the branch.',

          status:
            'Approved',

          requestedAt:
            '2026-09-04T09:45:00',

          requestedBy:
            'Maria Santos',

          reviewedAt:
            '2026-09-04T14:10:00',

          reviewedBy:
            'HR Administrator',
        },

        {
          id: 5,

          timeLogId: 17,

          employeeId: 6,
          employeeNumber:
            'EMP-006',
          employeeName:
            'Angela Flores',

          department:
            'Billing',

          position:
            'Billing Officer',

          attendanceDate:
            '2026-09-05',

          schedule:
            '8:00 AM - 5:00 PM',

          actualTimeIn:
            '8:06 AM',

          originalLateMinutes: 6,

          adjustedLateMinutes: 0,

          reason:
            'Employee requested removal of late minutes due to heavy traffic.',

          status:
            'Rejected',

          requestedAt:
            '2026-09-05T10:15:00',

          requestedBy:
            'Maria Santos',

          reviewedAt:
            '2026-09-05T15:20:00',

          reviewedBy:
            'HR Administrator',

          reviewNotes:
            'No supporting document or supervisor confirmation provided.',
        },

        {
          id: 6,

          timeLogId: 18,

          employeeId: 9,
          employeeNumber:
            'EMP-009',
          employeeName:
            'Robert Castillo',

          department:
            'Finance',

          position:
            'Finance Assistant',

          attendanceDate:
            '2026-09-06',

          schedule:
            '8:00 AM - 5:00 PM',

          actualTimeIn:
            '8:11 AM',

          originalLateMinutes: 11,

          adjustedLateMinutes: 3,

          reason:
            'Late arrival partly covered by approved field assignment.',

          status:
            'Pending',

          requestedAt:
            '2026-09-06T09:30:00',

          requestedBy:
            'Maria Santos',
        },

        {
          id: 7,

          timeLogId: 19,

          employeeId: 10,
          employeeNumber:
            'EMP-010',
          employeeName:
            'Grace Navarro',

          department:
            'Human Resources',

          position:
            'HR Assistant',

          attendanceDate:
            '2026-09-07',

          schedule:
            '8:00 AM - 5:00 PM',

          actualTimeIn:
            '8:07 AM',

          originalLateMinutes: 7,

          adjustedLateMinutes: 0,

          reason:
            'Approved official errand before office reporting time.',

          status:
            'Approved',

          requestedAt:
            '2026-09-07T10:00:00',

          requestedBy:
            'Maria Santos',

          reviewedAt:
            '2026-09-07T13:25:00',

          reviewedBy:
            'HR Administrator',
        },

        {
          id: 8,

          timeLogId: 20,

          employeeId: 11,
          employeeNumber:
            'EMP-011',
          employeeName:
            'Leo Martinez',

          department:
            'Operations',

          position:
            'Dispatcher',

          attendanceDate:
            '2026-09-08',

          schedule:
            '8:00 AM - 5:00 PM',

          actualTimeIn:
            '8:09 AM',

          originalLateMinutes: 9,

          adjustedLateMinutes: 0,

          reason:
            'Employee requested late adjustment due to personal transportation delay.',

          status:
            'Rejected',

          requestedAt:
            '2026-09-08T09:40:00',

          requestedBy:
            'Maria Santos',

          reviewedAt:
            '2026-09-08T14:30:00',

          reviewedBy:
            'HR Administrator',

          reviewNotes:
            'Reason is not covered by the approved late adjustment policy.',
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
     FILTERED RECORDS
  ========================================================= */

  const filteredAdjustments =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return adjustments.value.filter(
        adjustment => {
          const matchesSearch =
            !keyword ||
            adjustment.employeeName
              .toLowerCase()
              .includes(keyword) ||
            adjustment.employeeNumber
              .toLowerCase()
              .includes(keyword)

          const matchesDepartment =
            !department.value ||
            adjustment.department ===
              department.value

          const matchesStatus =
            !status.value ||
            adjustment.status ===
              status.value

          const matchesDateFrom =
            !dateFrom.value ||
            adjustment.attendanceDate >=
              dateFrom.value

          const matchesDateTo =
            !dateTo.value ||
            adjustment.attendanceDate <=
              dateTo.value

          return (
            matchesSearch &&
            matchesDepartment &&
            matchesStatus &&
            matchesDateFrom &&
            matchesDateTo
          )
        },
      )
    })

  /* =========================================================
     STATS
  ========================================================= */

  const stats =
    computed(() => {
      const pending =
        adjustments.value.filter(
          adjustment =>
            adjustment.status ===
            'Pending',
        ).length

      const approved =
        adjustments.value.filter(
          adjustment =>
            adjustment.status ===
            'Approved',
        )

      const totalMinutesAdjusted =
        approved.reduce(
          (
            total,
            adjustment,
          ) => {
            return (
              total +
              Math.max(
                0,
                adjustment
                  .originalLateMinutes -
                  adjustment
                    .adjustedLateMinutes,
              )
            )
          },
          0,
        )

      return {
        lateRecords:
          adjustments.value.length,

        pending,

        approved:
          approved.length,

        totalMinutesAdjusted,
      }
    })

  /* =========================================================
     OPTIONS
  ========================================================= */

  const departments =
    computed(() => {
      return [
        ...new Set(
          adjustments.value.map(
            adjustment =>
              adjustment.department,
          ),
        ),
      ].sort()
    })

  const statusOptions:
    LateAdjustmentStatus[] = [
      'Pending',
      'Approved',
      'Rejected',
    ]

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
          start + perPage.value,
        )
    })

  const showingFrom =
    computed(() => {
      if (
        !filteredAdjustments
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

        filteredAdjustments
          .value.length,
      )
    })

  /* =========================================================
     SAVE / REFILE ADJUSTMENT
  ========================================================= */

  const saveAdjustment = (
    id: number,
    data:
      LateAdjustmentFormData,
  ) => {
    const adjustment =
      adjustments.value.find(
        item =>
          item.id === id,
      )

    if (!adjustment) {
      return null
    }

    adjustment.adjustedLateMinutes =
      data.adjustedLateMinutes

    adjustment.reason =
      data.reason

    adjustment.status =
      'Pending'

    adjustment.requestedAt =
      new Date()
        .toISOString()

    adjustment.requestedBy =
      'Maria Santos'

    adjustment.reviewedAt =
      undefined

    adjustment.reviewedBy =
      undefined

    adjustment.reviewNotes =
      undefined

    return adjustment
  }

  /* =========================================================
     APPROVE
  ========================================================= */

  const approveAdjustment = (
    id: number,
  ) => {
    const adjustment =
      adjustments.value.find(
        item =>
          item.id === id,
      )

    if (!adjustment) {
      return false
    }

    adjustment.status =
      'Approved'

    adjustment.reviewedAt =
      new Date()
        .toISOString()

    adjustment.reviewedBy =
      'Maria Santos'

    return true
  }

  /* =========================================================
     REJECT
  ========================================================= */

  const rejectAdjustment = (
    id: number,
  ) => {
    const adjustment =
      adjustments.value.find(
        item =>
          item.id === id,
      )

    if (!adjustment) {
      return false
    }

    adjustment.status =
      'Rejected'

    adjustment.reviewedAt =
      new Date()
        .toISOString()

    adjustment.reviewedBy =
      'Maria Santos'

    return true
  }

  /* =========================================================
     RESET FILTERS
  ========================================================= */

  const resetFilters = () => {
    search.value = ''

    department.value = ''

    status.value = ''

    dateFrom.value = ''

    dateTo.value = ''

    currentPage.value =
      1
  }

  /* =========================================================
     WATCH FILTERS
  ========================================================= */

  watch(
    [
      search,
      department,
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

  /* =========================================================
     RETURN
  ========================================================= */

  return {
    adjustments,

    search,
    department,
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

    departments,
    statusOptions,

    saveAdjustment,
    approveAdjustment,
    rejectAdjustment,

    resetFilters,
  }
}