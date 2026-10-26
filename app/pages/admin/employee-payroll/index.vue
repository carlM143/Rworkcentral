<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  FileBarChart,
} from 'lucide-vue-next'

import EmployeePayrollStats from '~/components/admin/payroll/employee-payroll/EmployeePayrollStats.vue'
import EmployeePayrollFilters from '~/components/admin/payroll/employee-payroll/EmployeePayrollFilters.vue'
import EmployeePayrollTable from '~/components/admin/payroll/employee-payroll/EmployeePayrollTable.vue'

const router =
  useRouter()

const route =
  useRoute()

const {
  search,
  period,
  department,
  payrollStatus,
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
  payrollStatusOptions,
  paymentStatusOptions,

  resetFilters,
} = useEmployeePayroll()

const exportOpen = ref(false)
const ledgerOpen = ref(false)
const ledgerMode = ref('details')
const selectedPayroll = ref<Record<string, any> | null>(null)
const lastChecked = ref('')
const openPayroll = (mode: string, record: Record<string, any> | null = null) => { ledgerMode.value = mode; selectedPayroll.value = record; ledgerOpen.value = true }

/* =========================================================
   QUERY FILTERS

   Examples:
   /admin/employee-payroll?period=EMP-PP-2026-0915
   /admin/employee-payroll?employee=EMP-002
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

watch(
  () =>
    route.query.employee,
  value => {
    if (
      typeof value ===
        'string' &&
      value
    ) {
      search.value =
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

const handleExport = () => { exportOpen.value = true }

const handleSummary = () => openPayroll('summary')

const handleBack = () => {
  router.push(
    '/admin/payroll',
  )
}
</script>

<template>
  <section class="employee-payroll-page">

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
      title="Employee Payroll"
      description="View and monitor employee payroll records across all pay periods, including earnings, deductions, payroll status and payment history."
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
          :icon="FileBarChart"
          @click="
            handleSummary
          "
        >
          Payroll Summary
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <EmployeePayrollStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <EmployeePayrollFilters
      v-model:search="
        search
      "
      v-model:period="
        period
      "
      v-model:department="
        department
      "
      v-model:payroll-status="
        payrollStatus
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
      :payroll-statuses="
        payrollStatusOptions
      "
      :payment-statuses="
        paymentStatusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <EmployeePayrollTable
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

        employee payroll records
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

    <PayrollExportDialog :open="exportOpen" title="Employee Payroll" :records="filteredPayrolls" :filters="{ Search: search, Period: period, Department: department, 'Payroll Status': payrollStatus, 'Payment Status': paymentStatus }" :date-from="dateFrom" :date-to="dateTo" @close="exportOpen = false" />
    <PayrollLedgerDialog :open="ledgerOpen" :mode="ledgerMode" :record="selectedPayroll" :records="filteredPayrolls" title="Employee Payroll Summary" @close="ledgerOpen = false" @checked="at => lastChecked = at" />
  </section>
</template>

<style scoped>
.employee-payroll-page {
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
