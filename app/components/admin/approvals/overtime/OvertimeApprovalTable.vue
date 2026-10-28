<script setup lang="ts">
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Timer,
  UserRound,
} from 'lucide-vue-next'

import type {
  OvertimeApproval,
  OvertimeApprovalStatus,
  OvertimeApprovalType,
} from '~/types/overtimeApproval'

defineProps<{
  requests:
    OvertimeApproval[]
}>()

const emit = defineEmits<{ action: [mode: string, request: OvertimeApproval] }>()

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
    OvertimeApprovalType,
) => {
  if (
    type === 'Regular OT'
  ) {
    return 'regular'
  }

  if (
    type === 'Rest Day OT'
  ) {
    return 'rest-day'
  }

  return 'holiday'
}

const statusClass = (
  status:
    OvertimeApprovalStatus,
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
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          Overtime Approval Requests
        </h3>

        <p>
          Review requested overtime hours,
          employee justification, schedules
          and approval status.
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
            <th>OT No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>OT Date</th>
            <th>OT Schedule</th>
            <th>OT Type</th>
            <th>Requested Hours</th>
            <th>Approved Hours</th>
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

            <!-- OT NO -->

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

            <!-- SCHEDULE -->

            <td>

              <div class="schedule-cell">

                <Clock3
                  :size="13"
                />

                <div>

                  <strong>
                    {{
                      formatTime(
                        item.startTime,
                      )
                    }}
                  </strong>

                  <span>
                    to
                    {{
                      formatTime(
                        item.endTime,
                      )
                    }}
                  </span>

                </div>

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

            <!-- REQUESTED HOURS -->

            <td>

              <div class="hour-cell requested">

                <Timer
                  :size="13"
                />

                <strong>
                  {{
                    item.requestedHours
                  }}
                  hrs
                </strong>

              </div>

            </td>

            <!-- APPROVED HOURS -->

            <td>

              <div
                v-if="
                  item.approvedHours !==
                  undefined
                "
                class="hour-cell approved-hours"
              >

                <CheckCircle2
                  :size="13"
                />

                <strong>
                  {{
                    item.approvedHours
                  }}
                  hrs
                </strong>

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

              <span class="filed-date">
                {{
                  formatDateTime(
                    item.filedAt,
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

            <!-- REVIEWED -->

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

              <ApprovalRowActions :request="item" @action="(mode, request) => emit('action', mode, request as OvertimeApproval)" />

            </td>

          </tr>

        </tbody>

      </table>

    </div>

    <div
      v-else
      class="empty-state"
    >

      <Timer
        :size="34"
      />

      <strong>
        No overtime approval requests found
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

/* SCHEDULE */

.schedule-cell {
  display: flex;

  min-width: 125px;

  align-items: flex-start;

  gap: 6px;
}

.schedule-cell svg {
  margin-top: 1px;

  color:
    var(--text-muted);
}

.schedule-cell strong,
.schedule-cell span {
  display: block;
}

.schedule-cell strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.schedule-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9px;
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

  gap: 5px;

  white-space: nowrap;
}

.hour-cell.requested {
  color:
    var(--orange);
}

.hour-cell.approved-hours {
  color:
    var(--green);
}

.empty-value {
  color:
    var(--text-muted);
}

/* REASON */

.reason {
  width: 245px;

  margin: 0;

  color:
    var(--text-secondary);

  font-size: 10px;

  line-height: 1.45;
}

/* SUPERVISOR */

.supervisor-cell {
  display: flex;

  min-width: 150px;

  align-items: center;

  gap: 5px;

  color:
    var(--text-primary);
}

.supervisor-cell svg {
  color:
    var(--primary);
}

/* FILE DATE */

.filed-date {
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
  min-width: 145px;
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
