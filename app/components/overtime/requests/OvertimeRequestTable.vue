<script setup lang="ts">
import {
  Clock3,
  TimerReset,
} from 'lucide-vue-next'

import OvertimeRowActions from '~/components/timekeeping/overtime-requests/OvertimeRowActions.vue'

import type {
  OvertimeActionRequest,
} from '~/types/overtimeActions'

const props =
  defineProps<{
    requests: any[]
  }>()

const emit =
  defineEmits<{
    view: [
      request:
        OvertimeActionRequest,
    ]

    review: [
      request:
        OvertimeActionRequest,
    ]

    history: [
      request:
        OvertimeActionRequest,
    ]

    cancel: [
      request:
        OvertimeActionRequest,
    ]
  }>()

/* =========================================================
   NORMALIZER
========================================================= */

const normalizeRequest = (
  row: any,
): OvertimeActionRequest => {
  return {
    id:
      row.id ??
      row.requestId ??
      row.request_id ??
      row.requestNumber,

    requestNo:
      row.requestNumber ??
      row.requestNo ??
      row.request_no ??
      'OT Request',

    employeeName:
      row.employeeName ??
      row.employee_name ??
      row.employee?.name ??
      'Unknown Employee',

    employeeNo:
      row.employeeNumber ??
      row.employeeNo ??
      row.employee_number ??
      row.employee?.employeeNumber,

    department:
      row.department ??
      row.departmentName ??
      row.department_name ??
      '—',

    position:
      row.position ??
      row.positionName ??
      row.position_name ??
      '',

    otDate:
      row.otDate ??
      row.ot_date ??
      row.date ??
      '',

    schedule:
      row.schedule ??
      row.workSchedule ??
      row.work_schedule ??
      '',

    otStart:
      row.otStart ??
      row.ot_start ??
      row.startTime ??
      row.start_time ??
      '',

    otEnd:
      row.otEnd ??
      row.ot_end ??
      row.endTime ??
      row.end_time ??
      '',

    requestedHours:
      Number(
        row.requestedHours ??
        row.requested_hours ??
        row.hours ??
        0,
      ),

    approvedHours:
      row.approvedHours ??
      row.approved_hours ??
      null,

    otType:
      row.overtimeType ??
      row.otType ??
      row.overtime_type ??
      row.ot_type ??
      'Regular OT',

    reason:
      row.reason ??
      'No reason provided.',

    status:
      row.status ??
      'Pending',

    requestedAt:
      row.requestedAt ??
      row.requested_at ??
      row.createdAt ??
      row.created_at,

    reviewedBy:
      row.reviewedBy ??
      row.reviewed_by ??
      row.approvedBy ??
      row.approved_by,

    reviewedAt:
      row.reviewedAt ??
      row.reviewed_at ??
      row.approvedAt ??
      row.approved_at,

    remarks:
      row.approvalRemarks ??
      row.approval_remarks ??
      row.reviewRemarks ??
      row.review_remarks,
  }
}

/* =========================================================
   HELPERS
========================================================= */

const requestNumber = (
  row: any,
) => {
  return (
    row.requestNumber ??
    row.requestNo ??
    row.request_no ??
    '—'
  )
}

const employeeName = (
  row: any,
) => {
  return (
    row.employeeName ??
    row.employee_name ??
    row.employee?.name ??
    '—'
  )
}

const employeeNumber = (
  row: any,
) => {
  return (
    row.employeeNumber ??
    row.employeeNo ??
    row.employee_number ??
    row.employee?.employeeNumber ??
    ''
  )
}

const department = (
  row: any,
) => {
  return (
    row.department ??
    row.departmentName ??
    row.department_name ??
    '—'
  )
}

const position = (
  row: any,
) => {
  return (
    row.position ??
    row.positionName ??
    row.position_name ??
    ''
  )
}

const otDate = (
  row: any,
) => {
  return (
    row.otDate ??
    row.ot_date ??
    row.date ??
    ''
  )
}

