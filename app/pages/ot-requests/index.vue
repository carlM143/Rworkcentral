<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  Plus,
} from 'lucide-vue-next'

import OvertimeRequestStats from '~/components/overtime/requests/OvertimeRequestStats.vue'
import OvertimeRequestFilters from '~/components/overtime/requests/OvertimeRequestFilters.vue'
import OvertimeRequestTable from '~/components/overtime/requests/OvertimeRequestTable.vue'

import OvertimeExportModal from '~/components/timekeeping/overtime-requests/OvertimeExportModal.vue'
import FileOvertimeRequestModal from '~/components/timekeeping/overtime-requests/FileOvertimeRequestModal.vue'
import OvertimeRequestDetailsModal from '~/components/timekeeping/overtime-requests/OvertimeRequestDetailsModal.vue'
import OvertimeReviewModal from '~/components/timekeeping/overtime-requests/OvertimeReviewModal.vue'
import OvertimeHistoryModal from '~/components/timekeeping/overtime-requests/OvertimeHistoryModal.vue'
import OvertimeCancelModal from '~/components/timekeeping/overtime-requests/OvertimeCancelModal.vue'

import type {
  FileOvertimeRequestPayload,
  OvertimeActionRequest,
  OvertimeCancelPayload,
  OvertimeExportPayload,
  OvertimeReviewPayload,
} from '~/types/overtimeActions'

definePageMeta({
  alias: [
    '/timekeeping/overtime-requests',
  ],
})

const router =
  useRouter()

const {
  search,
  department,
  overtimeType,
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
  overtimeTypeOptions,
  statusOptions,

  resetFilters,
} = useOvertimeRequests()

const {
  info,
} = useToast()

/* =========================================================
   MODALS
========================================================= */

const exportModalOpen =
  ref(false)

const fileRequestModalOpen =
  ref(false)

const detailsModalOpen =
  ref(false)

const reviewModalOpen =
  ref(false)

const historyModalOpen =
  ref(false)

const cancelModalOpen =
  ref(false)

const selectedRequest =
  ref<OvertimeActionRequest | null>(
    null,
  )

/* =========================================================
   NAVIGATION
========================================================= */

const handleBack = () => {
  router.push(
    '/overtime',
  )
}

/* =========================================================
   HEADER ACTIONS
========================================================= */

const handleExport = () => {
  exportModalOpen.value =
    true
}

const handleFileOvertime = () => {
  fileRequestModalOpen.value =
    true
}

/* =========================================================
   ROW ACTIONS
========================================================= */

const handleViewRequest = (
  request:
    OvertimeActionRequest,
) => {
  selectedRequest.value =
    request

  detailsModalOpen.value =
    true
}

const handleReviewRequest = (
  request:
    OvertimeActionRequest,
) => {
  selectedRequest.value =
    request

  reviewModalOpen.value =
    true
}

const handleViewHistory = (
  request:
    OvertimeActionRequest,
) => {
  selectedRequest.value =
    request

  historyModalOpen.value =
    true
}

const handleCancelRequest = (
  request:
    OvertimeActionRequest,
) => {
  selectedRequest.value =
    request

  cancelModalOpen.value =
    true
}

/* =========================================================
   FRONTEND SUBMITS
========================================================= */

const handleExportSubmit = (
  payload:
    OvertimeExportPayload,
) => {
  info(
    `Export ${payload.format}`,
    'Overtime request export is ready for backend integration.',
  )
}

const handleFileRequestSubmit = (
  payload:
    FileOvertimeRequestPayload,
) => {
  info(
    'OT Request Prepared',
    `${payload.employeeName}'s ${payload.requestedHours}-hour OT request is ready for backend submission.`,
  )
}

const handleReviewSubmit = (
  payload:
    OvertimeReviewPayload,
) => {
  if (
    !selectedRequest.value
  ) {
    return
  }

  info(
    'Review Decision Saved',
    `${selectedRequest.value.requestNo}: ${payload.decision} decision prepared successfully.`,
  )
}

const handleCancelSubmit = (
  payload:
    OvertimeCancelPayload,
) => {
  if (
    !selectedRequest.value
  ) {
    return
  }

  info(
    'Cancellation Prepared',
    `${selectedRequest.value.requestNo} cancellation is ready for backend integration.`,
  )
}
</script>

<template>
  <section class="ot-request-page">

    <!-- =====================================================
         BACK
    ====================================================== -->

    <button
      type="button"
      class="back-button"
      @click="handleBack"
    >

      <ArrowLeft
        :size="15"
      />

      Back to Overtime

    </button>

    <!-- =====================================================
         HEADER
    ====================================================== -->

    <PageHeader
      title="Overtime Requests"
      description="Monitor employee overtime requests, requested hours, overtime types and approval status."
    >

      <div class="header-actions">

        <AppButton
          variant="secondary"
          :icon="Download"
          @click="handleExport"
        >
          Export
        </AppButton>

        <AppButton
          :icon="Plus"
          @click="handleFileOvertime"
        >
          File OT Request
        </AppButton>

      </div>

    </PageHeader>

    <!-- =====================================================
         STATS
    ====================================================== -->

    <OvertimeRequestStats
      :stats="stats"
    />

    <!-- =====================================================
         FILTERS
    ====================================================== -->

    <OvertimeRequestFilters
      v-model:search="search"
      v-model:department="department"
      v-model:overtime-type="overtimeType"
      v-model:status="status"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :departments="departmentOptions"
      :overtime-types="overtimeTypeOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <!-- =====================================================
         TABLE
    ====================================================== -->

    <OvertimeRequestTable
      :requests="paginatedRequests"
      @view="handleViewRequest"
      @review="handleReviewRequest"
      @history="handleViewHistory"
      @cancel="handleCancelRequest"
    />

    <!-- =====================================================
         PAGINATION
    ====================================================== -->

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

        overtime requests
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />

    </div>

    <!-- =====================================================
         EXPORT MODAL
    ====================================================== -->

    <OvertimeExportModal
      :open="exportModalOpen"
      :record-count="
        filteredRequests.length
      "
      @close="
        exportModalOpen = false
      "
      @export="
        handleExportSubmit
      "
    />

    <!-- =====================================================
         FILE OT REQUEST
    ====================================================== -->

    <FileOvertimeRequestModal
      :open="fileRequestModalOpen"
      @close="
        fileRequestModalOpen = false
      "
      @submit="
        handleFileRequestSubmit
      "
    />

    <!-- =====================================================
         REQUEST DETAILS
    ====================================================== -->

    <OvertimeRequestDetailsModal
      :open="detailsModalOpen"
      :request="selectedRequest"
      @close="
        detailsModalOpen = false
      "
      @review="
        handleReviewRequest
      "
    />

    <!-- =====================================================
         REVIEW
    ====================================================== -->

    <OvertimeReviewModal
      :open="reviewModalOpen"
      :request="selectedRequest"
      @close="
        reviewModalOpen = false
      "
      @submit="
        handleReviewSubmit
      "
    />

    <!-- =====================================================
         APPROVAL HISTORY
    ====================================================== -->

    <OvertimeHistoryModal
      :open="historyModalOpen"
      :request="selectedRequest"
      @close="
        historyModalOpen = false
      "
    />

    <!-- =====================================================
         CANCEL
    ====================================================== -->

    <OvertimeCancelModal
      :open="cancelModalOpen"
      :request="selectedRequest"
      @close="
        cancelModalOpen = false
      "
      @confirm="
        handleCancelSubmit
      "
    />

  </section>
</template>

<style scoped>
.ot-request-page {
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
    align-items: flex-start;

    flex-direction: column;
  }
}
</style>