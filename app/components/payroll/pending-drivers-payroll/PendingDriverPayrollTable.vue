<script setup lang="ts">
import {
  Truck,
  Route,
  AlertTriangle,
} from 'lucide-vue-next'

import PendingDriverPayrollActions from '~/components/payroll/pending-drivers-payroll/PendingDriverPayrollActions.vue'

import type {
  PendingDriverPayroll,
} from '~/types/pendingDriverPayroll'

defineProps<{
  payrolls:
    PendingDriverPayroll[]
}>()

const emit =
  defineEmits<{
    view: [payroll: PendingDriverPayroll]
    review: [payroll: PendingDriverPayroll]
    driver: [payroll: PendingDriverPayroll]
    trips: [payroll: PendingDriverPayroll]
    issues: [payroll: PendingDriverPayroll]
    ready: [payroll: PendingDriverPayroll]
    finalize: [payroll: PendingDriverPayroll]
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
          Pending Driver Payroll
        </h3>

        <p>
          Review pending driver compensation,
          trip earnings, deductions and estimated net pay.
        </p>

      </div>

    </div>

    <div
      v-if="payrolls.length"
      class="table-scroll"
    >

      <table>

        <thead>
          <tr>
            <th>Payroll No.</th>
            <th>Driver</th>
            <th>Pay Period</th>
            <th>Trips</th>
            <th>Regular Pay</th>
            <th>Trip Pay</th>
            <th>OT Pay</th>
            <th>Allowance</th>
            <th>Gross Pay</th>
            <th>Deductions</th>
            <th>Net Pay</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="payroll in payrolls"
            :key="payroll.id"
          >

            <td>

              <strong class="payroll-number">
                {{ payroll.payrollNumber }}
              </strong>

              <span class="small-text">
                {{ payroll.periodCode }}
              </span>

            </td>

            <td>

              <div class="driver-cell">

                <div class="driver-avatar">
                  <Truck :size="15" />
                </div>

                <div>

                  <strong>
                    {{ payroll.driverName }}
                  </strong>

                  <span>
                    {{ payroll.employeeNumber }}
                    ·
                    {{ payroll.department }}
                  </span>

                </div>

              </div>

            </td>

            <td>

              <div class="period-cell">

                <strong>
                  {{ payroll.periodName }}
                </strong>

                <span>
                  {{ formatDate(payroll.periodStart) }}
                  →
                  {{ formatDate(payroll.periodEnd) }}
                </span>

              </div>

            </td>

            <td>

              <div class="trip-cell">

                <Route :size="13" />

                <strong>
                  {{ payroll.totalTrips }}
                </strong>

              </div>

            </td>

            <td>
              {{ money(payroll.regularPay) }}
            </td>

            <td class="blue">
              {{ money(payroll.tripPay) }}
            </td>

            <td class="purple">
              {{ money(payroll.overtimePay) }}
            </td>

            <td>
              {{ money(payroll.allowance) }}
            </td>

            <td>
              <strong class="gross">
                {{ money(payroll.grossPay) }}
              </strong>
            </td>

            <td>
              <span class="deduction">
                {{ money(payroll.totalDeductions) }}
              </span>
            </td>

            <td>
              <strong class="net">
                {{ money(payroll.netPay) }}
              </strong>
            </td>

            <td>

              <div class="status-cell">

                <StatusBadge
                  :status="payroll.status"
                />

                <span
                  v-if="
                    payroll.issueCount > 0
                  "
                  class="issue"
                >
                  <AlertTriangle :size="11" />

                  {{ payroll.issueCount }}
                </span>

              </div>

            </td>

            <td>

              <PendingDriverPayrollActions
                :payroll="payroll"
                @view="
                  emit(
                    'view',
                    payroll,
                  )
                "
                @review="
                  emit(
                    'review',
                    payroll,
                  )
                "
                @driver="
                  emit(
                    'driver',
                    payroll,
                  )
                "
                @trips="
                  emit(
                    'trips',
                    payroll,
                  )
                "
                @issues="
                  emit(
                    'issues',
                    payroll,
                  )
                "
                @ready="
                  emit(
                    'ready',
                    payroll,
                  )
                "
                @finalize="
                  emit(
                    'finalize',
                    payroll,
                  )
                "
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

      <Truck :size="30" />

      <strong>
        No pending driver payroll found
      </strong>

      <span>
        Try changing your payroll filters.
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
  min-width: 1900px;
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

.payroll-number {
  display: block;
  color: var(--primary);
  white-space: nowrap;
}

.small-text {
  display: block;
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 8px;
}

.driver-cell {
  display: flex;
  min-width: 190px;
  align-items: center;
  gap: 8px;
}

.driver-avatar {
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

.driver-cell strong,
.driver-cell span {
  display: block;
}

.driver-cell strong {
  color: var(--text-primary);
  font-size: 10px;
}

.driver-cell span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 8px;
}

.period-cell {
  min-width: 180px;
}

.period-cell strong,
.period-cell span {
  display: block;
}

.period-cell strong {
  color: var(--text-primary);
  font-size: 9px;
}

.period-cell span {
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 8px;
}

.trip-cell {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--primary);
}

.blue {
  color: var(--primary);
}

.purple {
  color: var(--purple);
}

.gross {
  color: var(--text-primary);
  white-space: nowrap;
}

.deduction {
  color: var(--red);
  white-space: nowrap;
}

.net {
  color: var(--green);
  white-space: nowrap;
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 5px;
}

.issue {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 4px 6px;
  border-radius: 5px;
  background: var(--red-soft);
  color: var(--red);
  font-size: 8px;
  font-weight: 700;
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