<script setup lang="ts">
import {
  Plus,
  Download,
} from 'lucide-vue-next'

const {
  search,
  status,

  currentPage,

  paginatedDepartments,
  filteredDepartments,

  totalPages,

  showingFrom,
  showingTo,

  stats,
  statusOptions,

  getEmployeeCount,
  getPositionCount,

  resetFilters,
} = useDepartments()

const {
  info,
} = useToast()

const handleAddDepartment = () => {
  info(
    'Add Department',
    'Add Department form will be implemented next.',
  )
}

const handleExport = () => {
  info(
    'Export Departments',
    'Department export will be connected later.',
  )
}
</script>

<template>
  <section class="departments-page">

    <!-- HEADER -->
    <PageHeader
      title="Departments"
      description="Manage organizational departments, department heads and workforce assignments."
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
        @click="handleAddDepartment"
      >
        Add Department
      </AppButton>
    </PageHeader>

    <!-- STATS -->
    <DepartmentStats
      :stats="stats"
    />

    <!-- FILTERS -->
    <DepartmentFilters
      v-model:search="search"
      v-model:status="status"
      :status-options="statusOptions"
      @reset="resetFilters"
    />

    <!-- TABLE -->
    <DepartmentTable
      :departments="paginatedDepartments"
      :get-employee-count="getEmployeeCount"
      :get-position-count="getPositionCount"
    />

    <!-- FOOTER -->
    <div class="table-footer">
      <p>
        Showing

        <strong>
          {{ showingFrom }}–{{ showingTo }}
        </strong>

        of

        <strong>
          {{ filteredDepartments.length }}
        </strong>

        departments
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

  </section>
</template>

<style scoped>
.departments-page {
  width: 100%;
  max-width: 1660px;

  margin: 0 auto;
}

.table-footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 20px;

  padding: 13px 3px 0;
}

.table-footer p {
  margin: 0;

  color: var(--text-muted);

  font-size: 10px;
}

.table-footer strong {
  color: var(--text-primary);

  font-weight: 600;
}

@media (max-width: 650px) {
  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>