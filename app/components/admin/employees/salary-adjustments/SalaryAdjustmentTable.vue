<script setup lang="ts">
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import SalaryAdjustmentActions from './SalaryAdjustmentActions.vue'
import type { SalaryAdjustment, MoneyValue } from '~/types/salaryAdjustments/salaryAdjustment'

withDefaults(defineProps<{
  adjustments: SalaryAdjustment[]
  loading?: boolean
  busy?: boolean
}>(), { loading: false, busy: false })

const emit = defineEmits<{
  view: [adjustment: SalaryAdjustment]
  approve: [adjustment: SalaryAdjustment]
  reject: [adjustment: SalaryAdjustment]
  apply: [adjustment: SalaryAdjustment]
}>()

const MAX_VISIBLE_CHIPS = 2

const currency = (value: MoneyValue) => {
  if (value === null || value === undefined || value === '') return '—'
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '—'
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(numeric)
}

// Difference = change in basic salary + change in the main allowance.
const difference = (item: SalaryAdjustment) => {
  const basicDiff = Number(item.new_basic_salary) - Number(item.previous_basic_salary)
  const allowanceDiff = Number(item.new_allowance ?? 0) - Number(item.previous_allowance ?? 0)
  const diff = basicDiff + allowanceDiff
  if (!Number.isFinite(diff)) return '—'
  return `${diff > 0 ? '+' : diff < 0 ? '−' : ''}${currency(Math.abs(diff))}`
}

const dateLabel = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date)
}
const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

interface Chip {
  key: string
  label: string
  amount: number
  main: boolean
}

// Every allowance (main + additional) as one flat list.
const chipsOf = (item: SalaryAdjustment): Chip[] => {
  const list: Chip[] = []
  const main = Number(item.new_allowance ?? 0)
  if (main > 0) list.push({ key: 'main', label: 'Allowance', amount: main, main: true })
  for (const a of item.allowances ?? []) {
    list.push({
      key: `extra-${a.id ?? a.allowance_name}`,
      label: a.allowance_name,
      amount: Number(a.amount || 0),
      main: false,
    })
  }
  return list
}

const visibleChips = (item: SalaryAdjustment) => chipsOf(item).slice(0, MAX_VISIBLE_CHIPS)
const hiddenCount = (item: SalaryAdjustment) => Math.max(0, chipsOf(item).length - MAX_VISIBLE_CHIPS)
const totalAllowances = (item: SalaryAdjustment) => chipsOf(item).reduce((sum, c) => sum + c.amount, 0)
const fullBreakdown = (item: SalaryAdjustment) =>
  chipsOf(item).map(c => `${c.label}: ${currency(c.amount)}`).join('\n')
</script>

