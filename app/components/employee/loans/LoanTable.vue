<!-- Employee loans (shared EmployeeRequestTable). -->
<script setup lang="ts">
import { Landmark } from 'lucide-vue-next'
import EmployeeRequestTable from '~/components/shared-table/employee-table/EmployeeRequestTable.vue'
import { loanSummary } from '~/composables/employee/loans/useEmployeePortalLoans'
import type { EmployeePortalLoan } from '~/types/employee/loans/loans'

const props = withDefaults(defineProps<{
  loans: EmployeePortalLoan[]
  loading?: boolean
}>(), { loading: false })

const emit = defineEmits<{ view: [loan: EmployeePortalLoan] }>()

const columns = [
  { key: 'loan', label: 'Loan' },
  { key: 'principal', label: 'Principal', align: 'right' as const, hideOnMobile: true },
  { key: 'paid', label: 'Paid', align: 'right' as const, hideOnMobile: true },
  { key: 'outstanding', label: 'Outstanding', align: 'right' as const },
  { key: 'installment', label: 'Installment', align: 'right' as const },
  { key: 'status', label: 'Status' },
]

const money = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)

const rows = computed(() => props.loans.map(loan => ({ id: loan.id, loan, summary: loanSummary(loan) })))
const loanOf = (row: Record<string, unknown>) => row.loan as EmployeePortalLoan
const summaryOf = (row: Record<string, unknown>) => row.summary as ReturnType<typeof loanSummary>
</script>

<template>
  <EmployeeRequestTable
    :columns="columns"
    :rows="rows"
    :loading="loading"
    empty-message="You have no loans on record."
    mobile-hint="Tap a loan for terms, due dates and repayment history."
    @row-click="row => emit('view', loanOf(row))"
  >
    <template #cell-loan="{ row }">
      <button type="button" class="row-open-button" @click.stop="emit('view', loanOf(row))">
        <Landmark :size="16" />
        <strong>{{ loanOf(row).type }}</strong>
      </button>
      <small>{{ loanOf(row).id }}</small>
    </template>
    <template #cell-principal="{ row }">{{ money(loanOf(row).principal) }}</template>
    <template #cell-paid="{ row }">{{ money(summaryOf(row).paid) }}</template>
    <template #cell-outstanding="{ row }">
      <strong class="balance">{{ money(summaryOf(row).outstanding) }}</strong>
    </template>
    <template #cell-installment="{ row }">
      {{ money(summaryOf(row).outstanding ? Math.min(loanOf(row).installment, summaryOf(row).outstanding) : 0) }}
      <small>{{ summaryOf(row).outstanding ? loanOf(row).frequency : 'Completed' }}</small>
    </template>
    <template #cell-status="{ row }">
      <span class="loan-status" :class="{ paid: summaryOf(row).outstanding === 0 }">{{ summaryOf(row).status }}</span>
    </template>
  </EmployeeRequestTable>
</template>

<style scoped>
/* Slot content renders in this component's scope, so these styles apply inside the shared table. */
.row-open-button { display: inline-flex; align-items: center; gap: 7px; padding: 0; border: 0; background: transparent; color: var(--text-primary); font: inherit; font-size: 11px; cursor: pointer; }
.row-open-button svg { flex-shrink: 0; color: var(--primary); }
.balance { color: var(--primary) !important; font-variant-numeric: tabular-nums; }
.loan-status { display: inline-block; padding: 5px 8px; border-radius: 5px; background: var(--primary-soft); color: var(--primary); font-size: 10px; font-weight: 600; }
.loan-status.paid { background: var(--green-soft); color: var(--green); }
</style>
