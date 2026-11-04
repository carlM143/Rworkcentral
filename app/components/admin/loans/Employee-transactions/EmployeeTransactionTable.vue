<script setup lang="ts">
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import EmployeeTransactionActions from './EmployeeTransactionActions.vue'

import type { EmployeeLoanTransaction } from '~/types/loans/employee-loan-transactions/employeeLoan'

withDefaults(defineProps<{
  transactions: EmployeeLoanTransaction[]
  loading?: boolean
}>(), { loading: false })

const money = (value: string | number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value) || 0)

const date = (value: string | null) => {
  if (!value) return '—'
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const statusClass = (status: string) =>
  ['completed', 'posted', 'approved', 'paid'].includes(status.toLowerCase())
    ? 'status-pill--active'
    : 'status-pill--inactive'
</script>

<template>
  <BaseDataTable
    title="Employee Loan Transactions"
    description="Review loan disbursements, repayments, payroll deductions and adjustments."
    :has-rows="transactions.length > 0"
    :loading="loading"
    min-width="1180px"
    empty-title="No loan transactions found"
    empty-description="No transaction records match the selected filters."
  >
    <template #headers>
      <th>Reference</th><th>Employee</th><th>Employee Loan</th><th>Loan Type</th><th>Transaction</th>
      <th>Date</th><th>Amount</th><th>Status</th><th class="action-column">Actions</th>
    </template>
    <template #rows>
      <tr v-for="transaction in transactions" :key="transaction.id">
        <td><span class="reference">{{ transaction.referenceNo }}</span></td>
        <td><div class="stack"><strong>{{ transaction.employeeName }}</strong><span>{{ transaction.employeeNumber }}</span></div></td>
        <td><span>{{ transaction.loanReferenceNo }}</span></td>
        <td><span>{{ transaction.loanTypeName }}</span></td>
        <td><span>{{ transaction.transactionType }}</span></td>
        <td class="nowrap">{{ date(transaction.transactionDate) }}</td>
        <td class="money">{{ money(transaction.amount) }}</td>
        <td><span class="status-pill" :class="statusClass(transaction.status)">{{ transaction.status }}</span></td>
        <td class="action-column"><EmployeeTransactionActions :transaction="transaction" /></td>
      </tr>
    </template>
  </BaseDataTable>
</template>

<style scoped>
.reference { color: var(--primary); font-weight: 600; white-space: nowrap; }
.stack { display: flex; flex-direction: column; gap: 3px; }
.stack span { color: var(--text-muted); font-size: 12px; }
.nowrap, .money { white-space: nowrap; }
.money { color: var(--text-primary); font-variant-numeric: tabular-nums; font-weight: 600; }
.action-column { width: 76px; text-align: right !important; }
.action-column :deep(.table-action-button) { margin-left: auto; }
</style>
