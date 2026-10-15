<script setup lang="ts">
import {
  X,
  RefreshCw,
  UserRound,
  CalendarDays,
  FileText,
  Paperclip,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from 'lucide-vue-next'

import type {
  SwitchRestDayRecord,
} from '~/types/switchRestDay'

defineProps<{
  open: boolean

  record:
    SwitchRestDayRecord | null
}>()

const emit = defineEmits<{
  close: []
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
          record
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
                <RefreshCw :size="20" />
              </div>

              <div>

                <h2>
                  Rest Day Switch Request
                </h2>

                <p>
                  {{
                    record.requestNumber
                  }}
                  ·
                  {{
                    record.employeeName
                  }}
                </p>

              </div>

            </div>

            <div class="header-right">

              <StatusBadge
                :status="
                  record.status
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

                  <span>
                    Employee
                  </span>

                  <strong>
                    {{
                      record.employeeName
                    }}
                  </strong>

                </div>

                <div>

                  <span>
                    Employee ID
                  </span>

                  <strong>
                    {{
                      record.employeeNumber
                    }}
                  </strong>

                </div>

                <div>

                  <span>
                    Department
                  </span>

                  <strong>
                    {{
                      record.department
                    }}
                  </strong>

                </div>

                <div>

                  <span>
                    Position
                  </span>

                  <strong>
                    {{
                      record.position
                    }}
                  </strong>

                </div>

              </div>

            </section>

            <!-- SCHEDULE -->

            <section class="section-card">

              <div class="section-heading">

                <CalendarDays :size="16" />

                <h3>
                  Schedule Information
                </h3>

              </div>

              <div class="schedule-box">

                <div class="schedule-row">

                  <span>
                    Current Work Schedule
                  </span>

                  <strong>
                    {{
                      record.currentSchedule
                    }}
                  </strong>

                </div>

                <div class="switch-preview">

                  <div>

                    <span>
                      Current Rest Day
                    </span>

                    <strong>
                      {{
                        record.currentRestDay
                      }}
                    </strong>

                  </div>

                  <ArrowRight :size="20" />

                  <div>

                    <span>
                      Requested Rest Day
                    </span>

                    <strong class="blue">
                      {{
                        record.requestedRestDay
                      }}
                    </strong>

                  </div>

                </div>

              </div>

            </section>

            <!-- EFFECTIVE -->

            <section class="section-card">

              <div class="section-heading">

                <CalendarDays :size="16" />

                <h3>
                  Effective Schedule
                </h3>

              </div>

              <div class="info-grid two">

                <div>

                  <span>
                    Effective Date
                  </span>

                  <strong>
                    {{
                      formatDate(
                        record.effectiveDate,
                      )
                    }}
                  </strong>

                </div>

                <div>

                  <span>
                    Effective Week
                  </span>

                  <strong>
                    {{
                      record.effectiveWeek
                    }}
                  </strong>

                </div>

              </div>

            </section>

            <!-- REASON -->

            <section class="section-card">

              <div class="section-heading">

                <FileText :size="16" />

                <h3>
                  Reason
                </h3>

              </div>

              <p class="notes">
                {{
                  record.reason
                }}
              </p>

            </section>

            <!-- ATTACHMENT -->

            <section
              v-if="
                record.attachment
              "
              class="section-card"
            >

              <div class="section-heading">

                <Paperclip :size="16" />

                <h3>
                  Attachment
                </h3>

              </div>

              <div class="reference-row">

                <Paperclip :size="16" />

                <div>

                  <span>
                    Supporting Document
                  </span>

                  <strong>
                    {{
                      record.attachment.name
                    }}
                  </strong>

                </div>

              </div>

            </section>

            <!-- APPROVED -->

            <section
              v-if="
                record.status ===
                'Approved'
              "
              class="section-card"
            >

              <div class="section-heading">

                <ShieldCheck :size="16" />

                <h3>
                  Approval Information
                </h3>

              </div>

              <div class="info-grid two">

                <div>

                  <span>
                    Approved By
                  </span>

                  <strong>
                    {{
                      record.approvedBy ||
                      '—'
                    }}
                  </strong>

                </div>

                <div>

                  <span>
                    Approved At
                  </span>

                  <strong>
                    {{
                      formatDateTime(
                        record.approvedAt,
                      )
                    }}
                  </strong>

                </div>

              </div>

              <p
                v-if="
                  record.approvalNotes
                "
                class="
                  notes
                  spaced
                "
              >
                {{
                  record.approvalNotes
                }}
              </p>

            </section>

            <!-- REJECTED -->

            <section
              v-if="
                record.rejectionReason
              "
              class="
                section-card
                danger-card
              "
            >

              <div class="
                section-heading
                danger-heading
              ">

                <AlertCircle :size="16" />

                <h3>
                  Rejection Information
                </h3>

              </div>

              <div class="info-grid two">

                <div>

                  <span>
                    Rejected By
                  </span>

                  <strong>
                    {{
                      record.rejectedBy ||
                      '—'
                    }}
                  </strong>

                </div>

                <div>

                  <span>
                    Rejected At
                  </span>

                  <strong>
                    {{
                      formatDateTime(
                        record.rejectedAt,
                      )
                    }}
                  </strong>

                </div>

              </div>

              <p class="
                notes
                spaced
              ">
                {{
                  record.rejectionReason
                }}
              </p>

            </section>

            <!-- CANCELLED -->

            <section
              v-if="
                record.cancellationReason
              "
              class="
                section-card
                danger-card
              "
            >

              <div class="
                section-heading
                danger-heading
              ">

                <AlertCircle :size="16" />

                <h3>
                  Cancellation Information
                </h3>

              </div>

              <p class="notes">
                {{
                  record.cancellationReason
                }}
              </p>

            </section>

            <!-- AUDIT -->

            <section class="section-card">

              <div class="section-heading">

                <ShieldCheck :size="16" />

                <h3>
                  Request Audit
                </h3>

              </div>

              <div class="audit-grid">

                <div>

                  <span>
                    Requested By
                  </span>

                  <strong>
                    {{
                      record.requestedBy
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
                        record.requestedAt,
                      )
                    }}
                  </strong>

                </div>

                <div>

                  <span>
                    Request Number
                  </span>

                  <strong class="blue">
                    {{
                      record.requestNumber
                    }}
                  </strong>

                </div>

                <div>

                  <span>
                    Current Status
                  </span>

                  <StatusBadge
                    :status="
                      record.status
                    "
                  />

                </div>

              </div>

            </section>

          </div>

          <div class="modal-footer">

            <span>
              Request ID:
              #{{ record.id }}
            </span>

            <AppButton
              variant="secondary"
              @click="
                emit('close')
              "
            >
              Close
            </AppButton>

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
  max-width: 870px;

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

  align-items: center;
  justify-content: space-between;

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

  margin-bottom: 11px;

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
.audit-grid {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.info-grid.two {
  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );
}

.info-grid > div,
.audit-grid > div {
  padding: 9px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.info-grid span,
.info-grid strong,
.audit-grid span,
.audit-grid strong {
  display: block;
}

.info-grid span,
.audit-grid span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.info-grid strong,
.audit-grid strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.blue {
  color:
    var(--primary) !important;
}

.schedule-box {
  display: flex;

  flex-direction: column;

  gap: 8px;
}

.schedule-row {
  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.schedule-row span,
.schedule-row strong {
  display: block;
}

.schedule-row span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.schedule-row strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.switch-preview {
  display: grid;

  grid-template-columns:
    1fr auto 1fr;

  align-items: center;

  gap: 12px;
}

.switch-preview > div {
  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.switch-preview svg {
  color:
    var(--primary);
}

.switch-preview span,
.switch-preview strong {
  display: block;
}

.switch-preview span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.switch-preview strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 10px;
}

.reference-row {
  display: flex;

  align-items: center;

  gap: 8px;

  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card);

  color:
    var(--primary);
}

.reference-row span,
.reference-row strong {
  display: block;
}

.reference-row span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.reference-row strong {
  margin-top: 2px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.notes {
  margin: 0;

  color:
    var(--text-secondary);

  font-size: 9px;

  line-height: 1.6;
}

.notes.spaced {
  margin-top: 9px;

  padding: 9px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.danger-card {
  border-color:
    color-mix(
      in srgb,
      var(--red) 25%,
      var(--border)
    );
}

.danger-heading {
  color:
    var(--red);
}

.modal-footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

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
  .audit-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }

  .switch-preview {
    grid-template-columns:
      1fr;
  }

  .switch-preview svg {
    transform:
      rotate(90deg);

    margin:
      0 auto;
  }
}
</style>