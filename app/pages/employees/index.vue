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

  loading,
  loadError,
  loadEmployees,
} = useEmployees('Active', true)

const router = useRouter()

const goToCreateEmployee = () => {
  router.push('/employees/create-employee')
}

const handleStatusChanged = async () => {
  try {
    await loadEmployees()
  } catch (error) {
    console.error('Failed to refresh employees:', error)
  }
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

    <div
      v-if="loading"
      class="directory-message"
    >
      Loading active employees...
    </div>

    <div
      v-else-if="loadError"
      class="directory-message error-message"
      role="alert"
    >
      <div>
        <strong>Employees could not be loaded</strong>
        <p>{{ loadError }}</p>
      </div>

      <AppButton
        variant="secondary"
        size="sm"
        @click="loadEmployees"
      >
        Retry
      </AppButton>
    </div>

    <EmployeeTable
      v-else
      :employees="paginatedEmployees"
      @status-changed="handleStatusChanged"
    />

    <div
      v-if="!loading && !loadError"
      class="table-footer"
    >
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

.directory-message {
  display: flex;
  min-height: 90px;
  align-items: center;
  justify-content: center;

  margin-bottom: 12px;
  padding: 14px 16px;

  border: 1px solid var(--border);
  border-radius: 10px;

  background: var(--bg-card);
  color: var(--text-muted);

  font-size: 10px;
}

.error-message {
  min-height: auto;
  justify-content: space-between;
  gap: 16px;

  border-color: color-mix(in srgb, var(--red) 35%, var(--border));
  background: color-mix(in srgb, var(--red) 8%, var(--bg-card));
}

.error-message strong {
  color: var(--red);
  font-size: 11px;
}

.error-message p {
  margin: 3px 0 0;
  color: var(--text-secondary);
}

@media (max-width: 650px) {
  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
