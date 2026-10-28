<script setup lang="ts">
import {
  UserRound,
  CreditCard,
  FileCheck2,
} from 'lucide-vue-next'

import type {
  EmployeePayroll,
  EmployeePayrollPaymentStatus,
} from '~/types/employeePayroll'

defineProps<{
  payrolls:
    EmployeePayroll[]
}>()

const emit = defineEmits<{ action: [mode: string, record: EmployeePayroll] }>()

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

const paymentClass = (
  status:
    EmployeePayrollPaymentStatus,
) => {
  if (
    status ===
    'Paid'
  ) {
    return 'paid'
  }

  if (
    status ===
    'Released'
  ) {
    return 'released'
  }

  if (
    status ===
    'Pending Payment'
  ) {
    return 'pending'
  }

  return 'unpaid'
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
            <th>Allowances</th>
            <th>Gross Pay</th>
            <th>Deductions</th>
            <th>Net Pay</th>
            <th>Payroll Status</th>
            <th>Payment Status</th>
            <th>Reference</th>
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

            <!-- BASIC -->

            <td>

              <strong class="basic-pay">
                {{
                  money(
                    payroll.basicPay,
                  )
                }}
              </strong>

            </td>

            <!-- OT -->

            <td>

              <span class="ot-pay">
                {{
                  money(
                    payroll.overtimePay,
                  )
                }}
              </span>

            </td>

            <!-- ALLOWANCE -->

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

            <!-- DEDUCTION -->

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

            <!-- PAYROLL STATUS -->

            <td>

              <StatusBadge
                :status="
                  payroll.payrollStatus
                "
              />

            </td>

            <!-- PAYMENT -->

            <td>

              <span
                class="payment-badge"
                :class="
                  paymentClass(
                    payroll.paymentStatus,
                  )
                "
              >

                <CreditCard :size="11" />

                {{
                  payroll.paymentStatus
                }}

              </span>

            </td>

            <!-- REFERENCE -->

            <td>

              <div
                v-if="
                  payroll.referenceNumber
                "
                class="reference-cell"
              >

                <FileCheck2
                  :size="12"
                />

                <span>
                  {{
                    payroll.referenceNumber
                  }}
                </span>

              </div>

              <span
                v-else
                class="no-reference"
              >
                —
              </span>

            </td>

            <!-- ACTION -->

            <td>

              <PayrollActionMenu :label="'Actions for ' + payroll.employeeName" :items="[{ key: 'details', label: 'View Payroll Details' }, { key: 'payslip', label: 'Payslip Preview' }, { key: 'history', label: 'Payment History' }]" @select="mode => emit('action', mode, payroll)" />

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

/* PAYMENT */

.payment-badge {
  display: inline-flex;

  align-items: center;

  gap: 4px;

  padding:
    5px 7px;

  border-radius: 20px;

  font-size: 8px;
  font-weight: 650;

  white-space: nowrap;
}

.payment-badge.unpaid {
  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);
}

.payment-badge.pending {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.payment-badge.paid {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.payment-badge.released {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

/* REFERENCE */

.reference-cell {
  display: flex;

  min-width: 150px;

  align-items: center;

  gap: 5px;

  color:
    var(--green);
}

.reference-cell span {
  color:
    var(--text-secondary);

  font-size: 8px;

  white-space: nowrap;
}

.no-reference {
  color:
    var(--text-muted);
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