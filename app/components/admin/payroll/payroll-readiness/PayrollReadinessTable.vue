<script setup lang="ts">
import type {
  ReadinessEmployee,
  ReadinessPending,
} from '~/types/payroll/payroll-readiness/payrollReadiness'

withDefaults(defineProps<{
  employees: ReadinessEmployee[]
  loading?: boolean
}>(), {
  loading: false,
})

const pendingLabels: Record<keyof ReadinessPending, string> = {
  overtime: 'OT',
  undertime: 'UT',
  leave: 'Leave',
  corrections: 'Corrections',
  late_adjustments: 'Late adj.',
  transfers: 'Transfer',
}

const pendingItems = (pending: ReadinessPending) =>
  (Object.keys(pendingLabels) as (keyof ReadinessPending)[])
    .filter(key => pending[key] > 0)
    .map(key => ({ key, label: pendingLabels[key], count: pending[key] }))

const statusLabel = {
  ready: 'Ready',
  warning: 'Warning',
  blocked: 'Blocked',
}

const formatMoney = (value: string | number | null) => {
  if (value === null || value === '' || Number(value) <= 0) return '—'
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(Number(value))
}

const frequencyLabel = (value?: string) => ({
  weekly: 'Weekly',
  bi_weekly: 'Bi-weekly',
  semi_monthly: 'Semi-monthly',
  monthly: 'Monthly',
}[value ?? ''] ?? value ?? '')
</script>

<template>
  <BaseDataTable
    title="Employee Readiness"
    description="Each employee included in this cutoff and anything that needs attention before payroll is generated."
    :has-rows="employees.length > 0"
    :loading="loading"
    min-width="1150px"
    empty-title="No employees to show"
    empty-description="No employees are in a payroll group for this cutoff, or none match your filters."
  >
    <template #headers>
      <th>Employee</th>
      <th>Payroll Group</th>
      <th>Salary</th>
      <th>Time Logs</th>
      <th>Pending Approvals</th>
      <th>Status</th>
      <th>Issues</th>
    </template>

    <template #rows>
      <tr
        v-for="row in employees"
        :key="row.employee_id"
      >
        <td>
          <div class="stack">
            <strong>{{ row.name }}</strong>
            <span>{{ row.emp_id }}<template v-if="row.department"> · {{ row.department }}</template></span>
          </div>
        </td>

        <td>
          <div
            v-if="row.payroll_group"
            class="stack"
          >
            <strong>{{ row.payroll_group.group_name }}</strong>
            <span>{{ frequencyLabel(row.payroll_group.frequency) }}</span>
          </div>
          <span
            v-else
            class="muted"
          >—</span>
        </td>

        <td>
          <div class="stack">
            <strong>{{ formatMoney(row.basic_salary) }}</strong>
            <span>
              {{ row.salary_type || 'No salary type' }}
              <template v-if="Number(row.allowance) > 0">
                · + {{ formatMoney(row.allowance) }} allowance
              </template>
            </span>
          </div>
        </td>

        <td>
          <div class="stack">
            <strong>{{ row.time_logs_count }}</strong>
            <span
              v-if="row.incomplete_logs_count"
              class="warn-text"
            >{{ row.incomplete_logs_count }} incomplete</span>
          </div>
        </td>

        <td>
          <div
            v-if="pendingItems(row.pending).length"
            class="chips"
          >
            <span
              v-for="item in pendingItems(row.pending)"
              :key="item.key"
              class="chip"
            >
              {{ item.label }} {{ item.count }}
            </span>
          </div>
          <span
            v-else
            class="muted"
          >None</span>
        </td>

        <td>
          <span
            class="pill"
            :class="`pill--${row.status}`"
          >
            {{ statusLabel[row.status] }}
          </span>
        </td>

        <td>
          <ul
            v-if="row.issues.length"
            class="issues"
          >
            <li
              v-for="issue in row.issues"
              :key="issue.code"
              :class="issue.severity"
            >
              {{ issue.message }}
            </li>
          </ul>
          <span
            v-else
            class="ok-text"
          >All good</span>
        </td>
      </tr>
    </template>
  </BaseDataTable>
</template>

<style scoped>
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

.muted {
  color: var(--text-muted);
}

.warn-text {
  color: #fb923c !important;
}

.ok-text {
  color: #22c55e;
  font-size: 11px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.chip {
  padding: 2px 8px;
  border-radius: 20px;
  background: rgb(251 146 60 / 12%);
  color: #fb923c;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

.pill {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.pill--ready {
  background: rgb(34 197 94 / 11%);
  color: #22c55e;
}

.pill--warning {
  background: rgb(251 146 60 / 12%);
  color: #fb923c;
}

.pill--blocked {
  background: rgb(248 113 113 / 12%);
  color: #f87171;
}

.issues {
  max-width: 320px;
  margin: 0;
  padding-left: 16px;
  font-size: 11px;
}

.issues li {
  margin: 2px 0;
}

.issues .blocker {
  color: #f87171;
}

.issues .warning {
  color: var(--text-secondary);
}
</style>