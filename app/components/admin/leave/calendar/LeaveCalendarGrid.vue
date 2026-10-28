<script setup lang="ts">
import {
  ChevronLeft,
  ChevronRight,
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

const emit =
  defineEmits<{
    previous: []
    next: []
    today: []
  }>()

const leaveClass = (
  leaveType: string,
) => {
  if (
    leaveType ===
    'Vacation Leave'
  ) {
    return 'vacation'
  }

  if (
    leaveType ===
    'Sick Leave'
  ) {
    return 'sick'
  }

  if (
    leaveType ===
    'Emergency Leave'
  ) {
    return 'emergency'
  }

  if (
    leaveType ===
    'Special Leave'
  ) {
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

        <h3>
          Holiday Leave
        </h3>

        <p>
          View employee leaves and approved
          absences by calendar date.
        </p>

      </div>

      <div class="calendar-navigation">

        <button
          type="button"
          class="today-button"
          @click="
            emit('today')
          "
        >
          Today
        </button>

        <button
          type="button"
          class="nav-button"
          @click="
            emit('previous')
          "
        >
          <ChevronLeft
            :size="17"
          />
        </button>

        <strong class="month-label">
          {{ monthLabel }}
        </strong>

        <button
          type="button"
          class="nav-button"
          @click="
            emit('next')
          "
        >
          <ChevronRight
            :size="17"
          />
        </button>

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

    <!-- WEEK DAYS -->

    <div class="weekday-grid">

      <div>Sunday</div>
      <div>Monday</div>
      <div>Tuesday</div>
      <div>Wednesday</div>
      <div>Thursday</div>
      <div>Friday</div>
      <div>Saturday</div>

    </div>

    <!-- DAYS -->

    <div class="calendar-grid">

      <div
        v-for="
          day in days
        "
        :key="
          day.dateString
        "
        class="calendar-day"
        :class="{
          muted:
            !day.isCurrentMonth,
          today:
            day.isToday,
        }"
      >

        <div class="day-header">

          <span
            class="day-number"
            :class="{
              'today-number':
                day.isToday,
            }"
          >
            {{ day.dayNumber }}
          </span>

          <span
            v-if="
              day.events.length
            "
            class="event-count"
          >
            {{
              day.events.length
            }}
          </span>

        </div>

        <div class="events-list">

          <div
            v-for="
              event in day.events.slice(
                0,
                3,
              )
            "
            :key="
              `${event.id}-${day.dateString}`
            "
            class="leave-event"
            :class="[
              leaveClass(
                event.leaveType,
              ),
              {
                pending:
                  event.status ===
                  'Pending',
              },
            ]"
          >

            <strong>
              {{
                event.employeeName
              }}
            </strong>

            <span>
              {{
                event.leaveType
              }}
            </span>

          </div>

          <button
            v-if="
              day.events.length >
              3
            "
            type="button"
            class="more-events"
          >
            +
            {{
              day.events.length -
              3
            }}
            more
          </button>

        </div>

      </div>

    </div>

    <!-- FOOTER -->

    <div class="calendar-footer">

      <Clock3
        :size="14"
      />

      <span>
        Pending leave requests are displayed
        with a dashed border.
      </span>

    </div>

  </article>
</template>

<style scoped>
.calendar-card {
  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 12px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

/* =========================
   HEADER
========================= */

.calendar-header {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 20px;

  padding:
    16px 18px;

  border-bottom:
    1px solid var(--border-soft);
}

.calendar-header h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 16px;
}

.calendar-header p {
  margin:
    5px 0 0;

  color:
    var(--text-muted);

  font-size: 11px;
}

.calendar-navigation {
  display: flex;

  align-items: center;

  gap: 7px;
}

.today-button {
  height: 35px;

  padding:
    0 13px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);

  font-size: 11px;
  font-weight: 600;
}

.today-button:hover {
  border-color:
    var(--primary);

  color:
    var(--primary);
}

.nav-button {
  display: flex;

  width: 35px;
  height: 35px;

  align-items: center;
  justify-content: center;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);
}

.nav-button:hover {
  color:
    var(--primary);
}

