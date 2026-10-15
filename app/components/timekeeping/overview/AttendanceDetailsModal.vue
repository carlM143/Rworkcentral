<script setup lang="ts">
import {
  CalendarDays,
  Clock3,
  FilePenLine,
  History,
  UserRound,
  X,
} from 'lucide-vue-next'

import type {
  AttendanceRecord,
} from '~/types/timekeeping'

const props =
  defineProps<{
    open: boolean
    record:
      AttendanceRecord | null
  }>()

const emit =
  defineEmits<{
    close: []
    viewLogs: [
      record:
        AttendanceRecord,
    ]
    correction: [
      record:
        AttendanceRecord,
    ]
  }>()

const formatDate = (
  value?: string,
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
  value: number,
) => {
  if (!value) {
    return 'None'
  }

  return `${value} minutes`
}

const handleViewLogs = () => {
  if (!props.record) {
    return
  }

  emit(
    'viewLogs',
    props.record,
  )

  emit('close')
}

const handleCorrection = () => {
  if (!props.record) {
    return
  }

  emit(
    'correction',
    props.record,
  )

  emit('close')
}
</script>

<template>
  <Teleport to="body">

    <Transition name="modal-fade">

      <div
        v-if="
          open &&
          record
        "
        class="modal-overlay"
        @click.self="emit('close')"
      >

        <div class="modal-card">

          <!-- HEADER -->

          <div class="modal-header">

            <div class="employee-header">

              <div class="employee-avatar">

                <UserRound
                  :size="20"
                />

              </div>

              <div>

                <span class="eyebrow">
                  ATTENDANCE DETAILS
                </span>

                <h2>
                  {{ record.employeeName }}
                </h2>

                <p>
                  {{ record.employeeNumber }}
                  ·
                  {{ record.department }}
                  ·
                  {{ record.position }}
                </p>

              </div>

            </div>

            <button
              type="button"
              class="close-button"
              @click="emit('close')"
            >
              <X :size="18" />
            </button>

          </div>

          <!-- BODY -->

          <div class="modal-body">

            <div class="date-row">

              <CalendarDays
                :size="15"
              />

              <strong>
                {{
                  formatDate(
                    record.date,
                  )
                }}
              </strong>

              <StatusBadge
                :status="record.status"
              />

            </div>

            <div class="schedule-card">

              <div class="schedule-icon">

                <Clock3
                  :size="18"
                />

              </div>

              <div>

                <span>
                  WORK SCHEDULE
                </span>

                <strong>
                  {{ record.schedule }}
                </strong>

              </div>

            </div>

            <!-- TIME -->

            <div class="metrics-grid">

              <div class="metric-card">

                <span>
                  TIME IN
                </span>

                <strong
                  :class="{
                    warning:
                      record.lateMinutes > 0,
                  }"
                >
                  {{
                    record.timeIn ||
                    'No Entry'
                  }}
                </strong>

              </div>

              <div class="metric-card">

                <span>
                  TIME OUT
                </span>

                <strong
                  :class="{
                    danger:
                      record.timeIn &&
                      !record.timeOut,
                  }"
                >
                  {{
                    record.timeOut ||
                    'No Entry'
                  }}
                </strong>

              </div>

              <div class="metric-card">

                <span>
                  LATE
                </span>

                <strong
                  :class="{
                    warning:
                      record.lateMinutes > 0,
                  }"
                >
                  {{
                    minutesLabel(
                      record.lateMinutes,
                    )
                  }}
                </strong>

              </div>

              <div class="metric-card">

                <span>
                  UNDERTIME
                </span>

                <strong
                  :class="{
                    warning:
                      record.undertimeMinutes > 0,
                  }"
                >
                  {{
                    minutesLabel(
                      record.undertimeMinutes,
                    )
                  }}
                </strong>

              </div>

            </div>

            <!-- REVIEW -->

            <div class="review-box">

              <div class="review-icon">

                <History
                  :size="16"
                />

              </div>

              <div>

                <strong>
                  Attendance Review
                </strong>

                <p
                  v-if="
                    record.status ===
                    'Absent'
                  "
                >
                  No attendance was recorded for this employee on the selected date.
                </p>

                <p
                  v-else-if="
                    record.timeIn &&
                    !record.timeOut
                  "
                >
                  This record has a time-in but no corresponding time-out.
                </p>

                <p
                  v-else-if="
                    record.lateMinutes > 0 ||
                    record.undertimeMinutes > 0
                  "
                >
                  This attendance record contains a late or undertime occurrence.
                </p>

                <p v-else>
                  No attendance issues detected for this employee.
                </p>

              </div>

            </div>

          </div>

          <!-- FOOTER -->

          <div class="modal-footer">
            <AppButton
                variant="secondary"
                :icon="History"
                @click="handleViewLogs"
                >
                View Full Time Logs
                </AppButton>

            <AppButton
              :icon="FilePenLine"
              @click="handleCorrection"
            >
              File Correction
            </AppButton>

          </div>

        </div>

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

  padding: 24px;

  background:
    rgba(3, 10, 24, 0.7);

  backdrop-filter:
    blur(3px);
}

