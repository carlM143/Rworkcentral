<script setup lang="ts">
import {
  Download,
  History,
} from 'lucide-vue-next'

import LifecycleHistoryStats from '~/components/employee-lifecycle/history/LifecycleHistoryStats.vue'
import LifecycleHistoryFilters from '~/components/employee-lifecycle/history/LifecycleHistoryFilters.vue'
import LifecycleHistoryTable from '~/components/employee-lifecycle/history/LifecycleHistoryTable.vue'

const {
  search,
  eventType,
  department,
  status,
  dateFrom,
  dateTo,

  currentPage,

  filteredRecords,
  paginatedRecords,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  eventTypeOptions,
  departmentOptions,
  statusOptions,

  resetFilters,
} = useLifecycleHistory()

const {
  info,
} = useToast()

const handleExport = () => {
  info(
    'Export Lifecycle History',
    'Employee lifecycle history export functionality will be connected later.',
  )
}

const handleTimeline = () => {
  info(
    'Employee Timeline',
    'Detailed employee lifecycle timeline will be added later.',
  )
}
</script>

<template>
  <section class="history-page">

    <!-- HEADER -->

    <PageHeader
      title="Lifecycle History"
      description="Review the consolidated history of employee onboarding, regularization, transfers, promotions, employment changes and offboarding."
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
          :icon="History"
          @click="handleTimeline"
        >
          Employee Timeline
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <LifecycleHistoryStats
      :stats="stats"
    />

    <!-- FILTERS -->

    <LifecycleHistoryFilters
      v-model:search="search"
      v-model:event-type="eventType"
      v-model:department="department"
      v-model:status="status"
      v-model:date-from="dateFrom"
      v-model:date-to="dateTo"
      :event-types="eventTypeOptions"
      :departments="departmentOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <!-- TABLE -->

    <LifecycleHistoryTable
      :records="paginatedRecords"
    />

    <!-- PAGINATION -->

    <div class="table-footer">

      <p>
        Showing

        <strong>
          {{ showingFrom }}–{{ showingTo }}
        </strong>

        of

        <strong>
          {{ filteredRecords.length }}
        </strong>

        lifecycle events
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />

    </div>

  </section>
</template>

<style scoped>
.history-page {
  width: 100%;

  max-width: 1680px;

  margin:
    0 auto;
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
    14px 3px 0;
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