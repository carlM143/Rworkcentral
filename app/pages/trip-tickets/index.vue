<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  Plus,
} from 'lucide-vue-next'

import TripTicketStats from '~/components/timekeeping/trip-tickets/TripTicketStats.vue'
import TripTicketFilters from '~/components/timekeeping/trip-tickets/TripTicketFilters.vue'
import TripTicketTable from '~/components/timekeeping/trip-tickets/TripTicketTable.vue'
import AddEditTripTicketModal from '~/components/timekeeping/trip-tickets/AddEditTripTicketModal.vue'
import TripTicketDetailsModal from '~/components/timekeeping/trip-tickets/TripTicketDetailsModal.vue'
import TripTicketStatusModal from '~/components/timekeeping/trip-tickets/TripTicketStatusModal.vue'

import TripTicketExportModal from '~/components/timekeeping/trip-tickets/TripTicketExportModal.vue'

import type {
  TripTicket,
  TripTicketAction,
  TripTicketFormData,
  TripTicketStatusFormData,
} from '~/types/tripTicket'

const router =
  useRouter()

const {
  trips,
} = useManageTrips()

const {
  search,
  client,
  status,
  dateFrom,
  dateTo,

  currentPage,

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
} = useTripTickets()

const {
  info,
  success,
} = useToast()

const exportModalOpen =
  ref(false)

const formModalOpen =
  ref(false)

const editingTicket =
  ref<
    TripTicket |
    null
  >(null)

const availableTrips =
  computed(() => {
    return getAvailableTrips(
      editingTicket.value?.id,
    )
  })

const handleAdd = () => {
  editingTicket.value =
    null

  formModalOpen.value =
    true
}

const handleEdit = (
  ticket:
    TripTicket,
) => {
  editingTicket.value =
    ticket

  formModalOpen.value =
    true
}

const closeForm = () => {
  formModalOpen.value =
    false

  editingTicket.value =
    null
}

/* =========================================================
   SAVE
========================================================= */

const handleSave = (
  data:
    TripTicketFormData,
) => {
  if (
    editingTicket.value
  ) {
    const updated =
      updateTicket(
        editingTicket.value.id,
        data,
      )

    if (!updated) {
      info(
        'Unable to Update',
        'The selected trip ticket could not be updated.',
      )

      return
    }

    closeForm()

    success(
      'Trip Ticket Updated',
      `${updated.ticketNumber} has been updated.`,
    )

    return
  }

  const created =
    createTicket(data)

  if (!created) {
    info(
      'Unable to Create Ticket',
      'The selected trip may already have an active trip ticket.',
    )

    return
  }

  closeForm()

  success(
    'Trip Ticket Created',
    `${created.ticketNumber} has been created successfully.`,
  )
}

/* =========================================================
   DETAILS
========================================================= */

const detailsOpen =
  ref(false)

const selectedTicket =
  ref<
    TripTicket |
    null
  >(null)

const handleView = (
  ticket:
    TripTicket,
) => {
  selectedTicket.value =
    ticket

  detailsOpen.value =
    true
}

const closeDetails = () => {
  detailsOpen.value =
    false

  selectedTicket.value =
    null
}

/* =========================================================
   STATUS
========================================================= */

const statusModalOpen =
  ref(false)

const statusTicket =
  ref<
    TripTicket |
    null
  >(null)

const statusAction =
  ref<
    TripTicketAction
  >('issue')

const openStatus = (
  ticket:
    TripTicket,
  action:
    TripTicketAction,
) => {
  statusTicket.value =
    ticket

  statusAction.value =
    action

  statusModalOpen.value =
    true
}

const closeStatus = () => {
  statusModalOpen.value =
    false

  statusTicket.value =
    null
}

/* =========================================================
   ISSUE
========================================================= */

const handleIssue = (
  ticket:
    TripTicket,
) => {
  openStatus(
    ticket,
    'issue',
  )
}

/* =========================================================
   IN USE
========================================================= */

const handleInUse = (
  ticket:
    TripTicket,
) => {
  openStatus(
    ticket,
    'inUse',
  )
}

/* =========================================================
   COMPLETE
========================================================= */

const handleComplete = (
  ticket:
    TripTicket,
) => {
  openStatus(
    ticket,
    'complete',
  )
}

/* =========================================================
   CANCEL
========================================================= */

const handleCancel = (
  ticket:
    TripTicket,
) => {
  openStatus(
    ticket,
    'cancel',
  )
}

/* =========================================================
   STATUS SAVE
========================================================= */

const handleStatusSave = (
  data:
    TripTicketStatusFormData,
) => {
  if (
    data.action ===
    'issue'
  ) {
    const ticket =
      issueTicket(
        data.ticketId,
        data.notes,
      )

    if (!ticket) {
      return
    }

    closeStatus()

    success(
      'Ticket Issued',
      `${ticket.ticketNumber} has been issued.`,
    )

    return
  }

  if (
    data.action ===
    'inUse'
  ) {
    const ticket =
      markTicketInUse(
        data.ticketId,
        data.time ?? '',
        data.notes,
      )

    if (!ticket) {
      return
    }

    closeStatus()

    success(
      'Ticket In Use',
      `${ticket.ticketNumber} is now in use.`,
    )

    return
  }

  if (
    data.action ===
    'complete'
  ) {
    const ticket =
      completeTicket(
        data.ticketId,
        data.time ?? '',
        data.notes,
      )

    if (!ticket) {
      return
    }

    closeStatus()

    success(
      'Ticket Completed',
      `${ticket.ticketNumber} has been completed.`,
    )

    return
  }

  const ticket =
    cancelTicket(
      data.ticketId,
      data.notes,
    )

  if (!ticket) {
    return
  }

  closeStatus()

  success(
    'Ticket Cancelled',
    `${ticket.ticketNumber} has been cancelled.`,
  )
}

