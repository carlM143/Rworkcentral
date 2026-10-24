<script setup lang="ts">
import {
  CalendarDays,
  Clock3,
  MoreHorizontal,
  ShieldCheck,
  UserRound,
  WalletCards,
} from 'lucide-vue-next'

import type {
  LeaveApproval,
  LeaveApprovalStatus,
} from '~/types/leaveApproval'

defineProps<{
  requests:
    LeaveApproval[]
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

const statusClass = (
  status:
    LeaveApprovalStatus,
) => {
  if (
    status === 'Approved'
  ) {
    return 'approved'
  }

  if (
    status === 'Pending'
  ) {
    return 'pending'
  }

  if (
    status === 'For Review'
  ) {
    return 'review'
  }

  if (
    status === 'Rejected'
  ) {
    return 'rejected'
  }

  return 'cancelled'
}

const balanceClass = (
  balance: number,
  requestedDays: number,
) => {
  if (
    balance <= 0 ||
    balance < requestedDays
  ) {
    return 'insufficient'
  }

  if (
    balance <= 3
  ) {
    return 'low'
  }

  return 'healthy'
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          Leave Approval Requests
        </h3>

        <p>
          Review leave requests, available credits,
          employee reasons and approval status.
        </p>

      </div>

    </div>

    <div
      v-if="
        requests.length
      "
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Leave No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Leave Type</th>
            <th>Leave Period</th>
            <th>Days</th>
            <th>Available Balance</th>
            <th>Reason</th>
            <th>Supervisor</th>
            <th>Filed Date</th>
            <th>Status</th>
            <th>Reviewed By</th>
            <th>Remarks</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="
              item in requests
            "
            :key="
              item.id
            "
          >

            <!-- NUMBER -->

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
                    :size="16"
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

            <!-- LEAVE TYPE -->

            <td>

              <span class="leave-type-badge">
                {{
                  item.leaveType
                }}
              </span>

            </td>

            <!-- DATES -->

            <td>

              <div class="leave-period">

                <CalendarDays
                  :size="13"
                />

                <div>

                  <strong>
                    {{
                      formatDate(
                        item.startDate,
                      )
                    }}
                  </strong>

                  <span
                    v-if="
                      item.startDate !==
                      item.endDate
                    "
                  >
                    to
                    {{
                      formatDate(
                        item.endDate,
                      )
                    }}
                  </span>

                </div>

              </div>

            </td>

            <!-- DAYS -->

            <td>

              <strong class="day-count">
                {{
                  item.totalDays
                }}
                {{
                  item.totalDays === 1
                    ? 'day'
                    : 'days'
                }}
              </strong>

            </td>

            <!-- BALANCE -->

            <td>

              <div
                class="balance-cell"
                :class="
                  balanceClass(
                    item.availableBalance,
                    item.totalDays,
                  )
                "
              >

                <WalletCards
                  :size="13"
                />

                <div>

                  <strong>
                    {{
                      item.availableBalance
                    }}
                    days
                  </strong>

                  <span>
                    available
                  </span>

                </div>

              </div>

            </td>

            <!-- REASON -->

            <td>

              <p class="reason">
                {{
                  item.reason
                }}
              </p>

            </td>

            <!-- SUPERVISOR -->

            <td>

              <div class="supervisor-cell">

                <ShieldCheck
                  :size="13"
                />

                {{
                  item.immediateSupervisor
                }}

              </div>

            </td>

            <!-- FILED -->

            <td>

              <div class="filed-cell">

                <Clock3
                  :size="13"
                />

                {{
                  formatDateTime(
                    item.filedAt,
                  )
                }}

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

            <!-- REVIEW -->

            <td>

              <div class="review-cell">

                <strong>
                  {{
                    item.reviewedBy ??
                    '—'
                  }}
                </strong>

                <span
                  v-if="
                    item.reviewedAt
                  "
                >
                  {{
                    formatDateTime(
                      item.reviewedAt,
                    )
                  }}
                </span>

              </div>

            </td>

            <!-- REMARKS -->

            <td>

              <p class="remarks">
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
                title="Approval actions will be added later"
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

      <ShieldCheck
        :size="34"
      />

      <strong>
        No leave approval requests found
      </strong>

      <span>
        Try changing your leave approval filters.
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

  min-width: 2250px;

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

  white-space: nowrap;
}

/* EMPLOYEE */

.employee-cell {
  display: flex;

  min-width: 225px;

  align-items: center;

  gap: 9px;
}

.employee-icon {
  display: flex;

  width: 35px;
  height: 35px;

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

/* TYPE */

.leave-type-badge {
  display: inline-flex;

  padding:
    5px 9px;

  border-radius: 20px;

  background:
    var(--primary-soft);

  color:
    var(--primary);

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

/* PERIOD */

.leave-period {
  display: flex;

  min-width: 150px;

  align-items: flex-start;

  gap: 6px;
}

.leave-period svg {
  margin-top: 1px;

  color:
    var(--text-muted);
}

.leave-period strong,
.leave-period span {
  display: block;
}

.leave-period strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.leave-period span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9px;
}

.day-count {
  color:
    var(--text-primary);

  white-space: nowrap;
}

/* BALANCE */

.balance-cell {
  display: flex;

  min-width: 115px;

  align-items: center;

  gap: 6px;
}

.balance-cell strong,
.balance-cell span {
  display: block;
}

.balance-cell strong {
  font-size: 10px;
}

.balance-cell span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 9px;
}

.balance-cell.healthy {
  color:
    var(--green);
}

.balance-cell.low {
  color:
    var(--orange);
}

.balance-cell.insufficient {
  color:
    var(--red);
}

/* REASON */

.reason {
  width: 240px;

  margin: 0;

  color:
    var(--text-secondary);

  font-size: 10px;

  line-height: 1.45;
}

/* SUPERVISOR */

.supervisor-cell {
  display: flex;

  min-width: 140px;

  align-items: center;

  gap: 5px;

  color:
    var(--text-primary);
}

.supervisor-cell svg {
  color:
    var(--primary);
}

/* FILED */

.filed-cell {
  display: flex;

  min-width: 165px;

  align-items: center;

  gap: 5px;

  white-space: nowrap;
}

.filed-cell svg {
  color:
    var(--text-muted);
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

/* REVIEW */

.review-cell {
  min-width: 135px;
}

.review-cell strong,
.review-cell span {
  display: block;
}

.review-cell strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.review-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9px;
}

/* REMARKS */

.remarks {
  width: 190px;

  margin: 0;

  overflow: hidden;

  color:
    var(--text-secondary);

  font-size: 10px;

  text-overflow: ellipsis;

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