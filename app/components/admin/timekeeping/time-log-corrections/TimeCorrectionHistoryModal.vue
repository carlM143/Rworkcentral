<script setup lang="ts">
import {
  X,
  History,
  Clock3,
  UserRound,
  CalendarDays,
  FileText,
  Paperclip,
  ShieldCheck,
} from 'lucide-vue-next'

import type {
  TimeLogRecord,
} from '~/types/timekeeping'

import type {
  TimeLogCorrectionRequest,
} from '~/types/timeLogCorrection'

const props = defineProps<{
  open: boolean

  log:
    TimeLogRecord | null
}>()

const emit = defineEmits<{
  close: []
}>()

const {
  requests,
} = useTimeLogCorrections()

/* =========================================================
   HISTORY
========================================================= */

const history =
  computed<
    TimeLogCorrectionRequest[]
  >(() => {
    if (!props.log) {
      return []
    }

    return requests.value
      .filter(
        request =>
          request.timeLogId ===
          props.log?.id,
      )
      .slice()
      .sort(
        (
          first,
          second,
        ) => {
          return (
            new Date(
              second.requestedAt,
            ).getTime() -
            new Date(
              first.requestedAt,
            ).getTime()
          )
        },
      )
  })

/* =========================================================
   DATE
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

/* =========================================================
   LOG HELPERS
========================================================= */

const originalLog = (
  request:
    TimeLogCorrectionRequest,
) => {
  return {
    timeIn:
      request.originalTimeIn ||
      'No log',

    timeOut:
      request.originalTimeOut ||
      'No log',
  }
}

const requestedLog = (
  request:
    TimeLogCorrectionRequest,
) => {
  return {
    timeIn:
      request.requestedTimeIn ||
      '—',

    timeOut:
      request.requestedTimeOut ||
      '—',
  }
}
</script>

