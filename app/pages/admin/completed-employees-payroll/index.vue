<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  FileText,
} from 'lucide-vue-next'

import CompletedEmployeePayrollStats from '~/components/admin/payroll/completed-employees-payroll/CompletedEmployeePayrollStats.vue'
import CompletedEmployeePayrollFilters from '~/components/admin/payroll/completed-employees-payroll/CompletedEmployeePayrollFilters.vue'
import CompletedEmployeePayrollTable from '~/components/admin/payroll/completed-employees-payroll/CompletedEmployeePayrollTable.vue'

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
} = useCompletedEmployeePayroll()

const exportOpen = ref(false)
const ledgerOpen = ref(false)
const ledgerMode = ref('details')
const selectedPayroll = ref<Record<string, any> | null>(null)
const lastChecked = ref('')
const openPayroll = (mode: string, record: Record<string, any> | null = null) => { ledgerMode.value = mode; selectedPayroll.value = record; ledgerOpen.value = true }

/* =========================================================
   PERIOD QUERY

   Example:
   /admin/completed-employees-payroll?period=EMP-PP-2026-0831
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
   UI ONLY
========================================================= */

const handleExport = () => { exportOpen.value = true }

const handleReport = () => openPayroll('summary')

const handleBack = () => {
  router.push(
    '/admin/payroll',
  )
}
</script>

<template>
  <section class="completed-employee-page">

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
      title="Completed Employees Payroll"
      description="Review completed employee payroll records, payment releases, deductions and final net payroll amounts."
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

    <CompletedEmployeePayrollStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <CompletedEmployeePayrollFilters
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

    <CompletedEmployeePayrollTable
      @action="openPayroll"
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

        completed employee payroll records
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

    <PayrollExportDialog :open="exportOpen" title="Completed Employee Payroll" :records="filteredPayrolls" :filters="{ Search: search, Period: period, Department: department, 'Payment Status': paymentStatus }" :date-from="dateFrom" :date-to="dateTo" @close="exportOpen = false" />
    <PayrollLedgerDialog :open="ledgerOpen" :mode="ledgerMode" :record="selectedPayroll" :records="filteredPayrolls" title="Completed Employee Payroll Summary" @close="ledgerOpen = false" @checked="at => lastChecked = at" />
  </section>
</template>

<style scoped>
.completed-employee-page {
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
