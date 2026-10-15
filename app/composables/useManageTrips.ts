import type {
  ManageTrip,
  ManageTripFormData,
  TripStatus,
  TripPurpose,
} from '~/types/manageTrip'

export const useManageTrips = () => {
  const {
    employees,
  } = useEmployees()

  /* =========================================================
     MOCK DATA
  ========================================================= */

  const trips =
    useState<
      ManageTrip[]
    >(
      'manage-trips',
      () => [
        {
          id: 1,

          tripNumber:
            'TRP-2026-001',

          employeeId: 7,
          employeeNumber:
            'EMP-007',
          employeeName:
            'Mark Lopez',

          department:
            'Operations',

          position:
            'Driver',

          client:
            'ABC Logistics Corp.',

          origin:
            'Main Branch',

          destination:
            'Davao City Warehouse',

          tripDate:
            '2026-09-11',

          purpose:
            'Delivery',

          expectedDeparture:
            '08:00',

          actualDeparture:
            '08:06',

          expectedReturn:
            '12:00',

          vehicle:
            'Toyota Hiace',

          plateNumber:
            'ABC 1234',

          tripTicketNumber:
            'TT-2026-001',

          notes:
            'Delivery of client documents and supplies.',

          status:
            'Ongoing',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-11T07:20:00',

          startedBy:
            'Maria Santos',

          startedAt:
            '2026-09-11T08:06:00',
        },

        {
          id: 2,

          tripNumber:
            'TRP-2026-002',

          employeeId: 1,
          employeeNumber:
            'EMP-001',
          employeeName:
            'Juan Dela Cruz',

          department:
            'Operations',

          position:
            'Driver',

          client:
            'Metro Supplies Inc.',

          origin:
            'Main Branch',

          destination:
            'Bajada Office',

          tripDate:
            '2026-09-11',

          purpose:
            'Pickup',

          expectedDeparture:
            '09:30',

          expectedReturn:
            '11:30',

          vehicle:
            'Toyota Innova',

          plateNumber:
            'DEF 5678',

          tripTicketNumber:
            'TT-2026-002',

          notes:
            'Pickup signed billing documents.',

          status:
            'Pending',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-11T07:45:00',
        },

        {
          id: 3,

          tripNumber:
            'TRP-2026-003',

          employeeId: 5,
          employeeNumber:
            'EMP-005',
          employeeName:
            'Carlo Mendoza',

          department:
            'Operations',

          position:
            'Driver',

          client:
            'Southpoint Trading',

          origin:
            'Main Branch',

          destination:
            'Toril Client Site',

          tripDate:
            '2026-09-11',

          purpose:
            'Client Service',

          expectedDeparture:
            '07:00',

          actualDeparture:
            '07:05',

          expectedReturn:
            '10:30',

          actualReturn:
            '10:22',

          vehicle:
            'Mitsubishi L300',

          plateNumber:
            'GHI 9012',

          tripTicketNumber:
            'TT-2026-003',

          notes:
            'Client service and document turnover.',

          status:
            'Completed',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-10T16:00:00',

          startedBy:
            'Maria Santos',

          startedAt:
            '2026-09-11T07:05:00',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-09-11T10:22:00',
        },

        {
          id: 4,

          tripNumber:
            'TRP-2026-004',

          employeeId: 11,
          employeeNumber:
            'EMP-011',
          employeeName:
            'Leo Martinez',

          department:
            'Operations',

          position:
            'Dispatcher',

          client:
            'Prime Industrial Solutions',

          origin:
            'Main Branch',

          destination:
            'Panacan Facility',

          tripDate:
            '2026-09-10',

          purpose:
            'Site Visit',

          expectedDeparture:
            '13:00',

          actualDeparture:
            '13:08',

          expectedReturn:
            '16:00',

          actualReturn:
            '15:48',

          vehicle:
            'Toyota Hilux',

          plateNumber:
            'JKL 3456',

          tripTicketNumber:
            'TT-2026-004',

          notes:
            'Operational site inspection.',

          status:
            'Completed',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-10T09:15:00',

          startedBy:
            'Maria Santos',

          startedAt:
            '2026-09-10T13:08:00',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-09-10T15:48:00',
        },

        {
          id: 5,

          tripNumber:
            'TRP-2026-005',

          employeeId: 3,
          employeeNumber:
            'EMP-003',
          employeeName:
            'Pedro Reyes',

          department:
            'Finance',

          position:
            'Accountant',

          client:
            'Regional Bank',

          origin:
            'Main Branch',

          destination:
            'Bank Branch Office',

          tripDate:
            '2026-09-10',

          purpose:
            'Official Business',

          expectedDeparture:
            '10:00',

          actualDeparture:
            '10:05',

          expectedReturn:
            '12:00',

          actualReturn:
            '11:52',

          vehicle:
            'Toyota Vios',

          plateNumber:
            'MNO 7890',

          notes:
            'Bank transaction and payroll document submission.',

          status:
            'Completed',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-10T08:00:00',

          startedBy:
            'Maria Santos',

          startedAt:
            '2026-09-10T10:05:00',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-09-10T11:52:00',
        },

        {
          id: 6,

          tripNumber:
            'TRP-2026-006',

          employeeId: 4,
          employeeNumber:
            'EMP-004',
          employeeName:
            'Ana Garcia',

          department:
            'Operations',

          position:
            'Dispatcher',

          client:
            'Northgate Distribution',

          origin:
            'Main Branch',

          destination:
            'Lanang Distribution Hub',

          tripDate:
            '2026-09-12',

          purpose:
            'Delivery',

          expectedDeparture:
            '08:30',

          expectedReturn:
            '12:30',

          vehicle:
            'Toyota Hiace',

          plateNumber:
            'ABC 1234',

          tripTicketNumber:
            'TT-2026-006',

          notes:
            'Scheduled delivery for next working day.',

          status:
            'Pending',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-11T08:15:00',
        },

        {
          id: 7,

          tripNumber:
            'TRP-2026-007',

          employeeId: 6,
          employeeNumber:
            'EMP-006',
          employeeName:
            'Angela Flores',

          department:
            'Billing',

          position:
            'Billing Officer',

          client:
            'Citywide Services',

          origin:
            'Main Branch',

          destination:
            'Matina Office',

          tripDate:
            '2026-09-09',

          purpose:
            'Official Business',

          expectedDeparture:
            '14:00',

          expectedReturn:
            '16:00',

          vehicle:
            'Toyota Vios',

          plateNumber:
            'MNO 7890',

          notes:
            'Trip cancelled after client rescheduled the meeting.',

          status:
            'Cancelled',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-09T10:10:00',

          cancelledBy:
            'Maria Santos',

          cancelledAt:
            '2026-09-09T12:00:00',

          cancellationReason:
            'Client requested to reschedule the meeting.',
        },

        {
          id: 8,

          tripNumber:
            'TRP-2026-008',

          employeeId: 2,
          employeeNumber:
            'EMP-002',
          employeeName:
            'Maria Santos',

          department:
            'Human Resources',

          position:
            'HR Officer',

          client:
            'Government Office',

          origin:
            'Main Branch',

          destination:
            'Government Center',

          tripDate:
            '2026-09-08',

          purpose:
            'Official Business',

          expectedDeparture:
            '09:00',

          actualDeparture:
            '09:03',

          expectedReturn:
            '11:00',

          actualReturn:
            '10:56',

          vehicle:
            'Toyota Innova',

          plateNumber:
            'DEF 5678',

          notes:
            'Submission of government compliance documents.',

          status:
            'Completed',

          createdBy:
            'HR Administrator',

          createdAt:
            '2026-09-08T07:40:00',

          startedBy:
            'HR Administrator',

          startedAt:
            '2026-09-08T09:03:00',

          completedBy:
            'HR Administrator',

          completedAt:
            '2026-09-08T10:56:00',
        },
      ],
    )

  /* =========================================================
     FILTERS
  ========================================================= */

  const search =
    ref('')

  const client =
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

  const clientOptions =
    computed(() => {
      return [
        ...new Set(
          trips.value.map(
            trip =>
              trip.client,
          ),
        ),
      ].sort()
    })

  const statusOptions:
    TripStatus[] = [
      'Pending',
      'Ongoing',
      'Completed',
      'Cancelled',
    ]

  const purposeOptions:
    TripPurpose[] = [
      'Client Service',
      'Delivery',
      'Pickup',
      'Official Business',
      'Site Visit',
      'Other',
    ]

  /* =========================================================
     FILTERED
  ========================================================= */

  const filteredTrips =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return trips.value.filter(
        trip => {
          const matchesSearch =
            !keyword ||
            trip.tripNumber
              .toLowerCase()
              .includes(keyword) ||
            trip.employeeName
              .toLowerCase()
              .includes(keyword) ||
            trip.employeeNumber
              .toLowerCase()
              .includes(keyword) ||
            trip.destination
              .toLowerCase()
              .includes(keyword)

          const matchesClient =
            !client.value ||
            trip.client ===
              client.value

          const matchesStatus =
            !status.value ||
            trip.status ===
              status.value

          const matchesFrom =
            !dateFrom.value ||
            trip.tripDate >=
              dateFrom.value

          const matchesTo =
            !dateTo.value ||
            trip.tripDate <=
              dateTo.value

          return (
            matchesSearch &&
            matchesClient &&
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
          trips.value.filter(
            trip =>
              trip.tripDate ===
              today,
          ).length,

        ongoing:
          trips.value.filter(
            trip =>
              trip.status ===
              'Ongoing',
          ).length,

        completed:
          trips.value.filter(
            trip =>
              trip.status ===
              'Completed',
          ).length,

        pending:
          trips.value.filter(
            trip =>
              trip.status ===
              'Pending',
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
          filteredTrips
            .value.length /
            perPage.value,
        ),
      )
    })

  const paginatedTrips =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredTrips
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
        !filteredTrips
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

        filteredTrips
          .value.length,
      )
    })

  /* =========================================================
     CREATE
  ========================================================= */

  const createTrip = (
    data:
      ManageTripFormData,
  ) => {
    if (
      data.employeeId ===
      null
    ) {
      return null
    }

    const employee =
      employees.value.find(
        employee =>
          employee.id ===
          data.employeeId,
      )

    if (!employee) {
      return null
    }

    const nextId =
      trips.value.length
        ? Math.max(
            ...trips.value.map(
              trip =>
                trip.id,
            ),
          ) + 1
        : 1

    const year =
      new Date()
        .getFullYear()

    const employeeName =
      [
        employee.firstName,
        employee.middleName,
        employee.lastName,
      ]
        .filter(Boolean)
        .join(' ')

    const trip:
      ManageTrip = {
        id:
          nextId,

        tripNumber:
          `TRP-${year}-${String(
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

        client:
          data.client,

        origin:
          data.origin,

        destination:
          data.destination,

        tripDate:
          data.tripDate,

        purpose:
          data.purpose,

        expectedDeparture:
          data.expectedDeparture,

        expectedReturn:
          data.expectedReturn,

        vehicle:
          data.vehicle,

        plateNumber:
          data.plateNumber,

        tripTicketNumber:
          data.tripTicketNumber ||
          undefined,

        notes:
          data.notes ||
          undefined,

        status:
          'Pending',

        createdBy:
          'Maria Santos',

        createdAt:
          new Date()
            .toISOString(),
      }

    trips.value.unshift(
      trip,
    )

    return trip
  }

  /* =========================================================
     UPDATE
  ========================================================= */

  const updateTrip = (
    id: number,
    data:
      ManageTripFormData,
  ) => {
    const trip =
      trips.value.find(
        item =>
          item.id === id,
      )

    if (!trip) {
      return null
    }

    if (
      data.employeeId !==
      null
    ) {
      const employee =
        employees.value.find(
          employee =>
            employee.id ===
            data.employeeId,
        )

      if (employee) {
        trip.employeeId =
          employee.id

        trip.employeeNumber =
          employee.employeeNumber

        trip.employeeName =
          [
            employee.firstName,
            employee.middleName,
            employee.lastName,
          ]
            .filter(Boolean)
            .join(' ')

        trip.department =
          employee.department

        trip.position =
          employee.position
      }
    }

    trip.client =
      data.client

    trip.origin =
      data.origin

    trip.destination =
      data.destination

    trip.tripDate =
      data.tripDate

    trip.purpose =
      data.purpose

    trip.expectedDeparture =
      data.expectedDeparture

    trip.expectedReturn =
      data.expectedReturn

    trip.vehicle =
      data.vehicle

    trip.plateNumber =
      data.plateNumber

    trip.tripTicketNumber =
      data.tripTicketNumber ||
      undefined

    trip.notes =
      data.notes ||
      undefined

    return trip
  }

  /* =========================================================
     START
  ========================================================= */

  const startTrip = (
    id: number,
    actualDeparture: string,
    notes?: string,
  ) => {
    const trip =
      trips.value.find(
        item =>
          item.id === id,
      )

    if (!trip) {
      return null
    }

    trip.status =
      'Ongoing'

    trip.actualDeparture =
      actualDeparture

    trip.startedBy =
      'Maria Santos'

    trip.startedAt =
      new Date()
        .toISOString()

    if (notes) {
      trip.notes =
        notes
    }

    return trip
  }

  /* =========================================================
     COMPLETE
  ========================================================= */

  const completeTrip = (
    id: number,
    actualReturn: string,
    notes?: string,
  ) => {
    const trip =
      trips.value.find(
        item =>
          item.id === id,
      )

    if (!trip) {
      return null
    }

    trip.status =
      'Completed'

    trip.actualReturn =
      actualReturn

    trip.completedBy =
      'Maria Santos'

    trip.completedAt =
      new Date()
        .toISOString()

    if (notes) {
      trip.notes =
        notes
    }

    return trip
  }

  /* =========================================================
     CANCEL
  ========================================================= */

  const cancelTrip = (
    id: number,
    reason: string,
  ) => {
    const trip =
      trips.value.find(
        item =>
          item.id === id,
      )

    if (!trip) {
      return null
    }

    trip.status =
      'Cancelled'

    trip.cancelledBy =
      'Maria Santos'

    trip.cancelledAt =
      new Date()
        .toISOString()

    trip.cancellationReason =
      reason

    return trip
  }

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    search.value = ''

    client.value = ''

    status.value = ''

    dateFrom.value = ''

    dateTo.value = ''

    currentPage.value =
      1
  }

  watch(
    [
      search,
      client,
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
    trips,

    search,
    client,
    status,
    dateFrom,
    dateTo,

    currentPage,
    perPage,

    filteredTrips,
    paginatedTrips,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    clientOptions,
    statusOptions,
    purposeOptions,

    createTrip,
    updateTrip,

    startTrip,
    completeTrip,
    cancelTrip,

    resetFilters,
  }
}