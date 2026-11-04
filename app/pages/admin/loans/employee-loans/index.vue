
<script setup lang="ts">
import { onMounted } from 'vue'
import { Plus, RefreshCw } from 'lucide-vue-next'

import EmployeeLoanStats from '~/components/admin/loans/employee-loans/EmployeeLoanStats.vue'
import EmployeeLoanFilters from '~/components/admin/loans/employee-loans/EmployeeLoanFilters.vue'
import EmployeeLoanTable from '~/components/admin/loans/employee-loans/EmployeeLoanTable.vue'

import { useEmployeeLoans } from '~/composables/admin/loans/employee-loans/useEmployeeLoans'

definePageMeta({
  layout: 'admin',
})

const {
  filteredEmployeeLoans,
  loading,
  loadError,

  search,
  statusFilter,
  loanTypeFilter,
  loanTypeOptions,

  stats,
  getEmployeeLoans,
  resetFilters,
} = useEmployeeLoans()

onMounted(() => {
  void getEmployeeLoans()
})

const addEmployeeLoan = () => {
  void navigateTo('/admin/loans/employee-loans/create')
}
</script>

<template>
  <section class="employee-loans-page">

    <PageHeader
      title="Employee Loans"
      description="Monitor employee loans, principal amounts, scheduled deductions and loan status."
    >
      <div class="header-actions">
        <AppButton
          variant="secondary"
          :icon="RefreshCw"
          :disabled="loading"
          @click="getEmployeeLoans"
        >
          Refresh
        </AppButton>
        
        <AppButton
          :icon="Plus"
          @click="addEmployeeLoan"
        >
          Add Employee Loan
        </AppButton>
      </div>
    </PageHeader>

    <!-- STATISTICS -->
    <EmployeeLoanStats :stats="stats" />

    <!-- FILTERS -->
    <EmployeeLoanFilters
      v-model:search="search"
      v-model:status="statusFilter"
      v-model:loan-type="loanTypeFilter"
      :loan-type-options="loanTypeOptions"
      @reset="resetFilters"
    />

    <!-- ERROR -->
    <div
      v-if="loadError"
      class="api-error"
      role="alert"
    >
      {{ loadError }}

      <AppButton
        variant="secondary"
        :icon="RefreshCw"
        @click="getEmployeeLoans"
      >
        Retry
      </AppButton>
    </div>

    <!-- TABLE -->
    <EmployeeLoanTable
      v-else
      :loans="filteredEmployeeLoans"
      :loading="loading"
    />

    <!-- RECORD COUNT -->
    <div
      v-if="!loading && !loadError"
      class="table-footer"
    >
      <p>
        Showing
        <strong>{{ filteredEmployeeLoans.length }}</strong>
        of
        <strong>{{ stats.total }}</strong>
        employee loans
      </p>
    </div>

  </section>
</template>

<style scoped>
.employee-loans-page {
  width: 100%;
  max-width: 1660px;
  min-width: 0;
  margin: 0 auto;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.api-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px;
  margin-bottom: 14px;
  border: 1px solid var(--red, #ef4444);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--red, #ef4444);
  font-size: 13px;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 3px 0;
}

.table-footer p {
  margin: 0;
  color: var(--text-muted);
  font-size: 12px;
}

.table-footer strong {
  color: var(--text-primary);
  font-weight: 600;
}

@media (max-width: 650px) {
  .header-actions {
    width: 100%;
    align-items: stretch;
    flex-direction: column;
  }

  .api-error {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
