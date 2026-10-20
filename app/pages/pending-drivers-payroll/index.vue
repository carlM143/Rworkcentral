<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  RefreshCw,
} from 'lucide-vue-next'

import PendingDriverPayrollStats from '~/components/payroll/pending-drivers-payroll/PendingDriverPayrollStats.vue'
import PendingDriverPayrollFilters from '~/components/payroll/pending-drivers-payroll/PendingDriverPayrollFilters.vue'
import PendingDriverPayrollTable from '~/components/payroll/pending-drivers-payroll/PendingDriverPayrollTable.vue'

import PendingDriverPayrollDetailsModal from '~/components/payroll/pending-drivers-payroll/PendingDriverPayrollDetailsModal.vue'

import PendingDriverPayrollReviewModal from '~/components/payroll/pending-drivers-payroll/PendingDriverPayrollReviewModal.vue'

import PendingDriverPayrollExportModal from '~/components/payroll/pending-drivers-payroll/PendingDriverPayrollExportModal.vue'

import PendingDriverPayrollRefreshModal from '~/components/payroll/pending-drivers-payroll/PendingDriverPayrollRefreshModal.vue'

import type {
  PendingDriverPayroll,
} from '~/types/pendingDriverPayroll'

const router =
  useRouter()

const route =
  useRoute()

const {
  search,
  period,
  department,
  status,
  dateFrom,
  dateTo,

  currentPage,

  filteredPayrolls,
  paginatedPayrolls,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  periodOptions,
  departmentOptions,
  statusOptions,

  resetFilters,
} = usePendingDriverPayroll()

const {
  info,
  success,
} = useToast()

watch(
  () =>
    route.query.period,
  value => {
    if (
      typeof value === 'string' &&
      value
    ) {
      period.value =
        value
    }
  },
  {
    immediate: true,
  },
)

/* =========================================================
   DETAILS
========================================================= */

const detailsOpen =
  ref(false)

const selectedPayroll =
  ref<
    PendingDriverPayroll |
    null
  >(null)

const handleView = (
  payroll:
    PendingDriverPayroll,
) => {
  selectedPayroll.value =
    payroll

  detailsOpen.value =
    true
}

/* =========================================================
   REVIEW / ISSUES
========================================================= */

const reviewOpen =
  ref(false)

const reviewMode =
  ref<
    'review' |
    'issues'
  >('review')

const reviewPayroll =
  ref<
    PendingDriverPayroll |
    null
  >(null)

const handleReview = (
  payroll:
    PendingDriverPayroll,
) => {
  reviewPayroll.value =
    payroll

  reviewMode.value =
    'review'

  reviewOpen.value =
    true
}

const handleIssues = (
  payroll:
    PendingDriverPayroll,
) => {
  reviewPayroll.value =
    payroll

  reviewMode.value =
    'issues'

  reviewOpen.value =
    true
}

const handleReady = (
  payroll:
    PendingDriverPayroll,
) => {
  payroll.status =
    'Ready'

  reviewOpen.value =
    false

  success(
    'Payroll Ready',
    `${payroll.driverName}'s payroll has been marked as ready.`,
  )
}

const handleResolved = (
  payroll:
    PendingDriverPayroll,
) => {
  payroll.issueCount =
    0

  payroll.status =
    'For Review'

  reviewOpen.value =
    false

  success(
    'Issues Resolved',
    `${payroll.driverName}'s payroll issues have been cleared for review.`,
  )
}

/* =========================================================
   ROUTES
========================================================= */

const handleDriver = (
  payroll:
    PendingDriverPayroll,
) => {
  router.push(
    `/employees/${payroll.driverId}`,
  )
}

const handleTrips = (
  payroll:
    PendingDriverPayroll,
) => {
  router.push({
    path:
      '/manage-trips',

    query: {
      employee:
        payroll.employeeNumber,

      period:
        payroll.periodCode,
    },
  })
}

/* =========================================================
   FINALIZE
========================================================= */

