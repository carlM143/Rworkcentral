<script setup lang="ts">
import {
  Download,
  Plus,
  RotateCcw,
} from 'lucide-vue-next'

import type {
  PerformanceEvaluation,
} from '~/types/performance'

const {
  currentCycle,

  search,
  department,
  status,

  currentPage,

  filteredEvaluations,
  paginatedEvaluations,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  dueSoon,
  ratingSummary,

  departments,
  statusOptions,

  resetFilters,
} = usePerformanceOverview()

const router =
  useRouter()

const {
  info,
} = useToast()

const handleExport = () => {
  info(
    'Export Performance',
    'Performance report export will be connected later.',
  )
}

const handleCreateCycle = () => {
  info(
    'Create Evaluation Cycle',
    'Evaluation cycle creation UI will be implemented next.',
  )
}

const handleView = (
  evaluation:
    PerformanceEvaluation,
) => {
  info(
    'Performance Evaluation',
    `${evaluation.employeeName} — ${evaluation.evaluationType}`,
  )
}

const handleEvaluations = () => {
  router.push(
    '/performance/evaluations',
  )
}

const handleTemplates = () => {
  router.push(
    '/performance/templates',
  )
}
</script>

<template>
  <section class="performance-page">

    <!-- HEADER -->
    <PageHeader
      title="Performance"
      description="Manage employee evaluations, review cycles, performance ratings and evaluation progress."
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
        @click="handleCreateCycle"
      >
        Create Cycle
      </AppButton>

    </PageHeader>

    <!-- STATS -->
    <PerformanceStats
      :stats="stats"
    />

    <!-- CYCLE -->
    <PerformanceCycleCard
      :cycle="currentCycle"
    />

    <!-- FILTERS -->
    <div class="performance-filters">

      <AppInput
        v-model="search"
        searchable
        clearable
        placeholder="Search employee or employee ID..."
      />

      <AppSelect
        v-model="department"
        :options="departments"
        placeholder="All Departments"
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

    <!-- MAIN -->
    <div class="performance-layout">

      <div class="performance-main">

        <PerformanceOverviewEvaluationTable
          :evaluations="
            paginatedEvaluations
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
              {{ filteredEvaluations.length }}
            </strong>

            evaluations
          </p>

          <AppPagination
            v-model="currentPage"
            :total-pages="totalPages"
          />

        </div>

      </div>

      <PerformanceSidePanel
        :due-soon="dueSoon"
        :rating-summary="ratingSummary"
        @create-cycle="handleCreateCycle"
        @evaluations="handleEvaluations"
        @templates="handleTemplates"
      />

    </div>

  </section>
</template>

<style scoped>
.performance-page {
  width: 100%;

  max-width: 1660px;

  margin: 0 auto;
}

.performance-filters {
  display: grid;

  grid-template-columns:
    minmax(300px, 1fr)
    210px
    180px
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

.performance-layout {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    290px;

  gap: 12px;
}

.performance-main {
  min-width: 0;
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
}

@media (max-width: 1100px) {
  .performance-layout {
    grid-template-columns: 1fr;
  }

  .performance-filters {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .performance-filters {
    grid-template-columns: 1fr;
  }

  .table-footer {
    flex-direction: column;

    align-items: flex-start;
  }
}
</style>