<template>
  <Teleport to="body">

    <Transition name="modal">

      <div
        v-if="
          open &&
          log
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
                <History :size="20" />
              </div>

              <div>
                <h2>
                  Correction History
                </h2>

                <p>
                  Review all correction requests
                  filed for this attendance record.
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

          </div>

          <!-- EMPLOYEE SUMMARY -->

          <div class="employee-summary">

            <div class="employee-avatar">
              <UserRound :size="18" />
            </div>

            <div class="employee-copy">

              <strong>
                {{ log.employeeName }}
              </strong>

              <span>
                {{ log.employeeNumber }}
                ·
                {{ log.department }}
                ·
                {{ log.position }}
              </span>

            </div>

            <div class="attendance-date">

              <CalendarDays :size="14" />

              <span>
                {{
                  formatDate(
                    log.date,
                  )
                }}
              </span>

            </div>

          </div>

          <!-- BODY -->

          <div class="modal-body">

            <!-- CURRENT LOG -->

            <section class="current-log-card">

              <div class="section-heading">

                <Clock3 :size="16" />

                <div>
                  <h3>
                    Current Attendance Record
                  </h3>

                  <p>
                    Current time log stored
                    for this employee.
                  </p>
                </div>

              </div>

              <div class="current-grid">

                <div>
                  <span>
                    Time In
                  </span>

                  <strong>
                    {{
                      log.timeIn ||
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
                      log.timeOut ||
                      'No log'
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Status
                  </span>

                  <StatusBadge
                    :status="
                      log.status
                    "
                  />
                </div>

                <div>
                  <span>
                    Schedule
                  </span>

                  <strong>
                    {{ log.schedule }}
                  </strong>
                </div>

              </div>

            </section>

            <!-- HISTORY -->

            <section class="history-section">

              <div class="history-heading">

                <div>
                  <h3>
                    Request History
                  </h3>

                  <p>
                    {{
                      history.length
                    }}
                    correction request(s)
                    found.
                  </p>
                </div>

                <span class="history-total">
                  {{ history.length }}
                </span>

              </div>

              <!-- ITEMS -->

              <div
                v-if="
                  history.length
                "
                class="history-list"
              >

                <article
                  v-for="
                    request in
                    history
                  "
                  :key="
                    request.id
                  "
                  class="history-card"
                >

                  <!-- TOP -->

                  <div class="history-card-header">

                    <div>

                      <div class="request-number">

                        <strong>
                          {{
                            request.requestNumber
                          }}
                        </strong>

                        <span
                          v-if="
                            request.priority ===
                            'Urgent'
                          "
                          class="urgent-badge"
                        >
                          Urgent
                        </span>

                      </div>

                      <p>
                        {{
                          request.correctionType
                        }}
                        · Filed
                        {{
                          formatDateTime(
                            request.requestedAt,
                          )
                        }}
                      </p>

                    </div>

                    <StatusBadge
                      :status="
                        request.status
                      "
                    />

                  </div>

                  <!-- COMPARISON -->

                  <div class="comparison-grid">

                    <div class="comparison-box">

                      <span class="comparison-label">
                        Original Log
                      </span>

                      <div class="time-row">

                        <div>
                          <span>
                            Time In
                          </span>

                          <strong>
                            {{
                              originalLog(
                                request,
                              ).timeIn
                            }}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Time Out
                          </span>

                          <strong>
                            {{
                              originalLog(
                                request,
                              ).timeOut
                            }}
                          </strong>
                        </div>

                      </div>

                    </div>

                    <div
                      class="
                        comparison-box
                        requested
                      "
                    >

                      <span class="comparison-label">
                        Requested Log
                      </span>

                      <div class="time-row">

                        <div>
                          <span>
                            Time In
                          </span>

                          <strong>
                            {{
                              requestedLog(
                                request,
                              ).timeIn
                            }}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Time Out
                          </span>

                          <strong>
                            {{
                              requestedLog(
                                request,
                              ).timeOut
                            }}
                          </strong>
                        </div>

                      </div>

                    </div>

                  </div>

                  <!-- REASON -->

                  <div class="reason-box">

                    <div class="reason-heading">
                      <FileText :size="14" />

                      <span>
                        Reason
                      </span>
                    </div>

                    <p>
                      {{ request.reason }}
                    </p>

                  </div>

                  <!-- ATTACHMENT -->

                  <div
                    v-if="
                      request.attachment
                    "
                    class="attachment-row"
                  >

                    <Paperclip :size="14" />

                    <span>
                      {{
                        request.attachment
                          .name
                      }}
                    </span>

                  </div>

                  <!-- REVIEW -->

                  <div
                    v-if="
                      request.status !==
                      'Pending'
                    "
                    class="review-box"
                  >

                    <ShieldCheck :size="15" />

                    <div class="review-info">

                      <div>

                        <span>
                          Reviewed By
                        </span>

                        <strong>
                          {{
                            request.reviewedBy ||
                            '—'
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
                              request.reviewedAt,
                            )
                          }}
                        </strong>

                      </div>

                    </div>

                  </div>

                  <div
                    v-if="
                      request.reviewNotes
                    "
                    class="review-notes"
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

                </article>

              </div>

              <!-- EMPTY -->

              <div
                v-else
                class="empty-history"
              >

                <div class="empty-icon">
                  <History :size="26" />
                </div>

                <strong>
                  No correction history
                </strong>

                <p>
                  No correction request has
                  been filed for this attendance
                  record yet.
                </p>

              </div>

            </section>

          </div>

          <!-- FOOTER -->

          <div class="modal-footer">

            <span>
              Time Log ID:
              #{{ log.id }}
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
  max-width: 920px;

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

.header-left {
  display: flex;

  align-items: center;

  gap: 11px;
}

.header-icon {
  display: flex;

  width: 42px;
  height: 42px;

  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background:
    var(--purple-soft);

  color:
    var(--purple);
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

.employee-summary {
  display: flex;

  flex-shrink: 0;

  align-items: center;

  gap: 10px;

  padding:
    11px 18px;

  border-bottom:
    1px solid
    var(--border-soft);

  background:
    var(--bg-card-soft);
}

.employee-avatar {
  display: flex;

  width: 35px;
  height: 35px;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.employee-copy {
  min-width: 0;

  flex: 1;
}

.employee-copy strong,
.employee-copy span {
  display: block;
}

.employee-copy strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.employee-copy span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

.attendance-date {
  display: flex;

  align-items: center;

  gap: 6px;

  color:
    var(--text-secondary);

  font-size: 9px;
}

.modal-body {
  flex: 1;

  overflow-y: auto;

  padding:
    16px 18px;
}

.current-log-card {
  padding: 13px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 9px;

  background:
    var(--bg-card-soft);
}

.section-heading {
  display: flex;

  align-items: center;

  gap: 8px;

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

.section-heading p {
  margin:
    3px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

.current-grid {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.current-grid > div {
  min-height: 55px;

  padding: 9px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.current-grid span,
.current-grid strong {
  display: block;
}

.current-grid > div > span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.current-grid strong {
  margin-top: 4px;

  color:
    var(--text-primary);

  font-size: 10px;
}

.history-section {
  margin-top: 13px;
}

.history-heading {
  display: flex;

  align-items: center;
  justify-content: space-between;

  margin-bottom: 9px;
}

.history-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 12px;
}

.history-heading p {
  margin:
    3px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

.history-total {
  display: flex;

  min-width: 27px;
  height: 27px;

  align-items: center;
  justify-content: center;

  padding:
    0 7px;

  border-radius: 50px;

  background:
    var(--purple-soft);

  color:
    var(--purple);

  font-size: 9px;
  font-weight: 700;
}

.history-list {
  display: flex;

  flex-direction: column;

  gap: 10px;
}

.history-card {
  padding: 13px;

  border:
    1px solid var(--border);

  border-radius: 9px;

  background:
    var(--bg-card);
}

.history-card-header {
  display: flex;

  align-items: flex-start;
  justify-content: space-between;

  gap: 12px;

  margin-bottom: 11px;
}

.request-number {
  display: flex;

  align-items: center;

  gap: 6px;
}

.request-number strong {
  color:
    var(--text-primary);

  font-size: 11px;
}

.history-card-header p {
  margin:
    4px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

.urgent-badge {
  display: inline-flex;

  padding:
    3px 6px;

  border-radius: 20px;

  background:
    var(--red-soft);

  color:
    var(--red);

  font-size: 7px;
  font-weight: 700;
}

.comparison-grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.comparison-box {
  padding: 10px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.comparison-box.requested {
  border-color:
    color-mix(
      in srgb,
      var(--primary) 25%,
      var(--border)
    );

  background:
    var(--primary-soft);
}

.comparison-label {
  display: block;

  margin-bottom: 8px;

  color:
    var(--text-secondary);

  font-size: 9px;
  font-weight: 650;
}

.time-row {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 6px;
}

.time-row > div {
  padding: 8px;

  border-radius: 6px;

  background:
    var(--bg-card);
}

.time-row span,
.time-row strong {
  display: block;
}

.time-row span {
  color:
    var(--text-muted);

  font-size: 7px;
}

.time-row strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 10px;
}

.comparison-box.requested
.time-row strong {
  color:
    var(--primary);
}

.reason-box {
  margin-top: 9px;

  padding: 9px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card-soft);
}

.reason-heading {
  display: flex;

  align-items: center;

  gap: 6px;

  color:
    var(--text-muted);
}

.reason-heading span {
  font-size: 8px;
  font-weight: 600;
}

.reason-box p {
  margin:
    5px 0 0;

  color:
    var(--text-secondary);

  font-size: 9px;

  line-height: 1.55;
}

.attachment-row {
  display: flex;

  align-items: center;

  gap: 6px;

  margin-top: 8px;

  padding:
    7px 8px;

  border-radius: 6px;

  background:
    var(--purple-soft);

  color:
    var(--purple);

  font-size: 8px;
}

.review-box {
  display: flex;

  align-items: center;

  gap: 8px;

  margin-top: 8px;

  padding: 9px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--green-soft);

  color:
    var(--green);
}

.review-info {
  display: grid;

  flex: 1;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.review-info span,
.review-info strong {
  display: block;
}

.review-info span {
  color:
    var(--text-muted);

  font-size: 7px;
}

.review-info strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.review-notes {
  margin-top: 8px;

  padding: 9px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card-soft);
}

.review-notes span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.review-notes p {
  margin:
    4px 0 0;

  color:
    var(--text-secondary);

  font-size: 9px;
}

.empty-history {
  display: flex;

  min-height: 210px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  text-align: center;
}

.empty-icon {
  display: flex;

  width: 52px;
  height: 52px;

  align-items: center;
  justify-content: center;

  margin-bottom: 9px;

  border-radius: 50%;

  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.empty-history strong {
  color:
    var(--text-primary);

  font-size: 11px;
}

.empty-history p {
  max-width: 330px;

  margin:
    5px 0 0;

  color:
    var(--text-muted);

  font-size: 9px;

  line-height: 1.5;
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

.modal-enter-active,
.modal-leave-active {
  transition:
    opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 720px) {
  .current-grid {
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

@media (max-width: 500px) {
  .current-grid,
  .time-row,
  .review-info {
    grid-template-columns:
      1fr;
  }

  .employee-summary {
    align-items:
      flex-start;

    flex-wrap: wrap;
  }

  .attendance-date {
    width: 100%;

    padding-left: 45px;
  }
}
</style>