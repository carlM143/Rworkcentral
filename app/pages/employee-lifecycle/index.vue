<script setup lang="ts">
import {
  Download,
  Plus,
  RotateCcw,
} from 'lucide-vue-next'

import type {
  LifecycleTransaction,
} from '~/types/employeeLifecycle'

const {
  search,
  type,
  status,

  currentPage,

  filteredTransactions,
  paginatedTransactions,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  upcomingActions,
  transactionSummary,

  recentActivity,

  typeOptions,
  statusOptions,

  resetFilters,
} = useEmployeeLifecycle()

const {
  info,
} = useToast()

/* =========================================================
   ACTIONS
========================================================= */

const handleExport = () => {
  info(
    'Export Lifecycle Records',
    'Employee lifecycle export will be connected later.',
  )
}

const handleCreateTransaction = () => {
  info(
    'New Lifecycle Transaction',
    'Select the employee lifecycle action you want to process.',
  )
}

const handleView = (
  transaction:
    LifecycleTransaction,
) => {
  info(
    transaction.type,
    `${transaction.employeeName} — ${transaction.reference}`,
  )
}

const handleOnboarding = () => {
  info(
    'Start Onboarding',
    'Employee onboarding workflow will be implemented in the onboarding module.',
  )
}

const handleTransfer = () => {
  info(
    'Process Transfer',
    'Employee transfer workflow will be implemented in the transfer module.',
  )
}

const handleRegularization = () => {
  info(
    'Regularize Employee',
    'Employee regularization workflow will be implemented next.',
  )
}

const handleOffboarding = () => {
  info(
    'Start Offboarding',
    'Employee offboarding workflow will be implemented in the offboarding module.',
  )
}
</script>

<template>
  <section class="lifecycle-page">

    <!-- HEADER -->
    <PageHeader
      title="Employee Lifecycle"
      description="Manage employee onboarding, regularization, transfers, promotions, employment changes and offboarding."
    >

      <AppButton
        variant="secondary"
        :icon="Download"
        @click="handleExport"
      >
        Export
      </AppButton>

      <AppButton
        :icon="Plus"
        @click="handleCreateTransaction"
      >
        New Transaction
      </AppButton>

    </PageHeader>

    <!-- STATS -->
    <LifecycleStats
      :stats="stats"
    />

    <!-- FILTERS -->
    <div class="lifecycle-filters">

      <AppInput
        v-model="search"
        searchable
        clearable
        placeholder="Search employee, employee ID or reference..."
      />

      <AppSelect
        v-model="type"
        :options="typeOptions"
        placeholder="All Transaction Types"
      />

      <AppSelect
        v-model="status"
        :options="statusOptions"
        placeholder="All Status"
      />

      <AppButton
        variant="secondary"
        :icon="RotateCcw"
        @click="resetFilters"
      >
        Reset
      </AppButton>

    </div>

    <!-- CONTENT -->
    <div class="lifecycle-layout">

      <!-- LEFT -->
      <div class="lifecycle-main">

        <LifecycleTransactionsTable
          :transactions="
            paginatedTransactions
          "
          @view="handleView"
        />

        <div class="table-footer">

          <p>
            Showing

            <strong>
              {{ showingFrom }}–{{ showingTo }}
            </strong>

            of

            <strong>
              {{ filteredTransactions.length }}
            </strong>

            transactions
          </p>

          <AppPagination
            v-model="currentPage"
            :total-pages="totalPages"
          />

        </div>

        <RecentLifecycleActivity
          :activities="recentActivity"
        />

      </div>

      <!-- RIGHT -->
      <LifecycleSidePanel
        :upcoming-actions="upcomingActions"
        :summary="transactionSummary"
        @onboarding="handleOnboarding"
        @transfer="handleTransfer"
        @regularization="
          handleRegularization
        "
        @offboarding="handleOffboarding"
      />

    </div>

  </section>
</template>

<style scoped>
.lifecycle-page {
  width: 100%;

  max-width: 1660px;

  margin: 0 auto;
}

/* =========================================
   FILTERS
========================================= */

.lifecycle-filters {
  display: grid;

  grid-template-columns:
    minmax(320px, 1fr)
    220px
    190px
    auto;

  gap: 8px;

  margin-bottom: 14px;

  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 10px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

/* Same font size as Performance/Documents */

.lifecycle-filters :deep(input) {
  font-size: 11px;
}

.lifecycle-filters :deep(select) {
  font-size: 11px;
}

.lifecycle-filters :deep(button) {
  font-size: 10px;
}

/* =========================================
   MAIN LAYOUT
========================================= */

.lifecycle-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    320px;

  gap: 14px;
}

.lifecycle-main {
  display: flex;

  min-width: 0;

  flex-direction: column;

  gap: 14px;
}

/* =========================================
   FOOTER
========================================= */

.table-footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 20px;

  padding:
    2px 3px 0;
}

.table-footer p {
  margin: 0;

  color:
    var(--text-muted);

  font-size: 11px;
}

.table-footer strong {
  color:
    var(--text-primary);

  font-size: 11px;
  font-weight: 650;
}

/* =========================================
   RESPONSIVE
========================================= */

@media (max-width: 1100px) {
  .lifecycle-layout {
    grid-template-columns: 1fr;
  }

  .lifecycle-filters {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .lifecycle-filters {
    grid-template-columns: 1fr;
  }

  .table-footer {
    flex-direction: column;

    align-items: flex-start;
  }
}
</style>