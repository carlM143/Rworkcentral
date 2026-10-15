<script setup lang="ts">
import {
  Download,
  Plus,
} from 'lucide-vue-next'

import OnboardingStats from '~/components/employee-lifecycle/onboarding/OnboardingStats.vue'
import OnboardingFilters from '~/components/employee-lifecycle/onboarding/OnboardingFilters.vue'
import OnboardingTable from '~/components/employee-lifecycle/onboarding/OnboardingTable.vue'

const {
  search,
  department,
  employmentType,
  status,

  currentPage,

  filteredRecords,
  paginatedRecords,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  departmentOptions,
  employmentTypeOptions,
  statusOptions,

  resetFilters,
} = useOnboarding()

const {
  info,
} = useToast()

const handleExport = () => {
  info(
    'Export Onboarding',
    'Employee onboarding export functionality will be connected later.',
  )
}

const handleNewOnboarding = () => {
  info(
    'Start Onboarding',
    'New employee onboarding workflow will be added later.',
  )
}
</script>

<template>
  <section class="onboarding-page">

    <!-- =====================================================
         HEADER
    ====================================================== -->

    <PageHeader
      title="Employee Onboarding"
      description="Track new employee onboarding requirements, document completion, account setup, orientation and department endorsement."
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
          @click="handleNewOnboarding"
        >
          Start Onboarding
        </AppButton>

      </div>

    </PageHeader>

    <!-- =====================================================
         STATS
    ====================================================== -->

    <OnboardingStats
      :stats="stats"
    />

    <!-- =====================================================
         FILTERS
    ====================================================== -->

    <OnboardingFilters
      v-model:search="search"
      v-model:department="department"
      v-model:employment-type="employmentType"
      v-model:status="status"
      :departments="departmentOptions"
      :employment-types="employmentTypeOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <!-- =====================================================
         TABLE
    ====================================================== -->

    <OnboardingTable
      :records="paginatedRecords"
    />

    <!-- =====================================================
         PAGINATION
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

        onboarding records
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />

    </div>

  </section>
</template>

<style scoped>
.onboarding-page {
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