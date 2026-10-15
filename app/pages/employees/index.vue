<script setup lang="ts">
import {
  Plus,
  Download,
} from 'lucide-vue-next'

const {
  search,
  department,
  position,
  employmentType,

  currentPage,

  paginatedEmployees,
  filteredEmployees,

  totalPages,
  stats,

  departments,
  positions,

  showingFrom,
  showingTo,

  resetFilters,
} = useEmployees()

const router = useRouter()

const goToCreateEmployee = () => {
  router.push('/create-employee')
}
</script>

<template>
  <section class="employees-page">
    <PageHeader
      title="Employees"
      description="Manage employee records, employment details and workforce information."
    >
      <AppButton
        variant="secondary"
        :icon="Download"
      >
        Export
      </AppButton>

      <AppButton
        :icon="Plus"
        @click="goToCreateEmployee"
      >
        Add Employee
      </AppButton>
    </PageHeader>

    <EmployeeStats
      :stats="stats"
    />

    <EmployeeFilters
      v-model:search="search"
      v-model:department="department"
      v-model:position="position"
      v-model:employment-type="employmentType"
      :departments="departments"
      :positions="positions"
      @reset="resetFilters"
    />

    <EmployeeTable
      :employees="paginatedEmployees"
    />

    <div class="table-footer">
      <p>
        Showing
        <strong>
          {{ showingFrom }}–{{ showingTo }}
        </strong>
        of
        <strong>
          {{ filteredEmployees.length }}
        </strong>
        employees
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>
  </section>
</template>

<style scoped>
.employees-page {
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