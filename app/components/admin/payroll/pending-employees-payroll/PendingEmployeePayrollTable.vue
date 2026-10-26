<script setup lang="ts">
import {
  UserRound,
  Clock3,
  AlertTriangle,
} from 'lucide-vue-next'

import type {
  PendingEmployeePayroll,
} from '~/types/pendingEmployeePayroll'

defineProps<{
  payrolls:
    PendingEmployeePayroll[]
}>()

const emit = defineEmits<{ action: [mode: string, record: PendingEmployeePayroll] }>()

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
          Pending Employee Payroll
        </h3>

        <p>
          Review employee payroll calculations,
          attendance-based earnings,
          deductions and estimated net pay.
        </p>

      </div>

    </div>

    <div
      v-if="
        payrolls.length
      "
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Payroll No.</th>
            <th>Employee</th>
            <th>Pay Period</th>
            <th>Attendance</th>
            <th>Basic Pay</th>
            <th>OT Pay</th>
            <th>Holiday Pay</th>
            <th>Allowances</th>
            <th>Gross Pay</th>
            <th>Deductions</th>
            <th>Net Pay</th>
            <th>Status</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="
              payroll in
              payrolls
            "
            :key="
              payroll.id
            "
          >

            <!-- PAYROLL -->

            <td>

              <strong class="payroll-number">
                {{
                  payroll.payrollNumber
                }}
              </strong>

              <span class="subtext">
                {{
                  payroll.periodCode
                }}
              </span>

            </td>

            <!-- EMPLOYEE -->

            <td>

              <div class="employee-cell">

                <div class="employee-icon">

                  <UserRound :size="15" />

                </div>

                <div>

                  <strong>
                    {{
                      payroll.employeeName
                    }}
                  </strong>

                  <span>
                    {{
                      payroll.employeeNumber
                    }}
                    ·
                    {{
                      payroll.department
                    }}
                  </span>

                  <small>
                    {{
                      payroll.position
                    }}
                  </small>

                </div>

              </div>

            </td>

            <!-- PERIOD -->

            <td>

              <div class="period-cell">

                <strong>
                  {{
                    payroll.periodName
                  }}
                </strong>

                <span>
                  {{
                    formatDate(
                      payroll.periodStart,
                    )
                  }}
                  →
                  {{
                    formatDate(
                      payroll.periodEnd,
                    )
                  }}
                </span>

              </div>

            </td>

            <!-- ATTENDANCE -->

            <td>

              <div class="attendance-cell">

                <div>

                  <span>
                    Days
                  </span>

                  <strong>
                    {{
                      payroll.regularDays
                    }}
                  </strong>

                </div>

                <div>

                  <span>
                    OT
                  </span>

                  <strong>
                    {{
                      payroll.overtimeHours
                    }}h
                  </strong>

                </div>

                <div
                  v-if="
                    payroll.lateMinutes >
                      0 ||
                    payroll.undertimeMinutes >
                      0
                  "
                  class="attendance-warning"
                >

                  <Clock3 :size="10" />

                  {{
                    payroll.lateMinutes +
                    payroll.undertimeMinutes
                  }}
                  min

                </div>

              </div>

            </td>

            <!-- BASIC -->

            <td>

              <strong class="money-normal">
                {{
                  money(
                    payroll.basicPay,
                  )
                }}
              </strong>

            </td>

            <!-- OT -->

            <td>

              <span class="money-purple">
                {{
                  money(
                    payroll.overtimePay,
                  )
                }}
              </span>

            </td>

            <!-- HOLIDAY -->

            <td>

              <span class="money-blue">
                {{
                  money(
                    payroll.holidayPay,
                  )
                }}
              </span>

            </td>

            <!-- ALLOWANCES -->

            <td>

              <span>
                {{
                  money(
                    payroll.allowances,
                  )
                }}
              </span>

            </td>

            <!-- GROSS -->

            <td>

              <strong class="gross">
                {{
                  money(
                    payroll.grossPay,
                  )
                }}
              </strong>

            </td>

            <!-- DEDUCTIONS -->

            <td>

              <span class="deduction">
                {{
                  money(
                    payroll.totalDeductions,
                  )
                }}
              </span>

            </td>

            <!-- NET -->

            <td>

              <strong class="net">
                {{
                  money(
                    payroll.netPay,
                  )
                }}
              </strong>

            </td>

            <!-- STATUS -->

            <td>

              <div class="status-cell">

                <StatusBadge
                  :status="
                    payroll.status
                  "
                />

                <span
                  v-if="
                    payroll.issueCount >
                    0
                  "
                  class="issue-badge"
                >

                  <AlertTriangle
                    :size="11"
                  />

                  {{
                    payroll.issueCount
                  }}

                </span>

              </div>

            </td>

            <!-- ACTION -->

            <td>

              <PayrollActionMenu :label="'Actions for ' + payroll.employeeName" :items="[{ key: 'details', label: 'View Payroll Details' }, { key: 'issues', label: 'Review Payroll Issues' }, { key: 'payslip', label: 'Payroll Preview' }]" @select="mode => emit('action', mode, payroll)" />

            </td>

          </tr>

        </tbody>

      </table>

    </div>

    <!-- EMPTY -->

    <div
      v-else
      class="empty-state"
    >

      <UserRound :size="30" />

      <strong>
        No pending employee payroll found
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

  border:
    1px solid var(--border);

  border-radius: 11px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

