<script setup lang="ts">
import { UserRound } from 'lucide-vue-next'

import type { EmployeePayrollRow } from '~/types/payroll/employee-payroll/employeePayroll'

defineProps<{
  payrolls: EmployeePayrollRow[]
}>()

const emit = defineEmits<{ action: [mode: string, record: EmployeePayrollRow] }>()

const money = (value: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(value)
}

const formatDate = (value?: string | null) => {
  if (!value) return '—'

  const date = new Date(`${value.slice(0, 10)}T00:00:00`)

  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(date)
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          Employee Payroll Ledger
        </h3>

        <p>
          View employee payroll records across pay periods,
          earnings, deductions, payroll status and payment history.
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
            <th>Basic Pay</th>
            <th>OT Pay</th>
            <th>Holiday Pay</th>
            <th>Allowances</th>
            <th>Gross Pay</th>
            <th>Deductions</th>
            <th>Net Pay</th>
            <th>Payroll Status</th>
            <th>Payment Date</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="payroll in payrolls"
            :key="payroll.payroll_id"
          >

            <!-- PAYROLL -->

            <td>
              <strong class="payroll-number">
                {{ payroll.payslip_no ?? '—' }}
              </strong>

              <span class="subtext">
                {{ payroll.payroll_group ?? '—' }}
              </span>
            </td>

            <!-- EMPLOYEE -->

            <td>
              <div class="employee-cell">
                <div class="employee-icon">
                  <UserRound :size="15" />
                </div>

                <div>
                  <strong>{{ payroll.employee.name }}</strong>

                  <span>
                    {{ payroll.employee.emp_id ?? '—' }}
                    ·
                    {{ payroll.employee.department ?? '—' }}
                  </span>
                </div>
              </div>
            </td>

            <!-- PERIOD -->

            <td>
              <div class="period-cell">
                <strong>{{ payroll.period?.period_name ?? '—' }}</strong>

                <span>
                  {{ formatDate(payroll.period?.pay_period_start) }}
                  →
                  {{ formatDate(payroll.period?.pay_period_end) }}
                </span>
              </div>
            </td>

            <!-- BASIC -->

            <td>
              <strong class="basic-pay">{{ money(payroll.basic_pay) }}</strong>
            </td>

            <!-- OT -->

            <td>
              <span class="ot-pay">{{ money(payroll.overtime_pay) }}</span>
            </td>

            <!-- HOLIDAY -->

            <td>
              <span class="holiday-pay">{{ money(payroll.holiday_pay ?? 0) }}</span>
            </td>

            <!-- ALLOWANCE -->

            <td>
              <span>{{ money(payroll.allowance_pay) }}</span>
            </td>

            <!-- GROSS -->

            <td>
              <strong class="gross">{{ money(payroll.gross_pay) }}</strong>
            </td>

            <!-- DEDUCTION -->

            <td>
              <span class="deduction">{{ money(payroll.total_deductions) }}</span>
            </td>

            <!-- NET -->

            <td>
              <strong class="net">{{ money(payroll.net_pay) }}</strong>
            </td>

            <!-- PAYROLL STATUS -->

            <td>
              <StatusBadge :status="payroll.status" />
            </td>

            <!-- PAYMENT DATE -->

            <td>
              {{ formatDate(payroll.period?.payment_date) }}
            </td>

            <!-- ACTION -->

            <td>
              <PayrollActionMenu :label="'Actions for ' + payroll.employee.name" :items="[{ key: 'details', label: 'View Payroll Details' }, { key: 'payslip', label: 'Payslip Preview' }, { key: 'history', label: 'Payment History' }]" @select="mode => emit('action', mode, payroll)" />
            </td>

          </tr>

        </tbody>

      </table>

    </div>

    <div
      v-else
      class="empty-state"
    >

      <UserRound :size="31" />

      <strong>
        No employee payroll records found
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

  min-width: 210px;

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

/* MONEY */

.basic-pay,
.gross {
  color:
    var(--text-primary);

  white-space: nowrap;
}

.ot-pay {
  color:
    var(--purple);

  white-space: nowrap;
}

.holiday-pay {
  color:
    var(--orange);

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