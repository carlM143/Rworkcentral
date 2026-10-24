<script setup lang="ts">
import {
  MoreHorizontal,
  Truck,
  Route,
  CircleCheck,
  CreditCard,
} from 'lucide-vue-next'

import type {
  CompletedDriverPayroll,
  DriverPayrollPaymentStatus,
} from '~/types/completedDriverPayroll'

defineProps<{
  payrolls:
    CompletedDriverPayroll[]
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

const formatDateTime = (
  value: string,
) => {
  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    },
  ).format(
    new Date(value),
  )
}

const paymentClass = (
  status:
    DriverPayrollPaymentStatus,
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

  return 'pending'
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          Completed Driver Payroll
        </h3>

        <p>
          Review completed driver payroll records,
          payment status and released net payroll.
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
            <th>Driver</th>
            <th>Pay Period</th>
            <th>Trips</th>
            <th>Gross Pay</th>
            <th>Deductions</th>
            <th>Net Pay</th>
            <th>Completed</th>
            <th>Payment Status</th>
            <th>Payroll Status</th>
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

            <!-- DRIVER -->

            <td>

              <div class="driver-cell">

                <div class="driver-icon">

                  <Truck :size="15" />

                </div>

                <div>

                  <strong>
                    {{
                      payroll.driverName
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

            <!-- TRIPS -->

            <td>

              <div class="trip-cell">

                <Route :size="13" />

                <strong>
                  {{
                    payroll.totalTrips
                  }}
                </strong>

              </div>

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

            <!-- COMPLETED -->

            <td>

              <div class="completed-cell">

                <strong>
                  {{
                    formatDateTime(
                      payroll.completedAt,
                    )
                  }}
                </strong>

                <span>
                  by
                  {{
                    payroll.completedBy
                  }}
                </span>

              </div>

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

                <CreditCard
                  :size="11"
                />

                {{
                  payroll.paymentStatus
                }}

              </span>

            </td>

            <!-- STATUS -->

            <td>

              <StatusBadge
                :status="
                  payroll.payrollStatus
                "
              />

            </td>

            <!-- REFERENCE -->

            <td>

              <div
                v-if="
                  payroll.referenceNumber
                "
                class="reference-cell"
              >

                <CircleCheck
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

            <!-- ACTIONS -->

            <td>

              <button
                type="button"
                class="action-button"
                title="Actions will be added later"
              >

                <MoreHorizontal
                  :size="17"
                />

              </button>

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

      <CircleCheck :size="31" />

      <strong>
        No completed driver payroll found
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

  min-width: 1850px;

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

/* DRIVER */

.driver-cell {
  display: flex;

  min-width: 190px;

  align-items: center;

  gap: 8px;
}

.driver-icon {
  display: flex;

  width: 34px;
  height: 34px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--green-soft);

  color:
    var(--green);
}

.driver-cell strong,
.driver-cell span {
  display: block;
}

.driver-cell strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.driver-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

/* PERIOD */

.period-cell {
  min-width: 190px;
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

/* TRIP */

.trip-cell {
  display: flex;

  align-items: center;

  gap: 5px;

  color:
    var(--primary);
}

/* MONEY */

.gross {
  color:
    var(--text-primary);

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

/* COMPLETED */

.completed-cell {
  min-width: 145px;
}

.completed-cell strong,
.completed-cell span {
  display: block;
}

.completed-cell strong {
  color:
    var(--text-primary);

  font-size: 9px;

  white-space: nowrap;
}

.completed-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
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