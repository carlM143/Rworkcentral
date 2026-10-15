<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  Plus,
} from 'lucide-vue-next'

import EmployeePayPeriodStats from '~/components/payroll/employee-pay-periods/EmployeePayPeriodStats.vue'
import EmployeePayPeriodFilters from '~/components/payroll/employee-pay-periods/EmployeePayPeriodFilters.vue'
import EmployeePayPeriodTable from '~/components/payroll/employee-pay-periods/EmployeePayPeriodTable.vue'

const router =
  useRouter()

const {
  search,
  status,
  year,
  month,
  dateFrom,
  dateTo,

  currentPage,

  filteredPeriods,
  paginatedPeriods,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  statusOptions,
  monthOptions,
  yearOptions,

  resetFilters,
} = useEmployeePayPeriods()

const {
  info,
} = useToast()

/* =========================================================
   UI ONLY ACTIONS
========================================================= */

const handleExport = () => {
  info(
    'Export Employee Pay Periods',
    'Export functionality will be connected later.',
  )
}

const handleCreate = () => {
  info(
    'Create Employee Pay Period',
    'Create pay period functionality will be added after all payroll submenu UIs are completed.',
  )
}

const handleBack = () => {
  router.push(
    '/payroll',
  )
}
</script>

<template>
  <section class="employee-periods-page">

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
      title="Employee Pay Periods"
      description="Review employee payroll cutoffs, processing schedules, payroll totals and completed pay periods."
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
            handleCreate
          "
        >
          Create Pay Period
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <EmployeePayPeriodStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <EmployeePayPeriodFilters
      v-model:search="
        search
      "
      v-model:status="
        status
      "
      v-model:year="
        year
      "
      v-model:month="
        month
      "
      v-model:date-from="
        dateFrom
      "
      v-model:date-to="
        dateTo
      "
      :statuses="
        statusOptions
      "
      :years="
        yearOptions
      "
      :months="
        monthOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <EmployeePayPeriodTable
      :periods="
        paginatedPeriods
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
            filteredPeriods.length
          }}
        </strong>

        employee pay periods
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
.employee-periods-page {
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