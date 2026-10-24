<script setup lang="ts">
import {
  ArrowLeft,
  Download,
  SlidersHorizontal,
} from 'lucide-vue-next'

import LeaveBalanceStats from '~/components/admin/leave/balances/LeaveBalanceStats.vue'
import LeaveBalanceFilters from '~/components/admin/leave/balances/LeaveBalanceFilters.vue'
import LeaveBalanceTable from '~/components/admin/leave/balances/LeaveBalanceTable.vue'

const router =
  useRouter()

const {
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

  resetFilters,
} = useLeaveBalances()

const {
  info,
} = useToast()

const handleBack = () => {
  router.push(
    '/admin/leave-management',
  )
}

const handleExport = () => {
  info(
    'Export Leave Balances',
    'Leave balance export functionality will be connected later.',
  )
}

const handleAdjustCredits = () => {
  info(
    'Adjust Leave Credits',
    'Manual leave credit adjustment workflow will be added later.',
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
      :stats="stats"
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
    align-items: flex-start;

    flex-direction: column;
  }
}
</style>