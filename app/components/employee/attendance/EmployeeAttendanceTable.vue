<!-- Employee attendance history (shared EmployeeRequestTable). -->
<script setup lang="ts">
import { FileClock } from 'lucide-vue-next'
import EmployeeRequestTable from '~/components/shared-table/employee-table/EmployeeRequestTable.vue'
import { attendanceStatusLabel, attendanceWorkedHours } from '~/composables/employee/attendance/useAttendance'
import type { TimeLogRecord } from '~/types/employee/attendance/attendance'

const props = withDefaults(defineProps<{
  logs: TimeLogRecord[]
  loading?: boolean
  pageSize?: number
  /** Status text per log; defaults to attendanceStatusLabel. */
  statusLabel?: (log: TimeLogRecord) => string
}>(), {
  loading: false,
  pageSize: 10,
  statusLabel: undefined,
})

const emit = defineEmits<{
  view: [log: TimeLogRecord]
  report: [log: TimeLogRecord]
}>()

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'time_in', label: 'Time In' },
  { key: 'time_out', label: 'Time Out' },
  { key: 'hours', label: 'Hours Worked', hideOnMobile: true },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', hideOnMobile: true },
]

const formatDate = (value: string, withYear = true) => {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-PH', withYear
      ? { month: 'short', day: 'numeric', year: 'numeric' }
      : { month: 'short', day: 'numeric' })
}

const formatTime = (value: string | null) =>
  value ? new Date(value).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : '—'

const hoursText = (log: TimeLogRecord) => {
  const hours = attendanceWorkedHours(log)
  return hours === null ? '—' : `${hours.toFixed(1)} hrs`
}

const statusOf = (log: TimeLogRecord) => (props.statusLabel ?? attendanceStatusLabel)(log)

const badgeClass = (status: string) =>
  status === 'On Time' || status.includes('Verified') ? 'green'
    : status.includes('Late') ? 'orange'
      : status.includes('Undertime') ? 'purple'
        : 'neutral'

const rows = computed(() => props.logs.map(log => ({ id: log.id, log })))
const logOf = (row: Record<string, unknown>) => row.log as TimeLogRecord
</script>

<template>
  <EmployeeRequestTable
    :columns="columns"
    :rows="rows"
    :page-size="pageSize"
    :loading="loading"
    empty-message="No attendance records for this period."
    mobile-hint="Tap a row for worked hours, schedule and reporting."
    @row-click="row => emit('view', logOf(row))"
  >
    <template #cell-date="{ row }">
      <button type="button" class="row-open-button" @click.stop="emit('view', logOf(row))">
        <strong class="mobile-hide">{{ formatDate(logOf(row).work_date) }}</strong>
        <strong class="mobile-only">{{ formatDate(logOf(row).work_date, false) }}</strong>
      </button>
      <small v-if="logOf(row).source">{{ logOf(row).source }}</small>
    </template>

    <template #cell-time_in="{ row }">{{ formatTime(logOf(row).time_in) }}</template>
    <template #cell-time_out="{ row }">{{ formatTime(logOf(row).time_out) }}</template>
    <template #cell-hours="{ row }">{{ hoursText(logOf(row)) }}</template>

    <template #cell-status="{ row }">
      <span class="badge" :class="badgeClass(statusOf(logOf(row)))">{{ statusOf(logOf(row)) }}</span>
    </template>

    <template #cell-actions="{ row }">
      <button
        type="button"
        class="report-button"
        :aria-label="`Report an attendance issue for ${formatDate(logOf(row).work_date)}`"
        @click.stop="emit('report', logOf(row))"
      >
        <FileClock :size="13" /> Report
      </button>
    </template>
  </EmployeeRequestTable>
</template>

<style scoped>
/* Slot content renders in this component's scope, so these styles apply inside the shared table. */
.row-open-button { padding: 0; border: 0; background: transparent; color: var(--text-primary); font: inherit; text-align: left; cursor: pointer; }
small { text-transform: capitalize; }
.badge { display: inline-block; padding: 5px 8px; border-radius: 5px; font-size: 10px; font-weight: 600; white-space: nowrap; }
.green { background: var(--green-soft); color: var(--green); }
.orange { background: var(--orange-soft); color: var(--orange); }
.purple { background: var(--purple-soft, rgba(139, 92, 246, .12)); color: var(--purple, #8b5cf6); }
.neutral { background: var(--bg-card-soft); color: var(--text-secondary); }
.report-button { display: inline-flex; align-items: center; gap: 5px; padding: 6px 10px; border: 1px solid var(--border); border-radius: 7px; background: transparent; color: var(--primary); font: inherit; font-size: 11px; font-weight: 600; cursor: pointer; }
.report-button:hover { border-color: var(--primary); background: var(--primary-soft); }
</style>
