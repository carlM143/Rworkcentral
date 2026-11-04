<script setup lang="ts">
import {
  Clock3,
  UserRound,
  Paperclip,
} from 'lucide-vue-next'

import ManualTimeActions from '~/components/admin/timekeeping/manual-time-in-out/ManualTimeActions.vue'

import type {
  ManualTimeEntry,
} from '~/types/manualTimeEntry'

defineProps<{
  entries: ManualTimeEntry[]
}>()

const emit = defineEmits<{
  view: [entry: ManualTimeEntry]
  edit: [entry: ManualTimeEntry]
  validate: [entry: ManualTimeEntry]
  employee: [entry: ManualTimeEntry]
  timeLog: [entry: ManualTimeEntry]
  cancel: [entry: ManualTimeEntry]
}>()

const formatDate = (value: string): string => {
  if (!value) return '—'

  const date = new Date(`${value.slice(0, 10)}T00:00:00`)

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const formatTime = (value?: string | null): string => {
  if (!value) return '—'

  // Supports HH:mm, HH:mm:ss, and full datetime strings.
  const timePart = value.includes(' ')
    ? value.split(' ').pop() ?? ''
    : value

  // Preserve already formatted AM/PM values.
  if (/[ap]m/i.test(timePart)) return timePart

  const match = timePart.match(/^(\d{1,2}):(\d{2})/)

  if (!match) return value

  const hour = Number(match[1])
  const minute = match[2]

  if (hour > 23) return value

  return `${String(hour % 12 || 12).padStart(2, '0')}:${minute} ${hour >= 12 ? 'PM' : 'AM'}`
}

const getTimeIn = (entry: ManualTimeEntry): string => {
  if (entry.timeIn) return formatTime(entry.timeIn)

  // Compatibility for old records.
  if (entry.entryType === 'Time In') {
    return formatTime(entry.time)
  }

  return '—'
}

const getTimeOut = (entry: ManualTimeEntry): string => {
  if (entry.timeOut) return formatTime(entry.timeOut)

  // Compatibility for old records.
  if (entry.entryType === 'Time Out') {
    return formatTime(entry.time)
  }

  return '—'
}

const getAttendanceStatus = (
  entry: ManualTimeEntry,
): string => {
  if (entry.attendanceStatus) {
    return entry.attendanceStatus
  }

  if (
    entry.timeIn !== undefined ||
    entry.timeOut !== undefined
  ) {
    if (entry.timeIn && entry.timeOut) return 'Complete'
    if (!entry.timeIn && !entry.timeOut) return 'Missing'
    return 'Incomplete'
  }

  return 'Not Available'
}

const getStatusClass = (value: string): string => {
  const status = value.trim().toLowerCase()

  if (status === 'complete') return 'status-complete'
  if (status === 'late') return 'status-late'
  if (status === 'undertime') return 'status-undertime'

  if (
    status === 'missing' ||
    status === 'missing log' ||
    status === 'absent'
  ) {
    return 'status-missing'
  }

  if (status === 'incomplete') {
    return 'status-incomplete'
  }

  return 'status-default'
}

const getRemarks = (entry: ManualTimeEntry): string => {
  return entry.remarks?.trim() ||
    entry.reason?.trim() ||
    '—'
}
</script>

<template>
  <article class="table-card">
    <div class="table-heading">
      <div>
        <h3>Manual Time Entries</h3>

        <p>
          Review manually recorded attendance,
          time entries, remarks and attendance status.
        </p>
      </div>
    </div>

    <div v-if="entries.length" class="table-scroll">
      <table class="entry-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Date</th>
            <th>Schedule</th>
            <th>Time In</th>
            <th>Time Out</th>
            <th>Remarks</th>
            <th>Attendance Status</th>
            <th class="actions-heading">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="entry in entries"
            :key="entry.id"
          >
            <!-- EMPLOYEE -->
            <td>
              <div class="employee-cell">
                <div class="employee-icon">
                  <UserRound :size="16" />
                </div>

                <div class="employee-information">
                  <strong>{{ entry.employeeName }}</strong>

                  <span>
                    {{ entry.employeeNumber }}
                    <template v-if="entry.department">
                      · {{ entry.department }}
                    </template>
                  </span>
                </div>
              </div>
            </td>

            <!-- DATE -->
            <td class="date-cell">
              {{ formatDate(entry.attendanceDate) }}
            </td>

            <!-- SCHEDULE -->
            <td class="schedule">
              <span class="schedule-value">
                <Clock3 :size="12" />
                {{ entry.schedule || 'Not recorded' }}
              </span>
            </td>

            <!-- TIME IN -->
            <td>
              <strong
                class="time-value"
                :class="{
                  'time-empty': getTimeIn(entry) === '—',
                }"
              >
                {{ getTimeIn(entry) }}
              </strong>
            </td>

            <!-- TIME OUT -->
            <td>
              <strong
                class="time-value"
                :class="{
                  'time-empty': getTimeOut(entry) === '—',
                }"
              >
                {{ getTimeOut(entry) }}
              </strong>
            </td>

            <!-- REMARKS -->
            <td>
              <div class="remarks-cell">
                <span
                  :title="getRemarks(entry)"
                >
                  {{ getRemarks(entry) }}
                </span>

                <Paperclip
                  v-if="entry.attachment"
                  :size="13"
                />
              </div>
            </td>

            <!-- ATTENDANCE STATUS -->
            <td>
              <span
                class="attendance-status"
                :class="
                  getStatusClass(
                    getAttendanceStatus(entry),
                  )
                "
              >
                <span class="status-dot" />

                {{ getAttendanceStatus(entry) }}
              </span>
            </td>

            <!-- ACTIONS -->
            <td class="actions-cell">
              <ManualTimeActions
                :entry="entry"
                @view="emit('view', entry)"
                @edit="emit('edit', entry)"
                @validate="emit('validate', entry)"
                @employee="emit('employee', entry)"
                @time-log="emit('timeLog', entry)"
                @cancel="emit('cancel', entry)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-state">
      <Clock3 :size="28" />

      <strong>No manual time entries found</strong>

      <span>
        There are no manual attendance records
        matching your filters.
      </span>
    </div>
  </article>
