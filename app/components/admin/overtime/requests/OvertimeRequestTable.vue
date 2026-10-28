<script setup lang="ts">
import {
  CheckCircle2,
  Clock3,
  Timer,
  UserRound,
} from 'lucide-vue-next'

import type {
  OvertimeRequest,
  OvertimeRequestStatus,
  OvertimeType,
} from '~/types/overtimeRequest'

defineProps<{
  requests:
    OvertimeRequest[]
  approvingId?: number | null
}>()

const emit = defineEmits<{
  approve: [request: OvertimeRequest]
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

const formatTime = (
  value: string,
) => {
  const [hour, minute] =
    value.split(':')
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
    OvertimeRequestStatus,
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

const typeClass = (
  type: OvertimeType,
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
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          Overtime Requests
        </h3>

        <p>
          Review employee overtime requests,
          requested hours and approval status.
        </p>

      </div>

    </div>

    <div
      v-if="requests.length"
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Request No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>OT Date</th>
            <th>Schedule</th>
            <th>Requested</th>
            <th>Approved</th>
            <th>OT Type</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Requested At</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="
              item in requests
            "
            :key="item.id"
          >

            <td>

              <strong class="request-number">
                {{
                  item.requestNumber
                }}
              </strong>

            </td>

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

            <td>

              <span class="department">
                {{
                  item.department
                }}
              </span>

            </td>

            <td>

              <strong class="ot-date">
                {{
                  formatDate(
                    item.overtimeDate,
                  )
                }}
              </strong>

            </td>

            <td>

              <div class="schedule-cell">

                <Clock3
                  :size="12"
                />

                <span>
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
                </span>

              </div>

            </td>

            <td>

              <div class="hour-cell">

                <Timer
                  :size="12"
                />

                <strong>
                  {{
                    item.requestedHours
                  }}
                  hrs
                </strong>

              </div>

            </td>

            <td>

              <strong
                v-if="
                  item.approvedHours !==
                  undefined
                "
                class="approved-hours"
              >
                {{
                  item.approvedHours
                }}
                hrs
              </strong>

              <span
                v-else
                class="empty-value"
              >
                —
              </span>

            </td>

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

            <td>

              <span class="requested-at">
                {{
                  formatDateTime(
                    item.requestedAt,
                  )
                }}
              </span>

            </td>

            <td>

              <button
                v-if="item.status === 'Pending' || item.status === 'For Review'"
                type="button"
                class="action-button"
                title="Approve overtime request"
                :disabled="approvingId === item.id"
                @click="emit('approve', item)"
              >

                <CheckCircle2
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

      <Timer
        :size="31"
      />

      <strong>
        No overtime requests found
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

  border-collapse: collapse;
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

  font-size: 9px;

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

.employee-cell {
  display: flex;

  min-width: 230px;

  align-items: center;

  gap: 8px;
}

.employee-icon {
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

.employee-cell strong,
.employee-cell span {
  display: block;
}

.employee-cell strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

.employee-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

.department {
  color:
    var(--text-primary);

  white-space: nowrap;
}

.ot-date {
  color:
    var(--text-primary);

  white-space: nowrap;
}

.schedule-cell {
  display: flex;

  min-width: 145px;

  align-items: center;

  gap: 5px;
}

.schedule-cell svg {
  color:
    var(--text-muted);
}

.hour-cell {
  display: flex;

  align-items: center;

  gap: 4px;

  color:
    var(--orange);

  white-space: nowrap;
}

.approved-hours {
  color:
    var(--green);

  white-space: nowrap;
}

.empty-value {
  color:
    var(--text-muted);
}

.type-badge {
  display: inline-flex;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 8px;
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

.reason-cell {
  min-width: 230px;
  max-width: 280px;
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

.status-badge.approved {
  background:
    var(--green-soft);

  color:
    var(--green);
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

.requested-at {
  white-space: nowrap;
}

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
}

.action-button:hover {
  border-color:
    var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--primary);
}

.action-button:disabled {
  cursor: wait;
  opacity: 0.55;
}

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
