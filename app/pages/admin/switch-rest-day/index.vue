<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  Plus,
} from 'lucide-vue-next'

import SwitchRestDayStats from '~/components/admin/timekeeping/switch-rest-day/SwitchRestDayStats.vue'
import SwitchRestDayFilters from '~/components/admin/timekeeping/switch-rest-day/SwitchRestDayFilters.vue'
import SwitchRestDayTable from '~/components/admin/timekeeping/switch-rest-day/SwitchRestDayTable.vue'
import SwitchRestDayDetailsModal from '~/components/admin/timekeeping/switch-rest-day/SwitchRestDayDetailsModal.vue'
import SwitchRestDayStatusModal from '~/components/admin/timekeeping/switch-rest-day/SwitchRestDayStatusModal.vue'

import type {
  SwitchRestDayAction,
  SwitchRestDayRecord,
  SwitchRestDayStatusFormData,
} from '~/types/switchRestDay'

const router =
  useRouter()


const {
  search,
  department,
  status,
  dateFrom,
  dateTo,

  currentPage,
  filteredRequests,
  paginatedRequests,
  totalPages,
  showingFrom,
  showingTo,

  stats,
  departmentOptions,
  statusOptions,

  loading,
  loadError,
  actionError,
  loadRequests,

  approveRequest,
  rejectRequest,
  cancelRequest,

  resetFilters,
} = useSwitchRestDays()

const {
  info,
  success,
} = useToast()

const handleAdd = async () => {
  await router.push('/admin/switch-rest-day/create')
}

const handleEdit = async (record: SwitchRestDayRecord) => {
  if (record.status !== 'Pending') {
    info(
      'Cannot Edit Request',
      'Only pending rest day switch requests can be edited.',
    )
    return
  }

  await router.push(`/admin/switch-rest-day/${record.id}/edit`)
}

const detailsOpen =
  ref(false)

const selectedRecord =
  ref<
    SwitchRestDayRecord |
    null
  >(null)

const handleView = (
  record:
    SwitchRestDayRecord,
) => {
  selectedRecord.value =
    record

  detailsOpen.value =
    true
}

const closeDetails = () => {
  detailsOpen.value =
    false

  selectedRecord.value =
    null
}

/* =========================================================
   STATUS
========================================================= */

const statusModalOpen =
  ref(false)

const statusRecord =
  ref<
    SwitchRestDayRecord |
    null
  >(null)

const statusAction =
  ref<
    SwitchRestDayAction
  >('approve')

const openStatusModal = (
  record:
    SwitchRestDayRecord,
  action:
    SwitchRestDayAction,
) => {
  statusRecord.value =
    record

  statusAction.value =
    action

  statusModalOpen.value =
    true
}

const closeStatusModal = () => {
  statusModalOpen.value =
    false

  statusRecord.value =
    null
}

/* =========================================================
   APPROVE
========================================================= */

const handleApprove = (
  record:
    SwitchRestDayRecord,
) => {
  openStatusModal(
    record,
    'approve',
  )
}

/* =========================================================
   REJECT
========================================================= */

const handleReject = (
  record:
    SwitchRestDayRecord,
) => {
  openStatusModal(
    record,
    'reject',
  )
}

/* =========================================================
   CANCEL
========================================================= */

const handleCancel = (
  record:
    SwitchRestDayRecord,
) => {
  openStatusModal(
    record,
    'cancel',
  )
}

/* =========================================================
   STATUS SAVE
========================================================= */


const handleStatusSave = async (
  data: SwitchRestDayStatusFormData,
) => {
  const action = data.action

  const record = action === 'approve'
    ? await approveRequest(data.requestId, data.notes)
    : action === 'reject'
      ? await rejectRequest(data.requestId, data.notes)
      : await cancelRequest(data.requestId, data.notes)

  if (!record) {
    info(
      'Unable to Update Request',
      actionError.value || 'Please try again.',
    )
    return
  }

  closeStatusModal()

  const titles = {
    approve: 'Request Approved',
    reject: 'Request Rejected',
    cancel: 'Request Cancelled',
  }

  success(
    titles[action],
    `${record.requestNumber} has been ${record.status.toLowerCase()}.`,
  )
}

/* =========================================================
   VIEW EMPLOYEE
========================================================= */

const handleEmployee = (
  record:
    SwitchRestDayRecord,
) => {
  router.push(
    `/admin/employees/${record.employeeId}`,
  )
}

/* =========================================================
   VIEW WORK SCHEDULE
========================================================= */


const handleSchedule = (record: SwitchRestDayRecord) => {
  router.push({
    path: '/admin/work-schedules',
    query: {
      employee: record.employeeNumber,
    },
  })
}
/* =========================================================
   EXPORT
========================================================= */

const handleExport = () => {
  info(
    'Export Switch Rest Day',
    'Rest day switch report export will be connected later.',
  )
}

/* =========================================================
   BACK
========================================================= */

const handleBack = () => {
  router.push('/admin/work-schedules')
}
</script>

<template>
  <section class="switch-rest-day-page">

    <!-- BACK -->

    <button
      type="button"
      class="back-button"
      @click="
        handleBack
      "
    >
      <ArrowLeft :size="15" />

      Back to Work Schedules
    </button>

    <!-- HEADER -->

    <PageHeader
      title="Switch Rest Day"
      description="Manage employee requests to temporarily change their scheduled rest day."
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
          Request Rest Day Switch
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <SwitchRestDayStats
      :stats="
        stats
      "
    />
    
    <div
      v-if="loadError"
      class="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400"
    >
      {{ loadError }}

      <button
        type="button"
        class="ml-2 font-semibold underline"
        @click="loadRequests"
      >
        Retry
      </button>
    </div>

    <div
      v-if="loading"
      class="mb-3 flex items-center gap-2 text-xs text-blue-400"
    >
      <span class="h-3 w-3 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
      Loading rest day switch requests...
    </div>

    <!-- FILTERS -->

    <SwitchRestDayFilters
      v-model:search="
        search
      "
      v-model:department="
        department
      "
      v-model:status="
        status
      "
      v-model:date-from="
        dateFrom
      "
      v-model:date-to="
        dateTo
      "
      :departments="
        departmentOptions
      "
      :statuses="
        statusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <SwitchRestDayTable
      :records="
        paginatedRequests
      "
      @view="
        handleView
      "
      @edit="
        handleEdit
      "
      @approve="
        handleApprove
      "
      @reject="
        handleReject
      "
      @employee="
        handleEmployee
      "
      @schedule="
        handleSchedule
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
            filteredRequests.length
          }}
        </strong>

        rest day switch requests
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
    
    <SwitchRestDayDetailsModal
      :open="
        detailsOpen
      "
      :record="
        selectedRecord
      "
      @close="
        closeDetails
      "
    />

    <!-- STATUS -->

    <SwitchRestDayStatusModal
      :open="
        statusModalOpen
      "
      :record="
        statusRecord
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

  </section>
</template>

<style scoped>
.switch-rest-day-page {
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

  font-family:
    inherit;

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

    align-items:
      stretch;

    flex-direction:
      column;
  }

  .table-footer {
    align-items:
      flex-start;

    flex-direction:
      column;
  }
}
</style>