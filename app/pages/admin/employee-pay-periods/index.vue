<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  Plus,
} from 'lucide-vue-next'


import EmployeePayPeriodStats from '~/components/admin/payroll/payroll-periods/EmployeePayPeriodStats.vue'
import EmployeePayPeriodFilters from '~/components/admin/payroll/payroll-periods/EmployeePayPeriodFilters.vue'
import EmployeePayPeriodTable from '~/components/admin/payroll/payroll-periods/EmployeePayPeriodTable.vue'
import EmployeePayPeriodFormModal from '~/components/admin/payroll/payroll-periods/EmployeePayPeriodFormModal.vue'
import EmployeePayPeriodDetailsModal from '~/components/admin/payroll/payroll-periods/EmployeePayPeriodDetailsModal.vue'
import EmployeePayPeriodStatusModal from '~/components/admin/payroll/payroll-periods/EmployeePayPeriodStatusModal.vue'
import EmployeePayPeriodExportModal from '~/components/admin/payroll/payroll-periods/EmployeePayPeriodExportModal.vue'

import type { EmployeePayPeriod } from '~/types/employeePayPeriod'


type PeriodAction =
  | 'open'
  | 'process'
  | 'close'
  | 'cancel'

const router =
  useRouter()

const {
  periods,

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
  success,
  error,
} = useToast()

/* =========================================================
   CREATE / EDIT
========================================================= */

const formOpen =
  ref(false)

const editingPeriod =
  ref<
    EmployeePayPeriod |
    null
  >(null)

const handleCreate = () => {
  editingPeriod.value = null
  formOpen.value = true
}

const handleEdit = (
  period:
    EmployeePayPeriod,
) => {
  editingPeriod.value =
    period

  formOpen.value =
    true
}

const handleSave = (
  payload: {
    periodName: string
    startDate: string
    endDate: string
    cutoffDate: string
    payDate: string
    remarks: string
  },
) => {
  if (editingPeriod.value) {
    const period =
      editingPeriod.value

    period.periodName =
      payload.periodName

    period.startDate =
      payload.startDate

    period.endDate =
      payload.endDate

    period.cutoffDate =
      payload.cutoffDate

    period.payDate =
      payload.payDate

    period.remarks =
      payload.remarks

    formOpen.value =
      false

    editingPeriod.value =
      null

    success(
      'Pay Period Updated',
      `${period.periodCode} has been updated.`,
    )

    return
  }

  const id =
    periods.value.length
      ? Math.max(
          ...periods.value.map(
            item => item.id,
          ),
        ) + 1
      : 1

  const end =
    new Date(
      `${payload.endDate}T00:00:00`,
    )

  const code =
    `EMP-PP-${end.getFullYear()}-${String(
      end.getMonth() + 1,
    ).padStart(2, '0')}${String(
      end.getDate(),
    ).padStart(2, '0')}`

  periods.value.unshift({
    id,

    periodCode: code,

    periodName:
      payload.periodName,

    payrollType:
      'Employee Payroll',

    startDate:
      payload.startDate,

    endDate:
      payload.endDate,

    cutoffDate:
      payload.cutoffDate,

    payDate:
      payload.payDate,

    totalEmployees: 88,

    pendingEmployees: 88,

    processedEmployees: 0,

    completedEmployees: 0,

    grossAmount: 0,

    totalDeductions: 0,

    netAmount: 0,

    status: 'Draft',

    remarks:
      payload.remarks ||
      undefined,

    createdBy:
      'Maria Santos',

    createdAt:
      new Date()
        .toISOString(),
  })

  formOpen.value =
    false

  success(
    'Pay Period Created',
    `${code} has been created as Draft.`,
  )
}

/* =========================================================
   DETAILS
========================================================= */

const detailsOpen =
  ref(false)

const selectedPeriod =
  ref<
    EmployeePayPeriod |
    null
  >(null)

const handleView = (
  period:
    EmployeePayPeriod,
) => {
  selectedPeriod.value =
    period

  detailsOpen.value =
    true
}

/* =========================================================
   STATUS
========================================================= */

const statusOpen =
  ref(false)

const statusPeriod =
  ref<
    EmployeePayPeriod |
    null
  >(null)

const statusAction =
  ref<PeriodAction>(
    'open',
  )

const openStatus = (
  period:
    EmployeePayPeriod,

  action:
    PeriodAction,
) => {
  statusPeriod.value =
    period

  statusAction.value =
    action

  statusOpen.value =
    true
}

