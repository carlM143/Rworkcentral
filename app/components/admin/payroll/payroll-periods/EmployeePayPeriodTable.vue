<script setup lang="ts">
import type { PayrollPeriod } from '~/types/payroll/payroll-periods/payrollPeriod'

withDefaults(defineProps<{
  periods: PayrollPeriod[]
  loading?: boolean
}>(), {
  loading: false,
})

const emit = defineEmits<{
  view: [period: PayrollPeriod]
  edit: [period: PayrollPeriod]
  delete: [period: PayrollPeriod]
}>()

const periodName = (period: PayrollPeriod) =>
  period.period_name || period.label || `Payroll Period #${period.id}`

const isDraft = (period: PayrollPeriod) =>
  String(period.status ?? '').toLowerCase() === 'draft'

const rowActions = (period: PayrollPeriod) => [
  { key: 'view', label: 'View Payroll Period' },
  { key: 'edit', label: 'Edit Payroll Period', disabled: !isDraft(period), reason: 'Only draft periods can be edited.' },
  { key: 'delete', label: 'Delete Payroll Period', disabled: !isDraft(period), reason: 'Only draft periods can be deleted.' },
]

const selectAction = (key: string, period: PayrollPeriod) => {
  if (key === 'view') emit('view', period)
  if (key === 'edit') emit('edit', period)
  if (key === 'delete') emit('delete', period)
}

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date)
}
</script>

<template>
  <BaseDataTable
    title="Payroll Periods"
    description="Manage company payroll cutoff dates, payment schedules and period status."
    :has-rows="periods.length > 0"
    :loading="loading"
    min-width="950px"
    empty-title="No payroll periods found"
    empty-description="Create your first payroll period or adjust the filters."
  >
    <template #headers>
      <th>Period ID</th>
      <th>Payroll Period</th>
      <th>Cutoff Start</th>
      <th>Cutoff End</th>
      <th>Payment Date</th>
      <th>Status</th>
      <th class="text-right">Actions</th>
    </template>

    <template #rows>
      <tr
        v-for="period in periods"
        :key="period.id"
      >
        <td>
          <strong class="period-code">#{{ period.id }}</strong>
        </td>

        <td>
          <div class="period-cell">
            <strong>{{ periodName(period) }}</strong>
            <span>
              Cutoff {{ period.cutoff_number }} ·
              {{ formatDate(period.cutoff_start) }} – {{ formatDate(period.cutoff_end) }}
            </span>
          </div>
        </td>

        <td>{{ formatDate(period.cutoff_start) }}</td>
        <td>{{ formatDate(period.cutoff_end) }}</td>
        <td>{{ formatDate(period.payment_date) }}</td>

        <td>
          <StatusBadge :status="period.status" />
        </td>

        <td class="text-right">
          <PayrollActionMenu
            :label="'Actions for ' + periodName(period)"
            :items="rowActions(period)"
            @select="key => selectAction(key, period)"
          />
        </td>
      </tr>
    </template>
  </BaseDataTable>
</template>

<style scoped>
.period-code {
  color: var(--primary);
  font-size: 12px;
}

.period-cell {
  min-width: 220px;
}

.period-cell strong,
.period-cell span {
  display: block;
}

.period-cell strong {
  color: var(--text-primary);
  font-size: 12px;
}

.period-cell span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 10px;
}
</style>