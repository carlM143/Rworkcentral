<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  RefreshCw,
} from 'lucide-vue-next'

import PendingEmployeePayrollStats from '~/components/payroll/pending-employees-payroll/PendingEmployeePayrollStats.vue'

import PendingEmployeePayrollFilters from '~/components/payroll/pending-employees-payroll/PendingEmployeePayrollFilters.vue'

import PendingEmployeePayrollTable from '~/components/payroll/pending-employees-payroll/PendingEmployeePayrollTable.vue'

import PendingEmployeePayrollDetailsModal from '~/components/payroll/pending-employees-payroll/PendingEmployeePayrollDetailsModal.vue'

import PendingEmployeePayrollReviewModal from '~/components/payroll/pending-employees-payroll/PendingEmployeePayrollReviewModal.vue'

import PendingEmployeePayrollExportModal from '~/components/payroll/pending-employees-payroll/PendingEmployeePayrollExportModal.vue'

import PendingEmployeePayrollRefreshModal from '~/components/payroll/pending-employees-payroll/PendingEmployeePayrollRefreshModal.vue'

import type {
  PendingEmployeePayroll,
} from '~/types/pendingEmployeePayroll'

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
} = usePendingEmployeePayroll()

const {
  info,
  success,
} = useToast()

/* =========================================================
   PERIOD QUERY
========================================================= */

watch(
  () =>
    route.query.period,
  value => {
    if (
      typeof value ===
        'string' &&
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
    PendingEmployeePayroll |
    null
  >(null)

const handleView = (
  payroll:
    PendingEmployeePayroll,
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
    PendingEmployeePayroll |
    null
  >(null)

const handleReview = (
  payroll:
    PendingEmployeePayroll,
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
    PendingEmployeePayroll,
) => {
  reviewPayroll.value =
    payroll

  reviewMode.value =
    'issues'

  reviewOpen.value =
    true
}

/* =========================================================
   MARK READY
========================================================= */

const handleReady = (
  payroll:
    PendingEmployeePayroll,
) => {
  if (
    payroll.issueCount > 0
  ) {
    info(
      'Payroll Has Issues',
      'Resolve the payroll issues before marking this record as ready.',
    )

    return
  }

  payroll.status =
    'Ready'

  reviewOpen.value =
    false

  success(
    'Payroll Ready',
    `${payroll.employeeName}'s payroll has been marked as ready.`,
  )
}

/* =========================================================
   RESOLVE ISSUES
========================================================= */

const handleResolved = (
  payroll:
    PendingEmployeePayroll,
) => {
  payroll.issueCount =
    0

  payroll.status =
    'For Review'

  reviewOpen.value =
    false

  success(
    'Issues Resolved',
    `${payroll.employeeName}'s payroll issues have been cleared for review.`,
  )
}

/* =========================================================
   EMPLOYEE PROFILE
========================================================= */

const handleEmployee = (
  payroll:
    PendingEmployeePayroll,
) => {
  router.push(
    `/employees/${payroll.employeeId}`,
  )
}

/* =========================================================
   TIME LOGS
========================================================= */

const handleTimeLogs = (
  payroll:
    PendingEmployeePayroll,
) => {
  router.push({
    path:
      '/time-logs',

    query: {
      employee:
        payroll.employeeNumber,

      dateFrom:
        payroll.periodStart,

      dateTo:
        payroll.periodEnd,
    },
  })
}

/* =========================================================
   FINALIZE
========================================================= */

const handleFinalize = (
  payroll:
    PendingEmployeePayroll,
) => {
  info(
    'Finalize Employee Payroll',
    `${payroll.employeeName}'s payroll is ready for finalization. Moving the record to Completed Employees Payroll will be connected during backend integration.`,
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
    `${filteredPayrolls.value.length} pending employee payroll record(s) are ready for export. Actual file generation will be connected during backend integration.`,
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
    `${filteredPayrolls.value.length} employee payroll record(s) have been reviewed using the current frontend data.`,
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
  <section class="pending-employee-page">

    <button
      type="button"
      class="back-button"
      @click="
        handleBack
      "
    >

      <ArrowLeft :size="15" />

      Back to Payroll

    </button>

    <PageHeader
      title="Pending Employees Payroll"
      description="Review employee salary calculations, overtime, attendance deductions, government contributions and records awaiting payroll completion."
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
          :icon="RefreshCw"
          @click="
            handleRefresh
          "
        >
          Refresh Payroll
        </AppButton>

      </div>

    </PageHeader>

    <PendingEmployeePayrollStats
      :stats="
        stats
      "
    />

    <PendingEmployeePayrollFilters
      v-model:search="
        search
      "
      v-model:period="
        period
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
      :periods="
        periodOptions
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

    <PendingEmployeePayrollTable
      :payrolls="
        paginatedPayrolls
      "
      @view="
        handleView
      "
      @review="
        handleReview
      "
      @employee="
        handleEmployee
      "
      @time-logs="
        handleTimeLogs
      "
      @issues="
        handleIssues
      "
      @ready="
        handleReady
      "
      @finalize="
        handleFinalize
      "
    />

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
            filteredPayrolls.length
          }}
        </strong>

        pending employee payroll records
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

    <!-- DETAILS -->

    <PendingEmployeePayrollDetailsModal
      :open="
        detailsOpen
      "
      :payroll="
        selectedPayroll
      "
      @close="
        detailsOpen =
          false
      "
    />

    <!-- REVIEW -->

    <PendingEmployeePayrollReviewModal
      :open="
        reviewOpen
      "
      :payroll="
        reviewPayroll
      "
      :mode="
        reviewMode
      "
      @close="
        reviewOpen =
          false
      "
      @ready="
        handleReady
      "
      @resolved="
        handleResolved
      "
    />

    <!-- EXPORT -->

    <PendingEmployeePayrollExportModal
      :open="
        exportOpen
      "
      :record-count="
        filteredPayrolls.length
      "
      :period="
        period
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
        exportOpen =
          false
      "
      @export="
        handleExportSubmit
      "
    />

    <!-- REFRESH -->

    <PendingEmployeePayrollRefreshModal
      :open="
        refreshOpen
      "
      :record-count="
        filteredPayrolls.length
      "
      @close="
        refreshOpen =
          false
      "
      @refresh="
        handleRefreshConfirm
      "
    />

  </section>
</template>

<style scoped>
.pending-employee-page {
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