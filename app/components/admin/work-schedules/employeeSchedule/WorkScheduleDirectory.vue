<script setup lang="ts">
import { computed } from 'vue'
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import WorkScheduleActions from '~/components/admin/work-schedules/employeeSchedule/WorkScheduleActions.vue'
import type { WorkSchedule } from '~/types/workSchedule'

defineOptions({ name: 'WorkScheduleDirectory' })

const props = defineProps<{
  schedules: WorkSchedule[]
}>()

const emit = defineEmits<{
  view: [schedule: WorkSchedule]
  edit: [schedule: WorkSchedule]
  toggleStatus: [schedule: WorkSchedule]
}>()

interface ApiWorkScheduleDay {
  day_of_week?: string | null
  dayOfWeek?: string | null
  is_working_day?: boolean | number | string | null
  isWorkingDay?: boolean | number | string | null
  time_in?: string | null
  timeIn?: string | null
  time_out?: string | null
  timeOut?: string | null
}

type ScheduleWithDays = WorkSchedule & {
  days?: ApiWorkScheduleDay[] | null
  work_schedule_days?: ApiWorkScheduleDay[] | null
  scheduleDays?: ApiWorkScheduleDay[] | null
}

interface DisplayDay {
  key: string
  label: string
  working: boolean
  timeIn: string | null
  timeOut: string | null
}

const weekdays = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
] as const

const dayKey = (day: string | null | undefined): string =>
  typeof day === 'string' ? day.trim().slice(0, 3).toLowerCase() : ''

const isEnabled = (value: ApiWorkScheduleDay): boolean => {
  const flag = value.is_working_day ?? value.isWorkingDay
  return flag !== false && flag !== 0 && flag !== '0' && flag !== 'false'
}

// Laravel saves working-day rows only; absent weekdays are rest days.
const getDisplayDays = (schedule: WorkSchedule): DisplayDay[] | null => {
  const source = schedule as ScheduleWithDays
  const records = source.days ?? source.work_schedule_days ?? source.scheduleDays
  if (!Array.isArray(records)) return null

  const byDay = new Map<string, ApiWorkScheduleDay>()
  for (const record of records) {
    const key = dayKey(record.day_of_week ?? record.dayOfWeek)
    if (key) byDay.set(key, record)
  }

  return weekdays.map(({ key, label }) => {
    const record = byDay.get(key)
    const working = record ? isEnabled(record) : false

    return {
      key,
      label,
      working,
      timeIn: working ? (record?.time_in ?? record?.timeIn ?? null) : null,
      timeOut: working ? (record?.time_out ?? record?.timeOut ?? null) : null,
    }
  })
}

// Format Laravel times without Date timezone conversion.
const formatTime = (value: string | null): string => {
  if (!value) return '—'
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/)
  if (!match) return value

  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour > 23 || minute > 59) return value

  const meridiem = hour >= 12 ? 'PM' : 'AM'
  const twelveHour = hour % 12 || 12
  return `${String(twelveHour).padStart(2, '0')}:${match[2]} ${meridiem}`
}

interface HourGroup {
  days: string
  hours: string
}

// Consecutive working days with the same hours become one line,
// e.g. "Mon–Fri · 08:00 AM – 05:00 PM". Keeps each row short.
const groupHours = (days: DisplayDay[]): HourGroup[] => {
  const groups: { from: string, to: string, hours: string }[] = []

  for (const day of days) {
    if (!day.working) continue
    const hours = day.timeIn && day.timeOut
      ? `${formatTime(day.timeIn)} – ${formatTime(day.timeOut)}`
      : 'Time not configured'

    const last = groups[groups.length - 1]
    const previousIndex = days.findIndex(d => d.label === last?.to)
    const isNext = last && days[previousIndex + 1]?.key === day.key

    if (last && isNext && last.hours === hours) last.to = day.label
    else groups.push({ from: day.label, to: day.label, hours })
  }

  return groups.map(g => ({
    days: g.from === g.to ? g.from : `${g.from}–${g.to}`,
    hours: g.hours,
  }))
}

const displaySchedules = computed(() =>
  props.schedules.map((schedule) => {
    const days = getDisplayDays(schedule)

    return {
      schedule,
      days,
      hourGroups: days ? groupHours(days) : [],
      restDays: days ? days.filter(d => !d.working).map(d => d.label) : [],
      workingCount: days ? days.filter(d => d.working).length : 0,
    }
  }),
)
</script>

