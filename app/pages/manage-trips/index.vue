<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  Plus,
} from 'lucide-vue-next'

import ManageTripStats from '~/components/timekeeping/manage-trips/ManageTripStats.vue'
import ManageTripFilters from '~/components/timekeeping/manage-trips/ManageTripFilters.vue'
import ManageTripTable from '~/components/timekeeping/manage-trips/ManageTripTable.vue'
import AddEditTripModal from '~/components/timekeeping/manage-trips/AddEditTripModal.vue'
import TripDetailsModal from '~/components/timekeeping/manage-trips/TripDetailsModal.vue'
import TripStatusModal from '~/components/timekeeping/manage-trips/TripStatusModal.vue'
import TripTicketModal from '~/components/timekeeping/manage-trips/TripTicketModal.vue'
import ManageTripExportModal from '~/components/timekeeping/manage-trips/ManageTripExportModal.vue'

import type {
  ManageTrip,
  ManageTripFormData,
  TripStatusAction,
  TripStatusFormData,
} from '~/types/manageTrip'

const router =
  useRouter()

const route =
  useRoute()

const {
  employees,
} = useEmployees()

const {
  trips,

  search,
  client,
  status,
  dateFrom,
  dateTo,

  currentPage,

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
} = useManageTrips()

const {
  info,
  success,
} = useToast()

const exportModalOpen = ref(false)

const formModalOpen =
  ref(false)

const editingTrip =
  ref<
    ManageTrip |
    null
  >(null)

const handleAdd = () => {
  editingTrip.value =
    null

  formModalOpen.value =
    true
}

const handleEdit = (
  trip:
    ManageTrip,
) => {
  editingTrip.value =
    trip

  formModalOpen.value =
    true
}

const closeForm = () => {
  formModalOpen.value =
    false

  editingTrip.value =
    null
}

const handleSave = (
  data:
    ManageTripFormData,
) => {
  if (
    editingTrip.value
  ) {
    const updated =
      updateTrip(
        editingTrip.value.id,
        data,
      )

    if (!updated) {
      info(
        'Trip Not Found',
        'The selected trip could not be found.',
      )

      return
    }

    closeForm()

    success(
      'Trip Updated',
      `${updated.tripNumber} has been updated.`,
    )

    return
  }

  const created =
    createTrip(data)

  if (!created) {
    info(
      'Unable to Create Trip',
      'The selected employee could not be found.',
    )

    return
  }

  closeForm()

  success(
    'Trip Created',
    `${created.tripNumber} has been created successfully.`,
  )
}

/* =========================================================
   DETAILS
========================================================= */

const detailsOpen =
  ref(false)

const selectedTrip =
  ref<
    ManageTrip |
    null
  >(null)

/* =========================================================
   OPEN DETAILS FROM TABLE
========================================================= */

const handleView = (
  trip:
    ManageTrip,
) => {
  selectedTrip.value =
    trip

  detailsOpen.value =
    true
}

/* =========================================================
   OPEN DETAILS FROM ?trip= QUERY
========================================================= */

const openTripFromQuery = () => {
  const tripNumber =
    route.query.trip

  if (
    !tripNumber ||
    typeof tripNumber !== 'string'
  ) {
    return
  }

  const trip =
    trips.value.find(
      item =>
        item.tripNumber ===
        tripNumber,
    )

  if (!trip) {
    info(
      'Trip Not Found',
      `${tripNumber} could not be found.`,
    )

    const newQuery = {
      ...route.query,
    }

    delete newQuery.trip

    router.replace({
      query: newQuery,
    })

    return
  }

  selectedTrip.value =
    trip

  detailsOpen.value =
    true
}

/* =========================================================
   WATCH QUERY
========================================================= */

watch(
  () => route.query.trip,
  () => {
    openTripFromQuery()
  },
  {
    immediate: true,
  },
)

/* =========================================================
   CLOSE DETAILS
========================================================= */

const closeDetails =
  async () => {
    detailsOpen.value =
      false

    selectedTrip.value =
      null

    if (
      route.query.trip
    ) {
      const newQuery = {
        ...route.query,
      }

      delete newQuery.trip

      await router.replace({
        query: newQuery,
      })
    }
  }

/* =========================================================
   STATUS MODAL
========================================================= */

const statusModalOpen =
  ref(false)

const statusAction =
  ref<
    TripStatusAction
  >('start')

const statusTrip =
  ref<
    ManageTrip |
    null
  >(null)

const openStatusModal = (
  trip:
    ManageTrip,
  action:
    TripStatusAction,
) => {
  statusTrip.value =
    trip

  statusAction.value =
    action

  statusModalOpen.value =
    true
}

const closeStatusModal =
  () => {
    statusModalOpen.value =
      false

    statusTrip.value =
      null
  }

/* =========================================================
   START
========================================================= */

const handleStart = (
  trip:
    ManageTrip,
) => {
  openStatusModal(
    trip,
    'start',
  )
}

/* =========================================================
   COMPLETE
========================================================= */

const handleComplete = (
  trip:
    ManageTrip,
) => {
  openStatusModal(
    trip,
    'complete',
  )
}

