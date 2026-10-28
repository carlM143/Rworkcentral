<script setup lang="ts">
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MoreHorizontal,
  Timer,
  UserRound,
  WalletCards,
} from 'lucide-vue-next'

import type {
  OvertimeHistory,
  OvertimeHistoryPayrollStatus,
  OvertimeHistoryStatus,
  OvertimeHistoryType,
} from '~/types/overtimeHistory'

defineProps<{
  records:
    OvertimeHistory[]
}>()

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
      hour: 'numeric',
      minute: '2-digit',
    },
  ).format(
    new Date(value),
  )
}

const formatTime = (
  value: string,
) => {
  const [
    hour,
    minute,
  ] =
    value
      .split(':')
      .map(Number)

  const date =
    new Date()

  date.setHours(
    hour ?? 0,
    minute ?? 0,
    0,
    0,
  )

  return new Intl.DateTimeFormat(
    'en-US',
    {
      hour: 'numeric',
      minute: '2-digit',
    },
  ).format(date)
}

const typeClass = (
  type:
    OvertimeHistoryType,
) => {
  if (
    type ===
    'Regular OT'
  ) {
    return 'regular'
  }

  if (
    type ===
    'Rest Day OT'
  ) {
    return 'rest-day'
  }

  return 'holiday'
}

const statusClass = (
  status:
    OvertimeHistoryStatus,
) => {
  if (
    status ===
    'Approved'
  ) {
    return 'approved'
  }

  if (
    status ===
    'Rejected'
  ) {
    return 'rejected'
  }

  return 'cancelled'
}

