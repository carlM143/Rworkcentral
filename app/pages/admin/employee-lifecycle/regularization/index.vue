<script setup lang="ts">
import {
  Download,
  UserCheck,
} from 'lucide-vue-next'

import RegularizationStats from '~/components/admin/employee-lifecycle/regularization/RegularizationStats.vue'
import RegularizationFilters from '~/components/admin/employee-lifecycle/regularization/RegularizationFilters.vue'
import RegularizationTable from '~/components/admin/employee-lifecycle/regularization/RegularizationTable.vue'

const {
  search,
  department,
  evaluationStatus,
  status,

  currentPage,

  filteredRecords,
  paginatedRecords,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  departmentOptions,
  evaluationStatusOptions,
  statusOptions,

  resetFilters,
} = useRegularization()

const {
  info,
} = useToast()

const handleExport = () => {
  info(
    'Export Regularization',
    'Employee regularization export functionality will be connected later.',
  )
}

const handleProcess = () => {
  info(
    'Process Regularization',
    'Regularization processing workflow will be added later.',
  )
}
</script>

<template>
  <section class="regularization-page">

    <!-- =====================================================
         HEADER
    ====================================================== -->

    <PageHeader
      title="Employee Regularization"
      description="Monitor probationary employees, performance evaluations, HR recommendations, approvals and effective regularization dates."
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
          :icon="UserCheck"
          @click="handleProcess"
        >
          Process Regularization
        </AppButton>

      </div>

    </PageHeader>

    <!-- =====================================================
         STATS
    ====================================================== -->

    <RegularizationStats
      :stats="stats"
    />

    <!-- =====================================================
         FILTERS
    ====================================================== -->

    <RegularizationFilters
      v-model:search="search"
      v-model:department="department"
      v-model:evaluation-status="evaluationStatus"
      v-model:status="status"
      :departments="departmentOptions"
      :evaluation-statuses="evaluationStatusOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <!-- =====================================================
         TABLE
    ====================================================== -->

    <RegularizationTable
      :records="paginatedRecords"
    />

    <!-- =====================================================
         FOOTER
    ====================================================== -->

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

        regularization records
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />

    </div>

  </section>
</template>

<style scoped>
.regularization-page {
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