const handleStatus = (
  payload: {
    action:
      PeriodAction

    reason: string
  },
) => {
  const period =
    statusPeriod.value

  if (!period) {
    return
  }

  if (
    payload.action ===
    'open'
  ) {
    period.status =
      'Open'

    success(
      'Period Opened',
      `${period.periodCode} is now open for employee payroll.`,
    )
  }

  if (
    payload.action ===
    'process'
  ) {
    period.status =
      'Processing'

    period.processedEmployees =
      period.totalEmployees

    success(
      'Processing Started',
      `${period.periodCode} is now being processed.`,
    )
  }

  if (
    payload.action ===
    'close'
  ) {
    if (
      period.pendingEmployees >
      0
    ) {
      error(
        'Cannot Close Period',
        `${period.pendingEmployees} employee payroll record(s) are still pending.`,
      )

      return
    }

    period.status =
      'Closed'

    success(
      'Period Closed',
      `${period.periodCode} has been closed.`,
    )
  }

  if (
    payload.action ===
    'cancel'
  ) {
    period.status =
      'Cancelled'

    success(
      'Period Cancelled',
      `${period.periodCode} has been cancelled.`,
    )
  }

  statusOpen.value =
    false

  statusPeriod.value =
    null
}

/* =========================================================
   ROUTES
========================================================= */

const handleEmployees = (
  period:
    EmployeePayPeriod,
) => {
  router.push({
    path:
      '/employees',

    query: {
      payroll:
        'employee',

      period:
        period.periodCode,
    },
  })
}

const handlePending = (
  period:
    EmployeePayPeriod,
) => {
  router.push({
    path:
      '/pending-employees-payroll',

    query: {
      period:
        period.periodCode,
    },
  })
}

const handleCompleted = (
  period:
    EmployeePayPeriod,
) => {
  router.push({
    path:
      '/completed-employees-payroll',

    query: {
      period:
        period.periodCode,
    },
  })
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
    `${filteredPeriods.value.length} employee pay period record(s) are ready for export. Actual file generation will be connected during backend integration.`,
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
  <section class="employee-periods-page">

    <button
      type="button"
      class="back-button"
      @click="handleBack"
    >
      <ArrowLeft :size="15" />
      Back to Payroll
    </button>

    <PageHeader
      title="Employee Pay Periods"
      description="Review employee payroll cutoffs, processing schedules, payroll totals and completed pay periods."
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
          :icon="Plus"
          @click="handleCreate"
        >
          Create Pay Period
        </AppButton>

      </div>

    </PageHeader>

    <EmployeePayPeriodStats
      :stats="stats"
    />

    <EmployeePayPeriodFilters
      v-model:search="search"
      v-model:status="status"
      v-model:year="year"
      v-model:month="month"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :statuses="statusOptions"
      :years="yearOptions"
      :months="monthOptions"
      @reset="resetFilters"
    />

    <EmployeePayPeriodTable
      :periods="paginatedPeriods"
      @view="handleView"
      @edit="handleEdit"
      @open="
        period =>
          openStatus(
            period,
            'open',
          )
      "
      @process="
        period =>
          openStatus(
            period,
            'process',
          )
      "
      @employees="handleEmployees"
      @pending="handlePending"
      @completed="handleCompleted"
      @close="
        period =>
          openStatus(
            period,
            'close',
          )
      "
      @cancel="
        period =>
          openStatus(
            period,
            'cancel',
          )
      "
    />

    <div class="table-footer">

      <p>
        Showing

        <strong>
          {{ showingFrom }}–{{ showingTo }}
        </strong>

        of

        <strong>
          {{ filteredPeriods.length }}
        </strong>

        employee pay periods
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />

    </div>

    <!-- CREATE / EDIT -->

    <EmployeePayPeriodFormModal
      :open="formOpen"
      :period="editingPeriod"
      @close="
        formOpen = false
      "
      @save="handleSave"
    />

    <!-- DETAILS -->

    <EmployeePayPeriodDetailsModal
      :open="detailsOpen"
      :period="selectedPeriod"
      @close="
        detailsOpen = false
      "
    />

    <!-- STATUS -->

    <EmployeePayPeriodStatusModal
      :open="statusOpen"
      :period="statusPeriod"
      :action="statusAction"
      @close="
        statusOpen = false
      "
      @confirm="handleStatus"
    />

    <!-- EXPORT -->

    <EmployeePayPeriodExportModal
      :open="exportOpen"
      :record-count="
        filteredPeriods.length
      "
      :status="status"
      :year="year"
      :month="month"
      :date-from="dateFrom"
      :date-to="dateTo"
      @close="
        exportOpen = false
      "
      @export="
        handleExportSubmit
      "
    />

  </section>
</template>

<style scoped>
.employee-periods-page {
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