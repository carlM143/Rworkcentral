<script setup lang="ts">
import {
  X,
  MapPin,
  UserRound,
  CalendarDays,
  Building2,
  FileText,
  Navigation,
  Paperclip,
  ShieldCheck,
  Clock3,
  AlertCircle,
} from 'lucide-vue-next'

import type {
  FieldLeaveRecord,
} from '~/types/fieldLeave'

defineProps<{
  open: boolean

  record:
    FieldLeaveRecord | null
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

const formatTime = (
  value?: string,
) => {
  if (!value) {
    return '—'
  }

  const [
    hourValue = '0',
    minute = '00',
  ] =
    value.split(':')

  const hour =
    Number(hourValue)

  const period =
    hour >= 12
      ? 'PM'
      : 'AM'

  return `${
    hour % 12 || 12
  }:${minute} ${period}`
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
                <MapPin :size="20" />
              </div>

              <div>
                <h2>
                  Field Leave Request
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

            <!-- FIELD INFO -->

            <section class="section-card">

              <div class="section-heading">
                <CalendarDays :size="16" />

                <h3>
                  Field Leave Information
                </h3>
              </div>

              <div class="info-grid">

                <div>
                  <span>
                    Type
                  </span>

                  <strong class="blue">
                    {{
                      record.leaveType
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Date
                  </span>

                  <strong>
                    {{
                      formatDate(
                        record.fieldDate,
                      )
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Time From
                  </span>

                  <strong>
                    {{
                      formatTime(
                        record.timeFrom,
                      )
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Time To
                  </span>

                  <strong>
                    {{
                      formatTime(
                        record.timeTo,
                      )
                    }}
                  </strong>
                </div>

              </div>

            </section>

            <!-- LOCATION -->

            <section class="section-card">

              <div class="section-heading">
                <Building2 :size="16" />

                <h3>
                  Location & Client
                </h3>
              </div>

              <div class="info-grid two">

                <div>
                  <span>
                    Destination
                  </span>

                  <strong>
                    {{
                      record.destination
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Client / Company
                  </span>

                  <strong>
                    {{
                      record.client ||
                      '—'
                    }}
                  </strong>
                </div>

              </div>

            </section>

            <!-- PURPOSE -->

            <section class="section-card">

              <div class="section-heading">
                <FileText :size="16" />

                <h3>
                  Purpose
                </h3>
              </div>

              <p class="notes">
                {{
                  record.purpose
                }}
              </p>

            </section>

            <!-- RELATED TRIP -->

            <section
              v-if="
                record.relatedTripNumber
              "
              class="section-card"
            >

              <div class="section-heading">
                <Navigation :size="16" />

                <h3>
                  Related Trip
                </h3>
              </div>

              <div class="reference-row">

                <Navigation :size="16" />

                <div>
                  <span>
                    Trip Number
                  </span>

                  <strong>
                    {{
                      record.relatedTripNumber
                    }}
                  </strong>
                </div>

              </div>

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
                    Supporting File
                  </span>

                  <strong>
                    {{
                      record.attachment.name
                    }}
                  </strong>
                </div>

              </div>

            </section>

            <!-- COMPLETION -->

            <section
              v-if="
                record.status ===
                'Completed'
              "
              class="section-card"
            >

              <div class="section-heading">
                <Clock3 :size="16" />

                <h3>
                  Completion Information
                </h3>
              </div>

              <div class="info-grid">

                <div>
                  <span>
                    Actual Completion
                  </span>

                  <strong class="green">
                    {{
                      formatTime(
                        record.actualCompletionTime,
                      )
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Completed By
                  </span>

                  <strong>
                    {{
                      record.completedBy ||
                      '—'
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Completed At
                  </span>

                  <strong>
                    {{
                      formatDateTime(
                        record.completedAt,
                      )
                    }}
                  </strong>
                </div>

              </div>

              <p
                v-if="
                  record.completionNotes
                "
                class="
                  notes
                  spaced
                "
              >
                {{
                  record.completionNotes
                }}
              </p>

            </section>

            <!-- REJECTION -->

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

              <p class="notes">
                {{
                  record.rejectionReason
                }}
              </p>

            </section>

            <!-- CANCELLATION -->

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

.green {
  color:
    var(--green) !important;
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
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 10px;
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
}
</style>