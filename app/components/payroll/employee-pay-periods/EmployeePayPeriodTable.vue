<script setup lang="ts">
import {
  CalendarRange,
  Users,
} from 'lucide-vue-next'

import EmployeePayPeriodActions from '~/components/payroll/employee-pay-periods/EmployeePayPeriodActions.vue'

import type {
  EmployeePayPeriod,
} from '~/types/employeePayPeriod'

defineProps<{
  periods: EmployeePayPeriod[]
}>()

const emit =
  defineEmits<{
    view: [period: EmployeePayPeriod]
    edit: [period: EmployeePayPeriod]
    open: [period: EmployeePayPeriod]
    process: [period: EmployeePayPeriod]
    employees: [period: EmployeePayPeriod]
    pending: [period: EmployeePayPeriod]
    completed: [period: EmployeePayPeriod]
    close: [period: EmployeePayPeriod]
    cancel: [period: EmployeePayPeriod]
  }>()

const money = (
  value: number,
) => {
  return new Intl.NumberFormat(
    'en-PH',
    {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    },
  ).format(value)
}

const formatDate = (
  value: string,
) => {
  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  ).format(
    new Date(
      `${value}T00:00:00`,
    ),
  )
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">
      <div>
        <h3>
          Employee Pay Periods
        </h3>

        <p>
          Review employee payroll cutoffs,
          processing progress and payroll totals.
        </p>
      </div>
    </div>

    <div
      v-if="periods.length"
      class="table-scroll"
    >

      <table>

        <thead>
          <tr>
            <th>Period Code</th>
            <th>Payroll Period</th>
            <th>Cutoff</th>
            <th>Pay Date</th>
            <th>Employees</th>
            <th>Pending</th>
            <th>Completed</th>
            <th>Gross Amount</th>
            <th>Deductions</th>
            <th>Net Amount</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="period in periods"
            :key="period.id"
          >

            <td>
              <strong class="period-code">
                {{ period.periodCode }}
              </strong>
            </td>

            <td>
              <div class="period-cell">

                <div class="period-icon">
                  <CalendarRange :size="15" />
                </div>

                <div>
                  <strong>
                    {{ period.periodName }}
                  </strong>

                  <span>
                    {{ formatDate(period.startDate) }}
                    →
                    {{ formatDate(period.endDate) }}
                  </span>
                </div>

              </div>
            </td>

            <td>
              {{ formatDate(period.cutoffDate) }}
            </td>

            <td>
              {{ formatDate(period.payDate) }}
            </td>

            <td>
              <div class="employee-count">
                <Users :size="13" />

                <strong>
                  {{ period.totalEmployees }}
                </strong>
              </div>
            </td>

            <td>
              <span class="count-badge pending">
                {{ period.pendingEmployees }}
              </span>
            </td>

            <td>
              <span class="count-badge completed">
                {{ period.completedEmployees }}
              </span>
            </td>

            <td>
              <strong class="money">
                {{ money(period.grossAmount) }}
              </strong>
            </td>

            <td>
              <span class="deductions">
                {{ money(period.totalDeductions) }}
              </span>
            </td>

            <td>
              <strong class="net">
                {{ money(period.netAmount) }}
              </strong>
            </td>

            <td>
              <StatusBadge
                :status="period.status"
              />
            </td>

            <td>
              <EmployeePayPeriodActions
                :period="period"
                @view="emit('view', period)"
                @edit="emit('edit', period)"
                @open="emit('open', period)"
                @process="emit('process', period)"
                @employees="emit('employees', period)"
                @pending="emit('pending', period)"
                @completed="emit('completed', period)"
                @close="emit('close', period)"
                @cancel="emit('cancel', period)"
              />
            </td>

          </tr>

        </tbody>

      </table>

    </div>

    <div
      v-else
      class="empty-state"
    >
      <CalendarRange :size="30" />

      <strong>
        No employee pay periods found
      </strong>

      <span>
        Try changing your filters.
      </span>
    </div>

  </article>
</template>

<style scoped>
.table-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.table-heading {
  padding: 15px 16px;
  border-bottom: 1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
}

.table-heading p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 9px;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1650px;
  border-collapse: collapse;
}

th {
  padding: 12px 13px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 9px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

td {
  padding: 13px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 9px;
  vertical-align: middle;
}

tbody tr:hover {
  background: var(--bg-card-soft);
}

.period-code {
  color: var(--primary);
  white-space: nowrap;
}

.period-cell {
  display: flex;
  min-width: 220px;
  align-items: center;
  gap: 9px;
}

.period-icon {
  display: flex;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--primary-soft);
  color: var(--primary);
}

.period-cell strong,
.period-cell span {
  display: block;
}

.period-cell strong {
  color: var(--text-primary);
  font-size: 10px;
}

.period-cell span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 8px;
}

.employee-count {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--primary);
}

.count-badge {
  display: inline-flex;
  min-width: 28px;
  align-items: center;
  justify-content: center;
  padding: 4px 7px;
  border-radius: 5px;
  font-weight: 650;
}

.count-badge.pending {
  background: var(--orange-soft);
  color: var(--orange);
}

.count-badge.completed {
  background: var(--green-soft);
  color: var(--green);
}

.money {
  color: var(--text-primary);
  white-space: nowrap;
}

.deductions {
  color: var(--red);
  white-space: nowrap;
}

.net {
  color: var(--green);
  white-space: nowrap;
}

.empty-state {
  display: flex;
  min-height: 240px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: var(--text-muted);
}

.empty-state strong {
  color: var(--text-primary);
  font-size: 11px;
}

.empty-state span {
  font-size: 9px;
}
</style>