<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  FileText,
} from 'lucide-vue-next'

import CompletedDriverPayrollStats from '~/components/admin/payroll/completed-drivers-payroll/CompletedDriverPayrollStats.vue'
import CompletedDriverPayrollFilters from '~/components/admin/payroll/completed-drivers-payroll/CompletedDriverPayrollFilters.vue'
import CompletedDriverPayrollTable from '~/components/admin/payroll/completed-drivers-payroll/CompletedDriverPayrollTable.vue'

const router =
  useRouter()

const route =
  useRoute()

const {
  search,
  period,
  department,
  paymentStatus,
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
  paymentStatusOptions,

  resetFilters,
} = useCompletedDriverPayroll()

const {
  info,
} = useToast()

/* =========================================================
   PERIOD QUERY

   Example:
   /admin/completed-drivers-payroll?period=DRV-PP-2026-0831
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
   UI ONLY ACTIONS
========================================================= */

const handleExport = () => {
  info(
    'Export Completed Driver Payroll',
    'Payroll export functionality will be connected later.',
  )
}

const handleReport = () => {
  info(
    'Driver Payroll Report',
    'Detailed payroll reporting will be connected after the payroll submenu UIs are completed.',
  )
}

const handleBack = () => {
  router.push(
    '/admin/payroll',
  )
}
</script>

<template>
  <section class="completed-driver-page">

    <!-- BACK -->

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

    <!-- PAGE HEADER -->

    <PageHeader
      title="Completed Drivers Payroll"
      description="Review completed driver payroll records, payment releases, deductions and final net payroll amounts."
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
          :icon="FileText"
          @click="
            handleReport
          "
        >
          Payroll Report
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <CompletedDriverPayrollStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <CompletedDriverPayrollFilters
      v-model:search="
        search
      "
      v-model:period="
        period
      "
      v-model:department="
        department
      "
      v-model:payment-status="
        paymentStatus
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
      :payment-statuses="
        paymentStatusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <CompletedDriverPayrollTable
      :payrolls="
        paginatedPayrolls
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
            filteredPayrolls.length
          }}
        </strong>

        completed driver payroll records
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

  </section>
</template>

<style scoped>
.completed-driver-page {
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