<template>
  <BaseDataTable
    title="Work Schedule Directory"
    description="Manage reusable employee shifts, working hours and day-by-day configurations."
    :has-rows="schedules.length > 0"
    min-width="970px"
    empty-title="No work schedules found"
    empty-description="Try adjusting your filters or create a new schedule."
  >
    <template #headers>
      <th>Schedule</th>
      <th>Type</th>
      <th>Days</th>
      <th>Working Hours</th>
      <th>Grace Period</th>
      <th>Status</th>
      <th class="text-right">Actions</th>
    </template>

    <template #rows>
      <tr v-for="row in displaySchedules" :key="row.schedule.id">
        <td>
          <div class="schedule-info">
            <strong>{{ row.schedule.name }}</strong>
          </div>
        </td>

        <td class="type-cell">{{ row.schedule.type }}</td>

        <td>
          <div v-if="row.days" class="day-chips" :aria-label="`${row.workingCount} working days`">
            <span
              v-for="day in row.days"
              :key="day.key"
              class="day-chip"
              :class="day.working ? 'is-working' : 'is-rest'"
              :title="day.working ? `${day.label}: working day` : `${day.label}: rest day`"
            >
              {{ day.label.charAt(0) }}
            </span>
          </div>
          <span v-else class="missing-days">Not loaded</span>
        </td>

        <td>
          <div v-if="row.days" class="hour-list">
            <div v-for="group in row.hourGroups" :key="group.days" class="hour-line">
              <span class="hour-days">{{ group.days }}</span>
              <span class="hour-time">{{ group.hours }}</span>
            </div>
            <div v-if="row.restDays.length" class="hour-line is-rest">
              <span class="hour-days">Rest</span>
              <span class="hour-time">{{ row.restDays.join(', ') }}</span>
            </div>
            <div v-if="!row.hourGroups.length" class="hour-line is-rest">No working days</div>
          </div>
          <span v-else class="missing-days">Schedule days unavailable</span>
        </td>

        <td class="grace-cell">{{ row.schedule.gracePeriod }} min</td>

        <td class="status-cell">
          <StatusBadge :status="row.schedule.status" />
        </td>

        <td class="text-right actions-cell">
          <WorkScheduleActions
            :schedule="row.schedule"
            @view="emit('view', row.schedule)"
            @edit="emit('edit', row.schedule)"
            @toggle-status="emit('toggleStatus', row.schedule)"
          />
        </td>
      </tr>
    </template>
  </BaseDataTable>
</template>


<style scoped>
/* =========================================
   WORK SCHEDULE DAYS
   ========================================= */

/* Days: one compact row of chips (M T W T F S S) */
.day-chips {
  display: flex;
  gap: 4px;
}

.day-chip {
  display: inline-grid;
  width: 24px;
  height: 24px;
  place-items: center;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}

.day-chip.is-working {
  background: var(--green-soft, rgba(34, 197, 94, 0.12));
  color: var(--green, #22c55e);
}

.day-chip.is-rest {
  border: 1px dashed var(--border);
  color: var(--text-muted);
}

/* Working hours: grouped lines instead of one line per day */
.hour-list {
  display: grid;
  gap: 4px;
}

.hour-line {
  display: flex;
  align-items: baseline;
  gap: 8px;
  color: var(--text-secondary);
  font-size: var(--table-row-font, 13px);
  line-height: 1.4;
  white-space: nowrap;
}

.hour-days {
  min-width: 64px;
  color: var(--text-primary);
  font-weight: 600;
}

.hour-time {
  font-variant-numeric: tabular-nums;
}

.hour-line.is-rest,
.hour-line.is-rest .hour-days {
  color: var(--text-muted);
  font-weight: 500;
}

/* =========================================
   SCHEDULE NAME
   ========================================= */

.schedule-info {
  display: flex;
  align-items: center;
  min-width: 150px;
}

.schedule-info strong {
  color: var(--text-primary);
  font-size: var(--table-row-font, 13px);
  font-weight: 600;
  line-height: 1.5;
}

/* =========================================
   MISSING DAYS
   ========================================= */

.missing-days {
  color: var(--text-muted);
  font-size: var(--table-row-font, 13px);
  font-weight: 400;
}

/* =========================================
   ACTIONS
   ========================================= */

.actions-cell {
  text-align: right;
  vertical-align: middle;
}

/* =========================================
   RESPONSIVE
   ========================================= */

@media (max-width: 650px) {
  .day-chip {
    width: 22px;
    height: 22px;
  }
}
</style>