const handleFinalize = (
  payroll:
    PendingDriverPayroll,
) => {
  info(
    'Finalize Driver Payroll',
    `${payroll.driverName}'s payroll is ready for finalization. Moving the record to Completed Drivers Payroll will be connected during backend integration.`,
  )
}

/* =========================================================
   EXPORT
========================================================= */

const exportOpen =
  ref(false)

const handleExport = () => {
  exportOpen.value =
    true
}

const handleExportSubmit = (
  format:
    | 'Excel'
    | 'PDF'
    | 'CSV',
) => {
  exportOpen.value =
    false

  info(
    `Export ${format}`,
    `${filteredPayrolls.value.length} pending driver payroll record(s) are ready for export. Actual file generation will be connected during backend integration.`,
  )
}

/* =========================================================
   REFRESH
========================================================= */

const refreshOpen =
  ref(false)

const handleRefresh = () => {
  refreshOpen.value =
    true
}

const handleRefreshConfirm = () => {
  refreshOpen.value =
    false

  success(
    'Payroll Refreshed',
    `${filteredPayrolls.value.length} driver payroll record(s) have been reviewed using the current frontend data.`,
  )
}

/* =========================================================
   BACK
========================================================= */

const handleBack = () => {
  router.push(
    '/payroll',
  )
}
</script>

<template>
  <section class="pending-driver-page">

    <button
      type="button"
      class="back-button"
      @click="handleBack"
    >
      <ArrowLeft :size="15" />

      Back to Payroll
    </button>

    <PageHeader
      title="Pending Drivers Payroll"
      description="Review driver payroll calculations, trip earnings, overtime, deductions and records awaiting payroll completion."
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
          :icon="RefreshCw"
          @click="handleRefresh"
        >
          Refresh Payroll
        </AppButton>

      </div>

    </PageHeader>

    <PendingDriverPayrollStats
      :stats="stats"
    />

    <PendingDriverPayrollFilters
      v-model:search="search"
      v-model:period="period"
      v-model:department="department"
      v-model:status="status"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :periods="periodOptions"
      :departments="departmentOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <PendingDriverPayrollTable
      :payrolls="paginatedPayrolls"
      @view="handleView"
      @review="handleReview"
      @driver="handleDriver"
      @trips="handleTrips"
      @issues="handleIssues"
      @ready="handleReady"
      @finalize="handleFinalize"
    />

    <div class="table-footer">

      <p>
        Showing

        <strong>
          {{ showingFrom }}–{{ showingTo }}
        </strong>

        of

        <strong>
          {{ filteredPayrolls.length }}
        </strong>

        pending driver payroll records
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />

    </div>

    <!-- DETAILS -->

    <PendingDriverPayrollDetailsModal
      :open="detailsOpen"
      :payroll="selectedPayroll"
      @close="
        detailsOpen = false
      "
    />

    <!-- REVIEW -->

    <PendingDriverPayrollReviewModal
      :open="reviewOpen"
      :payroll="reviewPayroll"
      :mode="reviewMode"
      @close="
        reviewOpen = false
      "
      @ready="handleReady"
      @resolved="handleResolved"
    />

    <!-- EXPORT -->

    <PendingDriverPayrollExportModal
      :open="exportOpen"
      :record-count="
        filteredPayrolls.length
      "
      :period="period"
      :department="department"
      :status="status"
      :date-from="dateFrom"
      :date-to="dateTo"
      @close="
        exportOpen = false
      "
      @export="
        handleExportSubmit
      "
    />

    <!-- REFRESH -->

    <PendingDriverPayrollRefreshModal
      :open="refreshOpen"
      :record-count="
        filteredPayrolls.length
      "
      @close="
        refreshOpen = false
      "
      @refresh="
        handleRefreshConfirm
      "
    />

  </section>
</template>

<style scoped>
.pending-driver-page {
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
  color: var(--primary);
  font-family: inherit;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}

.back-button:hover {
  color: var(--primary-dark);
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
  padding: 13px 3px 0;
}

.table-footer p {
  margin: 0;
  color: var(--text-muted);
  font-size: 10px;
}

.table-footer strong {
  color: var(--text-primary);
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