<!--
  Admin › Payroll History: payroll rows.
  mode="employees" — one period, a row per employee (Payroll History › period page)
  mode="periods"   — one employee, a row per payroll period (Payroll History › employee page)
-->
<script setup lang="ts">
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import type { PayrollHistoryPayrollRow, PayrollHistoryPeriod } from '~/types/payroll/payroll-history/payrollHistory'

type Row = PayrollHistoryPayrollRow & { period?: PayrollHistoryPeriod }

withDefaults(defineProps<{
  rows: Row[]
  mode: 'employees' | 'periods'
  title: string
  description?: string
  loading?: boolean
}>(), {
  description: '',
  loading: false,
})

const emit = defineEmits<{ open: [row: Row] }>()

const money = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value || 0)

const shortDate = (value: string | null | undefined) => {
  if (!value) return '—'
  const date = new Date(value.length <= 10 ? `${value}T00:00:00` : value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Additions on top of basic pay
const extras = (row: Row) => row.allowance_pay + row.overtime_pay + row.holiday_pay
</script>

<template>
  <BaseDataTable
    :title="title"
    :description="description"
    :has-rows="rows.length > 0"
    :loading="loading"
    min-width="1250px"
    :empty-title="mode === 'employees' ? 'No payroll records match' : 'No payroll records yet'"
    :empty-description="mode === 'employees' ? 'Try another payroll group, status or search.' : 'This employee has no generated payroll for the selected year.'"
  >
    <template #toolbar>
      <slot name="toolbar" />
    </template>

    <template #headers>
      <th v-if="mode === 'employees'">Employee</th>
      <th v-else>Payroll Period</th>
      <th>Payroll Group</th>
      <th class="num">Basic Pay</th>
      <th class="num">Allowance / OT / Holiday</th>
      <th class="num">Gross Pay</th>
      <th class="num">Contributions</th>
      <th class="num">Loans</th>
      <th class="num">Tax</th>
      <th class="num">Net Pay</th>
      <th>Status</th>
      <th class="text-right">{{ mode === 'employees' ? 'History' : '' }}</th>
    </template>

    <template #rows>
      <tr
        v-for="row in rows"
        :key="row.payroll_id"
        :class="{ clickable: mode === 'employees' }"
        @click="mode === 'employees' && emit('open', row)"
      >
        <td v-if="mode === 'employees'">
          <strong>{{ row.employee.name }}</strong>
          <small class="sub">{{ row.employee.emp_id ?? '—' }}<template v-if="row.employee.department"> · {{ row.employee.department }}</template></small>
        </td>
        <td v-else>
          <strong>{{ row.period?.period_name || `Payroll Period #${row.period?.id}` }}</strong>
          <small class="sub">Pay on {{ shortDate(row.period?.payment_date) }} · {{ row.payslip_no }}</small>
        </td>
        <td>{{ row.payroll_group || '—' }}</td>
        <td class="num">{{ money(row.basic_pay) }}</td>
        <td class="num">{{ extras(row) ? `+ ${money(extras(row))}` : '—' }}</td>
        <td class="num"><strong>{{ money(row.gross_pay) }}</strong></td>
        <td class="num minus">{{ row.contributions_total ? `− ${money(row.contributions_total)}` : '—' }}</td>
        <td class="num minus">{{ row.loan_deductions_total ? `− ${money(row.loan_deductions_total)}` : '—' }}</td>
        <td class="num minus">{{ row.withholding_tax ? `− ${money(row.withholding_tax)}` : '—' }}</td>
        <td class="num"><strong class="net">{{ money(row.net_pay) }}</strong></td>
        <td>
          <span class="pill" :class="`pill--${row.status}`">{{ row.status === 'finalized' ? 'Finalized' : 'Draft' }}</span>
          <small class="sub" :class="{ sent: row.payslip_sent_at }">
            {{ row.payslip_sent_at ? `Payslip sent ${shortDate(row.payslip_sent_at)}` : row.status === 'finalized' ? 'Payslip not sent' : '' }}
          </small>
        </td>
        <td class="text-right">
          <button v-if="mode === 'employees'" type="button" class="link-button" @click.stop="emit('open', row)">History</button>
        </td>
      </tr>
    </template>

    <template #bottom>
      <slot name="bottom" />
    </template>
  </BaseDataTable>
</template>

<style scoped>
.num { text-align: right; white-space: nowrap; }
.minus { color: #f87171; }
.net { color: #22c55e; }
.clickable { cursor: pointer; }
.sub { display: block; margin-top: 3px; color: var(--text-muted); font-size: 11px; }
.sub.sent { color: #22c55e; }
.pill { display: inline-flex; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.pill--draft { background: rgb(251 146 60 / 12%); color: #fb923c; }
.pill--finalized { background: rgb(34 197 94 / 11%); color: #22c55e; }
.link-button { padding: 6px 12px; border: 1px solid var(--border); border-radius: 7px; background: transparent; color: var(--primary); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.link-button:hover { border-color: var(--primary); }
</style>
