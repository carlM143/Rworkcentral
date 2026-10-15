<script setup lang="ts">
import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  Coffee,
  TimerReset,
  UserRound,
  X,
} from 'lucide-vue-next'

import type {
  TimeLogRecord,
} from '~/types/timekeeping'

defineProps<{
  open: boolean
  log: TimeLogRecord | null
}>()

const emit =
  defineEmits<{
    close: []
    correction: [
      log: TimeLogRecord,
    ]
    employee: [
      log: TimeLogRecord,
    ]
  }>()

const formatDate = (
  value: string,
) => {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    },
  ).format(
    new Date(
      `${value}T00:00:00`,
    ),
  )
}

const minutesLabel = (
  minutes: number,
) => {
  if (!minutes) {
    return '0 min'
  }

  return `${minutes} min`
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

const handleCorrection = () => {
  if (!log) {
    return
  }

  emit(
    'correction',
    log,
  )

  emit('close')
}

const handleEmployee = () => {
  if (!log) {
    return
  }

  emit(
    'employee',
    log,
  )

  emit('close')
}
</script>

<template>
  <Teleport to="body">

    <Transition name="details-modal">

      <div
        v-if="
          open &&
          log
        "
        class="modal-overlay"
        @click.self="
          emit('close')
        "
      >

        <article class="modal-card">

          <!-- HEADER -->

          <header class="modal-header">

            <div class="employee-heading">

              <div class="employee-icon">

                <UserRound
                  :size="19"
                />

              </div>

              <div>

                <span class="eyebrow">
                  TIME LOG DETAILS
                </span>

                <h2>
                  {{ log.employeeName }}
                </h2>

                <p>
                  {{ log.employeeNumber }}
                  ·
                  {{ log.department }}

                  <template
                    v-if="log.position"
                  >
                    · {{ log.position }}
                  </template>
                </p>

              </div>

            </div>

            <button
              type="button"
              class="close-button"
              @click="
                emit('close')
              "
            >
              <X :size="18" />
            </button>

          </header>

          <!-- BODY -->

          <div class="modal-body">

            <!-- BASIC INFO -->

            <section class="summary-grid">

              <div>

                <span>
                  ATTENDANCE DATE
                </span>

                <strong>
                  {{
                    formatDate(
                      log.date,
                    )
                  }}
                </strong>

              </div>

              <div>

                <span>
                  STATUS
                </span>

                <StatusBadge
                  :status="
                    log.status
                  "
                />

              </div>

            </section>

            <!-- SCHEDULE -->

            <section class="details-section">

              <div class="section-heading">

                <CalendarDays
                  :size="15"
                />

                <div>

                  <strong>
                    Work Schedule
                  </strong>

                  <span>
                    Employee schedule for this attendance date.
                  </span>

                </div>

              </div>

              <div class="schedule-card">

                <Clock3
                  :size="16"
                />

                <div>

                  <span>
                    SCHEDULE
                  </span>

                  <strong>
                    {{ log.schedule }}
                  </strong>

                </div>

              </div>

            </section>

            <!-- TIME ENTRIES -->

            <section class="details-section">

              <div class="section-heading">

                <Clock3
                  :size="15"
                />

                <div>

                  <strong>
                    Time Entries
                  </strong>

                  <span>
                    Recorded employee attendance punches.
                  </span>

                </div>

              </div>

              <div class="time-grid">

                <div class="time-card">

                  <span>
                    TIME IN
                  </span>

                  <strong>
                    {{
                      log.timeIn ||
                      'No Log'
                    }}
                  </strong>

                </div>

                <div class="time-card">

                  <span>
                    BREAK OUT
                  </span>

                  <strong>
                    {{
                      log.breakOut ||
                      'No Log'
                    }}
                  </strong>

                </div>

                <div class="time-card">

                  <span>
                    BREAK IN
                  </span>

                  <strong>
                    {{
                      log.breakIn ||
                      'No Log'
                    }}
                  </strong>

                </div>

                <div class="time-card">

                  <span>
                    TIME OUT
                  </span>

                  <strong>
                    {{
                      log.timeOut ||
                      'No Log'
                    }}
                  </strong>

                </div>

              </div>

            </section>

            <!-- ATTENDANCE COMPUTATION -->

            <section class="details-section">

              <div class="section-heading">

                <TimerReset
                  :size="15"
                />

                <div>

                  <strong>
                    Attendance Computation
                  </strong>

                  <span>
                    Late, undertime and total worked hours.
                  </span>

                </div>

              </div>

              <div class="metrics-grid">

                <div
                  class="metric-card"
                  :class="{
                    warning:
                      log.lateMinutes >
                      0,
                  }"
                >

                  <AlertTriangle
                    :size="15"
                  />

                  <div>

                    <span>
                      LATE
                    </span>

                    <strong>
                      {{
                        minutesLabel(
                          log.lateMinutes,
                        )
                      }}
                    </strong>

                  </div>

                </div>

                <div
                  class="metric-card"
                  :class="{
                    warning:
                      log.undertimeMinutes >
                      0,
                  }"
                >

                  <Clock3
                    :size="15"
                  />

                  <div>

                    <span>
                      UNDERTIME
                    </span>

                    <strong>
                      {{
                        minutesLabel(
                          log.undertimeMinutes,
                        )
                      }}
                    </strong>

                  </div>

                </div>

                <div class="metric-card worked">

                  <TimerReset
                    :size="15"
                  />

                  <div>

                    <span>
                      WORKED HOURS
                    </span>

                    <strong>
                      {{
                        hoursLabel(
                          log.hoursWorked,
                        )
                      }}
                    </strong>

                  </div>

                </div>

              </div>

            </section>

            <!-- BREAK SUMMARY -->

            <section class="details-section">

              <div class="section-heading">

                <Coffee
                  :size="15"
                />

                <div>

                  <strong>
                    Break Information
                  </strong>

                  <span>
                    Recorded employee break period.
                  </span>

                </div>

              </div>

              <div class="break-summary">

                <div>

                  <span>
                    Break Out
                  </span>

                  <strong>
                    {{
                      log.breakOut ||
                      'No Log'
                    }}
                  </strong>

                </div>

                <span class="arrow">
                  →
                </span>

                <div>

                  <span>
                    Break In
                  </span>

                  <strong>
                    {{
                      log.breakIn ||
                      'No Log'
                    }}
                  </strong>

                </div>

              </div>

            </section>

          </div>

          <!-- FOOTER -->

          <footer class="modal-footer">

            <AppButton
              variant="secondary"
              @click="
                emit('close')
              "
            >
              Close
            </AppButton>

            <AppButton
              variant="secondary"
              @click="
                handleEmployee
              "
            >
              View Employee
            </AppButton>

            <AppButton
              @click="
                handleCorrection
              "
            >
              Request Correction
            </AppButton>

          </footer>

        </article>

      </div>

    </Transition>

  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;

  z-index: 99990;

  inset: 0;

  display: flex;

  align-items: center;
  justify-content: center;

  padding: 22px;

  background:
    rgba(
      3,
      10,
      24,
      0.76
    );

  backdrop-filter:
    blur(4px);
}

