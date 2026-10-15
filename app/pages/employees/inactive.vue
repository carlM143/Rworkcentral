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
} = useEmployees('Inactive')
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

    <!-- TABLE -->
    <EmployeeTable
      :employees="paginatedEmployees"
      mode="inactive"
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

@media (max-width: 650px) {
  .table-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>