.month-label {
  min-width: 150px;

  color:
    var(--text-primary);

  font-size: 12px;

  text-align: center;
}

/* =========================
   LEGEND
========================= */

.calendar-legend {
  display: flex;

  flex-wrap: wrap;

  gap: 14px;

  padding:
    11px 18px;

  border-bottom:
    1px solid var(--border-soft);

  background:
    var(--bg-card-soft);
}

.calendar-legend span {
  display: inline-flex;

  align-items: center;

  gap: 6px;

  color:
    var(--text-secondary);

  font-size: 10px;
}

.legend-dot {
  width: 8px;
  height: 8px;

  border-radius: 50%;
}

.legend-dot.vacation {
  background:
    var(--primary);
}

.legend-dot.sick {
  background:
    var(--green);
}

.legend-dot.emergency {
  background:
    var(--red);
}

.legend-dot.special {
  background:
    var(--purple);
}

.legend-dot.statutory {
  background:
    var(--orange);
}

/* =========================
   WEEKDAY
========================= */

.weekday-grid {
  display: grid;

  grid-template-columns:
    repeat(
      7,
      minmax(150px, 1fr)
    );

  border-bottom:
    1px solid var(--border-soft);
}

.weekday-grid div {
  padding:
    10px 12px;

  border-right:
    1px solid var(--border-soft);

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-size: 10px;
  font-weight: 700;

  text-align: center;

  text-transform: uppercase;
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

  grid-template-columns:
    repeat(
      7,
      minmax(150px, 1fr)
    );
}

.calendar-day {
  min-height: 145px;

  padding:
    10px;

  border-right:
    1px solid var(--border-soft);

  border-bottom:
    1px solid var(--border-soft);

  background:
    var(--bg-card);
}

.calendar-day:nth-child(
  7n
) {
  border-right: 0;
}

.calendar-day.muted {
  background:
    var(--bg-card-soft);

  opacity: 0.55;
}

.calendar-day.today {
  background:
    color-mix(
      in srgb,
      var(--primary-soft)
      55%,
      var(--bg-card)
    );
}

.day-header {
  display: flex;

  align-items: center;
  justify-content: space-between;

  margin-bottom: 8px;
}

.day-number {
  display: flex;

  width: 27px;
  height: 27px;

  align-items: center;
  justify-content: center;

  border-radius: 50%;

  color:
    var(--text-primary);

  font-size: 11px;
  font-weight: 700;
}

.today-number {
  background:
    var(--primary);

  color: white;
}

.event-count {
  display: flex;

  min-width: 20px;
  height: 20px;

  align-items: center;
  justify-content: center;

  padding:
    0 5px;

  border-radius: 20px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-muted);

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

  padding:
    6px 7px;

  border-left:
    3px solid;

  border-radius: 5px;

  background:
    var(--bg-card-soft);
}

.leave-event strong,
.leave-event span {
  display: block;

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;
}

.leave-event strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.leave-event span {
  margin-top: 2px;

  color:
    var(--text-secondary);

  font-size: 9px;
}

.leave-event.vacation {
  border-left-color:
    var(--primary);

  background:
    var(--primary-soft);
}

.leave-event.sick {
  border-left-color:
    var(--green);

  background:
    var(--green-soft);
}

.leave-event.emergency {
  border-left-color:
    var(--red);

  background:
    var(--red-soft);
}

.leave-event.special {
  border-left-color:
    var(--purple);

  background:
    var(--purple-soft);
}

.leave-event.statutory {
  border-left-color:
    var(--orange);

  background:
    var(--orange-soft);
}

.leave-event.pending {
  border-top:
    1px dashed
    var(--orange);

  border-right:
    1px dashed
    var(--orange);

  border-bottom:
    1px dashed
    var(--orange);
}

.more-events {
  padding:
    3px 5px;

  border: 0;

  background:
    transparent;

  color:
    var(--primary);

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

  padding:
    11px 16px;

  color:
    var(--text-muted);

  font-size: 10px;
}

@media (max-width: 1100px) {
  .calendar-card {
    overflow-x: auto;
  }
}

@media (max-width: 750px) {
  .calendar-header {
    align-items:
      flex-start;

    flex-direction:
      column;
  }
}
</style>
