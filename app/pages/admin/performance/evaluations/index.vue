<script setup lang="ts">
import {
  CalendarRange,
  Download,
} from 'lucide-vue-next'

import PerformanceEvaluationStats from '~/components/admin/performance/evaluations/PerformanceEvaluationStats.vue'
import PerformanceEvaluationFilters from '~/components/admin/performance/evaluations/PerformanceEvaluationFilters.vue'
import PerformanceEvaluationTable from '~/components/admin/performance/evaluations/PerformanceEvaluationTable.vue'

const router =
  useRouter()

const {
  search,
  cycle,
  department,
  status,
  recommendation,

  currentPage,

  filteredEvaluations,
  paginatedEvaluations,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  cycleOptions,
  departmentOptions,
  statusOptions,
  recommendationOptions,

  resetFilters,
} = usePerformanceEvaluations()

const {
  info,
} = useToast()

const handleExport = () => {
  info(
    'Export Evaluations',
    'Performance evaluation export functionality will be connected later.',
  )
}

const handleCycles = () => {
  router.push(
    '/admin/performance/cycles',
  )
}
</script>

<template>
  <section class="performance-evaluations-page">

    <!-- HEADER -->

    <PageHeader
      title="Performance Evaluations"
      description="Monitor employee evaluations, reviewer progress, overall performance scores and final recommendations."
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
          :icon="CalendarRange"
          @click="
            handleCycles
          "
        >
          Evaluation Cycles
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <PerformanceEvaluationStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <PerformanceEvaluationFilters
      v-model:search="
        search
      "
      v-model:cycle="
        cycle
      "
      v-model:department="
        department
      "
      v-model:status="
        status
      "
      v-model:recommendation="
        recommendation
      "
      :cycles="
        cycleOptions
      "
      :departments="
        departmentOptions
      "
      :statuses="
        statusOptions
      "
      :recommendations="
        recommendationOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <PerformanceEvaluationTable
      :evaluations="
        paginatedEvaluations
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
            filteredEvaluations.length
          }}
        </strong>

        performance evaluations
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
.performance-evaluations-page {
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