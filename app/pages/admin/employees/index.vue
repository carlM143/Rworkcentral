
<script setup lang="ts">
import {
  Plus,
  Download,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
})

// EMPLOYEE DATA
const {
  loading,
  loadError,
  loadEmployees,

  // FILTERS
  search,
  department,
  position,
  employmentType,
  status,

  // EMPLOYEE RECORDS
  filteredEmployees,
  paginatedEmployees,

  // STATISTICS
  stats,
  departments,
  positions,

  // PAGINATION
  currentPage,
  totalPages,
  showingFrom,
  showingTo,

  employmentTypes,
  filterOptionsError,
  // FUNCTIONS
  resetFilters,
} = useEmployees('Active')

const router = useRouter()

// CREATE EMPLOYEE
const goToCreateEmployee = () => {
  router.push('/admin/employees/create-employee')
}

// REFRESH AFTER STATUS CHANGE
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

    <!-- PAGE HEADER -->
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

    <!-- EMPLOYEE STATISTICS -->
    <EmployeeStats
      :stats="stats"
    />

    <!-- EMPLOYEE FILTERS -->
    <EmployeeFilters
      v-model:search="search"
      v-model:department="department"
      v-model:position="position"
      v-model:employment-type="employmentType"
      v-model:status="status"
      :departments="departments"
      :positions="positions"
      :employment-types="employmentTypes"
      @reset="resetFilters"
    />

    <p
      v-if="filterOptionsError"
      role="alert"
      class="mb-3 text-xs text-red-500"
    >
      {{ filterOptionsError }}
    </p>

    <!-- LOADING -->
    <div
      v-if="loading"
      class="directory-message"
    >
      Loading employees...
    </div>

    <!-- API ERROR -->
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

    <!-- EMPLOYEE TABLE -->
    <EmployeeTable
      v-else
      :employees="paginatedEmployees"
      @status-changed="handleStatusChanged"
    />

    <!-- PAGINATION -->
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
