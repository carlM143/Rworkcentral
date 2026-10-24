<script setup lang="ts">
import {
  X,
  TimerReset,
  UserRound,
  CalendarDays,
  Clock3,
  FileText,
  Save,
  ShieldCheck,
} from 'lucide-vue-next'

import type {
  LateAdjustmentFormData,
  LateAdjustmentRecord,
} from '~/types/lateAdjustment'

const props = defineProps<{
  open: boolean

  adjustment:
    LateAdjustmentRecord | null

  mode:
    'view' | 'adjust'
}>()

const emit = defineEmits<{
  close: []

  save: [
    payload: {
      id: number

      data:
        LateAdjustmentFormData
    },
  ]
}>()

const {
  error,
} = useToast()

/* =========================================================
   FORM
========================================================= */

const form =
  reactive<
    LateAdjustmentFormData
  >({
    adjustedLateMinutes: 0,

    reason: '',
  })

/* =========================================================
   LOAD
========================================================= */

const loadAdjustment =
  () => {
    if (!props.adjustment) {
      return
    }

    form.adjustedLateMinutes =
      props.adjustment
        .adjustedLateMinutes

    form.reason =
      props.adjustment.reason
  }

watch(
  [
    () => props.open,
    () =>
      props.adjustment?.id,
    () => props.mode,
  ],
  () => {
    if (
      props.open &&
      props.adjustment
    ) {
      loadAdjustment()
    }
  },
  {
    immediate: true,
  },
)

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (
  value?: string,
) => {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
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

const formatDateTime = (
  value?: string,
) => {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    },
  ).format(
    new Date(value),
  )
}

const minutesRemoved =
  computed(() => {
    if (!props.adjustment) {
      return 0
    }

    return Math.max(
      0,
      props.adjustment
        .originalLateMinutes -
        Number(
          form.adjustedLateMinutes,
        ),
    )
  })

/* =========================================================
   SAVE
========================================================= */

const handleSave = () => {
  if (!props.adjustment) {
    return
  }

  const minutes =
    Number(
      form.adjustedLateMinutes,
    )

  if (
    Number.isNaN(minutes) ||
    minutes < 0
  ) {
    error(
      'Invalid Minutes',
      'Adjusted late minutes cannot be less than zero.',
    )

    return
  }

  if (
    minutes >
    props.adjustment
      .originalLateMinutes
  ) {
    error(
      'Invalid Adjustment',
      'Adjusted late minutes cannot be greater than the original late minutes.',
    )

    return
  }

  if (
    !form.reason.trim()
  ) {
    error(
      'Reason Required',
      'Please provide a reason for this late adjustment.',
    )

    return
  }

  emit('save', {
    id:
      props.adjustment.id,

    data: {
      adjustedLateMinutes:
        minutes,

      reason:
        form.reason.trim(),
    },
  })
}
</script>

