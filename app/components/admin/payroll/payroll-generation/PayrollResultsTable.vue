<script setup lang="ts">
import { Eye } from 'lucide-vue-next'
import PayrollBreakdownModal from '~/components/admin/payroll/payroll-generation/PayrollBreakdownModal.vue'
import type { Money, PayrollRecord } from '~/types/payroll/payroll-generation/payrollGeneration'

const props = withDefaults(defineProps<{
  payrolls: PayrollRecord[]
  loading?: boolean
}>(), {
  loading: false,
})

const selected = ref<PayrollRecord | null>(null)

const num = (value: Money | null | undefined) => Number(value ?? 0)

const money = (value: Money | null | undefined) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(num(value))

const name = (p: PayrollRecord) =>
  p.employee ? `${p.employee.lastname}, ${p.employee.firstname}` : `Employee #${p.employee_id}`

const timeDeductions = (p: PayrollRecord) =>
  num(p.late_deduction) + num(p.undertime_deduction) + num(p.unpaid_leave_deduction)

</script>

<template>
  <BaseDataTable
    title="Payroll Results"
    description="Computed pay for each employee in this period. Click a row to see the full breakdown."
    :has-rows="payrolls.length > 0"
    :loading="loading"
    min-width="1200px"
    empty-title="No payroll records yet"
    empty-description="Generate payroll to see the computed results here."
  >
    <template #headers>
      <th>Employee</th>
      <th class="num">Basic Pay</th>
      <th class="num">Allowance</th>
      <th class="num">Overtime</th>
      <th class="num">Late / UT / Leave</th>
      <th class="num">Gross Pay</th>
      <th class="num">Contributions</th>
      <th class="num">Loans</th>
      <th class="num">Net Pay</th>
      <th>Status</th>
      <th class="text-right">Details</th>
    </template>

    <template #rows>
      <tr
        v-for="p in payrolls"
        :key="p.id"
        class="clickable"
        @click="selected = p"
      >
        <td>
          <div class="stack">
            <strong>{{ name(p) }}</strong>
            <span>
              {{ p.employee?.emp_id }} · {{ p.salary_type?.type_name ?? '—' }}
              <template v-if="p.payroll_group"> · {{ p.payroll_group.group_name }}</template>
            </span>
          </div>
        </td>
        <td class="num">{{ money(p.basic_pay) }}</td>
        <td class="num">{{ num(p.allowance_pay) ? money(p.allowance_pay) : '—' }}</td>
        <td class="num">{{ num(p.overtime_pay) ? money(p.overtime_pay) : '—' }}</td>
        <td class="num minus">{{ timeDeductions(p) ? `− ${money(timeDeductions(p))}` : '—' }}</td>
        <td class="num"><strong>{{ money(p.gross_pay) }}</strong></td>
        <td class="num minus">{{ num(p.contributions_total) ? `− ${money(p.contributions_total)}` : '—' }}</td>
        <td class="num minus">{{ num(p.loan_deductions_total) ? `− ${money(p.loan_deductions_total)}` : '—' }}</td>
        <td class="num"><strong class="net">{{ money(p.net_pay) }}</strong></td>
        <td>
          <span
            class="pill"
            :class="`pill--${p.status}`"
          >
            {{ p.status === 'finalized' ? 'Finalized' : 'Draft' }}
          </span>
        </td>
        <td class="text-right">
          <button
            type="button"
            class="view-btn"
            :aria-label="`View payroll details for ${name(p)}`"
            @click.stop="selected = p"
          >
            <Eye :size="15" />
          </button>
        </td>
      </tr>
    </template>

  </BaseDataTable>

  <PayrollBreakdownModal
    :payroll="selected"
    @close="selected = null"
  />
</template>

<style scoped>
.num {
  text-align: right;
  white-space: nowrap;
}

.minus {
  color: #f87171;
}

.net {
  color: #22c55e;
}

.clickable {
  cursor: pointer;
}

.stack strong,
.stack span {
  display: block;
}

.stack strong {
  color: var(--text-primary);
  font-size: 12px;
}

.stack span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 10px;
}

.pill {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.pill--draft {
  background: rgb(251 146 60 / 12%);
  color: #fb923c;
}

.pill--finalized {
  background: rgb(34 197 94 / 11%);
  color: #22c55e;
}

.view-btn {
  display: inline-grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.view-btn:hover {
  background: var(--primary-soft);
  color: var(--primary);
}

.summary {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 18px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 12px;
}

.summary strong {
  color: var(--text-primary);
}
</style>