const schedule = (
  row: any,
) => {
  if (row.schedule) {
    return row.schedule
  }

  if (
    row.otStart &&
    row.otEnd
  ) {
    return (
      `${row.otStart} – ${row.otEnd}`
    )
  }

  if (
    row.ot_start &&
    row.ot_end
  ) {
    return (
      `${row.ot_start} – ${row.ot_end}`
    )
  }

  return '—'
}

const requestedHours = (
  row: any,
) => {
  return Number(
    row.requestedHours ??
    row.requested_hours ??
    row.hours ??
    0,
  )
}

const approvedHours = (
  row: any,
) => {
  return (
    row.approvedHours ??
    row.approved_hours ??
    null
  )
}

const overtimeType = (
  row: any,
) => {
  return (
    row.overtimeType ??
    row.otType ??
    row.overtime_type ??
    row.ot_type ??
    'Regular OT'
  )
}

const reason = (
  row: any,
) => {
  return (
    row.reason ??
    'No reason provided.'
  )
}

const status = (
  row: any,
) => {
  return (
    row.status ??
    'Pending'
  )
}

const requestedAt = (
  row: any,
) => {
  return (
    row.requestedAt ??
    row.requested_at ??
    row.createdAt ??
    row.created_at ??
    ''
  )
}

/* =========================================================
   FORMATTING
========================================================= */

const formatDate = (
  value: string,
) => {
  if (!value) {
    return '—'
  }

  const date =
    new Date(
      `${value}T00:00:00`,
    )

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  ).format(date)
}

const formatDateTime = (
  value: string,
) => {
  if (!value) {
    return '—'
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value
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
  ).format(date)
}

const typeClass = (
  value: string,
) => {
  const lowered =
    value.toLowerCase()

  if (
    lowered.includes(
      'rest',
    )
  ) {
    return 'purple'
  }

  if (
    lowered.includes(
      'holiday',
    )
  ) {
    return 'green'
  }

  return 'blue'
}

/* =========================================================
   EVENTS
========================================================= */

