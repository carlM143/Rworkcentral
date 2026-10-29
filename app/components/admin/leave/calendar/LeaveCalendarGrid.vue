<script setup lang="ts">
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock3,
} from 'lucide-vue-next'

import type {
  LeaveCalendarEvent,
} from '~/types/leaveCalendar'

interface CalendarDay {
  date: Date
  dateString: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  events: LeaveCalendarEvent[]
}

defineProps<{
  monthLabel: string
  days: CalendarDay[]
}>()

const emit = defineEmits<{
  previous: []
  next: []
  today: []
}>()

const leaveClass = (leaveType: string) => {
  const lt = (leaveType || '').toLowerCase()
  if (lt.includes('vacation')) {
    return 'vacation'
  }
  if (lt.includes('sick')) {
    return 'sick'
  }
  if (lt.includes('emergency')) {
    return 'emergency'
  }
  if (lt.includes('special')) {
    return 'special'
  }
  return 'statutory'
}
</script>

<template>
  <article class="calendar-card">
    <!-- HEADER -->
    <div class="calendar-header">
      <div>
        <h3>Holiday Leave</h3>
        <p>View employee leaves and approved absences by calendar date.</p>
      </div>

      <div class="calendar-navigation">
        <div class="month-title-group">
          <strong class="month-label">{{ monthLabel }}</strong>
          <ChevronDown :size="14" class="dropdown-caret-icon" />
          <button
            type="button"
            class="today-button"
            @click="emit('today')"
          >
            Today
          </button>
        </div>

        <div class="nav-arrows">
          <button
            type="button"
            class="nav-button"
            aria-label="Previous month"
            @click="emit('previous')"
          >
            <ChevronLeft :size="16" />
          </button>

          <button
            type="button"
            class="nav-button"
            aria-label="Next month"
            @click="emit('next')"
          >
            <ChevronRight :size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- LEGEND -->
    <div class="calendar-legend">
      <span>
        <i class="legend-dot vacation" />
        Vacation Leave
      </span>

      <span>
        <i class="legend-dot sick" />
        Sick Leave
      </span>

      <span>
        <i class="legend-dot emergency" />
        Emergency Leave
      </span>

      <span>
        <i class="legend-dot special" />
        Special Leave
      </span>

      <span>
        <i class="legend-dot statutory" />
        Statutory Leave
      </span>
    </div>

    <!-- WEEK DAYS (Consistent 2-letter uppercase) -->
    <div class="weekday-grid">
      <div>SU</div>
      <div>MO</div>
      <div>TU</div>
      <div>WE</div>
      <div>TH</div>
      <div>FR</div>
      <div>SA</div>
    </div>

    <!-- DAYS -->
    <div class="calendar-grid">
      <div
        v-for="day in days"
        :key="day.dateString"
        class="calendar-day"
        :class="{
          muted: !day.isCurrentMonth,
          today: day.isToday,
        }"
      >
        <div class="day-header">
          <span
            class="day-number"
            :class="{ 'today-number': day.isToday }"
          >
            {{ day.dayNumber }}
          </span>

          <span v-if="day.events.length" class="event-count">
            {{ day.events.length }}
          </span>
        </div>

        <div class="events-list">
          <div
            v-for="event in day.events.slice(0, 3)"
            :key="`${event.id}-${day.dateString}`"
            class="leave-event"
            :class="[
              leaveClass(event.leaveType),
              {
                pending: event.status === 'Pending',
              },
            ]"
          >
            <strong>
              {{ event.employeeName }}
            </strong>
            <span>
              {{ event.leaveType }}
            </span>
          </div>

          <button
            v-if="day.events.length > 3"
            type="button"
            class="more-events"
          >
            + {{ day.events.length - 3 }} more
          </button>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="calendar-footer">
      <Clock3 :size="14" />
      <span>
        Pending leave requests are displayed with a dashed border.
      </span>
    </div>
  </article>
</template>

<style scoped>
.calendar-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

