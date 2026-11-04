<script setup lang="ts">
import { Filter, RotateCcw } from 'lucide-vue-next'

import type { EmployeeLoanTransactionFilters } from '~/types/loans/employee-loan-transactions/employeeLoan'

defineProps<{
  filters: EmployeeLoanTransactionFilters
  loading?: boolean
}>()

defineEmits<{
  apply: []
  reset: []
}>()

const transactionTypes = ['disbursement', 'repayment', 'payroll_deduction', 'adjustment']
const statuses = ['pending', 'posted', 'completed', 'approved', 'cancelled', 'failed']
const perPageOptions = [10, 15, 25, 50, 100]

const label = (value: string) =>
  value.replace(/_/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase())
</script>

<template>
  <form class="transaction-filters" @submit.prevent="$emit('apply')">
    <label>
      <span>Employee ID</span>
      <input v-model="filters.employee_id" type="number" min="1" placeholder="All employees">
    </label>

    <label>
      <span>Employee Loan ID</span>
      <input v-model="filters.employee_loan_id" type="number" min="1" placeholder="All employee loans">
    </label>

    <label>
      <span>Loan Type ID</span>
      <input v-model="filters.loan_type_id" type="number" min="1" placeholder="All loan types">
    </label>

    <label>
      <span>Transaction Type</span>
      <input
        v-model="filters.transaction_type"
        list="transaction-type-options"
        placeholder="All transaction types"
      >
      <datalist id="transaction-type-options">
        <option v-for="option in transactionTypes" :key="option" :value="option">{{ label(option) }}</option>
      </datalist>
    </label>

    <label>
      <span>From Date</span>
      <input v-model="filters.from_date" type="date">
    </label>

    <label>
      <span>To Date</span>
      <input v-model="filters.to_date" type="date" :min="filters.from_date || undefined">
    </label>

    <label>
      <span>Status</span>
      <input v-model="filters.status" list="transaction-status-options" placeholder="All statuses">
      <datalist id="transaction-status-options">
        <option v-for="option in statuses" :key="option" :value="option">{{ label(option) }}</option>
      </datalist>
    </label>

    <label>
      <span>Rows</span>
      <select v-model.number="filters.per_page">
        <option v-for="option in perPageOptions" :key="option" :value="option">{{ option }} per page</option>
      </select>
    </label>

    <div class="filter-actions">
      <AppButton type="submit" :icon="Filter" :disabled="loading">Apply Filters</AppButton>
      <AppButton type="button" variant="secondary" :icon="RotateCcw" :disabled="loading" @click="$emit('reset')">Reset</AppButton>
    </div>
  </form>
</template>

<style scoped>
.transaction-filters {
  display: grid;
  grid-template-columns: repeat(4, minmax(150px, 1fr));
  gap: 10px;
  padding: 14px;
  margin-bottom: 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

label { display: flex; min-width: 0; flex-direction: column; gap: 6px; }
label span { color: var(--text-secondary); font-size: 11px; font-weight: 600; }
input, select {
  width: 100%; height: 40px; padding: 0 11px; border: 1px solid var(--border); border-radius: 8px;
  outline: 0; background: var(--bg-card-soft); color: var(--text-primary); font: inherit; font-size: 12px;
}
input:focus, select:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgb(36 107 253 / 8%); }
.filter-actions { display: flex; grid-column: 1 / -1; justify-content: flex-end; gap: 8px; }

@media (max-width: 1100px) { .transaction-filters { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 650px) {
  .transaction-filters { grid-template-columns: 1fr; }
  .filter-actions { align-items: stretch; flex-direction: column; }
}
</style>