.table-heading {
  padding:
    15px 16px;

  border-bottom:
    1px solid
    var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

.table-heading p {
  margin:
    5px 0 0;

  color:
    var(--text-muted);

  font-size: 9px;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;

  min-width: 1900px;

  border-collapse:
    collapse;
}

th {
  padding:
    12px 13px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-size: 9px;
  font-weight: 700;

  text-align: left;

  text-transform:
    uppercase;

  white-space: nowrap;
}

td {
  padding:
    13px;

  border-top:
    1px solid
    var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 9px;

  vertical-align:
    middle;
}

tbody tr:hover {
  background:
    var(--bg-card-soft);
}

/* PAYROLL */

.payroll-number {
  display: block;

  color:
    var(--primary);

  font-size: 9px;

  white-space: nowrap;
}

.subtext {
  display: block;

  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;

  white-space: nowrap;
}

/* EMPLOYEE */

.employee-cell {
  display: flex;

  min-width: 205px;

  align-items: center;

  gap: 8px;
}

.employee-icon {
  display: flex;

  width: 34px;
  height: 34px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.employee-cell strong,
.employee-cell span,
.employee-cell small {
  display: block;
}

.employee-cell strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.employee-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

.employee-cell small {
  margin-top: 2px;

  color:
    var(--text-secondary);

  font-size: 8px;
}

/* PERIOD */

.period-cell {
  min-width: 195px;
}

.period-cell strong,
.period-cell span {
  display: block;
}

.period-cell strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

.period-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;

  white-space: nowrap;
}

/* ATTENDANCE */

.attendance-cell {
  display: flex;

  min-width: 150px;

  align-items: center;

  gap: 6px;
}

.attendance-cell > div:not(
  .attendance-warning
) {
  min-width: 42px;

  padding:
    5px 6px;

  border-radius: 5px;

  background:
    var(--bg-card-soft);
}

.attendance-cell span,
.attendance-cell strong {
  display: block;
}

.attendance-cell span {
  color:
    var(--text-muted);

  font-size: 7px;
}

.attendance-cell strong {
  margin-top: 1px;

  color:
    var(--text-primary);

  font-size: 8px;
}

.attendance-warning {
  display: flex;

  align-items: center;

  gap: 3px;

  padding:
    5px 6px;

  border-radius: 5px;

  background:
    var(--orange-soft);

  color:
    var(--orange);

  font-size: 7px;

  white-space: nowrap;
}

/* MONEY */

.money-normal,
.gross {
  color:
    var(--text-primary);

  white-space: nowrap;
}

.money-purple {
  color:
    var(--purple);

  white-space: nowrap;
}

.money-blue {
  color:
    var(--primary);

  white-space: nowrap;
}

.deduction {
  color:
    var(--red);

  white-space: nowrap;
}

.net {
  color:
    var(--green);

  font-size: 10px;

  white-space: nowrap;
}

/* STATUS */

.status-cell {
  display: flex;

  align-items: center;

  gap: 5px;
}

.issue-badge {
  display: inline-flex;

  align-items: center;

  gap: 3px;

  padding:
    4px 6px;

  border-radius: 5px;

  background:
    var(--red-soft);

  color:
    var(--red);

  font-size: 8px;
  font-weight: 700;
}

/* ACTION */

.action-button {
  display: flex;

  width: 31px;
  height: 31px;

  align-items: center;
  justify-content: center;

  border:
    1px solid transparent;

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);

  cursor: pointer;
}

.action-button:hover {
  border-color:
    var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--primary);
}

/* EMPTY */

.empty-state {
  display: flex;

  min-height: 240px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 7px;

  color:
    var(--text-muted);
}

.empty-state strong {
  color:
    var(--text-primary);

  font-size: 11px;
}

.empty-state span {
  font-size: 9px;
}
</style>