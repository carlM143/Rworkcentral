import type {
  TripTicket,
  TripTicketAction,
  TripTicketFormData,
  TripTicketStatus,
} from '~/types/tripTicket'

export const useTripTickets = () => {
  const {
    trips,
  } = useManageTrips()

  /* =========================================================
     MOCK DATA
  ========================================================= */

  const tickets =
    useState<
      TripTicket[]
    >(
      'trip-tickets',
      () => [
        {
          id: 1,

          ticketNumber:
            'TT-2026-001',

          tripId: 1,
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

          vehicle:
            'Toyota Hiace',

          plateNumber:
            'ABC 1234',

          expectedDeparture:
            '08:00',

          actualDeparture:
            '08:06',

          expectedReturn:
            '12:00',

          status:
            'In Use',

          notes:
            'Delivery of client documents and supplies.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-11T07:15:00',

          issuedBy:
            'Maria Santos',

          issuedAt:
            '2026-09-11T07:30:00',

          inUseBy:
            'Maria Santos',

          inUseAt:
            '2026-09-11T08:06:00',
        },

        {
          id: 2,

          ticketNumber:
            'TT-2026-002',

          tripId: 2,
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

          vehicle:
            'Toyota Innova',

          plateNumber:
            'DEF 5678',

          expectedDeparture:
            '09:30',

          expectedReturn:
            '11:30',

          status:
            'Issued',

          notes:
            'Pickup signed billing documents.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-11T07:35:00',

          issuedBy:
            'Maria Santos',

          issuedAt:
            '2026-09-11T08:00:00',
        },

        {
          id: 3,

          ticketNumber:
            'TT-2026-003',

          tripId: 3,
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

          vehicle:
            'Mitsubishi L300',

          plateNumber:
            'GHI 9012',

          expectedDeparture:
            '07:00',

          actualDeparture:
            '07:05',

          expectedReturn:
            '10:30',

          actualReturn:
            '10:22',

          status:
            'Completed',

          notes:
            'Client service and document turnover.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-10T16:00:00',

          issuedBy:
            'Maria Santos',

          issuedAt:
            '2026-09-11T06:40:00',

          inUseBy:
            'Maria Santos',

          inUseAt:
            '2026-09-11T07:05:00',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-09-11T10:22:00',
        },

        {
          id: 4,

          ticketNumber:
            'TT-2026-004',

          tripId: 4,
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

          vehicle:
            'Toyota Hilux',

          plateNumber:
            'JKL 3456',

          expectedDeparture:
            '13:00',

          actualDeparture:
            '13:08',

          expectedReturn:
            '16:00',

          actualReturn:
            '15:48',

          status:
            'Completed',

          notes:
            'Operational site inspection.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-10T09:00:00',

          issuedBy:
            'Maria Santos',

          issuedAt:
            '2026-09-10T12:30:00',

          inUseBy:
            'Maria Santos',

          inUseAt:
            '2026-09-10T13:08:00',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-09-10T15:48:00',
        },

        {
          id: 5,

          ticketNumber:
            'TT-2026-005',

          tripId: 5,
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

          vehicle:
            'Toyota Vios',

          plateNumber:
            'MNO 7890',

          expectedDeparture:
            '10:00',

          actualDeparture:
            '10:05',

          expectedReturn:
            '12:00',

          actualReturn:
            '11:52',

          status:
            'Completed',

          notes:
            'Bank transaction and payroll document submission.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-10T08:00:00',

          issuedBy:
            'Maria Santos',

          issuedAt:
            '2026-09-10T09:30:00',

          inUseBy:
            'Maria Santos',

          inUseAt:
            '2026-09-10T10:05:00',

          completedBy:
            'Maria Santos',

          completedAt:
            '2026-09-10T11:52:00',
        },

        {
          id: 6,

          ticketNumber:
            'TT-2026-006',

          tripId: 6,
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

          vehicle:
            'Toyota Hiace',

          plateNumber:
            'ABC 1234',

          expectedDeparture:
            '08:30',

          expectedReturn:
            '12:30',

          status:
            'Pending',

          notes:
            'Scheduled delivery for next working day.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-11T08:20:00',
        },

        {
          id: 7,

          ticketNumber:
            'TT-2026-007',

          tripId: 7,
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

          vehicle:
            'Toyota Vios',

          plateNumber:
            'MNO 7890',

          expectedDeparture:
            '14:00',

          expectedReturn:
            '16:00',

          status:
            'Cancelled',

          notes:
            'Client meeting was rescheduled.',

          createdBy:
            'Maria Santos',

          createdAt:
            '2026-09-09T10:00:00',

          cancelledBy:
            'Maria Santos',

          cancelledAt:
            '2026-09-09T12:00:00',

          cancellationReason:
            'Client requested to move the meeting to another date.',
        },

        {
          id: 8,

          ticketNumber:
            'TT-2026-008',

          tripId: 8,
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

          vehicle:
            'Toyota Innova',

          plateNumber:
            'DEF 5678',

          expectedDeparture:
            '09:00',

          actualDeparture:
            '09:03',

          expectedReturn:
            '11:00',

          actualReturn:
            '10:56',

          status:
            'Completed',

          notes:
            'Submission of government compliance documents.',

          createdBy:
            'HR Administrator',

          createdAt:
            '2026-09-08T07:35:00',

          issuedBy:
            'HR Administrator',

          issuedAt:
            '2026-09-08T08:30:00',

          inUseBy:
            'HR Administrator',

          inUseAt:
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
          tickets.value.map(
            ticket =>
              ticket.client,
          ),
        ),
      ].sort()
    })

  const statusOptions:
    TripTicketStatus[] = [
      'Pending',
      'Issued',
      'In Use',
      'Completed',
      'Cancelled',
    ]

  /* =========================================================
     FILTERED
  ========================================================= */

  const filteredTickets =
    computed(() => {
      const keyword =
        search.value
          .trim()
          .toLowerCase()

      return tickets.value.filter(
        ticket => {
          const matchesSearch =
            !keyword ||
            ticket.ticketNumber
              .toLowerCase()
              .includes(keyword) ||
            ticket.tripNumber
              .toLowerCase()
              .includes(keyword) ||
            ticket.employeeName
              .toLowerCase()
              .includes(keyword) ||
            ticket.employeeNumber
              .toLowerCase()
              .includes(keyword)

          const matchesClient =
            !client.value ||
            ticket.client ===
              client.value

          const matchesStatus =
            !status.value ||
            ticket.status ===
              status.value

          const matchesFrom =
            !dateFrom.value ||
            ticket.tripDate >=
              dateFrom.value

          const matchesTo =
            !dateTo.value ||
            ticket.tripDate <=
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
      return {
        total:
          tickets.value.length,

        pending:
          tickets.value.filter(
            ticket =>
              ticket.status ===
              'Pending',
          ).length,

        inUse:
          tickets.value.filter(
            ticket =>
              ticket.status ===
              'In Use',
          ).length,

        completed:
          tickets.value.filter(
            ticket =>
              ticket.status ===
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
          filteredTickets.value.length /
            perPage.value,
        ),
      )
    })

  const paginatedTickets =
    computed(() => {
      const start =
        (
          currentPage.value -
          1
        ) *
        perPage.value

      return filteredTickets.value.slice(
        start,
        start +
          perPage.value,
      )
    })

  const showingFrom =
    computed(() => {
      if (
        !filteredTickets
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

        filteredTickets
          .value.length,
      )
    })

  /* =========================================================
     CREATE
  ========================================================= */

  const createTicket = (
    data:
      TripTicketFormData,
  ) => {
    if (
      data.tripId ===
      null
    ) {
      return null
    }

    const trip =
      trips.value.find(
        item =>
          item.id ===
          data.tripId,
      )

    if (!trip) {
      return null
    }

    const duplicate =
      tickets.value.find(
        ticket =>
          ticket.tripId ===
            trip.id &&
          ticket.status !==
            'Cancelled',
      )

    if (duplicate) {
      return null
    }

    const nextId =
      tickets.value.length
        ? Math.max(
            ...tickets.value.map(
              ticket =>
                ticket.id,
            ),
          ) + 1
        : 1

    const year =
      new Date()
        .getFullYear()

    const ticket:
      TripTicket = {
        id:
          nextId,

        ticketNumber:
          `TT-${year}-${String(
            nextId,
          ).padStart(
            3,
            '0',
          )}`,

        tripId:
          trip.id,

        tripNumber:
          trip.tripNumber,

        employeeId:
          trip.employeeId,

        employeeNumber:
          trip.employeeNumber,

        employeeName:
          trip.employeeName,

        department:
          trip.department,

        position:
          trip.position,

        client:
          trip.client,

        origin:
          trip.origin,

        destination:
          trip.destination,

        tripDate:
          trip.tripDate,

        purpose:
          trip.purpose,

        vehicle:
          data.vehicle,

        plateNumber:
          data.plateNumber,

        expectedDeparture:
          trip.expectedDeparture,

        actualDeparture:
          trip.actualDeparture,

        expectedReturn:
          trip.expectedReturn,

        actualReturn:
          trip.actualReturn,

        status:
          'Pending',

        notes:
          data.notes ||
          undefined,

        createdBy:
          'Maria Santos',

        createdAt:
          new Date()
            .toISOString(),
      }

    tickets.value.unshift(
      ticket,
    )

    return ticket
  }

  /* =========================================================
     UPDATE
  ========================================================= */

  const updateTicket = (
    id: number,
    data:
      TripTicketFormData,
  ) => {
    const ticket =
      tickets.value.find(
        item =>
          item.id === id,
      )

    if (!ticket) {
      return null
    }

    if (
      data.tripId ===
      null
    ) {
      return null
    }

    const trip =
      trips.value.find(
        item =>
          item.id ===
          data.tripId,
      )

    if (!trip) {
      return null
    }

    ticket.tripId =
      trip.id

    ticket.tripNumber =
      trip.tripNumber

    ticket.employeeId =
      trip.employeeId

    ticket.employeeNumber =
      trip.employeeNumber

    ticket.employeeName =
      trip.employeeName

    ticket.department =
      trip.department

    ticket.position =
      trip.position

    ticket.client =
      trip.client

    ticket.origin =
      trip.origin

    ticket.destination =
      trip.destination

    ticket.tripDate =
      trip.tripDate

    ticket.purpose =
      trip.purpose

    ticket.expectedDeparture =
      trip.expectedDeparture

    ticket.expectedReturn =
      trip.expectedReturn

    ticket.vehicle =
      data.vehicle

    ticket.plateNumber =
      data.plateNumber

    ticket.notes =
      data.notes ||
      undefined

    return ticket
  }

  /* =========================================================
     ISSUE
  ========================================================= */

  const issueTicket = (
    id: number,
    notes?: string,
  ) => {
    const ticket =
      tickets.value.find(
        item =>
          item.id === id,
      )

    if (!ticket) {
      return null
    }

    ticket.status =
      'Issued'

    ticket.issuedBy =
      'Maria Santos'

    ticket.issuedAt =
      new Date()
        .toISOString()

    if (notes) {
      ticket.notes =
        notes
    }

    return ticket
  }

  /* =========================================================
     IN USE
  ========================================================= */

  const markTicketInUse = (
    id: number,
    time: string,
    notes?: string,
  ) => {
    const ticket =
      tickets.value.find(
        item =>
          item.id === id,
      )

    if (!ticket) {
      return null
    }

    ticket.status =
      'In Use'

    ticket.actualDeparture =
      time

    ticket.inUseBy =
      'Maria Santos'

    ticket.inUseAt =
      new Date()
        .toISOString()

    if (notes) {
      ticket.notes =
        notes
    }

    return ticket
  }

  /* =========================================================
     COMPLETE
  ========================================================= */

  const completeTicket = (
    id: number,
    time: string,
    notes?: string,
  ) => {
    const ticket =
      tickets.value.find(
        item =>
          item.id === id,
      )

    if (!ticket) {
      return null
    }

    ticket.status =
      'Completed'

    ticket.actualReturn =
      time

    ticket.completedBy =
      'Maria Santos'

    ticket.completedAt =
      new Date()
        .toISOString()

    if (notes) {
      ticket.notes =
        notes
    }

    return ticket
  }

  /* =========================================================
     CANCEL
  ========================================================= */

  const cancelTicket = (
    id: number,
    reason: string,
  ) => {
    const ticket =
      tickets.value.find(
        item =>
          item.id === id,
      )

    if (!ticket) {
      return null
    }

    ticket.status =
      'Cancelled'

    ticket.cancelledBy =
      'Maria Santos'

    ticket.cancelledAt =
      new Date()
        .toISOString()

    ticket.cancellationReason =
      reason

    return ticket
  }

  /* =========================================================
     AVAILABLE TRIPS
  ========================================================= */

  const getAvailableTrips = (
    currentTicketId?: number,
  ) => {
    return trips.value.filter(
      trip => {
        return !tickets.value.some(
          ticket =>
            ticket.tripId ===
              trip.id &&
            ticket.status !==
              'Cancelled' &&
            ticket.id !==
              currentTicketId,
        )
      },
    )
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
    tickets,

    search,
    client,
    status,
    dateFrom,
    dateTo,

    currentPage,
    perPage,

    filteredTickets,
    paginatedTickets,

    totalPages,
    showingFrom,
    showingTo,

    stats,

    clientOptions,
    statusOptions,

    createTicket,
    updateTicket,

    issueTicket,
    markTicketInUse,
    completeTicket,
    cancelTicket,

    getAvailableTrips,

    resetFilters,
  }
}