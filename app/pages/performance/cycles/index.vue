<script setup lang="ts">
import {
  Download,
  Plus,
} from 'lucide-vue-next'

import PerformanceCycleStats from '~/components/performance/cycles/PerformanceCycleStats.vue'
import PerformanceCycleFilters from '~/components/performance/cycles/PerformanceCycleFilters.vue'
import PerformanceCycleTable from '~/components/performance/cycles/PerformanceCycleTable.vue'

const {
  search,
  cycleType,
  evaluationYear,
  status,

  currentPage,

  filteredCycles,
  paginatedCycles,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  cycleTypeOptions,
  yearOptions,
  statusOptions,

  resetFilters,
} = usePerformanceCycles()

const {
  info,
} = useToast()

const handleExport = () => {
  info(
    'Export Evaluation Cycles',
    'Evaluation cycle export functionality will be connected later.',
  )
}

const handleCreateCycle = () => {
  info(
    'Create Evaluation Cycle',
    'Evaluation cycle creation form will be added later.',
  )
}
</script>

<template>
  <section class="performance-cycles-page">

    <!-- HEADER -->

    <PageHeader
      title="Evaluation Cycles"
      description="Manage performance review periods, evaluation schedules, employee coverage and completion progress."
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
            handleCreateCycle
          "
        >
          Create Cycle
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <PerformanceCycleStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <PerformanceCycleFilters
      v-model:search="
        search
      "
      v-model:cycle-type="
        cycleType
      "
      v-model:evaluation-year="
        evaluationYear
      "
      v-model:status="
        status
      "
      :cycle-types="
        cycleTypeOptions
      "
      :years="
        yearOptions
      "
      :statuses="
        statusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <PerformanceCycleTable
      :cycles="
        paginatedCycles
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
            filteredCycles.length
          }}
        </strong>

        evaluation cycles
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
.performance-cycles-page {
  width: 100%;

  max-width: 1660px;

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

    align-items: stretch;

    flex-direction: column;
  }

  .table-footer {
    align-items: flex-start;

    flex-direction: column;
  }
}
</style>