</template>

<style scoped>
.table-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.table-heading {
  padding: 15px 16px;
  border-bottom: 1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 700;
}

.table-heading p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.entry-table {
  width: 100%;
  min-width: 1080px;
  border-collapse: collapse;
}

.entry-table th {
  padding: 12px 13px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 9px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

.entry-table td {
  padding: 13px;
  border-bottom: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 10px;
  vertical-align: middle;
}

.entry-table tbody tr:last-child td {
  border-bottom: 0;
}

.entry-table tbody tr:hover {
  background: var(--bg-card-soft);
}

.employee-cell {
  display: flex;
  min-width: 185px;
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
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--primary);
}

.employee-information {
  min-width: 0;
}

.employee-information strong,
.employee-information span {
  display: block;
}

.employee-information strong {
  color: var(--text-primary);
  font-size: 10px;
  font-weight: 700;
}

.employee-information span {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 8px;
}

.date-cell,
.schedule,
.time-value {
  white-space: nowrap;
}

.schedule-value {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.schedule-value svg {
  flex-shrink: 0;
  color: var(--text-muted);
}

.time-value {
  color: var(--primary);
  font-size: 10px;
  font-weight: 700;
}

.time-value.time-empty {
  color: var(--text-muted);
  font-weight: 400;
}

.remarks-cell {
  display: flex;
  max-width: 230px;
  align-items: center;
  gap: 6px;
}

.remarks-cell span {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.remarks-cell svg {
  flex-shrink: 0;
  color: var(--primary);
}

.attendance-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 9px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
}

.status-dot {
  width: 5px;
  height: 5px;
  flex-shrink: 0;
  border-radius: 50%;
  background: currentColor;
}

.status-complete {
  background: rgba(16, 185, 129, 0.13);
  color: #10b981;
}

.status-late {
  background: rgba(245, 158, 11, 0.13);
  color: #f59e0b;
}

.status-undertime {
  background: rgba(249, 115, 22, 0.13);
  color: #fb923c;
}

.status-incomplete {
  background: rgba(245, 158, 11, 0.13);
  color: #f59e0b;
}

.status-missing {
  background: rgba(239, 68, 68, 0.13);
  color: #f87171;
}

.status-default {
  background: var(--primary-soft);
  color: var(--primary);
}

.actions-heading,
.actions-cell {
  width: 75px;
  text-align: center !important;
}

.empty-state {
  display: flex;
  min-height: 250px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: var(--text-muted);
}

.empty-state strong {
  color: var(--text-primary);
  font-size: 11px;
}

.empty-state span {
  font-size: 9px;
}
</style>