/* =========================================================
   VIEW TRIP
========================================================= */

const handleTrip = (
  ticket:
    TripTicket,
) => {
  router.push({
    path:
      '/manage-trips',

    query: {
      trip:
        ticket.tripNumber,
    },
  })
}

/* =========================================================
   VIEW EMPLOYEE
========================================================= */

const handleEmployee = (
  ticket:
    TripTicket,
) => {
  router.push(
    `/employees/${ticket.employeeId}`,
  )
}

/* =========================================================
   EXPORT
========================================================= */

const handleExport = () => {
  exportModalOpen.value =
    true
}

const handleExportSubmit = (
  payload: {
    format:
      | 'Excel'
      | 'PDF'
      | 'CSV'

    scope:
      | 'Current Filters'
      | 'Selected Date Range'

    includeTicketInfo:
      boolean

    includeTripInfo:
      boolean

    includeEmployee:
      boolean

    includeClient:
      boolean

    includeRoute:
      boolean

    includeVehicle:
      boolean

    includeSchedule:
      boolean

    includeActualTimes:
      boolean

    includeStatus:
      boolean
  },
) => {
  info(
    `Export ${payload.format}`,
    `${filteredTickets.value.length} trip ticket record(s) are ready for export. Actual file generation will be connected during backend integration.`,
  )
}

/* =========================================================
   BACK
========================================================= */

const handleBack = () => {
  router.push(
    '/timekeeping',
  )
}
</script>

<template>
  <section class="trip-tickets-page">

    <!-- BACK -->

    <button
      type="button"
      class="back-button"
      @click="
        handleBack
      "
    >
      <ArrowLeft :size="15" />

      Back to Timekeeping
    </button>

    <!-- HEADER -->

    <PageHeader
      title="Trip Tickets"
      description="Manage trip tickets, assigned employees, vehicles, issuance and completion status."
    >

      <div class="header-actions">

        <AppButton
          variant="secondary"
          :icon="Download"
          @click="
            handleExport
          "
        >
          Export
        </AppButton>

        <AppButton
          :icon="Plus"
          @click="
            handleAdd
          "
        >
          Create Trip Ticket
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <TripTicketStats
      :stats="stats"
    />

    <!-- FILTER -->

    <TripTicketFilters
      v-model:search="search"
      v-model:client="client"
      v-model:status="status"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :clients="
        clientOptions
      "
      :statuses="
        statusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <TripTicketTable
      :tickets="
        paginatedTickets
      "
      @view="
        handleView
      "
      @edit="
        handleEdit
      "
      @issue="
        handleIssue
      "
      @in-use="
        handleInUse
      "
      @complete="
        handleComplete
      "
      @trip="
        handleTrip
      "
      @employee="
        handleEmployee
      "
      @cancel="
        handleCancel
      "
    />

    <!-- PAGINATION -->

    <div class="table-footer">

      <p>
        Showing

        <strong>
          {{
            showingFrom
          }}–{{
            showingTo
          }}
        </strong>

        of

        <strong>
          {{
            filteredTickets.length
          }}
        </strong>

        trip tickets
      </p>

      <AppPagination
        v-model="
          currentPage
        "
        :total-pages="
          totalPages
        "
      />

    </div>

    <!-- ADD / EDIT -->

    <AddEditTripTicketModal
      :open="
        formModalOpen
      "
      :ticket="
        editingTicket
      "
      :trips="
        availableTrips
      "
      @close="
        closeForm
      "
      @save="
        handleSave
      "
    />

    <!-- DETAILS -->

    <TripTicketDetailsModal
      :open="
        detailsOpen
      "
      :ticket="
        selectedTicket
      "
      @close="
        closeDetails
      "
    />

    <!-- STATUS -->

<TripTicketStatusModal
  :open="
    statusModalOpen
  "
  :ticket="
    statusTicket
  "
  :action="
    statusAction
  "
  @close="
    closeStatus
  "
  @save="
    handleStatusSave
  "
/>

<!-- EXPORT MODAL -->

<TripTicketExportModal
  :open="
    exportModalOpen
  "
  :record-count="
    filteredTickets.length
  "
  :client="
    client
  "
  :status="
    status
  "
  :date-from="
    dateFrom
  "
  :date-to="
    dateTo
  "
  @close="
    exportModalOpen = false
  "
  @export="
    handleExportSubmit
  "
/>

  </section>
</template>

<style scoped>
.trip-tickets-page {
  width: 100%;

  max-width: 1660px;

  margin:
    0 auto;
}

.back-button {
  display: inline-flex;

  align-items: center;

  gap: 6px;

  margin-bottom: 10px;

  padding: 0;

  border: 0;

  background:
    transparent;

  color:
    var(--primary);

  font-family: inherit;

  font-size: 10px;
  font-weight: 600;

  cursor: pointer;
}

.back-button:hover {
  color:
    var(--primary-dark);
}

.header-actions {
  display: flex;

  align-items: center;

  gap: 8px;
}

.table-footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 20px;

  padding:
    13px 3px 0;
}

.table-footer p {
  margin: 0;

  color:
    var(--text-muted);

  font-size: 10px;
}

.table-footer strong {
  color:
    var(--text-primary);

  font-weight: 650;
}

@media (max-width: 650px) {
  .header-actions {
    width: 100%;

    align-items: stretch;

    flex-direction: column;
  }

  .table-footer {
    align-items:
      flex-start;

    flex-direction:
      column;
  }
}
</style>