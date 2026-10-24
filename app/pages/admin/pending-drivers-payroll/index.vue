<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  RefreshCw,
} from 'lucide-vue-next'

import PendingDriverPayrollStats from '~/components/admin/payroll/pending-drivers-payroll/PendingDriverPayrollStats.vue'
import PendingDriverPayrollFilters from '~/components/admin/payroll/pending-drivers-payroll/PendingDriverPayrollFilters.vue'
import PendingDriverPayrollTable from '~/components/admin/payroll/pending-drivers-payroll/PendingDriverPayrollTable.vue'

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
} = useToast()

/* =========================================================
   PERIOD QUERY FROM DRIVER PAY PERIOD PAGE

   Example:
   /admin/pending-drivers-payroll?period=DRV-PP-2026-0915
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
    'Export Pending Driver Payroll',
    'Payroll export functionality will be connected later.',
  )
}

const handleRefresh = () => {
  info(
    'Payroll Refreshed',
    'Payroll recalculation and live data refresh will be connected later.',
  )
}

const handleBack = () => {
  router.push(
    '/admin/payroll',
  )
}
</script>

<template>
  <section class="pending-driver-page">

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

    <!-- HEADER -->

    <PageHeader
      title="Pending Drivers Payroll"
      description="Review driver payroll calculations, trip earnings, overtime, deductions and records awaiting payroll completion."
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

    <!-- STATS -->

    <PendingDriverPayrollStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <PendingDriverPayrollFilters
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

    <!-- TABLE -->

    <PendingDriverPayrollTable
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

        pending driver payroll records
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
.pending-driver-page {
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