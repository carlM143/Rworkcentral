<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  FileText,
} from 'lucide-vue-next'

import CompletedDriverPayrollStats from '~/components/payroll/completed-drivers-payroll/CompletedDriverPayrollStats.vue'

import CompletedDriverPayrollFilters from '~/components/payroll/completed-drivers-payroll/CompletedDriverPayrollFilters.vue'

import CompletedDriverPayrollTable from '~/components/payroll/completed-drivers-payroll/CompletedDriverPayrollTable.vue'

import CompletedDriverPayrollDetailsModal from '~/components/payroll/completed-drivers-payroll/CompletedDriverPayrollDetailsModal.vue'

import CompletedDriverPaymentModal from '~/components/payroll/completed-drivers-payroll/CompletedDriverPaymentModal.vue'

import CompletedDriverPayrollExportModal from '~/components/payroll/completed-drivers-payroll/CompletedDriverPayrollExportModal.vue'

import CompletedDriverPayrollReportModal from '~/components/payroll/completed-drivers-payroll/CompletedDriverPayrollReportModal.vue'

import type {
  CompletedDriverPayroll,
} from '~/types/completedDriverPayroll'

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
  success,
} = useToast()

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
    CompletedDriverPayroll |
    null
  >(null)

const handleView = (
  payroll:
    CompletedDriverPayroll,
) => {
  selectedPayroll.value =
    payroll

  detailsOpen.value =
    true
}

/* =========================================================
   DRIVER
========================================================= */

const handleDriver = (
  payroll:
    CompletedDriverPayroll,
) => {
  router.push(
    `/employees/${payroll.driverId}`,
  )
}

/* =========================================================
   TRIPS
========================================================= */

const handleTrips = (
  payroll:
    CompletedDriverPayroll,
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
   PAYSLIP
========================================================= */

const handlePayslip = (
  payroll:
    CompletedDriverPayroll,
) => {
  info(
    'Driver Payslip',
    `${payroll.driverName}'s payslip preview/download UI can be connected next.`,
  )
}

/* =========================================================
   PAYMENT
========================================================= */

const paymentOpen =
  ref(false)

const paymentPayroll =
  ref<
    CompletedDriverPayroll |
    null
  >(null)

const paymentAction =
  ref<
    'view' |
    'paid' |
    'released'
  >('view')

const openPayment = (
  payroll:
    CompletedDriverPayroll,

  action:
    'view' |
    'paid' |
    'released',
) => {
  paymentPayroll.value =
    payroll

  paymentAction.value =
    action

  paymentOpen.value =
    true
}

const handlePaymentConfirm = (
  payload: {
    action:
      'paid' |
      'released'

    referenceNumber: string
  },
) => {
  const payroll =
    paymentPayroll.value

  if (!payroll) {
    return
  }

  if (
    payload.action ===
    'paid'
  ) {
    payroll.paymentStatus =
      'Paid'

    payroll.referenceNumber =
      payload.referenceNumber ||
      payroll.referenceNumber ||
      `DRV-PMT-${Date.now()}`

    payroll.paidBy =
      'Maria Santos'

    payroll.paidAt =
      new Date()
        .toISOString()

    success(
      'Payroll Marked as Paid',
      `${payroll.driverName}'s payroll has been marked as paid.`,
    )
  }

  if (
    payload.action ===
    'released'
  ) {
    payroll.paymentStatus =
      'Released'

    payroll.referenceNumber =
      payload.referenceNumber ||
      payroll.referenceNumber

    success(
      'Payroll Released',
      `${payroll.driverName}'s payroll has been marked as released.`,
    )
  }

  paymentOpen.value =
    false

  paymentPayroll.value =
    null
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
    `${filteredPayrolls.value.length} completed driver payroll record(s) are ready for export. Actual file generation will be connected during backend integration.`,
  )
}

/* =========================================================
   REPORT
========================================================= */

const reportOpen =
  ref(false)

const handleReport = () => {
  reportOpen.value =
    true
}

const handleGenerateReport = (
  type:
    | 'Summary'
    | 'Detailed Payroll'
    | 'Payment Status',
) => {
  reportOpen.value =
    false

  info(
    `${type} Report`,
    `${filteredPayrolls.value.length} completed driver payroll record(s) will be included in the report.`,
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
  <section class="completed-driver-page">

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

    <CompletedDriverPayrollStats
      :stats="
        stats
      "
    />

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

    <CompletedDriverPayrollTable
      :payrolls="
        paginatedPayrolls
      "
      @view="
        handleView
      "
      @driver="
        handleDriver
      "
      @trips="
        handleTrips
      "
      @payment="
        payroll =>
          openPayment(
            payroll,
            'view',
          )
      "
      @payslip="
        handlePayslip
      "
      @paid="
        payroll =>
          openPayment(
            payroll,
            'paid',
          )
      "
      @released="
        payroll =>
          openPayment(
            payroll,
            'released',
          )
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

    <!-- DETAILS -->

    <CompletedDriverPayrollDetailsModal
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

    <!-- PAYMENT -->

    <CompletedDriverPaymentModal
      :open="
        paymentOpen
      "
      :payroll="
        paymentPayroll
      "
      :action="
        paymentAction
      "
      @close="
        paymentOpen =
          false
      "
      @confirm="
        handlePaymentConfirm
      "
    />

    <!-- EXPORT -->

    <CompletedDriverPayrollExportModal
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

    <!-- REPORT -->

    <CompletedDriverPayrollReportModal
      :open="
        reportOpen
      "
      :record-count="
        filteredPayrolls.length
      "
      :gross-pay="
        stats.grossPay
      "
      :deductions="
        stats.deductions
      "
      :net-pay="
        stats.netPay
      "
      @close="
        reportOpen =
          false
      "
      @generate="
        handleGenerateReport
      "
    />

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