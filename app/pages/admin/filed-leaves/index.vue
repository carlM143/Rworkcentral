<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  Plus,
} from 'lucide-vue-next'

import FieldLeaveStats from '~/components/admin/timekeeping/filed-leaves/FieldLeaveStats.vue'
import FieldLeaveFilters from '~/components/admin/timekeeping/filed-leaves/FieldLeaveFilters.vue'
import FieldLeaveTable from '~/components/admin/timekeeping/filed-leaves/FieldLeaveTable.vue'
import AddEditFieldLeaveModal from '~/components/admin/timekeeping/filed-leaves/AddEditFieldLeaveModal.vue'
import FieldLeaveDetailsModal from '~/components/admin/timekeeping/filed-leaves/FieldLeaveDetailsModal.vue'
import FieldLeaveStatusModal from '~/components/admin/timekeeping/filed-leaves/FieldLeaveStatusModal.vue'

import type {
  FieldLeaveAction,
  FieldLeaveFormData,
  FieldLeaveRecord,
  FieldLeaveStatusFormData,
} from '~/types/fieldLeave'

const router =
  useRouter()

const {
  employees,
} = useEmployees()

const {
  trips,
} = useManageTrips()

const {
  search,
  department,
  leaveType,
  status,
  dateFrom,
  dateTo,

  currentPage,

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
} = useFieldLeaves()

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
    FieldLeaveRecord |
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
    FieldLeaveRecord,
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
    FieldLeaveFormData,
) => {
  if (
    editingRecord.value
  ) {
    const updated =
      updateFieldLeave(
        editingRecord.value.id,
        data,
      )

    if (!updated) {
      info(
        'Unable to Update',
        'The selected field leave request could not be updated.',
      )

      return
    }

    closeForm()

    success(
      'Field Leave Updated',
      `${updated.requestNumber} has been updated and returned to Pending status.`,
    )

    return
  }

  const created =
    createFieldLeave(
      data,
    )

  if (!created) {
    info(
      'Unable to Submit',
      'The selected employee could not be found.',
    )

    return
  }

  closeForm()

  success(
    'Field Leave Submitted',
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
    FieldLeaveRecord |
    null
  >(null)

const handleView = (
  record:
    FieldLeaveRecord,
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
    FieldLeaveRecord |
    null
  >(null)

const statusAction =
  ref<
    FieldLeaveAction
  >('approve')

const openStatusModal = (
  record:
    FieldLeaveRecord,
  action:
    FieldLeaveAction,
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
    FieldLeaveRecord,
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
    FieldLeaveRecord,
) => {
  openStatusModal(
    record,
    'reject',
  )
}

/* =========================================================
   COMPLETE
========================================================= */

const handleComplete = (
  record:
    FieldLeaveRecord,
) => {
  openStatusModal(
    record,
    'complete',
  )
}

/* =========================================================
   CANCEL
========================================================= */

const handleCancel = (
  record:
    FieldLeaveRecord,
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
    FieldLeaveStatusFormData,
) => {
  if (
    data.action ===
    'approve'
  ) {
    const record =
      approveFieldLeave(
        data.requestId,
        data.notes,
      )

    if (!record) {
      return
    }

    closeStatusModal()

    success(
      'Field Leave Approved',
      `${record.requestNumber} has been approved.`,
    )

    return
  }

  if (
    data.action ===
    'reject'
  ) {
    const record =
      rejectFieldLeave(
        data.requestId,
        data.notes,
      )

    if (!record) {
      return
    }

    closeStatusModal()

    success(
      'Field Leave Rejected',
      `${record.requestNumber} has been rejected.`,
    )

    return
  }

  if (
    data.action ===
    'complete'
  ) {
    const record =
      completeFieldLeave(
        data.requestId,
        data.completionTime ?? '',
        data.notes,
      )

    if (!record) {
      return
    }

    closeStatusModal()

    success(
      'Field Leave Completed',
      `${record.requestNumber} has been marked as completed.`,
    )

    return
  }

  const record =
    cancelFieldLeave(
      data.requestId,
      data.notes,
    )

  if (!record) {
    return
  }

  closeStatusModal()

  success(
    'Field Leave Cancelled',
    `${record.requestNumber} has been cancelled.`,
  )
}

/* =========================================================
   VIEW EMPLOYEE
========================================================= */

const handleEmployee = (
  record:
    FieldLeaveRecord,
) => {
  router.push(
    `/admin/employees/${record.employeeId}`,
  )
}

/* =========================================================
   VIEW TIME LOG
========================================================= */

const handleTimeLog = (
  record:
    FieldLeaveRecord,
) => {
  router.push({
    path:
      '/admin/time-logs',

    query: {
      employee:
        record.employeeNumber,

      date:
        record.fieldDate,
    },
  })
}

/* =========================================================
   VIEW RELATED TRIP
========================================================= */

const handleTrip = (
  record:
    FieldLeaveRecord,
) => {
  if (
    !record.relatedTripNumber
  ) {
    info(
      'No Related Trip',
      'This field leave does not have a related trip.',
    )

    return
  }

  router.push({
    path:
      '/admin/manage-trips',

    query: {
      trip:
        record.relatedTripNumber,
    },
  })
}

/* =========================================================
   EXPORT
========================================================= */

const handleExport = () => {
  info(
    'Export Field Leaves',
    'Field leave report export will be connected later.',
  )
}

/* =========================================================
   BACK
========================================================= */

const handleBack = () => {
  router.push(
    '/admin/timekeeping',
  )
}
</script>

<template>
  <section class="field-leaves-page">

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
      title="Field Leaves"
      description="Manage employee client visits, field assignments, official business and related field activities."
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
          Add Field Leave
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <FieldLeaveStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <FieldLeaveFilters
      v-model:search="
        search
      "
      v-model:department="
        department
      "
      v-model:leave-type="
        leaveType
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
      :types="
        typeOptions
      "
      :statuses="
        statusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <FieldLeaveTable
      :records="
        paginatedFieldLeaves
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
      @complete="
        handleComplete
      "
      @employee="
        handleEmployee
      "
      @time-log="
        handleTimeLog
      "
      @trip="
        handleTrip
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
            filteredFieldLeaves.length
          }}
        </strong>

        field leave records
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

    <AddEditFieldLeaveModal
      :open="
        formModalOpen
      "
      :record="
        editingRecord
      "
      :employees="
        employees
      "
      :trips="
        trips
      "
      :types="
        typeOptions
      "
      @close="
        closeForm
      "
      @save="
        handleSave
      "
    />

    <!-- DETAILS -->

    <FieldLeaveDetailsModal
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

    <FieldLeaveStatusModal
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
.field-leaves-page {
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