.modal-card {
  width: 100%;

  max-width: 670px;

  max-height:
    calc(
      100vh - 44px
    );

  overflow-y: auto;

  border:
    1px solid
    var(--border);

  border-radius: 14px;

  background:
    var(--bg-card);

  box-shadow:
    0 25px 70px
    rgba(
      0,
      0,
      0,
      0.3
    );
}

/* HEADER */

.modal-header {
  position: sticky;

  z-index: 5;

  top: 0;

  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 14px;

  padding:
    16px 18px;

  border-bottom:
    1px solid
    var(--border);

  background:
    var(--bg-card);
}

.employee-heading {
  display: flex;

  align-items: center;

  gap: 10px;
}

.employee-icon {
  display: flex;

  width: 40px;
  height: 40px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.eyebrow {
  display: block;

  color:
    var(--primary);

  font-size: 7px;
  font-weight: 700;

  letter-spacing:
    0.4px;
}

.modal-header h2 {
  margin:
    2px 0 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

.modal-header p {
  margin:
    3px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

.close-button {
  display: flex;

  width: 31px;
  height: 31px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border:
    1px solid
    var(--border);

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);

  cursor: pointer;
}

.close-button:hover {
  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);
}

/* BODY */

.modal-body {
  padding:
    16px 18px;
}

/* SUMMARY */

.summary-grid {
  display: grid;

  grid-template-columns:
    minmax(
      0,
      1.4fr
    )
    minmax(
      0,
      0.6fr
    );

  gap: 8px;
}

.summary-grid > div {
  padding: 10px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.summary-grid span {
  display: block;

  margin-bottom: 4px;

  color:
    var(--text-muted);

  font-size: 7px;
  font-weight: 700;
}

.summary-grid strong {
  color:
    var(--text-primary);

  font-size: 8.5px;
}

/* SECTION */

.details-section {
  margin-top: 15px;
}

.section-heading {
  display: flex;

  align-items: center;

  gap: 7px;

  margin-bottom: 7px;

  color:
    var(--primary);
}

.section-heading strong,
.section-heading span {
  display: block;
}

.section-heading strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

.section-heading span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7px;
}

/* SCHEDULE */

.schedule-card {
  display: flex;

  align-items: center;

  gap: 9px;

  padding: 10px;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.schedule-card span,
.schedule-card strong {
  display: block;
}

.schedule-card span {
  color:
    var(--text-muted);

  font-size: 7px;
  font-weight: 700;
}

.schedule-card strong {
  margin-top: 2px;

  color:
    var(--text-primary);

  font-size: 9px;
}

/* TIME */

.time-grid {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(
        0,
        1fr
      )
    );

  gap: 7px;
}

.time-card {
  padding: 10px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.time-card span,
.time-card strong {
  display: block;
}

.time-card span {
  color:
    var(--text-muted);

  font-size: 7px;
  font-weight: 700;
}

.time-card strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 9px;
}

/* METRICS */

.metrics-grid {
  display: grid;

  grid-template-columns:
    repeat(
      3,
      minmax(
        0,
        1fr
      )
    );

  gap: 7px;
}

.metric-card {
  display: flex;

  align-items: center;

  gap: 8px;

  padding: 10px;

  border-radius: 8px;

  background:
    var(--green-soft);

  color:
    var(--green);
}

.metric-card.warning {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.metric-card.worked {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.metric-card span,
.metric-card strong {
  display: block;
}

.metric-card span {
  font-size: 7px;
  font-weight: 700;
}

.metric-card strong {
  margin-top: 2px;

  font-size: 10px;
}

/* BREAK */

.break-summary {
  display: grid;

  grid-template-columns:
    1fr
    auto
    1fr;

  align-items: center;

  gap: 10px;

  padding: 10px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.break-summary div:last-child {
  text-align: right;
}

.break-summary span,
.break-summary strong {
  display: block;
}

.break-summary span {
  color:
    var(--text-muted);

  font-size: 7px;
}

.break-summary strong {
  margin-top: 2px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.break-summary .arrow {
  color:
    var(--primary);

  font-size: 13px;
}

/* FOOTER */

.modal-footer {
  position: sticky;

  z-index: 5;

  bottom: 0;

  display: flex;

  align-items: center;
  justify-content: flex-end;

  gap: 7px;

  padding:
    13px 18px;

  border-top:
    1px solid
    var(--border);

  background:
    var(--bg-card);
}

/* TRANSITION */

.details-modal-enter-active,
.details-modal-leave-active {
  transition:
    opacity
    0.18s ease;
}

.details-modal-enter-from,
.details-modal-leave-to {
  opacity: 0;
}

/* MOBILE */

@media (
  max-width: 650px
) {
  .modal-overlay {
    padding: 12px;
  }

  .summary-grid,
  .time-grid,
  .metrics-grid,
  .break-summary {
    grid-template-columns:
      1fr;
  }

  .break-summary div:last-child {
    text-align: left;
  }

  .break-summary .arrow {
    transform:
      rotate(90deg);
  }

  .modal-footer {
    align-items: stretch;

    flex-direction:
      column-reverse;
  }
}
</style>