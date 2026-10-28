<script setup lang="ts">
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  MoreHorizontal,
  ReceiptText,
} from 'lucide-vue-next'

import type {
  BillingAdjustment,
  BillingAdjustmentStatus,
  BillingAdjustmentType,
} from '~/types/billingAdjustment'

defineProps<{
  adjustments:
    BillingAdjustment[]
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
  ).format(
    Math.abs(value),
  )
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

const statusClass = (
  status:
    BillingAdjustmentStatus,
) => {
  if (
    status ===
    'Pending'
  ) {
    return 'pending'
  }

  if (
    status ===
    'For Review'
  ) {
    return 'review'
  }

  if (
    status ===
    'Approved'
  ) {
    return 'approved'
  }

  if (
    status ===
    'Applied'
  ) {
    return 'applied'
  }

  return 'rejected'
}

const typeClass = (
  type:
    BillingAdjustmentType,
) => {
  if (
    type ===
    'Add Billing'
  ) {
    return 'add'
  }

  if (
    type ===
    'Deduction'
  ) {
    return 'deduction'
  }

  if (
    type ===
    'Overtime Adjustment'
  ) {
    return 'overtime'
  }

  if (
    type ===
    'Rate Adjustment'
  ) {
    return 'rate'
  }

  if (
    type ===
    'Correction'
  ) {
    return 'correction'
  }

  return 'manual'
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          Billing Adjustments
        </h3>

        <p>
          Review billing additions,
          deductions, corrections and
          adjustment approval status.
        </p>

      </div>

    </div>

    <div
      v-if="
        adjustments.length
      "
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Adjustment No.</th>
            <th>Billing No.</th>
            <th>Client</th>
            <th>Billing Period</th>
            <th>Adjustment Type</th>
            <th>Amount</th>
            <th>Reason</th>
            <th>Requested By</th>
            <th>Requested Date</th>
            <th>Status</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="
              item in adjustments
            "
            :key="
              item.id
            "
          >

            <!-- ADJUSTMENT -->

            <td>

              <strong class="adjustment-number">
                {{
                  item.adjustmentNumber
                }}
              </strong>

              <span class="subtext">
                {{
                  item.batchCode
                }}
              </span>

            </td>

            <!-- BILLING -->

            <td>

              <div class="billing-cell">

                <ReceiptText
                  :size="12"
                />

                <span>
                  {{
                    item.billingNumber
                  }}
                </span>

              </div>

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
                      item.clientName
                    }}
                  </strong>

                  <span>
                    {{
                      item.clientCode
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
                      item.periodStart,
                    )
                  }}
                  →
                  {{
                    formatDate(
                      item.periodEnd,
                    )
                  }}
                </strong>

              </div>

            </td>

            <!-- TYPE -->

            <td>

              <span
                class="type-badge"
                :class="
                  typeClass(
                    item.adjustmentType,
                  )
                "
              >
                {{
                  item.adjustmentType
                }}
              </span>

            </td>

            <!-- AMOUNT -->

            <td>

              <div
                class="amount-cell"
                :class="
                  item.amount >= 0
                    ? 'positive'
                    : 'negative'
                "
              >

                <ArrowUpRight
                  v-if="
                    item.amount >= 0
                  "
                  :size="13"
                />

                <ArrowDownRight
                  v-else
                  :size="13"
                />

                <strong>

                  {{
                    item.amount >= 0
                      ? '+'
                      : '-'
                  }}

                  {{
                    money(
                      item.amount,
                    )
                  }}

                </strong>

              </div>

            </td>

            <!-- REASON -->

            <td>

              <div class="reason-cell">

                <strong>
                  {{
                    item.reason
                  }}
                </strong>

                <span
                  v-if="
                    item.remarks
                  "
                >
                  {{
                    item.remarks
                  }}
                </span>

              </div>

            </td>

            <!-- REQUESTED BY -->

            <td>

              <strong class="requested-by">
                {{
                  item.requestedBy
                }}
              </strong>

            </td>

            <!-- DATE -->

            <td>

              <span class="requested-date">
                {{
                  formatDateTime(
                    item.requestedAt,
                  )
                }}
              </span>

            </td>

            <!-- STATUS -->

            <td>

              <span
                class="status-badge"
                :class="
                  statusClass(
                    item.status,
                  )
                "
              >

                <span class="status-dot" />

                {{
                  item.status
                }}

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

      <ReceiptText
        :size="31"
      />

      <strong>
        No billing adjustments found
      </strong>

      <span>
        Try changing your adjustment filters.
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
    1px solid var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 9px;

  vertical-align: middle;
}

tbody tr:hover {
  background:
    var(--bg-card-soft);
}

/* ADJUSTMENT */

.adjustment-number {
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
}

/* BILLING */

.billing-cell {
  display: flex;

  min-width: 165px;

  align-items: center;

  gap: 5px;

  color:
    var(--text-secondary);
}

.billing-cell svg {
  color:
    var(--primary);
}

/* CLIENT */

.client-cell {
  display: flex;

  min-width: 215px;

  align-items: center;

  gap: 8px;
}

.client-icon {
  display: flex;

  width: 32px;
  height: 32px;

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
  min-width: 185px;
}

.period-cell strong {
  color:
    var(--text-primary);

  font-size: 9px;

  white-space: nowrap;
}

/* TYPE */

.type-badge {
  display: inline-flex;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 8px;
  font-weight: 650;

  white-space: nowrap;
}

.type-badge.add {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.type-badge.deduction {
  background:
    var(--red-soft);

  color:
    var(--red);
}

.type-badge.overtime {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.type-badge.rate {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.type-badge.correction {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.type-badge.manual {
  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);
}

/* AMOUNT */

.amount-cell {
  display: inline-flex;

  align-items: center;

  gap: 4px;

  white-space: nowrap;
}

.amount-cell.positive {
  color:
    var(--green);
}

.amount-cell.negative {
  color:
    var(--red);
}

.amount-cell strong {
  font-size: 10px;
}

/* REASON */

.reason-cell {
  min-width: 240px;

  max-width: 300px;
}

.reason-cell strong,
.reason-cell span {
  display: block;
}

.reason-cell strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

.reason-cell span {
  overflow: hidden;

  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;

  text-overflow: ellipsis;

  white-space: nowrap;
}

/* REQUEST */

.requested-by {
  color:
    var(--text-primary);

  white-space: nowrap;
}

.requested-date {
  white-space: nowrap;
}

/* STATUS */

.status-badge {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 8px;
  font-weight: 650;

  white-space: nowrap;
}

.status-dot {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background:
    currentColor;
}

.status-badge.pending {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.status-badge.review {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.status-badge.approved {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.status-badge.applied {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.status-badge.rejected {
  background:
    var(--red-soft);

  color:
    var(--red);
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