<template>
  <BaseDataTable
    title="Salary Adjustments Directory"
    description="Track employee salary changes, approval decisions and application history."
    :has-rows="adjustments.length > 0"
    :loading="loading"
    min-width="1500px"
    empty-title="No salary adjustments found"
    empty-description="Create an adjustment or change the filters to see records."
  >
    <template #headers>
      <th>Employee</th>
      <th>Salary Type</th>
      <th>Adjustment</th>
      <th>Previous Salary</th>
      <th>New Salary</th>
      <th>Allowances</th>
      <th>Difference</th>
      <th>Effective Date</th>
      <th>Status</th>
      <th>Approved By</th>
      <th class="action-column" aria-label="Actions" />
    </template>

    <template #rows>
      <tr v-for="item in adjustments" :key="item.id">
        <td>
          <div class="employee-info">
            <strong>{{ item.employee_name || 'Unknown employee' }}</strong>
          </div>
        </td>
        <td>{{ item.salary_type || 'Not assigned' }}</td>
        <td><span class="type-label" :class="item.adjustment_type">{{ titleCase(item.adjustment_type) }}</span></td>
        <td class="money">{{ currency(item.previous_basic_salary) }}</td>
        <td class="money emphasized">{{ currency(item.new_basic_salary) }}</td>

        <!-- ALLOWANCES: compact chips + total -->
        <td class="allowance-td">
          <div v-if="chipsOf(item).length" class="allowance-cell" :title="fullBreakdown(item)">
            <div class="chip-list">
              <span
                v-for="chip in visibleChips(item)"
                :key="chip.key"
                class="chip"
                :class="{ main: chip.main }"
              >
                <span class="chip-name">{{ chip.label }}</span>
                <strong class="chip-amount">{{ currency(chip.amount) }}</strong>
              </span>
              <span v-if="hiddenCount(item)" class="chip more">+{{ hiddenCount(item) }} more</span>
            </div>
            <div v-if="chipsOf(item).length > 1" class="allowance-total">
              Total <strong>{{ currency(totalAllowances(item)) }}</strong>
            </div>
          </div>
          <span v-else class="muted">—</span>
        </td>

        <td class="money" :class="item.adjustment_type">{{ difference(item) }}</td>
        <td>{{ dateLabel(item.effective_date) }}</td>
        <td><span class="status-label" :class="item.status">{{ titleCase(item.status) }}</span></td>
        <td>{{ item.approved_by_name || '—' }}</td>
        <td class="action-column">
          <SalaryAdjustmentActions
            :adjustment="item"
            :disabled="busy"
            @view="emit('view', $event)"
            @approve="emit('approve', $event)"
            @reject="emit('reject', $event)"
            @apply="emit('apply', $event)"
          />
        </td>
      </tr>
    </template>
  </BaseDataTable>
</template>

<style scoped>
.employee-info { min-width: 170px; }
.employee-info strong { display: block; color: var(--text-primary); font-size: 12px; font-weight: 600; }
.money { white-space: nowrap; font-variant-numeric: tabular-nums; }
.emphasized { color: var(--text-primary); font-weight: 600; }
.money.increase { color: #34d399; }
.money.decrease { color: #fb7185; }
.muted { color: var(--text-muted); }

/* Allowances */
.allowance-td { min-width: 230px; }
.allowance-cell { display: flex; flex-direction: column; gap: 6px; padding: 4px 0; }
.chip-list { display: flex; flex-wrap: wrap; gap: 5px; }
.chip {
  display: inline-flex; align-items: center; gap: 6px;
  max-width: 100%; padding: 3px 9px;
  border: 1px solid var(--border); border-radius: 999px;
  background: var(--bg-card-soft); font-size: 11px; line-height: 1.5;
}
.chip-name { max-width: 90px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; color: var(--text-secondary); }
.chip-amount { color: var(--text-primary); font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
.chip.main { border-color: rgba(59,130,246,.35); background: rgba(59,130,246,.12); }
.chip.main .chip-name { color: #93c5fd; }
.chip.more { color: var(--text-muted); border-style: dashed; background: transparent; }
.allowance-total { color: var(--text-muted); font-size: 10px; }
.allowance-total strong { margin-left: 4px; color: #34d399; font-size: 11px; font-weight: 700; font-variant-numeric: tabular-nums; }

.type-label, .status-label {
  display: inline-block; border-radius: 999px; padding: 5px 9px;
  font-size: 10px; font-weight: 600; white-space: nowrap;
  background: rgba(59,130,246,.12); color: #93c5fd;
}
.type-label.increase, .status-label.applied { background: rgba(16,185,129,.12); color: #34d399; }
.type-label.decrease, .status-label.rejected { background: rgba(244,63,94,.12); color: #fb7185; }
.status-label.pending { background: rgba(245,158,11,.13); color: #fbbf24; }
.status-label.approved { background: rgba(59,130,246,.12); color: #60a5fa; }
.status-label.cancelled { background: rgba(148,163,184,.15); color: #cbd5e1; }
.action-column { min-width: 55px; text-align: right !important; }
</style>