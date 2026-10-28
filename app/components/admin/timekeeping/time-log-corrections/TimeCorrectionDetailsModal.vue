<script setup lang="ts">
import {
  X,
  Clock3,
  UserRound,
  CalendarDays,
  FileText,
  Paperclip,
  CircleCheck,
  CircleX,
  ShieldCheck,
} from 'lucide-vue-next'

import type {
  TimeLogCorrectionRequest,
} from '~/types/timeLogCorrection'

defineProps<{
  open: boolean

  request:
    TimeLogCorrectionRequest | null
}>()

const emit = defineEmits<{
  close: []

  approve: [
    request:
      TimeLogCorrectionRequest,
  ]

  reject: [
    request:
      TimeLogCorrectionRequest,
  ]
}>()

const formatDate = (
  value: string,
) => {
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
</script>

<template>
  <Teleport to="body">

    <Transition name="modal">

      <div
        v-if="
          open &&
          request
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
                <Clock3 :size="20" />
              </div>

              <div>
                <h2>
                  Time Log Correction
                </h2>

                <p>
                  {{
                    request.requestNumber
                  }}
                  ·
                  {{
                    request.employeeName
                  }}
                </p>
              </div>

            </div>

            <div class="header-right">

              <StatusBadge
                :status="
                  request.status
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

            <section class="info-section">

              <div class="section-title">
                <UserRound :size="16" />

                <h3>
                  Employee Information
                </h3>
              </div>

              <div class="details-grid">

                <div>
                  <span>
                    Employee
                  </span>

                  <strong>
                    {{
                      request.employeeName
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Employee ID
                  </span>

                  <strong>
                    {{
                      request.employeeNumber
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Department
                  </span>

                  <strong>
                    {{
                      request.department
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Position
                  </span>

                  <strong>
                    {{
                      request.position
                    }}
                  </strong>
                </div>

              </div>

            </section>

            <!-- DATE -->

            <section class="attendance-heading">

              <CalendarDays :size="16" />

              <div>
                <span>
                  Attendance Date
                </span>

                <strong>
                  {{
                    formatDate(
                      request.attendanceDate,
                    )
                  }}
                </strong>
              </div>

              <div class="type">
                {{
                  request.correctionType
                }}
              </div>

            </section>

            <!-- COMPARISON -->

            <div class="comparison-grid">

              <section class="comparison-card original">

                <div class="comparison-heading">
                  <Clock3 :size="17" />

                  <div>
                    <h3>
                      Original Attendance
                    </h3>

                    <p>
                      Current recorded time log.
                    </p>
                  </div>
                </div>

                <div class="time-grid">

                  <div>
                    <span>
                      Time In
                    </span>

                    <strong>
                      {{
                        request.originalTimeIn ||
                        'No log'
                      }}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Time Out
                    </span>

                    <strong>
                      {{
                        request.originalTimeOut ||
                        'No log'
                      }}
                    </strong>
                  </div>

                </div>

              </section>

              <section class="comparison-card requested">

                <div class="comparison-heading">
                  <Clock3 :size="17" />

                  <div>
                    <h3>
                      Requested Correction
                    </h3>

                    <p>
                      Employee requested attendance.
                    </p>
                  </div>
                </div>

                <div class="time-grid">

                  <div>
                    <span>
                      Time In
                    </span>

                    <strong>
                      {{
                        request.requestedTimeIn ||
                        '—'
                      }}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Time Out
                    </span>

                    <strong>
                      {{
                        request.requestedTimeOut ||
                        '—'
                      }}
                    </strong>
                  </div>

                </div>

              </section>

            </div>

            <!-- REASON -->

            <section class="reason-section">

              <div class="section-title">
                <FileText :size="16" />

                <h3>
                  Reason for Correction
                </h3>
              </div>

              <p>
                {{ request.reason }}
              </p>

              <div
                v-if="
                  request.attachment
                "
                class="attachment"
              >
                <Paperclip :size="15" />

                <div>
                  <span>
                    Attachment
                  </span>

                  <strong>
                    {{
                      request.attachment.name
                    }}
                  </strong>
                </div>
              </div>

            </section>

            <!-- REQUEST DETAILS -->

            <section class="review-section">

              <div class="section-title">
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
                      request.requestedBy
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
                        request.requestedAt,
                      )
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Priority
                  </span>

                  <strong
                    :class="{
                      urgent:
                        request.priority ===
                        'Urgent',
                    }"
                  >
                    {{
                      request.priority
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Reviewed By
                  </span>

                  <strong>
                    {{
                      request.reviewedBy ||
                      'Not reviewed'
                    }}
                  </strong>
                </div>

              </div>

              <div
                v-if="
                  request.reviewNotes
                "
                class="review-note"
              >
                <span>
                  Review Notes
                </span>

                <p>
                  {{
                    request.reviewNotes
                  }}
                </p>
              </div>

            </section>

          </div>

          <!-- FOOTER -->

          <div class="modal-footer">

            <span>
              {{
                request.status ===
                'Pending'
                  ? 'Review the requested changes before approving.'
                  : `Request ${request.status.toLowerCase()}`
              }}
            </span>

            <div class="footer-actions">

              <AppButton
                variant="secondary"
                @click="
                  emit('close')
                "
              >
                Close
              </AppButton>

              <template
                v-if="
                  request.status ===
                  'Pending'
                "
              >

                <button
                  type="button"
                  class="reject-button"
                  @click="
                    emit(
                      'reject',
                      request,
                    )
                  "
                >
                  <CircleX :size="15" />

                  Reject
                </button>

                <AppButton
                  :icon="CircleCheck"
                  @click="
                    emit(
                      'approve',
                      request,
                    )
                  "
                >
                  Approve Request
                </AppButton>

              </template>

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
  max-width: 880px;

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
    var(--primary-soft);

  color:
    var(--primary);
}

.modal-header h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 16px;
  font-weight: 700;
}

.modal-header p {
  margin:
    4px 0 0;

  color:
    var(--text-muted);

  font-size: 10px;
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

  cursor: pointer;
}

.modal-body {
  flex: 1;

  overflow-y: auto;

  padding:
    17px 18px;
}

.info-section,
.reason-section,
.review-section {
  padding: 14px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 9px;

  background:
    var(--bg-card-soft);
}

.section-title {
  display: flex;

  align-items: center;

  gap: 7px;

  margin-bottom: 12px;

  color:
    var(--primary);
}

.section-title h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 12px;
}

.details-grid,
.review-grid {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.details-grid > div,
.review-grid > div {
  padding: 10px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.details-grid span,
.details-grid strong,
.review-grid span,
.review-grid strong {
  display: block;
}

.details-grid span,
.review-grid span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.details-grid strong,
.review-grid strong {
  margin-top: 4px;

  color:
    var(--text-primary);

  font-size: 10px;
}

.attendance-heading {
  display: flex;

  align-items: center;

  gap: 9px;

  margin:
    13px 0;

  padding:
    11px 13px;

  border:
    1px solid var(--border);

  border-radius: 9px;

  background:
    var(--bg-card);
}

.attendance-heading > svg {
  color:
    var(--primary);
}

.attendance-heading div:nth-child(2) {
  flex: 1;
}

.attendance-heading span,
.attendance-heading strong {
  display: block;
}

.attendance-heading span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.attendance-heading strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 10px;
}

.type {
  padding:
    5px 9px;

  border-radius: 20px;

  background:
    var(--purple-soft);

  color:
    var(--purple);

  font-size: 9px;
  font-weight: 650;
}

.comparison-grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 10px;

  margin-bottom: 13px;
}

.comparison-card {
  padding: 14px;

  border:
    1px solid var(--border);

  border-radius: 9px;

  background:
    var(--bg-card);
}

.comparison-card.requested {
  border-color:
    var(--primary);

  background:
    var(--primary-soft);
}

.comparison-heading {
  display: flex;

  align-items: center;

  gap: 8px;

  margin-bottom: 12px;
}

.comparison-heading svg {
  color:
    var(--primary);
}

.comparison-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 11px;
}

.comparison-heading p {
  margin:
    3px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

.time-grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.time-grid > div {
  padding: 10px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.time-grid span,
.time-grid strong {
  display: block;
}

.time-grid span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.time-grid strong {
  margin-top: 4px;

  color:
    var(--text-primary);

  font-size: 12px;
}

.requested
.time-grid strong {
  color:
    var(--primary);
}

.reason-section {
  margin-bottom: 13px;
}

.reason-section > p {
  margin: 0;

  color:
    var(--text-secondary);

  font-size: 10px;

  line-height: 1.6;
}

.attachment {
  display: flex;

  align-items: center;

  gap: 8px;

  margin-top: 11px;

  padding: 9px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card);

  color:
    var(--primary);
}

.attachment span,
.attachment strong {
  display: block;
}

.attachment span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.attachment strong {
  margin-top: 2px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.urgent {
  color:
    var(--red) !important;
}

.review-note {
  margin-top: 10px;

  padding: 10px;

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

  font-size: 9px;
}

.footer-actions {
  display: flex;

  gap: 8px;
}

.reject-button {
  display: inline-flex;

  min-height: 36px;

  align-items: center;

  gap: 6px;

  padding:
    0 13px;

  border:
    1px solid var(--red);

  border-radius: 7px;

  background:
    var(--red-soft);

  color:
    var(--red);

  font-family: inherit;

  font-size: 10px;
  font-weight: 600;

  cursor: pointer;
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

@media (max-width: 750px) {
  .details-grid,
  .review-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }

  .comparison-grid {
    grid-template-columns:
      1fr;
  }
}

@media (max-width: 520px) {
  .details-grid,
  .review-grid,
  .time-grid {
    grid-template-columns:
      1fr;
  }

  .modal-footer {
    align-items: stretch;

    flex-direction: column;
  }

  .footer-actions {
    justify-content:
      flex-end;
  }
}
</style>