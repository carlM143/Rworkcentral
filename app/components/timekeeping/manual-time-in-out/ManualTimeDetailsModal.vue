<script setup lang="ts">
import {
  X,
  Clock3,
  UserRound,
  CalendarDays,
  FileText,
  Paperclip,
  ShieldCheck,
} from 'lucide-vue-next'

import type {
  ManualTimeEntry,
} from '~/types/manualTimeEntry'

defineProps<{
  open: boolean

  entry:
    ManualTimeEntry | null
}>()

const emit = defineEmits<{
  close: []
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
          entry
        "
        class="modal-backdrop"
        @click.self="
          emit('close')
        "
      >

        <div class="modal-card">

          <div class="modal-header">

            <div class="header-left">

              <div class="header-icon">
                <Clock3 :size="20" />
              </div>

              <div>
                <h2>
                  Manual Time Entry
                </h2>

                <p>
                  {{ entry.entryNumber }}
                  ·
                  {{ entry.employeeName }}
                </p>
              </div>

            </div>

            <div class="header-right">

              <StatusBadge
                :status="
                  entry.status
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
                    {{ entry.employeeName }}
                  </strong>
                </div>

                <div>
                  <span>Employee ID</span>
                  <strong>
                    {{ entry.employeeNumber }}
                  </strong>
                </div>

                <div>
                  <span>Department</span>
                  <strong>
                    {{ entry.department }}
                  </strong>
                </div>

                <div>
                  <span>Position</span>
                  <strong>
                    {{ entry.position }}
                  </strong>
                </div>

              </div>

            </section>

            <section class="section-card">

              <div class="section-heading">
                <CalendarDays :size="16" />
                <h3>
                  Attendance Information
                </h3>
              </div>

              <div class="info-grid">

                <div>
                  <span>Date</span>

                  <strong>
                    {{
                      formatDate(
                        entry.attendanceDate,
                      )
                    }}
                  </strong>
                </div>

                <div>
                  <span>Schedule</span>
                  <strong>
                    {{ entry.schedule }}
                  </strong>
                </div>

                <div>
                  <span>Entry Type</span>
                  <strong class="blue">
                    {{ entry.entryType }}
                  </strong>
                </div>

                <div>
                  <span>Manual Time</span>
                  <strong class="blue">
                    {{ entry.time }}
                  </strong>
                </div>

              </div>

            </section>

            <section class="section-card">

              <div class="section-heading">
                <FileText :size="16" />
                <h3>
                  Reason
                </h3>
              </div>

              <p class="reason">
                {{ entry.reason }}
              </p>

              <div
                v-if="
                  entry.attachment
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
                      entry.attachment.name
                    }}
                  </strong>
                </div>
              </div>

            </section>

            <section class="section-card">

              <div class="section-heading">
                <ShieldCheck :size="16" />
                <h3>
                  Audit Information
                </h3>
              </div>

              <div class="info-grid">

                <div>
                  <span>
                    Encoded By
                  </span>

                  <strong>
                    {{ entry.encodedBy }}
                  </strong>
                </div>

                <div>
                  <span>
                    Encoded At
                  </span>

                  <strong>
                    {{
                      formatDateTime(
                        entry.encodedAt,
                      )
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Validated By
                  </span>

                  <strong>
                    {{
                      entry.validatedBy ||
                      'Not validated'
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Validated At
                  </span>

                  <strong>
                    {{
                      formatDateTime(
                        entry.validatedAt,
                      )
                    }}
                  </strong>
                </div>

              </div>

              <div
                v-if="
                  entry.validationNotes
                "
                class="notes"
              >
                <span>
                  Notes
                </span>

                <p>
                  {{
                    entry.validationNotes
                  }}
                </p>
              </div>

            </section>

          </div>

          <div class="modal-footer">

            <span>
              Entry ID:
              #{{ entry.id }}
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
  max-width: 830px;

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

.info-grid {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.info-grid > div {
  padding: 10px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.info-grid span,
.info-grid strong {
  display: block;
}

.info-grid span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.info-grid strong {
  margin-top: 4px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.blue {
  color:
    var(--primary) !important;
}

.reason {
  margin: 0;

  color:
    var(--text-secondary);

  font-size: 9px;

  line-height: 1.6;
}

.attachment {
  display: flex;

  align-items: center;

  gap: 8px;

  margin-top: 10px;

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

.notes {
  margin-top: 9px;

  padding: 9px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.notes span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.notes p {
  margin:
    4px 0 0;

  color:
    var(--text-secondary);

  font-size: 9px;
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

@media (max-width: 650px) {
  .info-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }
}
</style>