<script setup lang="ts">
import {
  Download,
  Archive,
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
} = useEmployees('Inactive', true)
</script>

<template>
  <section class="inactive-employees-page">

    <!-- HEADER -->
    <PageHeader
      title="Inactive Employees"
      description="View former, resigned, ended-contract and deactivated employee records."
    >
      <AppButton
        variant="secondary"
        :icon="Download"
      >
        Export
      </AppButton>
    </PageHeader>

    <!-- NOTICE -->
    <div class="inactive-notice">
      <div class="notice-icon">
        <Archive :size="18" />
      </div>

      <div>
        <strong>
          Archived Employee Records
        </strong>

        <p>
          Inactive employees remain available for
          employment history, payroll records,
          documents and possible reactivation.
        </p>
      </div>
    </div>

    <!-- STATS -->
    <EmployeeStats
      :stats="stats"
    />

    <!-- FILTERS -->
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
      Loading inactive employees...
    </div>

    <div
      v-else-if="loadError"
      class="directory-message error-message"
      role="alert"
    >
      <div>
        <strong>Inactive employees could not be loaded</strong>
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

    <!-- TABLE -->
    <EmployeeTable
      v-else
      :employees="paginatedEmployees"
      mode="inactive"
    />

    <!-- FOOTER -->
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

        inactive employees
      </p>

      <AppPagination
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>

  </section>
</template>

<style scoped>
.inactive-employees-page {
  width: 100%;
  max-width: 1660px;

  margin: 0 auto;
}

/* NOTICE */

.inactive-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;

  margin-bottom: 14px;
  padding: 12px 14px;

  border: 1px solid var(--border);
  border-radius: 10px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

.notice-icon {
  display: flex;

  width: 36px;
  height: 36px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background: var(--orange-soft);
  color: var(--orange);
}

.inactive-notice strong {
  display: block;

  color: var(--text-primary);

  font-size: 10px;
  font-weight: 650;
}

.inactive-notice p {
  margin: 3px 0 0;

  color: var(--text-secondary);

  font-size: 8px;
  line-height: 1.5;
}

/* FOOTER */

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
