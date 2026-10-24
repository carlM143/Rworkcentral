<script setup lang="ts">
import {
  Download,
  FilePenLine,
} from 'lucide-vue-next'

import EmploymentChangeStats from '~/components/admin/employee-lifecycle/changes/EmploymentChangeStats.vue'
import EmploymentChangeFilters from '~/components/admin/employee-lifecycle/changes/EmploymentChangeFilters.vue'
import EmploymentChangeTable from '~/components/admin/employee-lifecycle/changes/EmploymentChangeTable.vue'

const {
  search,
  changeType,
  department,
  status,

  currentPage,

  filteredRecords,
  paginatedRecords,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  changeTypeOptions,
  departmentOptions,
  statusOptions,

  resetFilters,
} = useEmploymentChanges()

const {
  info,
} = useToast()

const handleExport = () => {
  info(
    'Export Employment Changes',
    'Employment change export functionality will be connected later.',
  )
}

const handleNewChange = () => {
  info(
    'New Employment Change',
    'Employment change workflow will be added later.',
  )
}
</script>

<template>
  <section class="employment-changes-page">

    <PageHeader
      title="Employment Changes"
      description="Track updates to employment type, contracts, compensation, reporting lines, work arrangements and employee status."
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
          :icon="FilePenLine"
          @click="handleNewChange"
        >
          New Employment Change
        </AppButton>

      </div>

    </PageHeader>

    <EmploymentChangeStats
      :stats="stats"
    />

    <EmploymentChangeFilters
      v-model:search="search"
      v-model:change-type="changeType"
      v-model:department="department"
      v-model:status="status"
      :change-types="changeTypeOptions"
      :departments="departmentOptions"
      :statuses="statusOptions"
      @reset="resetFilters"
    />

    <EmploymentChangeTable
      :records="paginatedRecords"
    />

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

        employment changes
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />

    </div>

  </section>
</template>

<style scoped>
.employment-changes-page {
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