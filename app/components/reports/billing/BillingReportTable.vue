<script setup lang="ts">
import {
  Building2,
  CalendarDays,
  MoreHorizontal,
  ReceiptText,
  UsersRound,
} from 'lucide-vue-next'

import type {
  BillingReportRecord,
  BillingReportStatus,
} from '~/types/billingReport'

defineProps<{
  records:
    BillingReportRecord[]

  totals: {
    employeesBilled: number
    baseAmount: number
    overtimeAmount: number
    holidayAmount: number
    allowances: number
    addOns: number
    adjustments: number
    grossBilling: number
    deductions: number
    credits: number
    netBilling: number
  }
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
      maximumFractionDigits: 2,
    },
  ).format(value)
}

const formatDate = (
  value?: string,
) => {
  if (!value) {
    return '—'
  }

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

const statusClass = (
  status:
    BillingReportStatus,
) => {
  if (
    status ===
    'Paid'
  ) {
    return 'paid'
  }

  if (
    status ===
    'Completed'
  ) {
    return 'completed'
  }

  if (
    status ===
    'For Review'
  ) {
    return 'review'
  }

  if (
    status ===
    'Pending'
  ) {
    return 'pending'
  }

  return 'draft'
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          Client Billing Summary
        </h3>

        <p>
          Review client billing amounts,
          adjustments, deductions, invoices and net billing.
        </p>

      </div>

    </div>

    <div
      v-if="records.length"
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Billing No.</th>
            <th>Client</th>
            <th>Employees</th>

            <th>Base Amount</th>
            <th>OT Amount</th>
            <th>Holiday</th>
            <th>Allowances</th>
            <th>Add-ons</th>
            <th>Adjustments</th>

            <th>Gross Billing</th>

            <th>Deductions</th>
            <th>Credits</th>

            <th>Net Billing</th>

            <th>Invoice No.</th>
            <th>Invoice Date</th>
            <th>Due Date</th>
            <th>Paid Date</th>

            <th>Status</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="item in records"
            :key="item.id"
          >

            <td>

              <strong class="billing-number">
                {{ item.billingNumber }}
              </strong>

            </td>

            <td>

              <div class="client-cell">

                <div class="client-icon">

                  <Building2
                    :size="17"
                  />

                </div>

                <div>

                  <strong>
                    {{ item.clientName }}
                  </strong>

                  <span>
                    {{ item.clientCode }}
                  </span>

                </div>

              </div>

            </td>

            <td>

              <div class="employees-cell">

                <UsersRound
                  :size="13"
                />

                <strong>
                  {{ item.employeesBilled }}
                </strong>

              </div>

            </td>

            <td class="money-cell">
              {{ money(item.baseAmount) }}
            </td>

            <td class="money-cell earnings">
              {{ money(item.overtimeAmount) }}
            </td>

            <td class="money-cell earnings">
              {{ money(item.holidayAmount) }}
            </td>

            <td class="money-cell earnings">
              {{ money(item.allowances) }}
            </td>

            <td class="money-cell earnings">
              {{ money(item.addOns) }}
            </td>

            <td>

              <span
                class="adjustment-value"
                :class="{
                  negative:
                    item.adjustments < 0,
                  positive:
                    item.adjustments > 0,
                }"
              >
                {{ money(item.adjustments) }}
              </span>

            </td>

            <td>

              <div class="gross-billing">

                <ReceiptText
                  :size="13"
                />

                <strong>
                  {{ money(item.grossBilling) }}
                </strong>

              </div>

            </td>

            <td class="deduction-cell">
              {{ money(item.deductions) }}
            </td>

            <td class="credit-cell">
              {{ money(item.credits) }}
            </td>

            <td>

              <div class="net-billing">

                <span>
                  NET BILLING
                </span>

                <strong>
                  {{ money(item.netBilling) }}
                </strong>

              </div>

            </td>

            <td>

              <strong
                v-if="item.invoiceNumber"
                class="invoice-number"
              >
                {{ item.invoiceNumber }}
              </strong>

              <span
                v-else
                class="pending-text"
              >
                Not Generated
              </span>

            </td>

            <td>

              <div class="date-cell">

                <CalendarDays
                  :size="12"
                />

                {{
                  formatDate(
                    item.invoiceDate,
                  )
                }}

              </div>

            </td>

            <td>

              <strong class="date-value">
                {{
                  formatDate(
                    item.dueDate,
                  )
                }}
              </strong>

            </td>

            <td>

              <strong
                v-if="item.paidDate"
                class="paid-date"
              >
                {{
                  formatDate(
                    item.paidDate,
                  )
                }}
              </strong>

              <span
                v-else
                class="pending-text"
              >
                —
              </span>

            </td>

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

                {{ item.status }}

              </span>

            </td>

            <td>

              <button
                type="button"
                class="action-button"
                title="Billing report details will be added later"
              >

                <MoreHorizontal
                  :size="18"
                />

              </button>

            </td>

          </tr>

        </tbody>

        <tfoot>

          <tr>

            <td colspan="2">

              <strong class="totals-title">
                Report Totals
              </strong>

            </td>

            <td>
              {{ totals.employeesBilled }}
            </td>

            <td>
              {{ money(totals.baseAmount) }}
            </td>

            <td>
              {{ money(totals.overtimeAmount) }}
            </td>

            <td>
              {{ money(totals.holidayAmount) }}
            </td>

            <td>
              {{ money(totals.allowances) }}
            </td>

            <td>
              {{ money(totals.addOns) }}
            </td>

            <td>
              {{ money(totals.adjustments) }}
            </td>

            <td class="footer-gross">
              {{ money(totals.grossBilling) }}
            </td>

            <td class="footer-deduction">
              {{ money(totals.deductions) }}
            </td>

            <td>
              {{ money(totals.credits) }}
            </td>

            <td class="footer-net">
              {{ money(totals.netBilling) }}
            </td>

            <td colspan="6">
              —
            </td>

          </tr>

        </tfoot>

      </table>

    </div>

    <div
      v-else
      class="empty-state"
    >

      <ReceiptText
        :size="38"
      />

      <strong>
        No billing records found
      </strong>

      <span>
        Try changing your billing report filters.
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
    16px 17px;

  border-bottom:
    1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 15px;
}

