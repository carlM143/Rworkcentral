<script setup lang="ts">
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  MoreHorizontal,
  UsersRound,
} from 'lucide-vue-next'

import type {
  BillingRecord,
} from '~/types/billingRecord'

defineProps<{
  records:
    BillingRecord[]
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
</script>

<template>
  <article class="table-card">

    <!-- HEADER -->

    <div class="table-heading">

      <div>

        <h3>
          Billing Records
        </h3>

        <p>
          Review client billing computations,
          work hours, adjustments and current billing status.
        </p>

      </div>

    </div>

    <!-- TABLE -->

    <div
      v-if="
        records.length
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
            <th>Regular Hours</th>
            <th>OT Hours</th>
            <th>Regular Amount</th>
            <th>OT Amount</th>
            <th>Adjustments</th>
            <th>Total Billing</th>
            <th>Status</th>
            <th>Prepared</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="
              record in records
            "
            :key="
              record.id
            "
          >

            <!-- BILLING NO -->

            <td>

              <strong class="billing-number">
                {{
                  record.billingNumber
                }}
              </strong>

              <span class="subtext">
                {{
                  record.batchCode
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
                      record.clientName
                    }}
                  </strong>

                  <span>
                    {{
                      record.clientCode
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
                      record.periodStart,
                    )
                  }}
                  →
                  {{
                    formatDate(
                      record.periodEnd,
                    )
                  }}
                </strong>

                <span>
                  Billing:
                  {{
                    formatDate(
                      record.billingDate,
                    )
                  }}
                </span>

              </div>

            </td>

            <!-- EMPLOYEES -->

            <td>

              <div class="employee-count">

                <UsersRound
                  :size="13"
                />

                <strong>
                  {{
                    record.employeeCount
                  }}
                </strong>

              </div>

            </td>

            <!-- REGULAR HOURS -->

            <td>

              <strong class="hours">
                {{
                  record.regularHours
                }}
              </strong>

            </td>

            <!-- OT HOURS -->

            <td>

              <strong class="ot-hours">
                {{
                  record.overtimeHours
                }}
              </strong>

            </td>

            <!-- REGULAR AMOUNT -->

            <td>

              <span class="money-normal">
                {{
                  money(
                    record.regularAmount,
                  )
                }}
              </span>

            </td>

            <!-- OT AMOUNT -->

            <td>

              <span class="money-purple">
                {{
                  money(
                    record.overtimeAmount,
                  )
                }}
              </span>

            </td>

            <!-- ADJUSTMENTS -->

            <td>

              <span
                class="adjustment"
                :class="{
                  negative:
                    record.adjustments <
                    0,
                  positive:
                    record.adjustments >
                    0,
                }"
              >
                {{
                  money(
                    record.adjustments,
                  )
                }}
              </span>

            </td>

            <!-- TOTAL -->

            <td>

              <strong class="total-billing">
                {{
                  money(
                    record.totalBilling,
                  )
                }}
              </strong>

            </td>

            <!-- STATUS -->

            <td>

              <div class="status-cell">

                <StatusBadge
                  :status="
                    record.status
                  "
                />

                <span
                  v-if="
                    record.issueCount >
                    0
                  "
                  class="issue-badge"
                  :title="
                    `${record.issueCount} billing issue(s)`
                  "
                >

                  <AlertTriangle
                    :size="11"
                  />

                  {{
                    record.issueCount
                  }}

                </span>

              </div>

            </td>

            <!-- PREPARED -->

            <td>

              <div class="prepared-cell">

                <strong>
                  {{
                    formatDateTime(
                      record.preparedAt,
                    )
                  }}
                </strong>

                <span>
                  by
                  {{
                    record.preparedBy
                  }}
                </span>

              </div>

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

    <!-- EMPTY -->

    <div
      v-else
      class="empty-state"
    >

      <CalendarDays
        :size="31"
      />

      <strong>
        No billing records found
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

  min-width: 2000px;

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

/* BILLING NO */

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
  min-width: 210px;
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

/* EMPLOYEES */

.employee-count {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  color:
    var(--primary);
}

.employee-count strong {
  font-size: 10px;
}

/* HOURS */

.hours {
  color:
    var(--text-primary);
}

.ot-hours {
  color:
    var(--orange);
}

/* MONEY */

.money-normal {
  color:
    var(--text-primary);

  white-space: nowrap;
}

.money-purple {
  color:
    var(--purple);

  white-space: nowrap;
}

.adjustment {
  color:
    var(--text-secondary);

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

/* PREPARED */

.prepared-cell {
  min-width: 150px;
}

.prepared-cell strong,
.prepared-cell span {
  display: block;
}

.prepared-cell strong {
  color:
    var(--text-primary);

  font-size: 8px;

  white-space: nowrap;
}

.prepared-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
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