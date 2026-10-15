<script setup lang="ts">
import {
  ArrowLeft,
  Download,
} from 'lucide-vue-next'

import LateAdjustmentStats from '~/components/timekeeping/late-adjustment/LateAdjustmentStats.vue'

import LateAdjustmentFilters from '~/components/timekeeping/late-adjustment/LateAdjustmentFilters.vue'

import LateAdjustmentTable from '~/components/timekeeping/late-adjustment/LateAdjustmentTable.vue'

import LateAdjustmentModal from '~/components/timekeeping/late-adjustment/LateAdjustmentModal.vue'
import LateAdjustmentExportModal from '~/components/timekeeping/late-adjustment/LateAdjustmentExportModal.vue'
import type {
  LateAdjustmentFormData,
  LateAdjustmentRecord,
} from '~/types/lateAdjustment'

const router =
  useRouter()

const {
  search,
  department,
  status,
  dateFrom,
  dateTo,

  currentPage,

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
} = useLateAdjustments()

const {
  info,
  success,
} = useToast()

const exportOpen =
  ref(false)

const modalOpen =
  ref(false)

const modalMode =
  ref<
    'view' |
    'adjust'
  >('view')

const selectedAdjustment =
  ref<
    LateAdjustmentRecord |
    null
  >(null)

/* =========================================================
   VIEW
========================================================= */

const handleView = (
  adjustment:
    LateAdjustmentRecord,
) => {
  selectedAdjustment.value =
    adjustment

  modalMode.value =
    'view'

  modalOpen.value =
    true
}

/* =========================================================
   ADJUST
========================================================= */

const handleAdjust = (
  adjustment:
    LateAdjustmentRecord,
) => {
  selectedAdjustment.value =
    adjustment

  modalMode.value =
    'adjust'

  modalOpen.value =
    true
}

/* =========================================================
   CLOSE
========================================================= */

const closeModal = () => {
  modalOpen.value =
    false

  selectedAdjustment.value =
    null
}

/* =========================================================
   SAVE
========================================================= */

const handleSave = (
  payload: {
    id: number

    data:
      LateAdjustmentFormData
  },
) => {
  const adjustment =
    saveAdjustment(
      payload.id,
      payload.data,
    )

  if (!adjustment) {
    info(
      'Adjustment Not Found',
      'The selected late adjustment record could not be found.',
    )

    return
  }

  closeModal()

  success(
    'Adjustment Submitted',
    `${adjustment.employeeName}'s late adjustment has been submitted for review.`,
  )
}

/* =========================================================
   APPROVE
========================================================= */

const handleApprove = (
  adjustment:
    LateAdjustmentRecord,
) => {
  const successResult =
    approveAdjustment(
      adjustment.id,
    )

  if (!successResult) {
    return
  }

  success(
    'Adjustment Approved',
    `${adjustment.employeeName}'s late adjustment has been approved.`,
  )
}

/* =========================================================
   REJECT
========================================================= */

const handleReject = (
  adjustment:
    LateAdjustmentRecord,
) => {
  const successResult =
    rejectAdjustment(
      adjustment.id,
    )

  if (!successResult) {
    return
  }

  success(
    'Adjustment Rejected',
    `${adjustment.employeeName}'s late adjustment has been rejected.`,
  )
}

/* =========================================================
   EMPLOYEE
========================================================= */

const handleEmployee = (
  adjustment:
    LateAdjustmentRecord,
) => {
  router.push(
    `/employees/${adjustment.employeeId}`,
  )
}

const handleExport = () => {
  exportOpen.value =
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

    includeEmployeeInfo:
      boolean

    includeSchedule:
      boolean

    includeOriginalLate:
      boolean

    includeAdjustedLate:
      boolean

    includeDifference:
      boolean

    includeReason:
      boolean

    includeStatus:
      boolean
  },
) => {
  info(
    `Export ${payload.format}`,
    `${filteredAdjustments.value.length} late adjustment record(s) are ready for export. Actual file generation will be connected during backend integration.`,
  )
}

const handleBack = () => {
  router.push(
    '/timekeeping',
  )
}
</script>

<template>
  <section class="late-adjustment-page">

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
      title="Late Adjustment"
      description="Review employee late attendance and manage approved late minute adjustments."
    >

      <AppButton
        variant="secondary"
        :icon="Download"
        @click="
          handleExport
        "
      >
        Export
      </AppButton>

    </PageHeader>

    <!-- STATS -->

    <LateAdjustmentStats
      :stats="stats"
    />

    <!-- FILTERS -->

    <LateAdjustmentFilters
      v-model:search="search"
      v-model:department="department"
      v-model:status="status"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :departments="departments"
      :status-options="statusOptions"
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <LateAdjustmentTable
      :adjustments="
        paginatedAdjustments
      "
      @view="
        handleView
      "
      @adjust="
        handleAdjust
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
            filteredAdjustments.length
          }}
        </strong>

        late adjustment records
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

    <!-- MODAL -->

   <LateAdjustmentModal
  :open="
    modalOpen
  "
  :adjustment="
    selectedAdjustment
  "
  :mode="
    modalMode
  "
  @close="
    closeModal
  "
  @save="
    handleSave
  "
/>

<!-- EXPORT MODAL -->

<LateAdjustmentExportModal
  :open="
    exportOpen
  "
  :record-count="
    filteredAdjustments.length
  "
  :department="
    department
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
    exportOpen = false
  "
  @export="
    handleExportSubmit
  "
/>

  </section>
</template>

<style scoped>
.late-adjustment-page {
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
  .table-footer {
    align-items:
      flex-start;

    flex-direction:
      column;
  }
}
</style>