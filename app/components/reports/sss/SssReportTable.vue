<script setup lang="ts">
import {
  CalendarDays,
  MoreHorizontal,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-vue-next'

import type {
  SssContributionStatus,
  SssReportRecord,
} from '~/types/sssReport'

defineProps<{
  records: SssReportRecord[]

  totals: {
    compensation: number
    contributionBasis: number
    employeeShare: number
    employerShare: number
    ecContribution: number
    totalContribution: number
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
    SssContributionStatus,
) => {
  if (
    status ===
    'Remitted'
  ) {
    return 'remitted'
  }

  if (
    status ===
    'Ready for Remittance'
  ) {
    return 'ready'
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

    <!-- HEADER -->

    <div class="table-heading">

      <div>

        <h3>
          SSS Contribution Summary
        </h3>

        <p>
          Employee and employer contribution breakdown
          with contribution basis and remittance information.
        </p>

      </div>

    </div>

    <!-- TABLE -->

    <div
      v-if="records.length"
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Reference</th>
            <th>Employee</th>
            <th>SSS Number</th>
            <th>Department</th>
            <th>Employment</th>

            <th>Compensation</th>
            <th>Contribution Basis</th>

            <th>Employee Share</th>
            <th>Employer Share</th>
            <th>EC</th>

            <th>Total Contribution</th>

            <th>Remittance Ref.</th>
            <th>Remittance Date</th>

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

            <!-- SSS -->

            <td>

              <strong class="sss-number">
                {{ item.sssNumber }}
              </strong>

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

            <!-- COMPENSATION -->

            <td>

              <span class="money-value">
                {{
                  money(
                    item.compensation,
                  )
                }}
              </span>

            </td>

            <!-- BASIS -->

            <td>

              <strong class="basis-value">
                {{
                  money(
                    item.contributionBasis,
                  )
                }}
              </strong>

            </td>

            <!-- EMPLOYEE SHARE -->

            <td>

              <span class="employee-share">
                {{
                  money(
                    item.employeeShare,
                  )
                }}
              </span>

            </td>

            <!-- EMPLOYER SHARE -->

            <td>

              <span class="employer-share">
                {{
                  money(
                    item.employerShare,
                  )
                }}
              </span>

            </td>

            <!-- EC -->

            <td>

              <span class="ec-value">
                {{
                  money(
                    item.ecContribution,
                  )
                }}
              </span>

            </td>

            <!-- TOTAL -->

            <td>

              <div class="total-contribution">

                <ShieldCheck
                  :size="13"
                />

                <div>

                  <span>
                    TOTAL
                  </span>

                  <strong>
                    {{
                      money(
                        item.totalContribution,
                      )
                    }}
                  </strong>

                </div>

              </div>

            </td>

            <!-- REMITTANCE REF -->

            <td>

              <strong
                v-if="item.remittanceReference"
                class="remittance-reference"
              >
                {{ item.remittanceReference }}
              </strong>

              <span
                v-else
                class="muted-text"
              >
                Not Generated
              </span>

            </td>

            <!-- REMITTANCE DATE -->

            <td>

              <div
                v-if="item.remittanceDate"
                class="date-cell"
              >

                <CalendarDays
                  :size="12"
                />

                {{
                  formatDate(
                    item.remittanceDate,
                  )
                }}

              </div>

              <span
                v-else
                class="muted-text"
              >
                —
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
                title="Contribution details will be added later"
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

            <td colspan="5">

              <div class="totals-label">

                <UsersRound
                  :size="14"
                />

                <strong>
                  SSS Report Totals
                </strong>

              </div>

            </td>

            <td>
              {{
                money(
                  totals.compensation,
                )
              }}
            </td>

            <td>
              {{
                money(
                  totals.contributionBasis,
                )
              }}
            </td>

            <td class="footer-employee">
              {{
                money(
                  totals.employeeShare,
                )
              }}
            </td>

            <td class="footer-employer">
              {{
                money(
                  totals.employerShare,
                )
              }}
            </td>

            <td>
              {{
                money(
                  totals.ecContribution,
                )
              }}
            </td>

            <td class="footer-total">
              {{
                money(
                  totals.totalContribution,
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

    <!-- EMPTY -->

    <div
      v-else
      class="empty-state"
    >

      <ShieldCheck
        :size="38"
      />

      <strong>
        No SSS records found
      </strong>

      <span>
        Try changing your contribution report filters.
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

  min-width: 2600px;

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

/* REFERENCE */

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

/* SSS NUMBER */

.sss-number {
  color:
    var(--text-primary);

  font-variant-numeric:
    tabular-nums;

  white-space:
    nowrap;
}

.department-name {
  color:
    var(--text-primary);

  white-space:
    nowrap;
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

  white-space:
    nowrap;
}

/* MONEY */

.money-value,
.basis-value,
.employee-share,
.employer-share,
.ec-value {
  font-variant-numeric:
    tabular-nums;

  white-space:
    nowrap;
}

.money-value {
  color:
    var(--text-primary);
}

.basis-value {
  color:
    var(--primary);
}

.employee-share {
  color:
    var(--purple);

  font-weight: 650;
}

.employer-share {
  color:
    var(--orange);

  font-weight: 650;
}

.ec-value {
  color:
    var(--text-secondary);
}

/* TOTAL */

.total-contribution {
  display: flex;

  min-width: 135px;

  align-items: center;

  gap: 7px;

  padding:
    7px 9px;

  border-radius: 8px;

  background:
    var(--green-soft);

  color:
    var(--green);
}

.total-contribution span,
.total-contribution strong {
  display: block;
}

.total-contribution span {
  font-size: 8px;
  font-weight: 700;

  letter-spacing:
    0.5px;
}

.total-contribution strong {
  margin-top: 2px;

  font-size: 11px;
}

/* REMITTANCE */

.remittance-reference {
  color:
    var(--primary);

  white-space:
    nowrap;
}

.date-cell {
  display: flex;

  align-items: center;

  gap: 5px;

  color:
    var(--green);

  white-space:
    nowrap;
}

.muted-text {
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

  border-radius: 20px;

  font-size: 9px;
  font-weight: 650;

  white-space:
    nowrap;
}

.status-dot {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background:
    currentColor;
}

.status-badge.remitted {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.status-badge.ready {
  background:
    var(--purple-soft);

  color:
    var(--purple);
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
  width: 210px;

  margin: 0;

  overflow: hidden;

  color:
    var(--text-secondary);

  font-size: 10px;

  text-overflow:
    ellipsis;

  white-space:
    nowrap;
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

.totals-label {
  display: flex;

  align-items: center;

  gap: 6px;

  color:
    var(--primary);
}

.footer-employee {
  color:
    var(--purple);
}

.footer-employer {
  color:
    var(--orange);
}

.footer-total {
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