<script setup lang="ts">
import {
  Building2,
  CircleCheck,
  CreditCard,
  FileText,
  MoreHorizontal,
  UsersRound,
} from 'lucide-vue-next'

import type {
  CompletedBilling,
  CompletedBillingPaymentStatus,
} from '~/types/completedBilling'

defineProps<{
  billings:
    CompletedBilling[]
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
    CompletedBillingPaymentStatus,
) => {
  if (
    status ===
    'Paid'
  ) {
    return 'paid'
  }

  if (
    status ===
    'Partially Paid'
  ) {
    return 'partial'
  }

  return 'unpaid'
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          Completed Billing
        </h3>

        <p>
          Review finalized client billings,
          payments, outstanding balances and
          invoice references.
        </p>

      </div>

    </div>

    <div
      v-if="
        billings.length
      "
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Billing No.</th>
            <th>Client</th>
            <th>Billing Period</th>
            <th>Employees</th>
            <th>Regular Amount</th>
            <th>OT Amount</th>
            <th>Adjustments</th>
            <th>Total Billing</th>
            <th>Amount Paid</th>
            <th>Outstanding</th>
            <th>Completed</th>
            <th>Billing Status</th>
            <th>Payment Status</th>
            <th>Reference</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="
              billing in billings
            "
            :key="
              billing.id
            "
          >

            <!-- BILLING -->

            <td>

              <strong class="billing-number">
                {{
                  billing.billingNumber
                }}
              </strong>

              <span class="subtext">
                {{
                  billing.batchCode
                }}
              </span>

            </td>

            <!-- CLIENT -->

            <td>

              <div class="client-cell">

                <div class="client-icon">

                  <Building2
                    :size="15"
                  />

                </div>

                <div>

                  <strong>
                    {{
                      billing.clientName
                    }}
                  </strong>

                  <span>
                    {{
                      billing.clientCode
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
                    formatDate(
                      billing.periodStart,
                    )
                  }}
                  →
                  {{
                    formatDate(
                      billing.periodEnd,
                    )
                  }}
                </strong>

                <span>
                  Billing:
                  {{
                    formatDate(
                      billing.billingDate,
                    )
                  }}
                </span>

              </div>

            </td>

            <!-- EMPLOYEE -->

            <td>

              <div class="employee-count">

                <UsersRound
                  :size="13"
                />

                <strong>
                  {{
                    billing.employeeCount
                  }}
                </strong>

              </div>

            </td>

            <!-- REGULAR -->

            <td>

              <span class="money-normal">
                {{
                  money(
                    billing.regularAmount,
                  )
                }}
              </span>

            </td>

            <!-- OT -->

            <td>

              <span class="ot-amount">
                {{
                  money(
                    billing.overtimeAmount,
                  )
                }}
              </span>

            </td>

            <!-- ADJUSTMENT -->

            <td>

              <span
                class="adjustment"
                :class="{
                  positive:
                    billing.adjustments >
                    0,
                  negative:
                    billing.adjustments <
                    0,
                }"
              >
                {{
                  billing.adjustments > 0
                    ? '+'
                    : ''
                }}{{
                  money(
                    billing.adjustments,
                  )
                }}
              </span>

            </td>

            <!-- TOTAL -->

            <td>

              <strong class="total-billing">
                {{
                  money(
                    billing.totalBilling,
                  )
                }}
              </strong>

            </td>

            <!-- PAID -->

            <td>

              <strong class="amount-paid">
                {{
                  money(
                    billing.amountPaid,
                  )
                }}
              </strong>

            </td>

            <!-- OUTSTANDING -->

            <td>

              <strong
                class="outstanding"
                :class="{
                  settled:
                    billing.outstandingAmount ===
                    0,
                }"
              >
                {{
                  money(
                    billing.outstandingAmount,
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
                      billing.completedAt,
                    )
                  }}
                </strong>

                <span>
                  by
                  {{
                    billing.completedBy
                  }}
                </span>

              </div>

            </td>

            <!-- BILLING STATUS -->

            <td>

              <StatusBadge
                :status="
                  billing.billingStatus
                "
              />

            </td>

            <!-- PAYMENT -->

            <td>

              <span
                class="payment-badge"
                :class="
                  paymentClass(
                    billing.paymentStatus,
                  )
                "
              >

                <CreditCard
                  :size="11"
                />

                {{
                  billing.paymentStatus
                }}

              </span>

            </td>

            <!-- REFERENCE -->

            <td>

              <div
                v-if="
                  billing.referenceNumber
                "
                class="reference-cell"
              >

                <FileText
                  :size="12"
                />

                <span>
                  {{
                    billing.referenceNumber
                  }}
                </span>

              </div>

              <span
                v-else
                class="empty-value"
              >
                —
              </span>

            </td>

            <!-- ACTION -->

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

    <div
      v-else
      class="empty-state"
    >

      <CircleCheck
        :size="31"
      />

      <strong>
        No completed billing found
      </strong>

      <span>
        Try changing your billing filters.
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
    1px solid var(--border-soft);
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

  min-width: 2250px;

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
    1px solid var(--border-soft);

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

/* BILLING */

.billing-number {
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

/* CLIENT */

.client-cell {
  display: flex;

  min-width: 220px;

  align-items: center;

  gap: 8px;
}

.client-icon {
  display: flex;

  width: 33px;
  height: 33px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.client-cell strong,
.client-cell span {
  display: block;
}

.client-cell strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

.client-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

/* PERIOD */

.period-cell {
  min-width: 205px;
}

.period-cell strong,
.period-cell span {
  display: block;
}

.period-cell strong {
  color:
    var(--text-primary);

  font-size: 9px;

  white-space: nowrap;
}

.period-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

/* EMPLOYEE */

.employee-count {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  color:
    var(--primary);
}

/* MONEY */

.money-normal {
  color:
    var(--text-primary);

  white-space: nowrap;
}

.ot-amount {
  color:
    var(--purple);

  white-space: nowrap;
}

.adjustment {
  white-space: nowrap;
}

.adjustment.positive {
  color:
    var(--green);
}

.adjustment.negative {
  color:
    var(--red);
}

.total-billing {
  color:
    var(--text-primary);

  font-size: 10px;

  white-space: nowrap;
}

.amount-paid {
  color:
    var(--green);

  white-space: nowrap;
}

.outstanding {
  color:
    var(--red);

  white-space: nowrap;
}

.outstanding.settled {
  color:
    var(--green);
}

/* COMPLETED */

.completed-cell {
  min-width: 155px;
}

.completed-cell strong,
.completed-cell span {
  display: block;
}

.completed-cell strong {
  color:
    var(--text-primary);

  font-size: 8px;

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
    5px 8px;

  border-radius: 20px;

  font-size: 8px;
  font-weight: 650;

  white-space: nowrap;
}

.payment-badge.paid {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.payment-badge.partial {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.payment-badge.unpaid {
  background:
    var(--red-soft);

  color:
    var(--red);
}

/* REFERENCE */

.reference-cell {
  display: flex;

  min-width: 150px;

  align-items: center;

  gap: 5px;

  color:
    var(--primary);
}

.reference-cell span {
  color:
    var(--text-secondary);

  white-space: nowrap;
}

.empty-value {
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

  min-height: 250px;

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