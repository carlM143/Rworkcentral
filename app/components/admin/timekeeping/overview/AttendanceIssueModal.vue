<script setup lang="ts">
import {
  AlertTriangle,
  Clock3,
  TimerReset,
  UserX,
  X,
} from 'lucide-vue-next'

import type {
  AttendanceRecord,
} from '~/types/timekeeping'

type AttendanceIssueType =
  | 'missing-time-out'
  | 'late'
  | 'absent'

const props =
  defineProps<{
    open: boolean
    issueType:
      AttendanceIssueType
    records:
      AttendanceRecord[]
  }>()

const emit =
  defineEmits<{
    close: []
    review: [
      type:
        AttendanceIssueType,
    ]
  }>()

const issueConfig =
  computed(() => {
    if (
      props.issueType ===
      'missing-time-out'
    ) {
      return {
        title:
          'Missing Time Out',

        description:
          'Employees with a recorded time-in but no corresponding time-out.',

        icon:
          Clock3,

        tone:
          'blue',

        action:
          'Review Missing Logs',
      }
    }

    if (
      props.issueType ===
      'late'
    ) {
      return {
        title:
          'Late Records',

        description:
          'Employees who recorded a late time-in for the selected date.',

        icon:
          TimerReset,

        tone:
          'orange',

        action:
          'Review Late Records',
      }
    }

    return {
      title:
        'Absence Records',

      description:
        'Employees with no attendance recorded for the selected date.',

      icon:
        UserX,

      tone:
        'red',

      action:
        'Review Absences',
    }
  })

const handleReview = () => {
  emit(
    'review',
    props.issueType,
  )

  emit('close')
}
</script>

<template>
  <Teleport to="body">

    <Transition name="modal-fade">

      <div
        v-if="open"
        class="modal-overlay"
        @click.self="emit('close')"
      >

        <div class="modal-card">

          <!-- HEADER -->

          <div class="modal-header">

            <div class="header-content">

              <div
                class="header-icon"
                :class="
                  issueConfig.tone
                "
              >

                <component
                  :is="
                    issueConfig.icon
                  "
                  :size="18"
                />

              </div>

              <div>

                <span class="eyebrow">
                  ATTENDANCE ISSUE
                </span>

                <h2>
                  {{ issueConfig.title }}
                </h2>

                <p>
                  {{ issueConfig.description }}
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

          <!-- SUMMARY -->

          <div class="issue-summary">

            <AlertTriangle
              :size="15"
            />

            <div>

              <span>
                RECORDS FOUND
              </span>

              <strong>
                {{ records.length }}
              </strong>

            </div>

          </div>

          <!-- RECORDS -->

          <div class="records-list">

            <div
              v-for="record in records"
              :key="record.id"
              class="record-row"
            >

              <div class="avatar">
                {{
                  record.employeeName
                    .charAt(0)
                }}
              </div>

              <div class="employee-info">

                <strong>
                  {{ record.employeeName }}
                </strong>

                <span>
                  {{ record.employeeNumber }}
                  ·
                  {{ record.department }}
                </span>

              </div>

              <div class="issue-value">

                <template
                  v-if="
                    issueType ===
                    'missing-time-out'
                  "
                >
                  <span>
                    Time In
                  </span>

                  <strong>
                    {{
                      record.timeIn ||
                      '—'
                    }}
                  </strong>
                </template>

                <template
                  v-else-if="
                    issueType ===
                    'late'
                  "
                >
                  <span>
                    Late
                  </span>

                  <strong class="orange">
                    {{
                      record.lateMinutes
                    }}
                    min
                  </strong>
                </template>

                <template v-else>
                  <span>
                    Status
                  </span>

                  <strong class="red">
                    Absent
                  </strong>
                </template>

              </div>

            </div>

            <div
              v-if="
                !records.length
              "
              class="empty-state"
            >

              <AlertTriangle
                :size="26"
              />

              <strong>
                No issue records found
              </strong>

              <span>
                There are currently no matching attendance records.
              </span>

            </div>

          </div>

          <!-- FOOTER -->

          <div class="modal-footer">

            <AppButton
              variant="secondary"
              @click="emit('close')"
            >
              Close
            </AppButton>

            <AppButton
              v-if="records.length"
              @click="handleReview"
            >
              {{ issueConfig.action }}
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

  max-height:
    calc(100vh - 48px);

  overflow-y: auto;

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

.header-content {
  display: flex;

  gap: 11px;
}

.header-icon {
  display: flex;

  width: 40px;
  height: 40px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;
}

.header-icon.blue {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.header-icon.orange {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.header-icon.red {
  background:
    var(--red-soft);

  color:
    var(--red);
}

.eyebrow {
  display: block;

  margin-bottom: 3px;

  color:
    var(--text-muted);

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
  max-width: 410px;

  margin:
    4px 0 0;

  color:
    var(--text-muted);

  font-size: 8.5px;

  line-height: 1.5;
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
}

.issue-summary {
  display: flex;

  align-items: center;

  gap: 9px;

  margin:
    15px 19px 0;

  padding: 10px;

  border-radius: 8px;

  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.issue-summary span,
.issue-summary strong {
  display: block;
}

.issue-summary span {
  font-size: 7px;
  font-weight: 700;
}

.issue-summary strong {
  margin-top: 1px;

  font-size: 13px;
}

.records-list {
  padding:
    8px 19px 17px;
}

.record-row {
  display: flex;

  align-items: center;

  gap: 9px;

  padding:
    10px 0;

  border-bottom:
    1px solid var(--border-soft);
}

.avatar {
  display: flex;

  width: 34px;
  height: 34px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);

  font-size: 11px;
  font-weight: 700;
}

.employee-info {
  min-width: 0;
  flex: 1;
}

.employee-info strong,
.employee-info span {
  display: block;
}

.employee-info strong {
  color:
    var(--text-primary);

  font-size: 9.5px;
}

.employee-info span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 8px;
}

.issue-value {
  text-align: right;
}

.issue-value span,
.issue-value strong {
  display: block;
}

.issue-value span {
  color:
    var(--text-muted);

  font-size: 7px;
}

.issue-value strong {
  margin-top: 2px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.issue-value strong.orange {
  color:
    var(--orange);
}

.issue-value strong.red {
  color:
    var(--red);
}

.empty-state {
  display: flex;

  min-height: 190px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 6px;

  color:
    var(--text-muted);
}

.empty-state strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.empty-state span {
  font-size: 8.5px;
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

  .modal-footer {
    align-items: stretch;

    flex-direction: column-reverse;
  }
}
</style>