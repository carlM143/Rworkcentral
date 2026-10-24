import type {
  FieldLeaveFormData,
  FieldLeaveRecord,
  FieldLeaveStatus,
  FieldLeaveType,
} from '~/types/fieldLeave'

export const useFieldLeaves = () => {
  const {
    employees,
  } = useEmployees()

  const {
    trips,
  } = useManageTrips()

  /* =========================================================
     MOCK DATA
  ========================================================= */

  const fieldLeaves =
    useState<
      FieldLeaveRecord[]
    >(
      'field-leaves',
      () => [
        {
          id: 1,

          requestNumber:
            'FL-2026-001',

          employeeId: 7,
          employeeNumber:
            'EMP-007',
          employeeName:
            'Mark Lopez',

          department:
            'Operations',

          position:
            'Driver',

          leaveType:
            'Delivery / Pickup',

          fieldDate:
            '2026-09-11',

          timeFrom:
            '08:00',

          timeTo:
            '12:00',

          destination:
            'Davao City Warehouse',

          client:
            'ABC Logistics Corp.',

          purpose:
            'Delivery coordination and client document turnover.',

          relatedTripId: 1,

          relatedTripNumber:
            'TRP-2026-001',

          attachment: {
            name:
              'supervisor-approval.pdf',
          },

          status:
            'Approved',

          requestedBy:
            'Mark Lopez',

          requestedAt:
            '2026-09-10T16:20:00',

          approvedBy:
            'Maria Santos',

          approvedAt:
            '2026-09-10T17:00:00',

          approvalNotes:
            'Verified against scheduled client delivery.',
        },

        {
          id: 2,

          requestNumber:
            'FL-2026-002',

          employeeId: 1,
          employeeNumber:
            'EMP-001',
          employeeName:
            'Juan Dela Cruz',

          department:
            'Operations',

          position:
            'Driver',

          leaveType:
            'Client Visit',

          fieldDate:
            '2026-09-11',

          timeFrom:
            '09:30',

          timeTo:
            '11:30',

          destination:
            'Bajada Office',

          client:
            'Metro Supplies Inc.',

          purpose:
            'Pickup signed billing documents from client office.',

          relatedTripId: 2,

          relatedTripNumber:
            'TRP-2026-002',

          status:
            'Pending',

          requestedBy:
            'Juan Dela Cruz',

          requestedAt:
            '2026-09-11T07:30:00',
        },

        {
          id: 3,

          requestNumber:
            'FL-2026-003',

          employeeId: 5,
          employeeNumber:
            'EMP-005',
          employeeName:
            'Carlo Mendoza',

          department:
            'Operations',

          position:
            'Driver',

          leaveType:
            'Client Visit',

          fieldDate:
            '2026-09-11',

          timeFrom:
            '07:00',

          timeTo:
            '10:30',

          destination:
            'Toril Client Site',

          client:
            'Southpoint Trading',

          purpose:
            'Client service and document turnover.',

          relatedTripId: 3,

          relatedTripNumber:
            'TRP-2026-003',

          status:
            'Completed',

          requestedBy:
            'Carlo Mendoza',

          requestedAt:
            '2026-09-10T15:20:00',

          approvedBy:
            'Maria Santos',

          approvedAt:
            '2026-09-10T16:00:00',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-09-11T10:25:00',

          actualCompletionTime:
            '10:22',

          completionNotes:
            'Employee returned and field assignment was completed.',
        },

        {
          id: 4,

          requestNumber:
            'FL-2026-004',

          employeeId: 11,
          employeeNumber:
            'EMP-011',
          employeeName:
            'Leo Martinez',

          department:
            'Operations',

          position:
            'Dispatcher',

          leaveType:
            'Inspection',

          fieldDate:
            '2026-09-10',

          timeFrom:
            '13:00',

          timeTo:
            '16:00',

          destination:
            'Panacan Facility',

          client:
            'Prime Industrial Solutions',

          purpose:
            'Operational inspection and field coordination.',

          relatedTripId: 4,

          relatedTripNumber:
            'TRP-2026-004',

          status:
            'Completed',

          requestedBy:
            'Leo Martinez',

          requestedAt:
            '2026-09-10T08:30:00',

          approvedBy:
            'Maria Santos',

          approvedAt:
            '2026-09-10T09:15:00',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-09-10T15:55:00',

          actualCompletionTime:
            '15:48',
        },

        {
          id: 5,

          requestNumber:
            'FL-2026-005',

          employeeId: 3,
          employeeNumber:
            'EMP-003',
          employeeName:
            'Pedro Reyes',

          department:
            'Finance',

          position:
            'Accountant',

          leaveType:
            'Official Business',

          fieldDate:
            '2026-09-10',

          timeFrom:
            '10:00',

          timeTo:
            '12:00',

          destination:
            'Regional Bank Branch',

          client:
            'Regional Bank',

          purpose:
            'Payroll document submission and banking transaction.',

          relatedTripId: 5,

          relatedTripNumber:
            'TRP-2026-005',

          status:
            'Approved',

          requestedBy:
            'Pedro Reyes',

          requestedAt:
            '2026-09-09T15:00:00',

          approvedBy:
            'Maria Santos',

          approvedAt:
            '2026-09-09T16:10:00',
        },

        {
          id: 6,

          requestNumber:
            'FL-2026-006',

          employeeId: 6,
          employeeNumber:
            'EMP-006',
          employeeName:
            'Angela Flores',

          department:
            'Billing',

          position:
            'Billing Officer',

          leaveType:
            'Client Visit',

          fieldDate:
            '2026-09-09',

          timeFrom:
            '14:00',

          timeTo:
            '16:00',

          destination:
            'Matina Office',

          client:
            'Citywide Services',

          purpose:
            'Client billing meeting and account reconciliation.',

          status:
            'Rejected',

          requestedBy:
            'Angela Flores',

          requestedAt:
            '2026-09-09T08:40:00',

          rejectedBy:
            'Maria Santos',

          rejectedAt:
            '2026-09-09T10:15:00',

          rejectionReason:
            'Client meeting was moved to another schedule.',
        },

        {
          id: 7,

          requestNumber:
            'FL-2026-007',

          employeeId: 2,
          employeeNumber:
            'EMP-002',
          employeeName:
            'Maria Santos',

          department:
            'Human Resources',

          position:
            'HR Officer',

          leaveType:
            'Official Business',

          fieldDate:
            '2026-09-08',

          timeFrom:
            '09:00',

          timeTo:
            '11:00',

          destination:
            'Government Center',

          client:
            'Government Office',

          purpose:
            'Submission of employee compliance documents.',

          relatedTripId: 8,

          relatedTripNumber:
            'TRP-2026-008',

          status:
            'Completed',

          requestedBy:
            'Maria Santos',

          requestedAt:
            '2026-09-07T16:00:00',

          approvedBy:
            'HR Administrator',

          approvedAt:
            '2026-09-07T16:30:00',

          completedBy:
            'HR Administrator',

          completedAt:
            '2026-09-08T11:00:00',

          actualCompletionTime:
            '10:56',
        },

        {
          id: 8,

          requestNumber:
            'FL-2026-008',

          employeeId: 10,
          employeeNumber:
            'EMP-010',
          employeeName:
            'Grace Navarro',

          department:
            'Human Resources',

          position:
            'HR Assistant',

          leaveType:
            'Field Work',

          fieldDate:
            '2026-09-12',

          timeFrom:
            '08:30',

          timeTo:
            '15:00',

          destination:
            'Satellite Recruitment Area',

          purpose:
            'Assist recruitment activities and applicant processing.',

          status:
            'Pending',

          requestedBy:
            'Grace Navarro',

          requestedAt:
            '2026-09-11T10:15:00',
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

  const leaveType =
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

  const departmentOptions =
    computed(() => {
      return [
        ...new Set(
          fieldLeaves.value.map(
            record =>
              record.department,
          ),
        ),
      ].sort()
    })

  const typeOptions:
    FieldLeaveType[] = [
      'Client Visit',
      'Site Assignment',
      'Official Business',
      'Delivery / Pickup',
      'Field Work',
      'Inspection',
      'Other',
    ]

  const statusOptions:
    FieldLeaveStatus[] = [
      'Pending',
      'Approved',
      'Rejected',
      'Completed',
      'Cancelled',
    ]

  /* =========================================================
     FILTERED
  ========================================================= */

  const filteredFieldLeaves =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return fieldLeaves.value.filter(
        record => {
          const matchesSearch =
            !keyword ||
            record.requestNumber
              .toLowerCase()
              .includes(keyword) ||
            record.employeeName
              .toLowerCase()
              .includes(keyword) ||
            record.employeeNumber
              .toLowerCase()
              .includes(keyword) ||
            record.destination
              .toLowerCase()
              .includes(keyword)

          const matchesDepartment =
            !department.value ||
            record.department ===
              department.value

          const matchesType =
            !leaveType.value ||
            record.leaveType ===
              leaveType.value

          const matchesStatus =
            !status.value ||
            record.status ===
              status.value

          const matchesFrom =
            !dateFrom.value ||
            record.fieldDate >=
              dateFrom.value

          const matchesTo =
            !dateTo.value ||
            record.fieldDate <=
              dateTo.value

          return (
            matchesSearch &&
            matchesDepartment &&
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
      const today =
        new Date()
          .toLocaleDateString(
            'en-CA',
          )

      return {
        today:
          fieldLeaves.value.filter(
            record =>
              record.fieldDate ===
                today &&
              record.status !==
                'Rejected' &&
              record.status !==
                'Cancelled',
          ).length,

        pending:
          fieldLeaves.value.filter(
            record =>
              record.status ===
              'Pending',
          ).length,

        approved:
          fieldLeaves.value.filter(
            record =>
              record.status ===
              'Approved',
          ).length,

        completed:
          fieldLeaves.value.filter(
            record =>
              record.status ===
              'Completed',
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
          filteredFieldLeaves
            .value.length /
            perPage.value,
        ),
      )
    })

  const paginatedFieldLeaves =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredFieldLeaves
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
        !filteredFieldLeaves
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

        filteredFieldLeaves
          .value.length,
      )
    })

  /* =========================================================
     CREATE
  ========================================================= */

  const createFieldLeave = (
    data:
      FieldLeaveFormData,
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
      fieldLeaves.value.length
        ? Math.max(
            ...fieldLeaves
              .value
              .map(
                record =>
                  record.id,
              ),
          ) + 1
        : 1

    const year =
      new Date()
        .getFullYear()

    const relatedTrip =
      data.relatedTripId
        ? trips.value.find(
            trip =>
              trip.id ===
              data.relatedTripId,
          )
        : undefined

    const employeeName =
      [
        employee.firstName,
        employee.middleName,
        employee.lastName,
      ]
        .filter(Boolean)
        .join(' ')

    const record:
      FieldLeaveRecord = {
        id:
          nextId,

        requestNumber:
          `FL-${year}-${String(
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

        leaveType:
          data.leaveType,

        fieldDate:
          data.fieldDate,

        timeFrom:
          data.timeFrom,

        timeTo:
          data.timeTo,

        destination:
          data.destination,

        client:
          data.client ||
          undefined,

        purpose:
          data.purpose,

        relatedTripId:
          relatedTrip?.id,

        relatedTripNumber:
          relatedTrip?.tripNumber,

        attachment:
          data.attachmentName
            ? {
                name:
                  data.attachmentName,
              }
            : undefined,

        status:
          'Pending',

        requestedBy:
          employeeName,

        requestedAt:
          new Date()
            .toISOString(),
      }

    fieldLeaves.value.unshift(
      record,
    )

    return record
  }

  /* =========================================================
     UPDATE
  ========================================================= */

  const updateFieldLeave = (
    id: number,
    data:
      FieldLeaveFormData,
  ) => {
    const record =
      fieldLeaves.value.find(
        item =>
          item.id === id,
      )

    if (!record) {
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

    const relatedTrip =
      data.relatedTripId
        ? trips.value.find(
            trip =>
              trip.id ===
              data.relatedTripId,
          )
        : undefined

    record.employeeId =
      employee.id

    record.employeeNumber =
      employee.employeeNumber

    record.employeeName =
      [
        employee.firstName,
        employee.middleName,
        employee.lastName,
      ]
        .filter(Boolean)
        .join(' ')

    record.department =
      employee.department

    record.position =
      employee.position

    record.leaveType =
      data.leaveType

    record.fieldDate =
      data.fieldDate

    record.timeFrom =
      data.timeFrom

    record.timeTo =
      data.timeTo

    record.destination =
      data.destination

    record.client =
      data.client ||
      undefined

    record.purpose =
      data.purpose

    record.relatedTripId =
      relatedTrip?.id

    record.relatedTripNumber =
      relatedTrip
        ?.tripNumber

    record.attachment =
      data.attachmentName
        ? {
            name:
              data.attachmentName,
          }
        : undefined

    record.status =
      'Pending'

    record.approvedBy =
      undefined

    record.approvedAt =
      undefined

    record.approvalNotes =
      undefined

    record.rejectedBy =
      undefined

    record.rejectedAt =
      undefined

    record.rejectionReason =
      undefined

    return record
  }

  /* =========================================================
     APPROVE
  ========================================================= */

  const approveFieldLeave = (
    id: number,
    notes?: string,
  ) => {
    const record =
      fieldLeaves.value.find(
        item =>
          item.id === id,
      )

    if (!record) {
      return null
    }

    record.status =
      'Approved'

    record.approvedBy =
      'Maria Santos'

    record.approvedAt =
      new Date()
        .toISOString()

    record.approvalNotes =
      notes ||
      undefined

    return record
  }

  /* =========================================================
     REJECT
  ========================================================= */

  const rejectFieldLeave = (
    id: number,
    reason: string,
  ) => {
    const record =
      fieldLeaves.value.find(
        item =>
          item.id === id,
      )

    if (!record) {
      return null
    }

    record.status =
      'Rejected'

    record.rejectedBy =
      'Maria Santos'

    record.rejectedAt =
      new Date()
        .toISOString()

    record.rejectionReason =
      reason

    return record
  }

  /* =========================================================
     COMPLETE
  ========================================================= */

  const completeFieldLeave = (
    id: number,
    completionTime: string,
    notes?: string,
  ) => {
    const record =
      fieldLeaves.value.find(
        item =>
          item.id === id,
      )

    if (!record) {
      return null
    }

    record.status =
      'Completed'

    record.actualCompletionTime =
      completionTime

    record.completedBy =
      'Maria Santos'

    record.completedAt =
      new Date()
        .toISOString()

    record.completionNotes =
      notes ||
      undefined

    return record
  }

  /* =========================================================
     CANCEL
  ========================================================= */

  const cancelFieldLeave = (
    id: number,
    reason: string,
  ) => {
    const record =
      fieldLeaves.value.find(
        item =>
          item.id === id,
      )

    if (!record) {
      return null
    }

    record.status =
      'Cancelled'

    record.cancelledBy =
      'Maria Santos'

    record.cancelledAt =
      new Date()
        .toISOString()

    record.cancellationReason =
      reason

    return record
  }

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value = ''

    department.value = ''

    leaveType.value = ''

    status.value = ''

    dateFrom.value = ''

    dateTo.value = ''

    currentPage.value =
      1
  }

  watch(
    [
      search,
      department,
      leaveType,
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

  return {
    fieldLeaves,

    search,
    department,
    leaveType,
    status,
    dateFrom,
    dateTo,

    currentPage,
    perPage,

    filteredFieldLeaves,
    paginatedFieldLeaves,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    departmentOptions,
    typeOptions,
    statusOptions,

    createFieldLeave,
    updateFieldLeave,

    approveFieldLeave,
    rejectFieldLeave,
    completeFieldLeave,
    cancelFieldLeave,

    resetFilters,
  }
}