
<script setup lang="ts">
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import EmployeeLoanActions from './EmployeeLoanActions.vue'

import type {
  EmployeeLoan,
  LoanMoney,
} from '~/types/loans/employee-loans/employeeLoan'

withDefaults(
  defineProps<{
    loans: EmployeeLoan[]
    loading?: boolean
  }>(),
  {
    loading: false,
  },
)

const formatMoney = (value: LoanMoney) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(Number(value) || 0)

const formatDate = (value: string | null) => {
  if (!value) return '—'

  const date = new Date(`${value.slice(0, 10)}T00:00:00`)

  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<template>
  <BaseDataTable
    title="Employee Loan Directory"
    description="View and manage employee loan records and scheduled deductions."
    :has-rows="loans.length > 0"
    :loading="loading"
    min-width="1130px"
    empty-title="No employee loans found"
    empty-description="No loan records match your current filters."
  >
    <template #headers>
      <th>Loan Reference</th>
      <th>Employee</th>
      <th>Loan Type</th>
      <th>Principal</th>
      <th>Total Payable</th>
      <th>Deduction Amount</th>
      <th>Deduction Starts</th>
      <th>Status</th>
      <th class="action-column">Actions</th>
    </template>

    <template #rows>
      <tr
        v-for="loan in loans"
        :key="loan.id"
      >
        <td>
          <span class="loan-reference">
            {{ loan.loan_reference_no }}
          </span>
        </td>

        <td>
          <div class="employee-info">
            <strong>
              {{ loan.employee?.name || 'Unknown Employee' }}
            </strong>
            <span>
              {{ loan.employee?.emp_id ?? 'No employee number' }}
            </span>
          </div>
        </td>

        <td>
          <div class="loan-type-info">
            <span>
              {{ loan.loan_type?.loan_name || 'Not assigned' }}
            </span>
            <small>
              {{ loan.loan_type?.loan_code || '—' }}
            </small>
          </div>
        </td>

        <td class="money-cell">
          {{ formatMoney(loan.principal_amount) }}
        </td>

        <td class="money-cell">
          {{ formatMoney(loan.total_payable_amount) }}
        </td>

        <td class="money-cell">
          {{ formatMoney(loan.deduction_amount) }}
        </td>

        <td class="date-cell">
          {{ formatDate(loan.deduction_start_date) }}
        </td>

        <td>
          <span
            class="status-pill"
            :class="loan.status
              ? 'status-pill--active'
              : 'status-pill--inactive'"
          >
            {{ loan.status ? 'Active' : 'Inactive' }}
          </span>
        </td>

        <td class="action-column">
          <EmployeeLoanActions :loan="loan" />
        </td>
      </tr>
    </template>
  </BaseDataTable>
</template>

<style scoped>
.loan-reference {
  color: var(--primary);
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.employee-info,
.loan-type-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.employee-info strong {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
}

.employee-info > span,
.loan-type-info small {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 400;
}

.loan-type-info > span {
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 400;
}

.money-cell {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  font-weight: 400;
}

.date-cell {
  white-space: nowrap;
}

.action-column {
  width: 75px;
  text-align: right !important;
  white-space: nowrap;
}
</style>