const payrollClass = (
  status:
    OvertimeHistoryPayrollStatus,
) => {
  if (
    status ===
    'Ready for Payroll'
  ) {
    return 'ready'
  }

  if (
    status ===
    'Included in Payroll'
  ) {
    return 'included'
  }

  if (
    status ===
    'Processed'
  ) {
    return 'processed'
  }

  return 'na'
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          Overtime History
        </h3>

        <p>
          Historical overtime requests,
          final approval results and payroll
          processing status.
        </p>

      </div>

    </div>

    <div
      v-if="
        records.length
      "
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>OT No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>OT Date</th>
            <th>Schedule</th>
            <th>OT Type</th>
            <th>Requested</th>
            <th>Approved</th>
            <th>Reason</th>
            <th>Request Status</th>
            <th>Payroll Period</th>
            <th>Payroll Status</th>
            <th>Reviewed By</th>
            <th>Reviewed Date</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="
              item in records
            "
            :key="
              item.id
            "
          >

            <td>

              <strong class="request-number">
                {{
                  item.requestNumber
                }}
              </strong>

            </td>

            <!-- EMPLOYEE -->

            <td>

              <div class="employee-cell">

                <div class="employee-icon">

                  <UserRound
                    :size="15"
                  />

                </div>

                <div>

                  <strong>
                    {{
                      item.employeeName
                    }}
                  </strong>

                  <span>
                    {{
                      item.employeeNumber
                    }}
                    ·
                    {{
                      item.position
                    }}
                  </span>

                </div>

              </div>

            </td>

            <!-- DEPARTMENT -->

            <td>

              <strong class="department">
                {{
                  item.department
                }}
              </strong>

            </td>

            <!-- DATE -->

            <td>

              <div class="date-cell">

                <CalendarDays
                  :size="13"
                />

                {{
                  formatDate(
                    item.overtimeDate,
                  )
                }}

              </div>

            </td>

            <!-- TIME -->

            <td>

              <div class="schedule-cell">

                <Clock3
                  :size="13"
                />

                {{
                  formatTime(
                    item.startTime,
                  )
                }}
                –
                {{
                  formatTime(
                    item.endTime,
                  )
                }}

              </div>

            </td>

            <!-- TYPE -->

            <td>

              <span
                class="type-badge"
                :class="
                  typeClass(
                    item.overtimeType,
                  )
                "
              >
                {{
                  item.overtimeType
                }}
              </span>

            </td>

            <!-- REQUESTED -->

            <td>

              <div class="hour-cell requested">

                <Timer
                  :size="13"
                />

                {{
                  item.requestedHours
                }}
                hrs

              </div>

            </td>

            <!-- APPROVED -->

            <td>

              <div
                v-if="
                  item.approvedHours >
                  0
                "
                class="hour-cell approved-hours"
              >

                <CheckCircle2
                  :size="13"
                />

                {{
                  item.approvedHours
                }}
                hrs

              </div>

              <span
                v-else
                class="empty-value"
              >
                —
              </span>

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

            <!-- PERIOD -->

            <td>

              <span class="payroll-period">
                {{
                  item.payrollPeriod ??
                  '—'
                }}
              </span>

            </td>

            <!-- PAYROLL -->

            <td>

              <span
                class="payroll-status"
                :class="
                  payrollClass(
                    item.payrollStatus,
                  )
                "
              >

                <WalletCards
                  :size="12"
                />

                {{
                  item.payrollStatus
                }}

              </span>

            </td>

            <!-- REVIEWER -->

            <td>

              <strong class="reviewed-by">
                {{
                  item.reviewedBy ??
                  '—'
                }}
              </strong>

            </td>

            <!-- REVIEWED DATE -->

            <td>

              <span class="reviewed-date">
                {{
                  formatDateTime(
                    item.reviewedAt,
                  )
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
                  :size="18"
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

      <Clock3
        :size="34"
      />

      <strong>
        No overtime history found
      </strong>

      <span>
        Try changing your overtime filters.
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

  font-size: 10px;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;

  min-width: 2350px;

  border-collapse: collapse;
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

  text-transform: uppercase;

  white-space: nowrap;
}

td {
  padding:
    13px;

  border-top:
    1px solid var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 10px;

  vertical-align: middle;
}

tbody tr:hover {
  background:
    var(--bg-card-soft);
}

.request-number {
  color:
    var(--primary);

  font-size: 10px;

  white-space: nowrap;
}

/* EMPLOYEE */

.employee-cell {
  display: flex;

  min-width: 230px;

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
.employee-cell span {
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

  font-size: 9px;
}

.department {
  color:
    var(--text-primary);

  white-space: nowrap;
}

/* DATE */

.date-cell,
.schedule-cell {
  display: flex;

  align-items: center;

  gap: 5px;

  white-space: nowrap;
}

.date-cell svg,
.schedule-cell svg {
  color:
    var(--text-muted);
}

/* TYPE */

.type-badge {
  display: inline-flex;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

.type-badge.regular {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.type-badge.rest-day {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.type-badge.holiday {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

/* HOURS */

.hour-cell {
  display: inline-flex;

  align-items: center;

  gap: 4px;

  white-space: nowrap;
}

.requested {
  color:
    var(--orange);
}

.approved-hours {
  color:
    var(--green);
}

.empty-value {
  color:
    var(--text-muted);
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

  font-size: 10px;
}

.reason-cell span {
  overflow: hidden;

  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9px;

  text-overflow: ellipsis;

  white-space: nowrap;
}

/* REQUEST STATUS */

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

.status-badge.approved {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.status-badge.rejected {
  background:
    var(--red-soft);

  color:
    var(--red);
}

.status-badge.cancelled {
  background:
    var(--bg-card-soft);

  color:
    var(--text-muted);
}

/* PAYROLL */

.payroll-period {
  white-space: nowrap;
}

.payroll-status {
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

.payroll-status.ready {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.payroll-status.included {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.payroll-status.processed {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.payroll-status.na {
  background:
    var(--bg-card-soft);

  color:
    var(--text-muted);
}

/* REVIEW */

.reviewed-by {
  color:
    var(--text-primary);

  white-space: nowrap;
}

.reviewed-date {
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

/* EMPTY */

.empty-state {
  display: flex;

  min-height: 260px;

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

  font-size: 12px;
}

.empty-state span {
  font-size: 10px;
}
</style>