/* =========================
   HEADER
========================= */

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border-soft);
}

.calendar-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
}

.calendar-header p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 11px;
}

.calendar-navigation {
  display: flex;
  align-items: center;
  gap: 16px;
}

.month-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.month-label {
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 700;
}

.dropdown-caret-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}

.today-button {
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.today-button:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.nav-arrows {
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-button {
  display: flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.nav-button:hover {
  background: var(--border-soft);
  color: var(--primary);
}

/* =========================
   LEGEND
========================= */

.calendar-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  padding: 11px 18px;
  border-bottom: 1px solid var(--border-soft);
  background: var(--bg-card-soft);
}

.calendar-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 10px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-dot.vacation { background: var(--primary); }
.legend-dot.sick { background: var(--green); }
.legend-dot.emergency { background: var(--red); }
.legend-dot.special { background: var(--purple); }
.legend-dot.statutory { background: var(--orange); }

/* =========================
   WEEKDAY
========================= */

.weekday-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(150px, 1fr));
  border-bottom: 1px solid var(--border-soft);
}

.weekday-grid div {
  padding: 10px 12px;
  border-right: 1px solid var(--border-soft);
  background: var(--bg-card-soft);
  color: var(--text-muted);
  font-size: 10px;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.5px;
}

.weekday-grid div:last-child {
  border-right: 0;
}

/* =========================
   CALENDAR
========================= */

.calendar-grid {
  display: grid;
  min-width: 1050px;
  grid-template-columns: repeat(7, minmax(150px, 1fr));
}

.calendar-day {
  min-height: 145px;
  padding: 10px;
  border-right: 1px solid var(--border-soft);
  border-bottom: 1px solid var(--border-soft);
  background: var(--bg-card);
}

.calendar-day:nth-child(7n) {
  border-right: 0;
}

.calendar-day.muted {
  background: var(--bg-card-soft);
  opacity: 0.55;
}

.calendar-day.today {
  background: color-mix(in srgb, var(--primary-soft) 55%, var(--bg-card));
}

.day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.day-number {
  display: flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 700;
}

.today-number {
  background: #2563eb;
  color: white;
  border-radius: 50%;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.45);
}

.event-count {
  display: flex;
  min-width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  border-radius: 20px;
  background: var(--bg-card-soft);
  color: var(--text-muted);
  font-size: 9px;
  font-weight: 700;
}

/* =========================
   EVENTS
========================= */

.events-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.leave-event {
  overflow: hidden;
  padding: 6px 7px;
  border-left: 3px solid;
  border-radius: 5px;
  background: var(--bg-card-soft);
}

.leave-event strong,
.leave-event span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.leave-event strong {
  color: var(--text-primary);
  font-size: 10px;
}

.leave-event span {
  margin-top: 2px;
  color: var(--text-secondary);
  font-size: 9px;
}

.leave-event.vacation {
  border-left-color: var(--primary);
  background: var(--primary-soft);
}

.leave-event.sick {
  border-left-color: var(--green);
  background: var(--green-soft);
}

.leave-event.emergency {
  border-left-color: var(--red);
  background: var(--red-soft);
}

.leave-event.special {
  border-left-color: var(--purple);
  background: var(--purple-soft);
}

.leave-event.statutory {
  border-left-color: var(--orange);
  background: var(--orange-soft);
}

.leave-event.pending {
  border-top: 1px dashed var(--orange);
  border-right: 1px dashed var(--orange);
  border-bottom: 1px dashed var(--orange);
}

.more-events {
  padding: 3px 5px;
  border: 0;
  background: transparent;
  color: var(--primary);
  font-size: 9px;
  font-weight: 600;
  text-align: left;
}

/* =========================
   FOOTER
========================= */

.calendar-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 11px 16px;
  color: var(--text-muted);
  font-size: 10px;
}

@media (max-width: 1100px) {
  .calendar-card {
    overflow-x: auto;
  }
}

@media (max-width: 750px) {
  .calendar-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
