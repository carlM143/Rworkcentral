<script setup lang="ts">
import {
  CalendarDays,
  Clock3,
  ShieldCheck,
  UserRound,
} from 'lucide-vue-next'

import TimeLogApprovalActions from '~/components/approvals/time-logs/TimeLogApprovalActions.vue'

import type {
  TimeLogApproval,
  TimeLogApprovalStatus,
} from '~/types/timeLogApproval'

defineProps<{
  requests:
    TimeLogApproval[]
}>()

const emit = defineEmits<{
  view: [request: TimeLogApproval]
  approve: [request: TimeLogApproval]
  reject: [request: TimeLogApproval]
  review: [request: TimeLogApproval]
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
  value?: string,
) => {
  if (!value) {
    return 'Missing'
  }

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

const statusClass = (
  status:
    TimeLogApprovalStatus,
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

    <!-- HEADER -->

    <div class="table-heading">

      <div>

        <h3>
          Time Log Correction Approvals
        </h3>

        <p>
          Review original attendance logs,
          requested corrections and employee
          justification before updating the DTR.
        </p>

      </div>

    </div>

    <!-- TABLE -->

    <div
      v-if="
        requests.length
      "
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Request No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Attendance Date</th>
            <th>Correction Type</th>
            <th>Original Log</th>
            <th />
            <th>Requested Log</th>
            <th>Reason</th>
            <th>Supervisor</th>
            <th>Filed Date</th>
            <th>Status</th>
            <th>Reviewed By</th>
            <th>Remarks</th>
            <th class="actions-column">Actions</th>
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

            <!-- DATE -->

            <td>

              <div class="date-cell">

                <CalendarDays
                  :size="13"
                />

                {{
                  formatDate(
                    item.attendanceDate,
                  )
                }}

              </div>

            </td>

            <!-- TYPE -->

            <td>

              <span class="correction-badge">
                {{
                  item.correctionType
                }}
              </span>

            </td>

            <!-- ORIGINAL -->

            <td>

              <div class="time-log-card original">

                <div class="time-row">

                  <span>
                    IN
                  </span>

                  <strong
                    :class="{
                      missing:
                        !item.originalTimeIn,
                    }"
                  >
                    {{
                      formatTime(
                        item.originalTimeIn,
                      )
                    }}
                  </strong>

                </div>

                <div class="time-row">

                  <span>
                    OUT
                  </span>

                  <strong
                    :class="{
                      missing:
                        !item.originalTimeOut,
                    }"
                  >
                    {{
                      formatTime(
                        item.originalTimeOut,
                      )
                    }}
                  </strong>

                </div>

              </div>

            </td>

            <!-- ARROW -->

            <td>

              <div class="change-arrow">
                →
              </div>

            </td>

            <!-- REQUESTED -->

            <td>

              <div class="time-log-card requested">

                <div class="time-row">

                  <span>
                    IN
                  </span>

                  <strong>
                    {{
                      formatTime(
                        item.requestedTimeIn,
                      )
                    }}
                  </strong>

                </div>

                <div class="time-row">

                  <span>
                    OUT
                  </span>

                  <strong>
                    {{
                      formatTime(
                        item.requestedTimeOut,
                      )
                    }}
                  </strong>

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

            <!-- REVIEWER -->

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

            <td class="actions-column">

              <TimeLogApprovalActions
                :request="item"
                @view="emit('view', $event)"
                @approve="emit('approve', $event)"
                @reject="emit('reject', $event)"
                @review="emit('review', $event)"
              />

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

      <Clock3
        :size="34"
      />

      <strong>
        No time log correction requests found
      </strong>

      <span>
        Try changing your correction filters.
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

  min-width: 2400px;

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

/* CORRECTION */

.correction-badge {
  display: inline-flex;

  padding:
    5px 9px;

  border-radius: 20px;

  background:
    var(--purple-soft);

  color:
    var(--purple);

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

/* TIME LOG */

.time-log-card {
  min-width: 135px;

  padding:
    7px 8px;

  border:
    1px solid var(--border);

  border-radius: 7px;
}

.time-log-card.original {
  background:
    var(--bg-card-soft);
}

.time-log-card.requested {
  border-color:
    color-mix(
      in srgb,
      var(--primary)
      25%,
      var(--border)
    );

  background:
    var(--primary-soft);
}

.time-row {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 8px;
}

.time-row + .time-row {
  margin-top: 5px;
}

.time-row span {
  color:
    var(--text-muted);

  font-size: 8px;
  font-weight: 700;
}

.time-row strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.time-row strong.missing {
  color:
    var(--red);
}

.change-arrow {
  display: flex;

  width: 29px;
  height: 29px;

  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background:
    var(--primary-soft);

  color:
    var(--primary);

  font-size: 15px;
  font-weight: 700;
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

  min-width: 145px;

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
.actions-column { width: 72px; min-width: 72px; text-align: center; white-space: nowrap; position: static; }
</style>