
<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { RefreshCw } from 'lucide-vue-next'

import EmployeeTransactionFilters from '~/components/admin/loans/Employee-transactions/EmployeeTransactionFilters.vue'
import EmployeeTransactionTable from '~/components/admin/loans/Employee-transactions/EmployeeTransactionTable.vue'
import { useEmployeeLoanTransactions } from '~/composables/admin/loans/employee-loan-transactions/useEmployeeLoanTransactions'

definePageMeta({
  layout: 'admin',
})

const {
  transactions, loading, loadError, filters, currentPage, total, lastPage, from, to,
  fetchTransactions, applyFilters, resetFilters,
} = useEmployeeLoanTransactions()

onMounted(() => void fetchTransactions())

watch(currentPage, () => void fetchTransactions())
</script>

<template>
  <section class="loan-transactions-page">
    <PageHeader
      title="Loan Transactions"
      description="Review employee loan disbursements, repayments and payroll deductions."
    >
      <AppButton variant="secondary" :icon="RefreshCw" :disabled="loading" @click="fetchTransactions">Refresh</AppButton>
    </PageHeader>

    <EmployeeTransactionFilters :filters="filters" :loading="loading" @apply="applyFilters" @reset="resetFilters" />

    <div v-if="loadError" class="api-error" role="alert">
      <span>{{ loadError }}</span>
      <AppButton variant="secondary" :icon="RefreshCw" @click="fetchTransactions">Retry</AppButton>
    </div>

    <EmployeeTransactionTable v-else :transactions="transactions" :loading="loading" />

    <div v-if="!loading && !loadError" class="table-footer">
      <p>Showing <strong>{{ from }}</strong>–<strong>{{ to }}</strong> of <strong>{{ total }}</strong> transactions</p>
      <AppPagination v-if="lastPage > 1" v-model="currentPage" :total-pages="lastPage" />
    </div>
  </section>
</template>

<style scoped>
.loan-transactions-page {
  width: 100%;
  max-width: 1660px;
  min-width: 0;
  margin: 0 auto;
}
.api-error, .table-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.api-error { padding: 14px; border: 1px solid var(--red, #ef4444); border-radius: 10px; background: var(--bg-card); color: var(--red, #ef4444); font-size: 13px; }
.table-footer { padding: 13px 3px 0; }
.table-footer p { margin: 0; color: var(--text-muted); font-size: 12px; }
.table-footer strong { color: var(--text-primary); font-weight: 600; }

@media (max-width: 650px) {
  .api-error, .table-footer { align-items: stretch; flex-direction: column; }
}
</style>
