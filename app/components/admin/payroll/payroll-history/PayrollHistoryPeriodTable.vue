<!-- Admin › Payroll History: generated payroll periods with their totals. -->
<script setup lang="ts">
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import type { PayrollHistoryPeriodRow } from '~/types/payroll/payroll-history/payrollHistory'

defineProps<{
  rows: PayrollHistoryPeriodRow[]
  loading?: boolean
}>()

const emit = defineEmits<{ view: [row: PayrollHistoryPeriodRow] }>()

const money = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value || 0)

const shortDate = (value: string | null) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const range = (row: PayrollHistoryPeriodRow) =>
  `${shortDate(row.period.cutoff_start ?? row.period.pay_period_start)} – ${shortDate(row.period.cutoff_end ?? row.period.pay_period_end)}`
</script>

<template>
  <BaseDataTable
    title="Payroll Periods"
    description="Every payroll period that has been generated. Open one for totals per group and every employee's payroll."
    :has-rows="rows.length > 0"
    :loading="loading"
    min-width="1100px"
    empty-title="No payroll history yet"
    empty-description="Periods appear here once payroll is generated in Payroll Readiness."
  >
    <template #toolbar>
      <slot name="toolbar" />
    </template>

    <template #headers>
      <th>Payroll Period</th>
      <th>Pay Date</th>
      <th class="num">Employees</th>
      <th class="num">Gross Pay</th>
      <th class="num">Deductions</th>
      <th class="num">Net Pay</th>
      <th>Payslips</th>
      <th>Status</th>
      <th class="text-right">Details</th>
    </template>

    <template #rows>
      <tr v-for="row in rows" :key="row.period.id" class="clickable" @click="emit('view', row)">
        <td>
          <strong>{{ row.period.period_name || `Payroll Period #${row.period.id}` }}</strong>
          <small class="sub">Cutoff {{ row.period.cutoff_number }} · {{ range(row) }}</small>
        </td>
        <td>{{ shortDate(row.period.payment_date) }}</td>
        <td class="num">
          {{ row.totals.employees }}
          <small v-if="row.totals.draft" class="sub warn">{{ row.totals.draft }} draft</small>
        </td>
        <td class="num">{{ money(row.totals.gross_pay) }}</td>
        <td class="num minus">− {{ money(row.totals.total_deductions) }}</td>
        <td class="num"><strong class="net">{{ money(row.totals.net_pay) }}</strong></td>
        <td>
          <span :class="row.totals.payslips_sent === row.totals.employees && row.totals.employees ? 'ok' : 'muted'">
            {{ row.totals.payslips_sent }}/{{ row.totals.employees }} sent
          </span>
        </td>
        <td><StatusBadge :status="row.period.status" /></td>
        <td class="text-right">
          <button type="button" class="link-button" @click.stop="emit('view', row)">View</button>
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
.sub.warn { color: #fb923c; }
.ok { color: #22c55e; font-weight: 600; }
.muted { color: var(--text-muted); }
.link-button { padding: 6px 12px; border: 1px solid var(--border); border-radius: 7px; background: transparent; color: var(--primary); font: inherit; font-size: 12px; font-weight: 600; cursor: pointer; }
.link-button:hover { border-color: var(--primary); }
</style>
