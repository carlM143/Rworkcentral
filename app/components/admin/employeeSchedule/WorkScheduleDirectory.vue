<script setup lang="ts">
import { computed } from 'vue'
import BaseDataTable from '~/components/shared-table/BaseDataTable.vue'
import WorkScheduleActions from '~/components/admin/employeeSchedule/WorkScheduleActions.vue'
import type { WorkSchedule } from '~/types/workSchedule'

defineOptions({ name: 'WorkScheduleDirectory' })

const props = defineProps<{
  schedules: WorkSchedule[]
}>()

const emit = defineEmits<{
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

const displaySchedules = computed(() =>
  props.schedules.map(schedule => ({
    schedule,
    days: getDisplayDays(schedule),
  })),
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
          <div v-if="row.days" class="day-stack">
            <div
              v-for="day in row.days"
              :key="day.key"
              class="day-item"
              :class="day.working ? 'is-working' : 'is-rest'"
            >
              <span class="day-dot" aria-hidden="true" />
              {{ day.label }}
            </div>
          </div>
          <span v-else class="missing-days">Not loaded</span>
        </td>

        <td>
          <div v-if="row.days" class="hour-stack">
            <div
              v-for="day in row.days"
              :key="day.key"
              class="hour-item"
              :class="{ 'is-rest': !day.working }"
            >
              <template v-if="!day.working">Rest Day</template>
              <template v-else-if="day.timeIn && day.timeOut">
                {{ formatTime(day.timeIn) }} – {{ formatTime(day.timeOut) }}
              </template>
              <template v-else>Time not configured</template>
            </div>
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

/* Align days and working hours */
.day-stack,
.hour-stack {
  display: grid;
  grid-template-rows: repeat(7, 25px);
  gap: 4px;
}

/* Day labels and working hours */
.day-item,
.hour-item {
  display: inline-flex;
  align-items: center;
  min-height: 25px;

  font-size: var(--table-row-font, 13px);
  font-weight: 400;
  line-height: 1.4;
  white-space: nowrap;
}

/* =========================================
   DAY BULLETS
   ========================================= */

.day-item {
  gap: 8px;
}

.day-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  min-width: 6px;
  flex-shrink: 0;

  border-radius: 50%;
  background-color: #22c55e;
}

/* Working days */
.day-item.is-working {
  color: var(--text-secondary);
}

/* Rest days */
.day-item.is-rest,
.hour-item.is-rest {
  color: var(--text-muted);
}

.day-item.is-rest .day-dot {
  background-color: var(--text-muted);
  opacity: 0.6;
}

/* Working hours */
.hour-item {
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
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
  .day-stack,
  .hour-stack {
    grid-template-rows: repeat(7, 25px);
    gap: 3px;
  }
}
</style>




