<script setup lang="ts">
import {
  Download,
  ArrowLeftRight,
} from 'lucide-vue-next'

import LifecycleTransferStats from '~/components/admin/employee-lifecycle/transfers/LifecycleTransferStats.vue'
import LifecycleTransferFilters from '~/components/admin/employee-lifecycle/transfers/LifecycleTransferFilters.vue'
import LifecycleTransferTable from '~/components/admin/employee-lifecycle/transfers/LifecycleTransferTable.vue'

const {
  search,
  transferType,
  destinationDepartment,
  status,

  currentPage,

  filteredRecords,
  paginatedRecords,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  transferTypeOptions,
  destinationDepartmentOptions,
  statusOptions,

  resetFilters,
} = useLifecycleTransfers()

const {
  info,
} = useToast()

const handleExport = () => {
  info(
    'Export Transfers',
    'Employee lifecycle transfer export functionality will be connected later.',
  )
}

const handleNewTransfer = () => {
  info(
    'New Employee Transfer',
    'Employee transfer workflow will be added later.',
  )
}
</script>

<template>
  <section class="lifecycle-transfers-page">

    <!-- =====================================================
         HEADER
    ====================================================== -->

    <PageHeader
      title="Employee Transfers"
      description="Track employee department, position, branch and assignment movements throughout the employee lifecycle."
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
          :icon="ArrowLeftRight"
          @click="handleNewTransfer"
        >
          New Transfer
        </AppButton>

      </div>

    </PageHeader>

    <!-- =====================================================
         STATS
    ====================================================== -->

    <LifecycleTransferStats
      :stats="stats"
    />

    <!-- =====================================================
         FILTERS
    ====================================================== -->

    <LifecycleTransferFilters
      v-model:search="search"
      v-model:transfer-type="transferType"
      v-model:destination-department="destinationDepartment"
      v-model:status="status"
      :transfer-types="transferTypeOptions"
      :departments="destinationDepartmentOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <!-- =====================================================
         TABLE
    ====================================================== -->

    <LifecycleTransferTable
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

        employee transfers
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />

    </div>

  </section>
</template>

<style scoped>
.lifecycle-transfers-page {
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