/* =========================================================
   CANCEL
========================================================= */

const handleCancel = (
  trip:
    ManageTrip,
) => {
  openStatusModal(
    trip,
    'cancel',
  )
}

/* =========================================================
   STATUS SAVE
========================================================= */

const handleStatusSave = (
  data:
    TripStatusFormData,
) => {
  if (
    data.action ===
    'start'
  ) {
    const trip =
      startTrip(
        data.tripId,
        data.time ?? '',
        data.notes,
      )

    if (!trip) {
      return
    }

    closeStatusModal()

    success(
      'Trip Started',
      `${trip.tripNumber} is now ongoing.`,
    )

    return
  }

  if (
    data.action ===
    'complete'
  ) {
    const trip =
      completeTrip(
        data.tripId,
        data.time ?? '',
        data.notes,
      )

    if (!trip) {
      return
    }

    closeStatusModal()

    success(
      'Trip Completed',
      `${trip.tripNumber} has been completed.`,
    )

    return
  }

  const trip =
    cancelTrip(
      data.tripId,
      data.notes,
    )

  if (!trip) {
    return
  }

  closeStatusModal()

  success(
    'Trip Cancelled',
    `${trip.tripNumber} has been cancelled.`,
  )
}

/* =========================================================
   EMPLOYEE
========================================================= */

const handleEmployee = (
  trip:
    ManageTrip,
) => {
  router.push(
    `/employees/${trip.employeeId}`,
  )
}

/* =========================================================
   TRIP TICKET MODAL
========================================================= */

const ticketModalOpen =
  ref(false)

const ticketTrip =
  ref<
    ManageTrip |
    null
  >(null)

const handleTicket = (
  trip:
    ManageTrip,
) => {
  ticketTrip.value =
    trip

  ticketModalOpen.value =
    true
}

const closeTicketModal =
  () => {
    ticketModalOpen.value =
      false

    ticketTrip.value =
      null
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

    includeTripInfo:
      boolean

    includeEmployee:
      boolean

    includeClient:
      boolean

    includeRoute:
      boolean

    includeSchedule:
      boolean

    includeActualTimes:
      boolean

    includeDuration:
      boolean

    includeStatus:
      boolean
  },
) => {
  info(
    `Export ${payload.format}`,
    `${filteredTrips.value.length} trip record(s) are ready for export. Actual file generation will be connected during backend integration.`,
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
  <section class="manage-trips-page">

    <!-- =========================================
         BACK
    ========================================== -->

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

    <!-- =========================================
         HEADER
    ========================================== -->

    <PageHeader
      title="Manage Trips"
      description="Manage employee and driver trips, routes, schedules, vehicles and trip completion records."
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
          Create Trip
        </AppButton>

      </div>

    </PageHeader>

    <!-- =========================================
         STATS
    ========================================== -->

    <ManageTripStats
      :stats="stats"
    />

    <!-- =========================================
         FILTERS
    ========================================== -->

    <ManageTripFilters
      v-model:search="search"
      v-model:client="client"
      v-model:status="status"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :clients="clientOptions"
      :statuses="statusOptions"
      @reset="
        resetFilters
      "
    />

    <!-- =========================================
         TABLE
    ========================================== -->

    <ManageTripTable
      :trips="
        paginatedTrips
      "
      @view="
        handleView
      "
      @edit="
        handleEdit
      "
      @start="
        handleStart
      "
      @complete="
        handleComplete
      "
      @employee="
        handleEmployee
      "
      @ticket="
        handleTicket
      "
      @cancel="
        handleCancel
      "
    />

    <!-- =========================================
         PAGINATION
    ========================================== -->

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
            filteredTrips.length
          }}
        </strong>

        trip records
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

    <!-- =========================================
         ADD / EDIT MODAL
    ========================================== -->

    <AddEditTripModal
      :open="
        formModalOpen
      "
      :employees="
        employees
      "
      :trip="
        editingTrip
      "
      :purposes="
        purposeOptions
      "
      @close="
        closeForm
      "
      @save="
        handleSave
      "
    />

    <!-- =========================================
         TRIP DETAILS MODAL
    ========================================== -->

    <TripDetailsModal
      :open="
        detailsOpen
      "
      :trip="
        selectedTrip
      "
      @close="
        closeDetails
      "
    />

    <!-- =========================================
         TRIP STATUS MODAL
    ========================================== -->

    <TripStatusModal
      :open="
        statusModalOpen
      "
      :trip="
        statusTrip
      "
      :action="
        statusAction
      "
      @close="
        closeStatusModal
      "
      @save="
        handleStatusSave
      "
    />

    <TripTicketModal
      :open="
        ticketModalOpen
      "
      :trip="
        ticketTrip
      "
      @close="
        closeTicketModal
      "
    />

<!-- =========================================
     EXPORT MODAL
========================================== -->

<ManageTripExportModal
  :open="
    exportModalOpen
  "
  :record-count="
    filteredTrips.length
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
.manage-trips-page {
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

    flex-direction:
      column;

    align-items:
      stretch;
  }

  .table-footer {
    align-items:
      flex-start;

    flex-direction:
      column;
  }
}
</style>