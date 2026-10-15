<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  Plus,
} from 'lucide-vue-next'

import SwitchRestDayStats from '~/components/timekeeping/switch-rest-day/SwitchRestDayStats.vue'
import SwitchRestDayFilters from '~/components/timekeeping/switch-rest-day/SwitchRestDayFilters.vue'
import SwitchRestDayTable from '~/components/timekeeping/switch-rest-day/SwitchRestDayTable.vue'
import AddEditSwitchRestDayModal from '~/components/timekeeping/switch-rest-day/AddEditSwitchRestDayModal.vue'
import SwitchRestDayDetailsModal from '~/components/timekeeping/switch-rest-day/SwitchRestDayDetailsModal.vue'
import SwitchRestDayStatusModal from '~/components/timekeeping/switch-rest-day/SwitchRestDayStatusModal.vue'

import type {
  SwitchRestDayAction,
  SwitchRestDayFormData,
  SwitchRestDayRecord,
  SwitchRestDayStatusFormData,
} from '~/types/switchRestDay'

const router =
  useRouter()

const {
  employees,
} = useEmployees()

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
  restDayOptions,

  getScheduleInfo,
  getEffectiveWeek,

  createRequest,
  updateRequest,

  approveRequest,
  rejectRequest,
  cancelRequest,

  resetFilters,
} = useSwitchRestDays()

const {
  info,
  success,
} = useToast()

/* =========================================================
   ADD / EDIT
========================================================= */

const formModalOpen =
  ref(false)

const editingRecord =
  ref<
    SwitchRestDayRecord |
    null
  >(null)

const handleAdd = () => {
  editingRecord.value =
    null

  formModalOpen.value =
    true
}

const handleEdit = (
  record:
    SwitchRestDayRecord,
) => {
  editingRecord.value =
    record

  formModalOpen.value =
    true
}

const closeForm = () => {
  formModalOpen.value =
    false

  editingRecord.value =
    null
}

/* =========================================================
   SAVE
========================================================= */

const handleSave = (
  data:
    SwitchRestDayFormData,
) => {
  if (
    editingRecord.value
  ) {
    const updated =
      updateRequest(
        editingRecord.value.id,
        data,
      )

    if (!updated) {
      info(
        'Unable to Update',
        'The request could not be updated. Make sure the requested rest day is different from the current rest day.',
      )

      return
    }

    closeForm()

    success(
      'Request Updated',
      `${updated.requestNumber} has been updated and returned to Pending status.`,
    )

    return
  }

  const created =
    createRequest(
      data,
    )

  if (!created) {
    info(
      'Unable to Submit',
      'Please verify the employee and requested rest day.',
    )

    return
  }

  closeForm()

  success(
    'Request Submitted',
    `${created.requestNumber} has been submitted for approval.`,
  )
}

/* =========================================================
   DETAILS
========================================================= */

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

const handleStatusSave = (
  data:
    SwitchRestDayStatusFormData,
) => {
  if (
    data.action ===
    'approve'
  ) {
    const record =
      approveRequest(
        data.requestId,
        data.notes,
      )

    if (!record) {
      return
    }

    closeStatusModal()

    success(
      'Request Approved',
      `${record.requestNumber} has been approved.`,
    )

    return
  }

  if (
    data.action ===
    'reject'
  ) {
    const record =
      rejectRequest(
        data.requestId,
        data.notes,
      )

    if (!record) {
      return
    }

    closeStatusModal()

    success(
      'Request Rejected',
      `${record.requestNumber} has been rejected.`,
    )

    return
  }

  const record =
    cancelRequest(
      data.requestId,
      data.notes,
    )

  if (!record) {
    return
  }

  closeStatusModal()

  success(
    'Request Cancelled',
    `${record.requestNumber} has been cancelled.`,
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
    `/employees/${record.employeeId}`,
  )
}

/* =========================================================
   VIEW WORK SCHEDULE
========================================================= */

const handleSchedule = (
  record:
    SwitchRestDayRecord,
) => {
  router.push({
    path:
      '/timekeeping/work-schedules',

    query: {
      employee:
        record.employeeNumber,
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
  router.push(
    '/timekeeping',
  )
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

      Back to Timekeeping
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

    <!-- ADD / EDIT -->

    <AddEditSwitchRestDayModal
      :open="
        formModalOpen
      "
      :record="
        editingRecord
      "
      :employees="
        employees
      "
      :rest-days="
        restDayOptions
      "
      :get-schedule-info="
        getScheduleInfo
      "
      :get-effective-week="
        getEffectiveWeek
      "
      @close="
        closeForm
      "
      @save="
        handleSave
      "
    />

    <!-- DETAILS -->

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