.modal-card {
  width: 100%;
  max-width: 610px;

  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 14px;

  background:
    var(--bg-card);

  box-shadow:
    0 25px 70px
    rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;

  align-items: flex-start;
  justify-content: space-between;

  gap: 15px;

  padding:
    18px 19px;

  border-bottom:
    1px solid var(--border);
}

.employee-header {
  display: flex;

  align-items: center;

  gap: 11px;
}

.employee-avatar {
  display: flex;

  width: 43px;
  height: 43px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.eyebrow {
  display: block;

  margin-bottom: 3px;

  color:
    var(--primary);

  font-size: 7.5px;
  font-weight: 700;

  letter-spacing:
    0.7px;
}

.modal-header h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 15px;
}

.modal-header p {
  margin:
    3px 0 0;

  color:
    var(--text-muted);

  font-size: 9px;
}

.close-button {
  display: flex;

  width: 32px;
  height: 32px;

  align-items: center;
  justify-content: center;

  border: 0;
  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-muted);

  cursor: pointer;
}

.close-button:hover {
  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);
}

.modal-body {
  padding:
    18px 19px;
}

.date-row {
  display: flex;

  align-items: center;

  gap: 7px;

  color:
    var(--text-secondary);
}

.date-row strong {
  margin-right: auto;

  color:
    var(--text-primary);

  font-size: 10px;
}

.schedule-card {
  display: flex;

  align-items: center;

  gap: 10px;

  margin-top: 13px;

  padding: 12px;

  border:
    1px solid var(--border);

  border-radius: 9px;

  background:
    var(--bg-card-soft);
}

.schedule-icon {
  display: flex;

  width: 36px;
  height: 36px;

  align-items: center;
  justify-content: center;

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

  font-size: 7.5px;
  font-weight: 700;
}

.schedule-card strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 10.5px;
}

.metrics-grid {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 8px;

  margin-top: 13px;
}

.metric-card {
  padding: 11px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.metric-card span,
.metric-card strong {
  display: block;
}

.metric-card span {
  color:
    var(--text-muted);

  font-size: 7.5px;
  font-weight: 700;
}

.metric-card strong {
  margin-top: 4px;

  color:
    var(--text-primary);

  font-size: 10px;
}

.metric-card strong.warning {
  color:
    var(--orange);
}

.metric-card strong.danger {
  color:
    var(--red);
}

.review-box {
  display: flex;

  gap: 10px;

  margin-top: 13px;

  padding: 12px;

  border:
    1px solid var(--border);

  border-radius: 9px;
}

.review-icon {
  display: flex;

  width: 33px;
  height: 33px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.review-box strong {
  color:
    var(--text-primary);

  font-size: 9.5px;
}

.review-box p {
  margin:
    4px 0 0;

  color:
    var(--text-muted);

  font-size: 8.5px;

  line-height: 1.5;
}

.modal-footer {
  display: flex;

  align-items: center;
  justify-content: flex-end;

  gap: 8px;

  padding:
    14px 19px;

  border-top:
    1px solid var(--border);

  background:
    var(--bg-card-soft);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition:
    opacity 0.18s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .modal-overlay {
    padding: 12px;
  }

  .metrics-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }

  .modal-footer {
    align-items: stretch;

    flex-direction: column;
  }
}
</style>