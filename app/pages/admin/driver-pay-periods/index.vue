<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  Plus,
} from 'lucide-vue-next'

import DriverPayPeriodStats from '~/components/admin/payroll/driver-pay-periods/DriverPayPeriodStats.vue'
import DriverPayPeriodFilters from '~/components/admin/payroll/driver-pay-periods/DriverPayPeriodFilters.vue'
import DriverPayPeriodTable from '~/components/admin/payroll/driver-pay-periods/DriverPayPeriodTable.vue'
import AddEditDriverPayPeriodModal from '~/components/admin/payroll/driver-pay-periods/AddEditDriverPayPeriodModal.vue'
import DriverPayPeriodDetailsModal from '~/components/admin/payroll/driver-pay-periods/DriverPayPeriodDetailsModal.vue'
import DriverPayPeriodStatusModal from '~/components/admin/payroll/driver-pay-periods/DriverPayPeriodStatusModal.vue'

import type {
  DriverPayPeriod,
  DriverPayPeriodAction,
  DriverPayPeriodFormData,
  DriverPayPeriodStatusFormData,
} from '~/types/driverPayPeriod'

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
  yearOptions,
  monthOptions,

  createPeriod,
  updatePeriod,

  openPeriod,
  processPeriod,
  closePeriod,
  cancelPeriod,

  resetFilters,
} = useDriverPayPeriods()

const {
  info,
  success,
  error,
} = useToast()

/* =========================================================
   ADD / EDIT
========================================================= */

const formOpen =
  ref(false)

const editingPeriod =
  ref<
    DriverPayPeriod |
    null
  >(null)

const handleAdd = () => {
  editingPeriod.value =
    null

  formOpen.value =
    true
}

const handleEdit = (
  period:
    DriverPayPeriod,
) => {
  editingPeriod.value =
    period

  formOpen.value =
    true
}

const closeForm = () => {
  formOpen.value =
    false

  editingPeriod.value =
    null
}

/* =========================================================
   SAVE
========================================================= */

const handleSave = (
  data:
    DriverPayPeriodFormData,
) => {
  if (
    editingPeriod.value
  ) {
    const updated =
      updatePeriod(
        editingPeriod.value.id,
        data,
      )

    if (!updated) {
      info(
        'Unable to Update',
        'The selected driver pay period could not be updated.',
      )

      return
    }

    closeForm()

    success(
      'Pay Period Updated',
      `${updated.periodCode} has been updated successfully.`,
    )

    return
  }

  const created =
    createPeriod(data)

  closeForm()

  success(
    'Pay Period Created',
    `${created.periodCode} has been created as Draft.`,
  )
}

/* =========================================================
   DETAILS
========================================================= */

const detailsOpen =
  ref(false)

const selectedPeriod =
  ref<
    DriverPayPeriod |
    null
  >(null)

const handleView = (
  period:
    DriverPayPeriod,
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
    DriverPayPeriod |
    null
  >(null)

const statusAction =
  ref<
    DriverPayPeriodAction
  >('open')

const openStatusModal = (
  period:
    DriverPayPeriod,

  action:
    DriverPayPeriodAction,
) => {
  statusPeriod.value =
    period

  statusAction.value =
    action

  statusOpen.value =
    true
}

const closeStatusModal = () => {
  statusOpen.value =
    false

  statusPeriod.value =
    null
}

const handleStatusSave = (
  data:
    DriverPayPeriodStatusFormData,
) => {
  if (
    data.action ===
    'open'
  ) {
    const period =
      openPeriod(
        data.periodId,
      )

    if (!period) {
      return
    }

    closeStatusModal()

    success(
      'Period Opened',
      `${period.periodCode} is now open for driver payroll processing.`,
    )

    return
  }

  if (
    data.action ===
    'process'
  ) {
    const period =
      processPeriod(
        data.periodId,
      )

    if (!period) {
      return
    }

    closeStatusModal()

    success(
      'Processing Started',
      `${period.periodCode} is now being processed.`,
    )

    return
  }

  if (
    data.action ===
    'close'
  ) {
    const period =
      closePeriod(
        data.periodId,
      )

    if (!period) {
      error(
        'Cannot Close Period',
        'All driver payroll records must be completed before closing the period.',
      )

      return
    }

    closeStatusModal()

    success(
      'Period Closed',
      `${period.periodCode} has been closed successfully.`,
    )

    return
  }

  const period =
    cancelPeriod(
      data.periodId,
      data.notes,
    )

  if (!period) {
    return
  }

  closeStatusModal()

  success(
    'Period Cancelled',
    `${period.periodCode} has been cancelled.`,
  )
}

/* =========================================================
   VIEW DRIVERS
========================================================= */

const handleDrivers = (
  period:
    DriverPayPeriod,
) => {
  router.push({
    path:
      '/admin/employees',

    query: {
      payroll:
        'driver',

      period:
        period.periodCode,
    },
  })
}

/* =========================================================
   PENDING PAYROLL
========================================================= */

const handlePending = (
  period:
    DriverPayPeriod,
) => {
  router.push({
    path:
      '/admin/pending-drivers-payroll',

    query: {
      period:
        period.periodCode,
    },
  })
}

/* =========================================================
   COMPLETED PAYROLL
========================================================= */

const handleCompleted = (
  period:
    DriverPayPeriod,
) => {
  router.push({
    path:
      '/admin/completed-drivers-payroll',

    query: {
      period:
        period.periodCode,
    },
  })
}

/* =========================================================
   EXPORT
========================================================= */

const handleExport = () => {
  info(
    'Export Driver Pay Periods',
    'Driver pay period export will be connected later.',
  )
}

/* =========================================================
   BACK
========================================================= */

const handleBack = () => {
  router.push(
    '/admin/payroll',
  )
}
</script>

<template>
  <section class="driver-periods-page">

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
      title="Driver Pay Periods"
      description="Create and manage driver payroll cutoffs, processing periods and completed payroll schedules."
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
            handleAdd
          "
        >
          Create Pay Period
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <DriverPayPeriodStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <DriverPayPeriodFilters
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

    <DriverPayPeriodTable
      :periods="
        paginatedPeriods
      "
      @view="
        handleView
      "
      @edit="
        handleEdit
      "
      @open="
        period =>
          openStatusModal(
            period,
            'open',
          )
      "
      @process="
        period =>
          openStatusModal(
            period,
            'process',
          )
      "
      @drivers="
        handleDrivers
      "
      @pending="
        handlePending
      "
      @completed="
        handleCompleted
      "
      @close="
        period =>
          openStatusModal(
            period,
            'close',
          )
      "
      @cancel="
        period =>
          openStatusModal(
            period,
            'cancel',
          )
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

        driver pay periods
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

    <!-- FORM -->

    <AddEditDriverPayPeriodModal
      :open="
        formOpen
      "
      :period="
        editingPeriod
      "
      @close="
        closeForm
      "
      @save="
        handleSave
      "
    />

    <!-- DETAILS -->

    <DriverPayPeriodDetailsModal
      :open="
        detailsOpen
      "
      :period="
        selectedPeriod
      "
      @close="
        detailsOpen = false
      "
    />

    <!-- STATUS -->

    <DriverPayPeriodStatusModal
      :open="
        statusOpen
      "
      :period="
        statusPeriod
      "
      :action="
        statusAction
      "
      @close="
        closeStatusModal
      "
      @save="
        handleStatusSave
      "
    />

  </section>
</template>

<style scoped>
.driver-periods-page {
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