.table-heading p {
  margin:
    5px 0 0;

  color:
    var(--text-muted);

  font-size: 11px;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;

  min-width: 3000px;

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

  font-size: 10px;
  font-weight: 700;

  text-align: left;

  text-transform:
    uppercase;

  white-space:
    nowrap;
}

td {
  padding:
    13px;

  border-top:
    1px solid var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 10.5px;

  vertical-align:
    middle;
}

tbody tr:hover {
  background:
    var(--bg-card-soft);
}

.billing-number {
  color:
    var(--primary);

  white-space:
    nowrap;
}

/* CLIENT */

.client-cell {
  display: flex;

  min-width: 220px;

  align-items: center;

  gap: 9px;
}

.client-icon {
  display: flex;

  width: 37px;
  height: 37px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

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

  font-size: 11px;
}

.client-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9px;
}

.employees-cell {
  display: flex;

  align-items: center;

  gap: 5px;

  color:
    var(--primary);
}

.employees-cell strong {
  color:
    var(--text-primary);
}

/* MONEY */

.money-cell,
.deduction-cell,
.credit-cell {
  font-variant-numeric:
    tabular-nums;

  white-space:
    nowrap;
}

.money-cell {
  color:
    var(--text-primary);
}

.money-cell.earnings {
  color:
    var(--green);
}

.deduction-cell {
  color:
    var(--red);
}

.credit-cell {
  color:
    var(--purple);
}

.adjustment-value {
  color:
    var(--text-secondary);

  white-space:
    nowrap;
}

.adjustment-value.positive {
  color:
    var(--green);
}

.adjustment-value.negative {
  color:
    var(--red);
}

/* GROSS */

.gross-billing {
  display: flex;

  min-width: 125px;

  align-items: center;

  gap: 5px;

  color:
    var(--green);

  white-space:
    nowrap;
}

.gross-billing strong {
  color:
    var(--text-primary);
}

/* NET */

.net-billing {
  min-width: 135px;

  padding:
    7px 9px;

  border-radius: 8px;

  background:
    var(--green-soft);
}

.net-billing span,
.net-billing strong {
  display: block;
}

.net-billing span {
  color:
    var(--green);

  font-size: 8px;
  font-weight: 700;

  letter-spacing:
    0.5px;
}

.net-billing strong {
  margin-top: 3px;

  color:
    var(--green);

  font-size: 11px;
}

/* INVOICE */

.invoice-number {
  color:
    var(--primary);

  white-space:
    nowrap;
}

.date-cell {
  display: flex;

  align-items: center;

  gap: 5px;

  white-space:
    nowrap;
}

.date-cell svg {
  color:
    var(--text-muted);
}

.date-value {
  color:
    var(--text-primary);

  white-space:
    nowrap;
}

.paid-date {
  color:
    var(--green);

  white-space:
    nowrap;
}

.pending-text {
  color:
    var(--text-muted);

  font-size: 9.5px;

  font-style:
    italic;

  white-space:
    nowrap;
}

/* STATUS */

.status-badge {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  padding:
    5px 8px;

  border-radius:
    20px;

  font-size: 9px;
  font-weight: 650;

  white-space:
    nowrap;
}

.status-dot {
  width: 5px;
  height: 5px;

  border-radius:
    50%;

  background:
    currentColor;
}

.status-badge.paid {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.status-badge.completed {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.status-badge.review {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.status-badge.pending {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.status-badge.draft {
  background:
    var(--bg-card-soft);

  color:
    var(--text-muted);
}

/* ACTION */

.action-button {
  display: flex;

  width: 32px;
  height: 32px;

  align-items: center;
  justify-content: center;

  border:
    1px solid transparent;

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);
}

.action-button:hover {
  border-color:
    var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--primary);
}

/* TOTALS */

tfoot td {
  border-top:
    1px solid var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);

  font-size: 10px;
  font-weight: 700;

  white-space:
    nowrap;
}

.totals-title {
  color:
    var(--primary);
}

.footer-gross {
  color:
    var(--green);
}

.footer-deduction {
  color:
    var(--red);
}

.footer-net {
  color:
    var(--green);

  font-size: 11px;
}

/* EMPTY */

.empty-state {
  display: flex;

  min-height: 280px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 8px;

  color:
    var(--text-muted);
}

.empty-state strong {
  color:
    var(--text-primary);

  font-size: 13px;
}

.empty-state span {
  font-size: 11px;
}
</style>