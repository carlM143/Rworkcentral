<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  SlidersHorizontal,
} from 'lucide-vue-next'

import LeaveBalanceStats from '~/components/leave/balances/LeaveBalanceStats.vue'

import LeaveBalanceFilters from '~/components/leave/balances/LeaveBalanceFilters.vue'

import LeaveBalanceTable from '~/components/leave/balances/LeaveBalanceTable.vue'

import AdjustLeaveCreditsModal from '~/components/leave/balances/AdjustLeaveCreditsModal.vue'

import LeaveBalanceExportModal from '~/components/leave/balances/LeaveBalanceExportModal.vue'

import type {
  LeaveBalance,
  LeaveCreditAdjustmentFormData,
} from '~/types/leaveBalance'

const router =
  useRouter()

const {
  balances,

  search,
  department,
  status,

  currentPage,

  filteredBalances,
  paginatedBalances,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  departmentOptions,
  statusOptions,
  leaveTypeOptions,

  adjustCredits,

  resetFilters,
} = useLeaveBalances()

const {
  info,
  success,
} = useToast()

/* =========================================================
   BACK
========================================================= */

const handleBack = () => {
  router.push(
    '/leave-management',
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
    'Excel' |
    'PDF' |
    'CSV',
) => {
  exportOpen.value =
    false

  info(
    `Export ${format}`,
    `${filteredBalances.value.length} employee leave balance record(s) are ready for export. Actual file generation will be connected during backend integration.`,
  )
}

/* =========================================================
   ADJUST CREDIT
========================================================= */

const adjustOpen =
  ref(false)

const selectedBalance =
  ref<
    LeaveBalance |
    null
  >(null)

const handleAdjustCredits = () => {
  selectedBalance.value =
    null

  adjustOpen.value =
    true
}

const handleRowAdjust = (
  balance:
    LeaveBalance,
) => {
  selectedBalance.value =
    balance

  adjustOpen.value =
    true
}

const closeAdjustModal = () => {
  adjustOpen.value =
    false

  selectedBalance.value =
    null
}

const handleSaveAdjustment = (
  data:
    LeaveCreditAdjustmentFormData,
) => {
  const result =
    adjustCredits(
      data,
    )

  if (
    !result.success
  ) {
    info(
      'Unable to Adjust Credits',
      result.message,
    )

    return
  }

  closeAdjustModal()

  success(
    'Leave Credits Adjusted',
    `${result.balance?.employeeName}'s ${data.leaveType} has been updated successfully.`,
  )
}

/* =========================================================
   VIEW EMPLOYEE
========================================================= */

const handleEmployee = (
  balance:
    LeaveBalance,
) => {
  router.push(
    `/employees/${balance.employeeId}`,
  )
}
</script>

<template>
  <section class="leave-balance-page">

    <!-- BACK -->

    <button
      type="button"
      class="back-button"
      @click="
        handleBack
      "
    >

      <ArrowLeft
        :size="15"
      />

      Back to Leave Management

    </button>

    <!-- HEADER -->

    <PageHeader
      title="Leave Balances"
      description="Monitor employee leave allocations, used credits and remaining leave balances."
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
          :icon="SlidersHorizontal"
          @click="
            handleAdjustCredits
          "
        >
          Adjust Credits
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <LeaveBalanceStats
      :stats="
        stats
      "
    />

    <!-- FILTER -->

    <LeaveBalanceFilters
      v-model:search="
        search
      "
      v-model:department="
        department
      "
      v-model:status="
        status
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

    <LeaveBalanceTable
      :balances="
        paginatedBalances
      "
      @employee="
        handleEmployee
      "
      @adjust="
        handleRowAdjust
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
            filteredBalances.length
          }}
        </strong>

        employee leave balances
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

    <!-- ADJUST CREDITS -->

    <AdjustLeaveCreditsModal
      :open="
        adjustOpen
      "
      :balances="
        balances
      "
      :selected-balance="
        selectedBalance
      "
      :leave-types="
        leaveTypeOptions
      "
      @close="
        closeAdjustModal
      "
      @save="
        handleSaveAdjustment
      "
    />

    <!-- EXPORT -->

    <LeaveBalanceExportModal
      :open="
        exportOpen
      "
      :record-count="
        filteredBalances.length
      "
      :available-credits="
        stats.availableCredits
      "
      :low-balance-count="
        stats.lowBalance
      "
      :exhausted-count="
        stats.exhausted
      "
      @close="
        exportOpen =
          false
      "
      @export="
        handleExportSubmit
      "
    />

  </section>
</template>

<style scoped>
.leave-balance-page {
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