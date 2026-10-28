<script setup lang="ts">
import {
  Download,
  Plus,
} from 'lucide-vue-next'

import DepartmentAssignmentStats from '~/components/admin/departments/assignments/DepartmentAssignmentStats.vue'
import DepartmentAssignmentFilters from '~/components/admin/departments/assignments/DepartmentAssignmentFilters.vue'
import DepartmentAssignmentTable from '~/components/admin/departments/assignments/DepartmentAssignmentTable.vue'

const {
  search,
  department,
  assignmentType,
  status,

  currentPage,

  filteredAssignments,
  paginatedAssignments,

  totalPages,
  showingFrom,
  showingTo,

  stats,

  departmentOptions,
  assignmentTypeOptions,
  statusOptions,

  resetFilters,
} = useDepartmentAssignments()

const {
  info,
} = useToast()

const handleExport = () => {
  info(
    'Export Department Assignments',
    'Department assignment export functionality will be connected later.',
  )
}

const handleAssignEmployee = () => {
  info(
    'Assign Employee',
    'Department assignment form will be added later.',
  )
}
</script>

<template>
  <section class="department-assignment-page">

    <!-- HEADER -->

    <PageHeader
      title="Employee Assignment"
      description="Manage employee department assignments, positions, supervisors and temporary or acting designations."
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
            handleAssignEmployee
          "
        >
          Assign Employee
        </AppButton>

      </div>

    </PageHeader>

    <!-- STATS -->

    <DepartmentAssignmentStats
      :stats="
        stats
      "
    />

    <!-- FILTERS -->

    <DepartmentAssignmentFilters
      v-model:search="
        search
      "
      v-model:department="
        department
      "
      v-model:assignment-type="
        assignmentType
      "
      v-model:status="
        status
      "
      :departments="
        departmentOptions
      "
      :assignment-types="
        assignmentTypeOptions
      "
      :statuses="
        statusOptions
      "
      @reset="
        resetFilters
      "
    />

    <!-- TABLE -->

    <DepartmentAssignmentTable
      :assignments="
        paginatedAssignments
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
            filteredAssignments.length
          }}
        </strong>

        department assignments
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
.department-assignment-page {
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
    align-items:
      flex-start;

    flex-direction:
      column;
  }
}
</style>