const handleView = (
  row: any,
) => {
  emit(
    'view',
    normalizeRequest(row),
  )
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
          Review employee overtime requests, requested hours and approval status.
        </p>

      </div>

    </div>

    <div class="table-scroll">

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
            v-for="row in requests"
            :key="
              row.id ??
              row.requestNumber
            "
          >

            <!-- REQUEST -->

            <td>

              <button
                type="button"
                class="request-link"
                @click="
                  handleView(row)
                "
              >
                {{ requestNumber(row) }}
              </button>

            </td>

            <!-- EMPLOYEE -->

            <td>

              <div class="employee-cell">

                <div class="employee-avatar">

                  {{
                    employeeName(row)
                      .charAt(0)
                  }}

                </div>

                <div>

                  <strong>
                    {{ employeeName(row) }}
                  </strong>

                  <span>
                    {{ employeeNumber(row) }}

                    <template
                      v-if="
                        position(row)
                      "
                    >
                      · {{ position(row) }}
                    </template>
                  </span>

                </div>

              </div>

            </td>

            <!-- DEPARTMENT -->

            <td>
              {{ department(row) }}
            </td>

            <!-- OT DATE -->

            <td>

              <strong class="date-text">
                {{
                  formatDate(
                    otDate(row),
                  )
                }}
              </strong>

            </td>

            <!-- SCHEDULE -->

            <td>

              <span class="schedule-text">

                <Clock3
                  :size="11"
                />

                {{ schedule(row) }}

              </span>

            </td>

            <!-- REQUESTED -->

            <td>

              <strong class="requested">

                <TimerReset
                  :size="11"
                />

                {{ requestedHours(row) }}
                hrs

              </strong>

            </td>

            <!-- APPROVED -->

            <td>

              <strong
                v-if="
                  approvedHours(row) !==
                  null &&
                  approvedHours(row) !==
                  undefined
                "
                class="approved"
              >
                {{ approvedHours(row) }}
                hrs
              </strong>

              <span
                v-else
                class="muted"
              >
                —
              </span>

            </td>

            <!-- TYPE -->

            <td>

              <span
                class="type-badge"
                :class="
                  typeClass(
                    overtimeType(row),
                  )
                "
              >
                {{ overtimeType(row) }}
              </span>

            </td>

            <!-- REASON -->

            <td>

              <p
                class="reason"
                :title="reason(row)"
              >
                {{ reason(row) }}
              </p>

            </td>

            <!-- STATUS -->

            <td>

              <StatusBadge
                :status="
                  status(row)
                "
              />

            </td>

            <!-- REQUESTED AT -->

            <td>

              <span class="requested-at">

                {{
                  formatDateTime(
                    requestedAt(row),
                  )
                }}

              </span>

            </td>

            <!-- THREE DOTS -->

            <td class="actions-cell">

              <OvertimeRowActions
                :request="
                  normalizeRequest(
                    row,
                  )
                "
                @view="
                  emit(
                    'view',
                    $event,
                  )
                "
                @review="
                  emit(
                    'review',
                    $event,
                  )
                "
                @history="
                  emit(
                    'history',
                    $event,
                  )
                "
                @cancel="
                  emit(
                    'cancel',
                    $event,
                  )
                "
              />

            </td>

          </tr>

          <tr
            v-if="
              !requests.length
            "
          >

            <td
              colspan="12"
              class="empty-state"
            >
              No overtime requests found.
            </td>

          </tr>

        </tbody>

      </table>

    </div>

  </article>
</template>

<style scoped>
.table-card {
  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 10px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

.table-heading {
  display: flex;

  align-items: center;
  justify-content: space-between;

  padding:
    14px 15px;

  border-bottom:
    1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 12px;
  font-weight: 700;
}

.table-heading p {
  margin:
    3px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;

  min-width: 1670px;

  border-collapse: collapse;
}

th {
  padding:
    10px 11px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-size: 7.5px;
  font-weight: 700;

  text-align: left;

  text-transform: uppercase;

  white-space: nowrap;
}

td {
  padding:
    10px 11px;

  border-top:
    1px solid var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 8px;

  vertical-align: middle;
}

tbody tr:hover {
  background:
    var(--bg-card-soft);
}

/* REQUEST */

.request-link {
  border: 0;

  padding: 0;

  background:
    transparent;

  color:
    var(--primary);

  font-family: inherit;

  font-size: 8px;
  font-weight: 700;

  cursor: pointer;
}

.request-link:hover {
  text-decoration: underline;
}

/* EMPLOYEE */

.employee-cell {
  display: flex;

  min-width: 190px;

  align-items: center;

  gap: 8px;
}

.employee-avatar {
  display: flex;

  width: 29px;
  height: 29px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 7px;

  background:
    var(--primary-soft);

  color:
    var(--primary);

  font-size: 9px;
  font-weight: 700;
}

.employee-cell strong,
.employee-cell span {
  display: block;
}

.employee-cell strong {
  color:
    var(--text-primary);

  font-size: 8.5px;
}

.employee-cell span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7px;
}

/* DATE */

.date-text {
  color:
    var(--text-primary);

  white-space: nowrap;
}

/* SCHEDULE */

.schedule-text {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  white-space: nowrap;
}

/* HOURS */

.requested {
  display: inline-flex;

  align-items: center;

  gap: 4px;

  color:
    var(--orange);

  white-space: nowrap;
}

.approved {
  color:
    var(--green);

  white-space: nowrap;
}

.muted {
  color:
    var(--text-muted);
}

/* TYPE */

.type-badge {
  display: inline-flex;

  padding:
    4px 7px;

  border-radius: 18px;

  font-size: 7px;
  font-weight: 650;

  white-space: nowrap;
}

.type-badge.blue {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.type-badge.purple {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.type-badge.green {
  background:
    var(--green-soft);

  color:
    var(--green);
}

/* REASON */

.reason {
  width: 230px;

  margin: 0;

  overflow: hidden;

  color:
    var(--text-primary);

  font-size: 8px;
  font-weight: 600;

  text-overflow: ellipsis;

  white-space: nowrap;
}

/* REQUESTED AT */

.requested-at {
  color:
    var(--text-secondary);

  white-space: nowrap;
}

/* ACTION */

.actions-cell {
  width: 40px;

  text-align: center;
}

/* EMPTY */

.empty-state {
  padding: 35px;

  color:
    var(--text-muted);

  text-align: center;
}
</style>