<template>
  <Teleport to="body">

    <Transition name="modal">

      <div
        v-if="
          open &&
          adjustment
        "
        class="modal-backdrop"
        @click.self="
          emit('close')
        "
      >

        <div class="modal-card">

          <!-- HEADER -->

          <div class="modal-header">

            <div class="header-left">

              <div class="header-icon">
                <TimerReset :size="20" />
              </div>

              <div>
                <h2>
                  {{
                    mode === 'view'
                      ? 'Late Adjustment Details'
                      : 'Adjust Late Minutes'
                  }}
                </h2>

                <p>
                  {{
                    adjustment.employeeName
                  }}
                  ·
                  {{
                    adjustment.employeeNumber
                  }}
                </p>
              </div>

            </div>

            <div class="header-right">

              <StatusBadge
                :status="
                  adjustment.status
                "
              />

              <button
                type="button"
                class="close-button"
                @click="
                  emit('close')
                "
              >
                <X :size="18" />
              </button>

            </div>

          </div>

          <!-- BODY -->

          <div class="modal-body">

            <!-- EMPLOYEE -->

            <section class="section-card">

              <div class="section-heading">

                <UserRound :size="16" />

                <h3>
                  Employee Information
                </h3>

              </div>

              <div class="info-grid">

                <div>
                  <span>Employee</span>

                  <strong>
                    {{
                      adjustment.employeeName
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Employee ID
                  </span>

                  <strong>
                    {{
                      adjustment.employeeNumber
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Department
                  </span>

                  <strong>
                    {{
                      adjustment.department
                    }}
                  </strong>
                </div>

                <div>
                  <span>Position</span>

                  <strong>
                    {{
                      adjustment.position
                    }}
                  </strong>
                </div>

              </div>

            </section>

            <!-- ATTENDANCE -->

            <section class="section-card">

              <div class="section-heading">

                <CalendarDays :size="16" />

                <h3>
                  Attendance Record
                </h3>

              </div>

              <div class="attendance-date">

                <CalendarDays :size="15" />

                <div>
                  <span>
                    Attendance Date
                  </span>

                  <strong>
                    {{
                      formatDate(
                        adjustment.attendanceDate,
                      )
                    }}
                  </strong>
                </div>

              </div>

              <div class="attendance-grid">

                <div>
                  <span>Schedule</span>

                  <strong>
                    {{
                      adjustment.schedule
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Actual Time In
                  </span>

                  <strong class="orange">
                    {{
                      adjustment.actualTimeIn
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Original Late
                  </span>

                  <strong class="red">
                    {{
                      adjustment.originalLateMinutes
                    }}
                    min
                  </strong>
                </div>

                <div>
                  <span>
                    Adjusted Late
                  </span>

                  <strong class="green">
                    {{
                      adjustment.adjustedLateMinutes
                    }}
                    min
                  </strong>
                </div>

              </div>

            </section>

            <!-- ADJUSTMENT -->

            <section class="section-card">

              <div class="section-heading">

                <Clock3 :size="16" />

                <h3>
                  Late Adjustment
                </h3>

              </div>

              <template
                v-if="
                  mode === 'adjust'
                "
              >

                <div class="adjustment-summary">

                  <div>
                    <span>
                      Current Late
                    </span>

                    <strong class="red">
                      {{
                        adjustment.originalLateMinutes
                      }}
                      minutes
                    </strong>
                  </div>

                  <div>
                    <span>
                      Adjusted Late
                    </span>

                    <strong class="green">
                      {{
                        form.adjustedLateMinutes
                      }}
                      minutes
                    </strong>
                  </div>

                  <div>
                    <span>
                      Minutes Removed
                    </span>

                    <strong class="blue">
                      {{
                        minutesRemoved
                      }}
                      minutes
                    </strong>
                  </div>

                </div>

                <div class="field-group">

                  <label>
                    Adjusted Late Minutes
                    <span>*</span>
                  </label>

                  <div class="number-input">

                    <input
                      v-model.number="
                        form.adjustedLateMinutes
                      "
                      type="number"
                      min="0"
                      :max="
                        adjustment.originalLateMinutes
                      "
                    >

                    <span>
                      minutes
                    </span>

                  </div>

                  <small>
                    Maximum:
                    {{
                      adjustment.originalLateMinutes
                    }}
                    minutes
                  </small>

                </div>

                <div class="field-group">

                  <label>
                    Reason for Adjustment
                    <span>*</span>
                  </label>

                  <textarea
                    v-model="
                      form.reason
                    "
                    rows="4"
                    placeholder="Explain why the late minutes should be adjusted..."
                  />

                </div>

              </template>

              <template v-else>

                <div class="view-adjustment">

                  <div>
                    <span>
                      Original Late
                    </span>

                    <strong class="red">
                      {{
                        adjustment.originalLateMinutes
                      }}
                      minutes
                    </strong>
                  </div>

                  <div>
                    <span>
                      Adjusted Late
                    </span>

                    <strong class="green">
                      {{
                        adjustment.adjustedLateMinutes
                      }}
                      minutes
                    </strong>
                  </div>

                  <div>
                    <span>
                      Minutes Removed
                    </span>

                    <strong class="blue">
                      {{
                        Math.max(
                          0,
                          adjustment.originalLateMinutes -
                            adjustment.adjustedLateMinutes,
                        )
                      }}
                      minutes
                    </strong>
                  </div>

                </div>

                <div class="reason-box">

                  <FileText :size="15" />

                  <div>
                    <span>
                      Adjustment Reason
                    </span>

                    <p>
                      {{
                        adjustment.reason
                      }}
                    </p>
                  </div>

                </div>

              </template>

            </section>

            <!-- REVIEW -->

            <section
              class="section-card"
            >

              <div class="section-heading">

                <ShieldCheck :size="16" />

                <h3>
                  Request Information
                </h3>

              </div>

              <div class="review-grid">

                <div>
                  <span>
                    Requested By
                  </span>

                  <strong>
                    {{
                      adjustment.requestedBy
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Requested At
                  </span>

                  <strong>
                    {{
                      formatDateTime(
                        adjustment.requestedAt,
                      )
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Reviewed By
                  </span>

                  <strong>
                    {{
                      adjustment.reviewedBy ||
                      'Not reviewed'
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Reviewed At
                  </span>

                  <strong>
                    {{
                      formatDateTime(
                        adjustment.reviewedAt,
                      )
                    }}
                  </strong>
                </div>

              </div>

              <div
                v-if="
                  adjustment.reviewNotes
                "
                class="review-note"
              >
                <span>
                  Review Notes
                </span>

                <p>
                  {{
                    adjustment.reviewNotes
                  }}
                </p>
              </div>

            </section>

          </div>

          <!-- FOOTER -->

          <div class="modal-footer">

            <span>
              Time Log ID:
              #{{ adjustment.timeLogId }}
            </span>

            <div class="footer-actions">

              <AppButton
                variant="secondary"
                @click="
                  emit('close')
                "
              >
                {{
                  mode === 'view'
                    ? 'Close'
                    : 'Cancel'
                }}
              </AppButton>

              <AppButton
                v-if="
                  mode === 'adjust'
                "
                :icon="Save"
                @click="
                  handleSave
                "
              >
                Save Adjustment
              </AppButton>

            </div>

          </div>

        </div>

      </div>

    </Transition>

  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;

  z-index: 9999;

  display: flex;

  align-items: center;
  justify-content: center;

  padding: 20px;

  background:
    rgba(3, 8, 18, 0.76);

  backdrop-filter:
    blur(3px);
}

.modal-card {
  display: flex;

  width: 100%;
  max-width: 850px;

  max-height:
    calc(100vh - 40px);

  flex-direction: column;

  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 13px;

  background:
    var(--bg-card);

  box-shadow:
    0 24px 80px
    rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;

  flex-shrink: 0;

  align-items: center;
  justify-content: space-between;

  gap: 15px;

  padding:
    16px 18px;

  border-bottom:
    1px solid
    var(--border-soft);
}

.header-left,
.header-right {
  display: flex;

  align-items: center;

  gap: 10px;
}

.header-icon {
  display: flex;

  width: 42px;
  height: 42px;

  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.modal-header h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 16px;
}

.modal-header p {
  margin:
    4px 0 0;

  color:
    var(--text-muted);

  font-size: 9px;
}

.close-button {
  display: flex;

  width: 34px;
  height: 34px;

  align-items: center;
  justify-content: center;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);
}

.modal-body {
  flex: 1;

  overflow-y: auto;

  padding:
    16px 18px;
}

.section-card {
  padding: 14px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 9px;

  background:
    var(--bg-card-soft);
}

.section-card +
.section-card {
  margin-top: 11px;
}

.section-heading {
  display: flex;

  align-items: center;

  gap: 7px;

  margin-bottom: 12px;

  color:
    var(--primary);
}

.section-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 11px;
}

.info-grid,
.attendance-grid,
.review-grid,
.view-adjustment,
.adjustment-summary {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.view-adjustment,
.adjustment-summary {
  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );
}

.info-grid > div,
.attendance-grid > div,
.review-grid > div,
.view-adjustment > div,
.adjustment-summary > div {
  padding: 10px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.info-grid span,
.attendance-grid span,
.review-grid span,
.view-adjustment span,
.adjustment-summary span {
  display: block;

  color:
    var(--text-muted);

  font-size: 8px;
}

.info-grid strong,
.attendance-grid strong,
.review-grid strong,
.view-adjustment strong,
.adjustment-summary strong {
  display: block;

  margin-top: 4px;

  color:
    var(--text-primary);

  font-size: 10px;
}

.red {
  color:
    var(--red) !important;
}

.green {
  color:
    var(--green) !important;
}

.orange {
  color:
    var(--orange) !important;
}

.blue {
  color:
    var(--primary) !important;
}

.attendance-date {
  display: flex;

  align-items: center;

  gap: 8px;

  margin-bottom: 8px;

  padding: 9px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card);

  color:
    var(--primary);
}

.attendance-date div {
  flex: 1;
}

.attendance-date span,
.attendance-date strong {
  display: block;
}

.attendance-date span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.attendance-date strong {
  margin-top: 2px;

  color:
    var(--text-primary);

  font-size: 10px;
}

.field-group {
  margin-top: 12px;
}

.field-group label {
  display: block;

  margin-bottom: 6px;

  color:
    var(--text-primary);

  font-size: 10px;
  font-weight: 600;
}

.field-group label span {
  color:
    var(--red);
}

.field-group small {
  display: block;

  margin-top: 5px;

  color:
    var(--text-muted);

  font-size: 8px;
}

.number-input {
  display: flex;

  height: 39px;

  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.number-input input {
  min-width: 0;

  flex: 1;

  padding:
    0 10px;

  border: 0;
  outline: none;

  background:
    transparent;

  color:
    var(--text-primary);
}

.number-input span {
  display: flex;

  align-items: center;

  padding:
    0 10px;

  border-left:
    1px solid
    var(--border-soft);

  color:
    var(--text-muted);

  font-size: 9px;
}

textarea {
  width: 100%;

  min-height: 90px;

  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  outline: none;

  background:
    var(--bg-card);

  color:
    var(--text-primary);

  font-family: inherit;

  font-size: 10px;

  resize: vertical;
}

textarea:focus {
  border-color:
    var(--primary);
}

.reason-box {
  display: flex;

  gap: 8px;

  margin-top: 10px;

  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card);

  color:
    var(--primary);
}

.reason-box div {
  flex: 1;
}

.reason-box span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.reason-box p {
  margin:
    4px 0 0;

  color:
    var(--text-secondary);

  font-size: 9px;

  line-height: 1.55;
}

.review-note {
  margin-top: 9px;

  padding: 9px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.review-note span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.review-note p {
  margin:
    4px 0 0;

  color:
    var(--text-secondary);

  font-size: 9px;
}

.modal-footer {
  display: flex;

  flex-shrink: 0;

  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding:
    13px 18px;

  border-top:
    1px solid
    var(--border-soft);

  background:
    var(--bg-card-soft);
}

.modal-footer > span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.footer-actions {
  display: flex;

  gap: 8px;
}

.modal-enter-active,
.modal-leave-active {
  transition:
    opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 700px) {
  .info-grid,
  .attendance-grid,
  .review-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }

  .view-adjustment,
  .adjustment-summary {
    grid-template-columns:
      1fr;
  }
}
</style>