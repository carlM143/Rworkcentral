<script setup lang="ts">
import {
  ArrowLeft,
  Download,
} from 'lucide-vue-next'

import TimeCorrectionStats from '~/components/timekeeping/time-log-corrections/TimeCorrectionStats.vue'

import TimeCorrectionFilters from '~/components/timekeeping/time-log-corrections/TimeCorrectionFilters.vue'

import TimeCorrectionTable from '~/components/timekeeping/time-log-corrections/TimeCorrectionTable.vue'

import TimeCorrectionSidePanel from '~/components/timekeeping/time-log-corrections/TimeCorrectionSidePanel.vue'

import TimeCorrectionDetailsModal from '~/components/timekeeping/time-log-corrections/TimeCorrectionDetailsModal.vue'

import type {
  TimeLogCorrectionRequest,
} from '~/types/timeLogCorrection'

const {
  search,
  department,
  status,
  correctionType,
  dateFrom,
  dateTo,

  currentPage,

  filteredRequests,
  paginatedRequests,

  totalPages,
  showingFrom,
  showingTo,

  stats,
  reviewSummary,

  departments,
  statusOptions,
  correctionTypeOptions,

  approveRequest,
  rejectRequest,

  resetFilters,
} = useTimeLogCorrections()

const router =
  useRouter()

const {
  info,
  success,
} = useToast()

/* =========================================================
   DETAILS
========================================================= */

const detailsOpen =
  ref(false)

const selectedRequest =
  ref<
    TimeLogCorrectionRequest |
    null
  >(null)

/* =========================================================
   VIEW
========================================================= */

const handleView = (
  request:
    TimeLogCorrectionRequest,
) => {
  selectedRequest.value =
    request

  detailsOpen.value =
    true
}

const closeDetails = () => {
  detailsOpen.value =
    false

  selectedRequest.value =
    null
}

/* =========================================================
   APPROVE
========================================================= */

const handleApprove = (
  request:
    TimeLogCorrectionRequest,
) => {
  approveRequest(
    request.id,
  )

  success(
    'Correction Approved',
    `${request.employeeName}'s time log correction has been approved.`,
  )

  closeDetails()
}

/* =========================================================
   REJECT
========================================================= */

const handleReject = (
  request:
    TimeLogCorrectionRequest,
) => {
  rejectRequest(
    request.id,
  )

  success(
    'Correction Rejected',
    `${request.employeeName}'s time log correction has been rejected.`,
  )

  closeDetails()
}

/* =========================================================
   EMPLOYEE
========================================================= */

const handleEmployee = (
  request:
    TimeLogCorrectionRequest,
) => {
  router.push(
    `/employees/${request.employeeId}`,
  )
}

/* =========================================================
   EXPORT
========================================================= */

const handleExport = () => {
  info(
    'Export Corrections',
    'Correction request export will be connected later.',
  )
}

/* =========================================================
   QUICK FILTER
========================================================= */

const showPending = () => {
  resetFilters()

  status.value =
    'Pending'
}

const showApproved = () => {
  resetFilters()

  status.value =
    'Approved'
}

const showRejected = () => {
  resetFilters()

  status.value =
    'Rejected'
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
  <section class="correction-page">

    <!-- BACK -->

    <button
      type="button"
      class="back-button"
      @click="handleBack"
    >
      <ArrowLeft :size="15" />

      Back to Timekeeping
    </button>

    <!-- HEADER -->

    <PageHeader
      title="Time Log Correction Requests"
      description="Review employee attendance correction requests, original time logs and requested changes."
    >

      <AppButton
        variant="secondary"
        :icon="Download"
        @click="handleExport"
      >
        Export
      </AppButton>

    </PageHeader>

    <!-- STATS -->

    <TimeCorrectionStats
      :stats="stats"
    />

    <!-- FILTERS -->

    <TimeCorrectionFilters
      v-model:search="search"
      v-model:department="department"
      v-model:status="status"
      v-model:correction-type="correctionType"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :departments="departments"
      :status-options="statusOptions"
      :correction-type-options="correctionTypeOptions"
      @reset="resetFilters"
    />

    <!-- CONTENT -->

    <div class="correction-layout">

      <div class="correction-main">

        <TimeCorrectionTable
          :requests="paginatedRequests"
          @view="handleView"
          @approve="handleApprove"
          @reject="handleReject"
          @employee="handleEmployee"
        />

        <div class="table-footer">

          <p>
            Showing

            <strong>
              {{ showingFrom }}–{{ showingTo }}
            </strong>

            of

            <strong>
              {{ filteredRequests.length }}
            </strong>

            correction requests
          </p>

          <AppPagination
            v-model="currentPage"
            :total-pages="totalPages"
          />

        </div>

      </div>

      <TimeCorrectionSidePanel
        :summary="reviewSummary"
        @pending="showPending"
        @approved="showApproved"
        @rejected="showRejected"
      />

    </div>

    <!-- DETAILS MODAL -->

    <TimeCorrectionDetailsModal
      :open="detailsOpen"
      :request="selectedRequest"
      @close="closeDetails"
      @approve="handleApprove"
      @reject="handleReject"
    />

  </section>
</template>

<style scoped>
.correction-page {
  width: 100%;

  max-width: 1660px;

  margin: 0 auto;
}

.back-button {
  display: inline-flex;

  align-items: center;

  gap: 6px;

  margin-bottom: 10px;

  padding: 0;

  border: 0;

  background: transparent;

  color:
    var(--primary);

  font-family: inherit;

  font-size: 10px;
  font-weight: 600;

  cursor: pointer;
}

.correction-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    300px;

  gap: 14px;
}

.correction-main {
  min-width: 0;
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

@media (max-width: 1100px) {
  .correction-layout {
    grid-template-columns:
      1fr;
  }
}

@media (max-width: 650px) {
  .table-footer {
    align-items: flex-start;

    flex-direction: column;
  }
}
</style>