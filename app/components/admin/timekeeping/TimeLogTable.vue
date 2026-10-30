
<script setup lang="ts">
import { Clock3, Users } from 'lucide-vue-next'
import type { TimeLogRecord } from '~/types/timekeeping'

defineProps<{
  logs: TimeLogRecord[]
}>()

const formatDate = (value: string) => {
  if (!value) return '—'

  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

const displayTime = (value?: string | null) => {
  return value || '—'
}

const displayMinutes = (value: number) => {
  return value > 0 ? `${value} min` : '—'
}

const statusClass = (status: string) => {
  if (status === 'Complete') return 'complete'
  if (status === 'Missing Log') return 'missing'
  if (status === 'Incomplete') return 'incomplete'
  if (status === 'On Leave') return 'on-leave'
  if (status === 'Rest Day') return 'rest-day'
  return 'default'
}
</script>

<template>
  <BaseDataTable
    title="Employee Time Logs"
    description="Review detailed attendance logs, schedules, late, undertime and worked hours."
    :has-rows="logs.length > 0"
    min-width="1200px"
    empty-title="No time logs found"
    empty-description="Try changing your filters or date range."
  >
    <template #headers>
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
      <th>Actions</th>
    </template>

    <template #rows>
      <tr v-for="log in logs" :key="log.id">
        <td>
          <div class="employee-cell">
            <span class="employee-icon">
              <Users :size="15" />
            </span>

            <div class="employee-details">
              <strong>{{ log.employeeName }}</strong>
              <small>
                {{ log.employeeNumber }} · {{ log.department }}
              </small>
            </div>
          </div>
        </td>

        <td>
          {{ formatDate(log.date) }}
        </td>

        <td>
          <span class="schedule-cell">
            <Clock3 :size="13" />
            {{ log.schedule }}
          </span>
        </td>

        <td :class="{ 'issue-time': log.lateMinutes > 0 }">
          {{ displayTime(log.timeIn) }}
        </td>

        <td>
          {{ displayTime(log.breakOut) }}
        </td>

        <td>
          {{ displayTime(log.breakIn) }}
        </td>

        <td :class="{ 'issue-time': log.undertimeMinutes > 0 }">
          {{ displayTime(log.timeOut) }}
        </td>

        <td :class="{ 'issue-time': log.lateMinutes > 0 }">
          {{ displayMinutes(log.lateMinutes) }}
        </td>

        <td :class="{ 'issue-time': log.undertimeMinutes > 0 }">
          {{ displayMinutes(log.undertimeMinutes) }}
        </td>

        <td class="worked-hours">
          {{
            log.hoursWorked === undefined
              ? '—'
              : `${log.hoursWorked.toFixed(2)} hrs`
          }}
        </td>

        <td>
          <span
            class="attendance-status"
            :class="statusClass(log.status)"
          >
            {{ log.status }}
          </span>
        </td>

        <td>
          <TimeLogActions :log="log" />
        </td>
      </tr>
    </template>
  </BaseDataTable>
</template>

<style scoped>
.employee-cell {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 190px;
}

.employee-icon {
  display: flex;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--primary-soft);
  color: var(--primary);
}

.employee-details {
  min-width: 0;
}

.employee-details strong {
  display: block;
  color: var(--text-primary);
  font-size: 10px;
  font-weight: 700;
}

.employee-details small {
  display: block;
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 9px;
}

.schedule-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.issue-time {
  color: var(--orange) !important;
  font-weight: 700;
}

.worked-hours {
  color: var(--text-primary) !important;
  font-weight: 650;
  white-space: nowrap;
}

.attendance-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.attendance-status.complete {
  background: var(--green-soft);
  color: var(--green);
}

.attendance-status.incomplete,
.attendance-status.missing {
  background: var(--orange-soft);
  color: var(--orange);
}

.attendance-status.on-leave,
.attendance-status.rest-day {
  background: var(--primary-soft);
  color: var(--primary);
}

.attendance-status.default {
  background: var(--purple-soft);
  color: var(--purple);
}
</style>
