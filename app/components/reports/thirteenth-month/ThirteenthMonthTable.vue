<script setup lang="ts">
import {
  CalendarDays,
  Gift,
  MoreHorizontal,
  UserRound,
  UsersRound,
} from 'lucide-vue-next'

import type {
  ThirteenthMonthRecord,
  ThirteenthMonthStatus,
} from '~/types/thirteenthMonthPay'

defineProps<{
  records:
    ThirteenthMonthRecord[]

  totals: {
    basicSalaryEarned: number
    adjustments: number
    eligibleBasicPay: number
    computedAmount: number
    previousRelease: number
    payableAmount: number
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
    ThirteenthMonthStatus,
) => {
  if (
    status ===
    'Released'
  ) {
    return 'released'
  }

  if (
    status ===
    'For Release'
  ) {
    return 'for-release'
  }

  if (
    status ===
    'Approved'
  ) {
    return 'approved'
  }

  if (
    status ===
    'For Review'
  ) {
    return 'review'
  }

  return 'draft'
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          13th Month Pay Computation
        </h3>

        <p>
          Review employee covered basic pay,
          adjustments, computed amounts and release status.
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
            <th>Reference</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Employment</th>
            <th>Employment Start</th>
            <th>Months Covered</th>
            <th>Basic Salary Earned</th>
            <th>Adjustments</th>
            <th>Eligible Basic Pay</th>
            <th>13th Month Amount</th>
            <th>Previous Release</th>
            <th>Payable Amount</th>
            <th>Approved By</th>
            <th>Release Date</th>
            <th>Status</th>
            <th>Remarks</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="item in records"
            :key="item.id"
          >

            <!-- REFERENCE -->

            <td>

              <strong class="reference-number">
                {{ item.referenceNumber }}
              </strong>

            </td>

            <!-- EMPLOYEE -->

            <td>

              <div class="employee-cell">

                <div class="employee-avatar">

                  <UserRound
                    :size="17"
                  />

                </div>

                <div>

                  <strong>
                    {{ item.employeeName }}
                  </strong>

                  <span>
                    {{ item.employeeNumber }}
                  </span>

                  <span>
                    {{ item.position }}
                  </span>

                </div>

              </div>

            </td>

            <!-- DEPARTMENT -->

            <td>

              <strong class="department-name">
                {{ item.department }}
              </strong>

            </td>

            <!-- EMPLOYMENT -->

            <td>

              <span class="employment-badge">
                {{ item.employmentType }}
              </span>

            </td>

            <!-- START -->

            <td>

              <div class="date-cell">

                <CalendarDays
                  :size="12"
                />

                {{
                  formatDate(
                    item.employmentStartDate,
                  )
                }}

              </div>

            </td>

            <!-- MONTHS -->

            <td>

              <div class="months-covered">

                <strong>
                  {{ item.monthsCovered }}
                </strong>

                <span>
                  months
                </span>

              </div>

            </td>

            <!-- BASIC -->

            <td class="money-value">
              {{
                money(
                  item.basicSalaryEarned,
                )
              }}
            </td>

            <!-- ADJUSTMENTS -->

            <td>

              <strong
                class="adjustment-value"
                :class="{
                  positive:
                    item.adjustments > 0,
                  negative:
                    item.adjustments < 0,
                }"
              >
                {{
                  money(
                    item.adjustments,
                  )
                }}
              </strong>

            </td>

            <!-- ELIGIBLE -->

            <td>

              <strong class="eligible-value">
                {{
                  money(
                    item.eligibleBasicPay,
                  )
                }}
              </strong>

            </td>

            <!-- COMPUTED -->

            <td>

              <div class="computed-value">

                <Gift
                  :size="13"
                />

                <strong>
                  {{
                    money(
                      item.computedAmount,
                    )
                  }}
                </strong>

              </div>

            </td>

            <!-- PREVIOUS -->

            <td>

              <span class="previous-release">
                {{
                  money(
                    item.previousRelease,
                  )
                }}
              </span>

            </td>

            <!-- PAYABLE -->

            <td>

              <div class="payable-value">

                <span>
                  PAYABLE
                </span>

                <strong>
                  {{
                    money(
                      item.payableAmount,
                    )
                  }}
                </strong>

              </div>

            </td>

            <!-- APPROVED BY -->

            <td>

              <strong
                v-if="item.approvedBy"
                class="approved-person"
              >
                {{ item.approvedBy }}
              </strong>

              <span
                v-else
                class="muted-text"
              >
                Pending
              </span>

            </td>

            <!-- RELEASE DATE -->

            <td>

              <div
                v-if="item.releaseDate"
                class="date-cell release-date"
              >

                <CalendarDays
                  :size="12"
                />

                {{
                  formatDate(
                    item.releaseDate,
                  )
                }}

              </div>

              <span
                v-else
                class="muted-text"
              >
                Not Scheduled
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

                {{ item.status }}

              </span>

            </td>

            <!-- REMARKS -->

            <td>

              <p
                class="remarks"
                :title="
                  item.remarks ||
                  'No remarks'
                "
              >
                {{
                  item.remarks ||
                  'No remarks'
                }}
              </p>

            </td>

            <!-- ACTION -->

            <td>

              <button
                type="button"
                class="action-button"
                title="13th month details will be added later"
              >

                <MoreHorizontal
                  :size="18"
                />

              </button>

            </td>

          </tr>

        </tbody>

        <!-- TOTALS -->

        <tfoot>

          <tr>

            <td colspan="6">

              <div class="total-label">

                <UsersRound
                  :size="14"
                />

                <strong>
                  13th Month Totals
                </strong>

              </div>

            </td>

            <td>
              {{
                money(
                  totals.basicSalaryEarned,
                )
              }}
            </td>

            <td>
              {{
                money(
                  totals.adjustments,
                )
              }}
            </td>

            <td>
              {{
                money(
                  totals.eligibleBasicPay,
                )
              }}
            </td>

            <td class="footer-computed">
              {{
                money(
                  totals.computedAmount,
                )
              }}
            </td>

            <td>
              {{
                money(
                  totals.previousRelease,
                )
              }}
            </td>

            <td class="footer-payable">
              {{
                money(
                  totals.payableAmount,
                )
              }}
            </td>

            <td colspan="5">
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

      <Gift
        :size="38"
      />

      <strong>
        No 13th month records found
      </strong>

      <span>
        Try changing your report filters.
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

  min-width: 2700px;

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

  white-space: nowrap;
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

.reference-number {
  color:
    var(--primary);

  white-space: nowrap;
}

/* EMPLOYEE */

.employee-cell {
  display: flex;

  min-width: 210px;

  align-items: center;

  gap: 9px;
}

.employee-avatar {
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

.employee-cell strong,
.employee-cell span {
  display: block;
}

.employee-cell strong {
  color:
    var(--text-primary);

  font-size: 11px;
}

.employee-cell span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 9.5px;
}

.department-name {
  color:
    var(--text-primary);

  white-space: nowrap;
}

/* EMPLOYMENT */

.employment-badge {
  display: inline-flex;

  padding:
    5px 8px;

  border-radius: 20px;

  background:
    var(--primary-soft);

  color:
    var(--primary);

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

/* DATE */

.date-cell {
  display: flex;

  align-items: center;

  gap: 5px;

  white-space: nowrap;
}

.date-cell svg {
  color:
    var(--text-muted);
}

.release-date svg {
  color:
    var(--green);
}

/* MONTHS */

.months-covered {
  display: flex;

  align-items: baseline;

  gap: 4px;

  white-space: nowrap;
}

.months-covered strong {
  color:
    var(--text-primary);

  font-size: 12px;
}

.months-covered span {
  color:
    var(--text-muted);

  font-size: 9px;
}

/* MONEY */

.money-value,
.eligible-value,
.previous-release {
  white-space: nowrap;

  font-variant-numeric:
    tabular-nums;
}

.money-value {
  color:
    var(--text-primary);
}

.eligible-value {
  color:
    var(--primary);
}

.adjustment-value {
  white-space: nowrap;
}

.adjustment-value.positive {
  color:
    var(--green);
}

.adjustment-value.negative {
  color:
    var(--red);
}

/* COMPUTED */

.computed-value {
  display: flex;

  min-width: 125px;

  align-items: center;

  gap: 5px;

  color:
    var(--orange);

  white-space: nowrap;
}

.computed-value strong {
  color:
    var(--text-primary);
}

/* PAYABLE */

.payable-value {
  min-width: 130px;

  padding:
    7px 9px;

  border-radius: 8px;

  background:
    var(--green-soft);
}

.payable-value span,
.payable-value strong {
  display: block;
}

.payable-value span {
  color:
    var(--green);

  font-size: 8px;
  font-weight: 700;

  letter-spacing:
    0.5px;
}

.payable-value strong {
  margin-top: 2px;

  color:
    var(--green);

  font-size: 11px;

  white-space: nowrap;
}

/* PEOPLE */

.approved-person {
  color:
    var(--green);

  white-space: nowrap;
}

.muted-text {
  color:
    var(--text-muted);

  font-size: 9.5px;

  font-style: italic;

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

  font-size: 9px;
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

.status-badge.released {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.status-badge.for-release {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.status-badge.approved {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.status-badge.review {
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

/* REMARKS */

.remarks {
  width: 220px;

  margin: 0;

  overflow: hidden;

  color:
    var(--text-secondary);

  text-overflow:
    ellipsis;

  white-space: nowrap;
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

  white-space: nowrap;
}

.total-label {
  display: flex;

  align-items: center;

  gap: 6px;

  color:
    var(--primary);
}

.footer-computed {
  color:
    var(--orange);
}

.footer-payable {
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