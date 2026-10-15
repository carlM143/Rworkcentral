<script setup lang="ts">
import {
  Clock3,
  Users,
} from 'lucide-vue-next'

import type {
  TimeLogRecord,
} from '~/types/timekeeping'

defineProps<{
  logs: TimeLogRecord[]
}>()

const formatDate = (
  date: string,
) => {
  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    },
  ).format(
    new Date(
      `${date}T00:00:00`,
    ),
  )
}

const minutesLabel = (
  minutes: number,
) => {
  return minutes
    ? `${minutes} min`
    : '—'
}

const hoursLabel = (
  hours?: number,
) => {
  if (
    hours === undefined ||
    hours === null
  ) {
    return '—'
  }

  return `${hours.toFixed(2)} hrs`
}
</script>

<template>
  <div class="time-log-card">

    <div class="table-heading">
      <div>
        <h3>
          Employee Time Logs
        </h3>

        <p>
          Review detailed attendance logs,
          schedules, late, undertime and worked hours.
        </p>
      </div>
    </div>

    <div
      v-if="logs.length"
      class="table-scroll"
    >
      <table class="time-log-table">

        <thead>
          <tr>
            <th>Employee</th>
            <th>Date</th>
            <th>Schedule</th>
            <th>Time In</th>
            <th>Break Out</th>
            <th>Break In</th>
            <th>Time Out</th>
            <th>Late</th>
            <th>Undertime</th>
            <th>Hours</th>
            <th>Status</th>
            <th class="action-column" />
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="log in logs"
            :key="log.id"
          >

            <td>
              <div class="employee-cell">

                <div class="employee-icon">
                  <Users :size="15" />
                </div>

                <div>
                  <strong>
                    {{ log.employeeName }}
                  </strong>

                  <span>
                    {{ log.employeeNumber }}
                    ·
                    {{ log.department }}
                  </span>
                </div>

              </div>
            </td>

            <td>
              {{ formatDate(log.date) }}
            </td>

            <td>
              <div class="schedule-cell">
                <Clock3 :size="13" />

                {{ log.schedule }}
              </div>
            </td>

            <td>
              <span
                :class="{
                  issue:
                    log.lateMinutes > 0,
                }"
              >
                {{ log.timeIn || '—' }}
              </span>
            </td>

            <td>
              {{ log.breakOut || '—' }}
            </td>

            <td>
              {{ log.breakIn || '—' }}
            </td>

            <td>
              <span
                :class="{
                  issue:
                    log.undertimeMinutes > 0,
                }"
              >
                {{ log.timeOut || '—' }}
              </span>
            </td>

            <td>
              <span
                :class="{
                  issue:
                    log.lateMinutes > 0,
                }"
              >
                {{
                  minutesLabel(
                    log.lateMinutes,
                  )
                }}
              </span>
            </td>

            <td>
              <span
                :class="{
                  issue:
                    log.undertimeMinutes > 0,
                }"
              >
                {{
                  minutesLabel(
                    log.undertimeMinutes,
                  )
                }}
              </span>
            </td>

            <td>
              <strong>
                {{
                  hoursLabel(
                    log.hoursWorked,
                  )
                }}
              </strong>
            </td>

            <td>
              <StatusBadge
                :status="log.status"
              />
            </td>

            <td class="action-column">
              <TimeLogActions
                :log="log"
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
      <div class="empty-icon">
        <Clock3 :size="24" />
      </div>

      <strong>
        No time logs found
      </strong>

      <p>
        Try changing your filters or date range.
      </p>
    </div>

  </div>
</template>

<style scoped>
.time-log-card {
  position: relative;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

.table-heading {
  padding: 15px 17px;

  border-bottom:
    1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 13px;
  font-weight: 700;
}

.table-heading p {
  margin: 4px 0 0;

  color: var(--text-muted);

  font-size: 9px;
}

.table-scroll {
  overflow-x: auto;
}

.time-log-table {
  width: 100%;

  min-width: 1450px;

  border-collapse: collapse;
}

.time-log-table th {
  padding: 11px 12px;

  border-bottom:
    1px solid var(--border);

  background: var(--bg-card-soft);
  color: var(--text-secondary);

  font-size: 8px;
  font-weight: 650;

  text-align: left;
  text-transform: uppercase;

  white-space: nowrap;

  letter-spacing: 0.3px;
}

.time-log-table td {
  padding: 11px 12px;

  border-bottom:
    1px solid var(--border-soft);

  color: var(--text-secondary);

  font-size: 9px;

  white-space: nowrap;
}

.time-log-table tbody
tr:last-child td {
  border-bottom: 0;
}

.time-log-table tbody tr:hover {
  background: var(--bg-card-soft);
}

.employee-cell {
  display: flex;
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

  background: var(--primary-soft);
  color: var(--primary);
}

.employee-cell strong,
.employee-cell span {
  display: block;
}

.employee-cell strong {
  color: var(--text-primary);

  font-size: 9px;
}

.employee-cell span {
  margin-top: 3px;

  color: var(--text-muted);

  font-size: 7px;
}

.schedule-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.issue {
  color: var(--orange);

  font-weight: 650;
}

.action-column {
  width: 45px;

  text-align: right !important;
}

.empty-state {
  display: flex;

  min-height: 260px;

  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 30px;

  text-align: center;
}

.empty-icon {
  display: flex;

  width: 48px;
  height: 48px;

  align-items: center;
  justify-content: center;

  margin-bottom: 12px;

  border-radius: 12px;

  background: var(--primary-soft);
  color: var(--primary);
}

.empty-state strong {
  color: var(--text-primary);

  font-size: 13px;
}

.empty-state p {
  margin: 5px 0 0;

  color: var(--text-muted);

  font-size: 10px;
}
</style>