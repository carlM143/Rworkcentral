<script setup lang="ts">
import {
  Download,
  UserMinus,
} from 'lucide-vue-next'

import OffboardingStats from '~/components/admin/employee-lifecycle/offboarding/OffboardingStats.vue'
import OffboardingFilters from '~/components/admin/employee-lifecycle/offboarding/OffboardingFilters.vue'
import OffboardingTable from '~/components/admin/employee-lifecycle/offboarding/OffboardingTable.vue'

const {
  search,
  offboardingType,
  department,
  status,

  currentPage,

  filteredRecords,
  paginatedRecords,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  offboardingTypeOptions,
  departmentOptions,
  statusOptions,

  resetFilters,
} = useOffboarding()

const {
  info,
} = useToast()

const handleExport = () => {
  info(
    'Export Offboarding',
    'Employee offboarding export functionality will be connected later.',
  )
}

const handleNewOffboarding = () => {
  info(
    'Start Offboarding',
    'Employee offboarding workflow will be added later.',
  )
}
</script>

<template>
  <section class="offboarding-page">

    <!-- =====================================================
         HEADER
    ====================================================== -->

    <PageHeader
      title="Employee Offboarding"
      description="Manage employee separation, clearance, asset return, exit interviews and final pay preparation."
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
          :icon="UserMinus"
          @click="handleNewOffboarding"
        >
          Start Offboarding
        </AppButton>

      </div>

    </PageHeader>

    <!-- =====================================================
         STATS
    ====================================================== -->

    <OffboardingStats
      :stats="stats"
    />

    <!-- =====================================================
         FILTERS
    ====================================================== -->

    <OffboardingFilters
      v-model:search="search"
      v-model:offboarding-type="offboardingType"
      v-model:department="department"
      v-model:status="status"
      :offboarding-types="offboardingTypeOptions"
      :departments="departmentOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <!-- =====================================================
         TABLE
    ====================================================== -->

    <OffboardingTable
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

        offboarding records
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />

    </div>

  </section>
</template>

<style scoped>
.offboarding-page {
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
    align-items: flex-start;

    flex-direction: column;
  }
}
</style>