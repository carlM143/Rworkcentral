<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  FileBarChart,
} from 'lucide-vue-next'

import EmployeePayrollStats from '~/components/payroll/employee-payroll/EmployeePayrollStats.vue'

import EmployeePayrollFilters from '~/components/payroll/employee-payroll/EmployeePayrollFilters.vue'

import EmployeePayrollTable from '~/components/payroll/employee-payroll/EmployeePayrollTable.vue'

import EmployeePayrollDetailsModal from '~/components/payroll/employee-payroll/EmployeePayrollDetailsModal.vue'

import EmployeePayrollPayslipModal from '~/components/payroll/employee-payroll/EmployeePayrollPayslipModal.vue'

import EmployeePayrollExportModal from '~/components/payroll/employee-payroll/EmployeePayrollExportModal.vue'

import EmployeePayrollSummaryModal from '~/components/payroll/employee-payroll/EmployeePayrollSummaryModal.vue'

import type {
  EmployeePayroll,
} from '~/types/employeePayroll'

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

const {
  info,
} = useToast()

/* =========================================================
   QUERY FILTERS
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
   DETAILS
========================================================= */

const detailsOpen =
  ref(false)

const selectedPayroll =
  ref<
    EmployeePayroll |
    null
  >(null)

const handleView = (
  payroll:
    EmployeePayroll,
) => {
  selectedPayroll.value =
    payroll

  detailsOpen.value =
    true
}

/* =========================================================
   EMPLOYEE
========================================================= */

const handleEmployee = (
  payroll:
    EmployeePayroll,
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
    EmployeePayroll,
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
   SOURCE PAYROLL
========================================================= */

const handleSource = (
  payroll:
    EmployeePayroll,
) => {
  if (
    payroll.payrollStatus ===
    'Completed'
  ) {
    router.push({
      path:
        '/completed-employees-payroll',

      query: {
        period:
          payroll.periodCode,
      },
    })

    return
  }

  router.push({
    path:
      '/pending-employees-payroll',

    query: {
      period:
        payroll.periodCode,

      employee:
        payroll.employeeNumber,
    },
  })
}

/* =========================================================
   PAYSLIP
========================================================= */

const payslipOpen =
  ref(false)

const payslipPayroll =
  ref<
    EmployeePayroll |
    null
  >(null)

const handlePayslip = (
  payroll:
    EmployeePayroll,
) => {
  payslipPayroll.value =
    payroll

  payslipOpen.value =
    true
}

const handlePrintPayslip = () => {
  payslipOpen.value =
    false

  info(
    'Print Payslip',
    'Printable/PDF payslip generation will be connected during backend integration.',
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
    `${filteredPayrolls.value.length} employee payroll record(s) are ready for export. Actual file generation will be connected later.`,
  )
}

/* =========================================================
   SUMMARY
========================================================= */

const summaryOpen =
  ref(false)

const handleSummary = () => {
  summaryOpen.value =
    true
}

const summaryPending =
  computed(() => {
    return filteredPayrolls.value.filter(
      payroll =>
        payroll.payrollStatus !==
        'Completed',
    ).length
  })

const summaryCompleted =
  computed(() => {
    return filteredPayrolls.value.filter(
      payroll =>
        payroll.payrollStatus ===
        'Completed',
    ).length
  })

const summaryPaid =
  computed(() => {
    return filteredPayrolls.value.filter(
      payroll =>
        payroll.paymentStatus ===
          'Paid' ||
        payroll.paymentStatus ===
          'Released',
    ).length
  })

const summaryUnpaid =
  computed(() => {
    return filteredPayrolls.value.filter(
      payroll =>
        payroll.paymentStatus ===
          'Not Yet Paid' ||
        payroll.paymentStatus ===
          'Pending Payment',
    ).length
  })

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
  <section class="employee-payroll-page">

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

    <EmployeePayrollStats
      :stats="
        stats
      "
    />

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

    <EmployeePayrollTable
      :payrolls="
        paginatedPayrolls
      "
      @view="
        handleView
      "
      @employee="
        handleEmployee
      "
      @time-logs="
        handleTimeLogs
      "
      @payslip="
        handlePayslip
      "
      @source="
        handleSource
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

    <!-- DETAILS -->

    <EmployeePayrollDetailsModal
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

    <!-- PAYSLIP -->

    <EmployeePayrollPayslipModal
      :open="
        payslipOpen
      "
      :payroll="
        payslipPayroll
      "
      @close="
        payslipOpen =
          false
      "
      @print="
        handlePrintPayslip
      "
    />

    <!-- EXPORT -->

    <EmployeePayrollExportModal
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
      :payroll-status="
        payrollStatus
      "
      :payment-status="
        paymentStatus
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

    <!-- SUMMARY -->

    <EmployeePayrollSummaryModal
      :open="
        summaryOpen
      "
      :stats="
        stats
      "
      :pending="
        summaryPending
      "
      :completed="
        summaryCompleted
      "
      :paid="
        summaryPaid
      "
      :unpaid="
        summaryUnpaid
      "
      @close="
        summaryOpen =
          false
      "
    />

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

    align-items: stretch;

    flex-direction: column;
  }

  .table-footer {
    align-items:
      flex-start;

    flex-direction:
      column;
  }
}
</style>