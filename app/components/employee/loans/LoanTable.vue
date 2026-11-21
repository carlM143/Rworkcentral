<!-- Employee loans (shared EmployeeRequestTable). -->
<script setup lang="ts">
import EmployeeRequestTable from '~/components/shared-table/employee-table/EmployeeRequestTable.vue'
import { loanFrequencyLabel } from '~/composables/employee/loans/useEmployeePortalLoans'
import type { EmployeeLoanRecord, EmployeeLoanStatus } from '~/types/employee/loans/loans'

const props = withDefaults(defineProps<{
  loans: EmployeeLoanRecord[]
  loading?: boolean
}>(), {
  loading: false,
})

const emit = defineEmits<{ view: [loan: EmployeeLoanRecord] }>()

const columns = [
  { key: 'loan', label: 'Loan' },
  { key: 'principal', label: 'Principal', align: 'right' as const, hideOnMobile: true },
  { key: 'paid', label: 'Paid', align: 'right' as const, hideOnMobile: true },
  { key: 'outstanding', label: 'Outstanding', align: 'right' as const },
  { key: 'installment', label: 'Installment', align: 'right' as const },
  { key: 'status', label: 'Status' },
]

const money = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)

const statusClass = (status: EmployeeLoanStatus) =>
  status === 'Fully Paid' ? 'paid' : status === 'Inactive' ? 'inactive' : ''

const rows = computed(() => props.loans.map(loan => ({ id: loan.id, loan })))
const loanOf = (row: Record<string, unknown>) => row.loan as EmployeeLoanRecord
</script>

<template>
  <EmployeeRequestTable
    :columns="columns"
    :rows="rows"
    :loading="loading"
    empty-message="You have no loans on record."
    mobile-hint="Tap a loan for terms, due dates and payment history."
    @row-click="row => emit('view', loanOf(row))"
  >
    <template #cell-loan="{ row }">
      <button type="button" class="row-open-button" @click.stop="emit('view', loanOf(row))">
        <strong>{{ loanOf(row).loan_type?.name || 'Loan' }}</strong>
      </button>
      <small>{{ loanOf(row).reference_no || `#${loanOf(row).id}` }}<template v-if="loanOf(row).loan_type?.provider"> · {{ loanOf(row).loan_type?.provider }}</template></small>
    </template>
    <template #cell-principal="{ row }">{{ money(loanOf(row).principal) }}</template>
    <template #cell-paid="{ row }">{{ money(loanOf(row).summary.paid) }}</template>
    <template #cell-outstanding="{ row }">
      <strong class="balance">{{ money(loanOf(row).summary.outstanding) }}</strong>
    </template>
    <template #cell-installment="{ row }">
      {{ money(loanOf(row).summary.status === 'Active' ? Math.min(loanOf(row).installment, loanOf(row).summary.outstanding) : 0) }}
      <small>{{ loanOf(row).summary.status === 'Active' ? loanFrequencyLabel(loanOf(row).frequency) : loanOf(row).summary.status }}</small>
    </template>
    <template #cell-status="{ row }">
      <span class="loan-status" :class="statusClass(loanOf(row).summary.status)">{{ loanOf(row).summary.status }}</span>
    </template>
  </EmployeeRequestTable>
</template>

<style scoped>
/* Slot content renders in this component's scope, so these styles apply inside the shared table. */
.row-open-button { display: inline-flex; align-items: center; gap: 7px; padding: 0; border: 0; background: transparent; color: var(--text-primary); font: inherit; font-size: 11px; cursor: pointer; }
.row-open-button strong { line-height: 1.4; }
.balance { color: var(--primary) !important; font-variant-numeric: tabular-nums; }
.loan-status { display: inline-block; padding: 5px 8px; border-radius: 5px; background: var(--primary-soft); color: var(--primary); font-size: 10px; font-weight: 600; }
.loan-status.paid { background: var(--green-soft); color: var(--green); }
.loan-status.inactive { background: var(--bg-card-soft); color: var(--text-secondary); }
</style>
