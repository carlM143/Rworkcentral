<script setup lang="ts">
import {
  Clock3,
  Paperclip,
} from 'lucide-vue-next'

import TimeCorrectionActions from '~/components/admin/timekeeping/time-log-corrections/TimeCorrectionActions.vue'

import type {
  TimeLogCorrectionRequest,
} from '~/types/timeLogCorrection'

defineProps<{
  requests:
    TimeLogCorrectionRequest[]
}>()

const emit = defineEmits<{
  view: [
    request:
      TimeLogCorrectionRequest,
  ]

  approve: [
    request:
      TimeLogCorrectionRequest,
  ]

  reject: [
    request:
      TimeLogCorrectionRequest,
  ]

  employee: [
    request:
      TimeLogCorrectionRequest,
  ]
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
      hour: 'numeric',
      minute: '2-digit',
    },
  ).format(
    new Date(value),
  )
}

const getOriginalLog = (
  request:
    TimeLogCorrectionRequest,
) => {
  if (
    !request.originalTimeIn &&
    !request.originalTimeOut
  ) {
    return 'No log'
  }

  return `${request.originalTimeIn ?? '—'} / ${request.originalTimeOut ?? '—'}`
}

const getRequestedLog = (
  request:
    TimeLogCorrectionRequest,
) => {
  return `${request.requestedTimeIn ?? '—'} / ${request.requestedTimeOut ?? '—'}`
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>
        <h3>
          Correction Requests
        </h3>

        <p>
          Review employee attendance
          correction requests and approval status.
        </p>
      </div>

    </div>

    <div
      v-if="requests.length"
      class="table-scroll"
    >

      <table class="correction-table">

        <thead>
          <tr>
            <th>Employee</th>
            <th>Attendance Date</th>
            <th>Correction Type</th>
            <th>Original Log</th>
            <th>Requested Log</th>
            <th>Reason</th>
            <th>Requested</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="request in requests"
            :key="request.id"
          >

            <td>

              <div class="employee-cell">

                <div class="employee-icon">
                  <Clock3 :size="16" />
                </div>

                <div>
                  <strong>
                    {{ request.employeeName }}
                  </strong>

                  <span>
                    {{ request.employeeNumber }}
                    ·
                    {{ request.department }}
                  </span>
                </div>

              </div>

            </td>

            <td>
              {{
                formatDate(
                  request.attendanceDate,
                )
              }}
            </td>

            <td>

              <div class="type-wrapper">

                <span class="type-badge">
                  {{
                    request.correctionType
                  }}
                </span>

                <span
                  v-if="
                    request.priority ===
                    'Urgent'
                  "
                  class="urgent"
                >
                  Urgent
                </span>

              </div>

            </td>

            <td class="time-value">
              {{
                getOriginalLog(
                  request,
                )
              }}
            </td>

            <td class="requested-value">
              {{
                getRequestedLog(
                  request,
                )
              }}
            </td>

            <td>

              <div class="reason-cell">

                <span>
                  {{ request.reason }}
                </span>

                <Paperclip
                  v-if="
                    request.attachment
                  "
                  :size="13"
                />

              </div>

            </td>

            <td>
              {{
                formatDateTime(
                  request.requestedAt,
                )
              }}
            </td>

            <td>
              <StatusBadge
                :status="
                  request.status
                "
              />
            </td>

            <td>

              <TimeCorrectionActions
                :request="request"
                @view="
                  emit(
                    'view',
                    request,
                  )
                "
                @approve="
                  emit(
                    'approve',
                    request,
                  )
                "
                @reject="
                  emit(
                    'reject',
                    request,
                  )
                "
                @employee="
                  emit(
                    'employee',
                    request,
                  )
                "
              />

            </td>

          </tr>

        </tbody>

      </table>

    </div>

    <div
      v-else
      class="empty-state"
    >
      <Clock3 :size="28" />

      <strong>
        No correction requests found
      </strong>

      <span>
        Try adjusting your filters.
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
    1px solid
    var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
  font-weight: 700;
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

.correction-table {
  width: 100%;

  min-width: 1350px;

  border-collapse:
    collapse;
}

.correction-table th {
  padding:
    12px 13px;

  border-bottom:
    1px solid var(--border);

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

.correction-table td {
  padding: 13px;

  border-bottom:
    1px solid
    var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 11px;

  vertical-align: middle;
}

.correction-table
tbody
tr:last-child
td {
  border-bottom: 0;
}

.correction-table
tbody
tr:hover {
  background:
    var(--bg-card-soft);
}

.employee-cell {
  display: flex;

  min-width: 190px;

  align-items: center;

  gap: 9px;
}

.employee-icon {
  display: flex;

  width: 36px;
  height: 36px;

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

  font-size: 11px;
}

.employee-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9px;
}

.type-wrapper {
  display: flex;

  align-items: center;

  gap: 5px;
}

.type-badge {
  display: inline-flex;

  padding:
    5px 8px;

  border-radius: 20px;

  background:
    var(--purple-soft);

  color:
    var(--purple);

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

.urgent {
  padding:
    4px 6px;

  border-radius: 20px;

  background:
    var(--red-soft);

  color:
    var(--red);

  font-size: 8px;
  font-weight: 700;
}

.time-value {
  white-space: nowrap;
}

.requested-value {
  color:
    var(--primary) !important;

  font-weight: 600;

  white-space: nowrap;
}

.reason-cell {
  display: flex;

  max-width: 220px;

  align-items: center;

  gap: 6px;
}

.reason-cell span {
  overflow: hidden;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.reason-cell svg {
  flex-shrink: 0;

  color:
    var(--primary);
}

.empty-state {
  display: flex;

  min-height: 260px;

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

  font-size: 12px;
}

.empty-state span {
  font-size: 10px;
}
</style>