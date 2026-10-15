<script setup lang="ts">
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ClipboardCheck,
  FileText,
  UserRound,
  X,
} from 'lucide-vue-next'

import type {
  OvertimeActionRequest,
} from '~/types/overtimeActions'

const props =
  defineProps<{
    open: boolean

    request:
      OvertimeActionRequest | null
  }>()

const emit =
  defineEmits<{
    close: []

    review: [
      request:
        OvertimeActionRequest,
    ]
  }>()

const canReview =
  computed(() => {
    return [
      'Pending',
      'For Review',
    ].includes(
      props.request?.status ||
      '',
    )
  })

const formatDate = (
  value?: string,
) => {
  if (!value) {
    return '—'
  }

  const date =
    new Date(
      `${value}T00:00:00`,
    )

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    },
  ).format(date)
}

const review = () => {
  if (!props.request) {
    return
  }

  emit(
    'review',
    props.request,
  )

  emit('close')
}
</script>

<template>
  <Teleport to="body">

    <div
      v-if="
        open &&
        request
      "
      class="overlay"
      @click.self="emit('close')"
    >

      <article class="modal">

        <header>

          <div class="header-main">

            <div class="avatar">
              <UserRound
                :size="19"
              />
            </div>

            <div>

              <span class="eyebrow">
                OVERTIME REQUEST
              </span>

              <h2>
                {{ request.requestNo }}
              </h2>

              <p>
                {{ request.employeeName }}

                <template
                  v-if="request.employeeNo"
                >
                  · {{ request.employeeNo }}
                </template>
              </p>

            </div>

          </div>

          <button
            type="button"
            class="close"
            @click="emit('close')"
          >
            <X :size="18" />
          </button>

        </header>

        <main>

          <div class="summary">

            <div>
              <span>
                DEPARTMENT
              </span>

              <strong>
                {{ request.department }}
              </strong>
            </div>

            <div>
              <span>
                POSITION
              </span>

              <strong>
                {{ request.position || '—' }}
              </strong>
            </div>

            <div>
              <span>
                STATUS
              </span>

              <strong class="primary">
                {{ request.status }}
              </strong>
            </div>

          </div>

          <section>

            <div class="section-title">

              <CalendarDays
                :size="14"
              />

              Overtime Schedule

            </div>

            <div class="details">

              <div>
                <span>OT DATE</span>

                <strong>
                  {{ formatDate(request.otDate) }}
                </strong>
              </div>

              <div>
                <span>OT TYPE</span>

                <strong>
                  {{ request.otType }}
                </strong>
              </div>

              <div>
                <span>
                  REGULAR SCHEDULE
                </span>

                <strong>
                  {{ request.schedule || '—' }}
                </strong>
              </div>

              <div>
                <span>
                  OT PERIOD
                </span>

                <strong>
                  {{ request.otStart || '—' }}
                  -
                  {{ request.otEnd || '—' }}
                </strong>
              </div>

            </div>

          </section>

          <div class="hours-grid">

            <div class="hours requested">

              <Clock3 :size="16" />

              <div>
                <span>
                  REQUESTED
                </span>

                <strong>
                  {{ request.requestedHours }}
                  hrs
                </strong>
              </div>

            </div>

            <div class="hours approved">

              <CheckCircle2
                :size="16"
              />

              <div>
                <span>
                  APPROVED
                </span>

                <strong>
                  {{
                    request.approvedHours ??
                    '—'
                  }}

                  <template
                    v-if="
                      request.approvedHours !==
                      null &&
                      request.approvedHours !==
                      undefined
                    "
                  >
                    hrs
                  </template>
                </strong>
              </div>

            </div>

          </div>

          <section>

            <div class="section-title">

              <FileText :size="14" />

              Reason

            </div>

            <p class="reason">
              {{ request.reason }}
            </p>

          </section>

          <section
            v-if="
              request.remarks
            "
          >

            <div class="section-title">

              <ClipboardCheck
                :size="14"
              />

              Approval Remarks

            </div>

            <p class="reason">
              {{ request.remarks }}
            </p>

          </section>

        </main>

        <footer>

          <AppButton
            variant="secondary"
            @click="emit('close')"
          >
            Close
          </AppButton>

          <AppButton
            v-if="canReview"
            :icon="ClipboardCheck"
            @click="review"
          >
            Review Request
          </AppButton>

        </footer>

      </article>

    </div>

  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  z-index: 99990;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  background:
    rgba(3, 10, 24, .76);

  backdrop-filter:
    blur(4px);
}

.modal {
  width: 100%;
  max-width: 650px;

  border:
    1px solid var(--border);

  border-radius: 13px;

  background:
    var(--bg-card);
}

header,
footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

  padding:
    15px 17px;

  gap: 12px;
}

header {
  border-bottom:
    1px solid var(--border);
}

footer {
  justify-content: flex-end;

  border-top:
    1px solid var(--border);
}

.header-main {
  display: flex;

  align-items: center;

  gap: 9px;
}

.avatar {
  display: flex;

  width: 39px;
  height: 39px;

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
}

h2 {
  margin:
    2px 0 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

header p {
  margin:
    2px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

.close {
  display: flex;

  width: 31px;
  height: 31px;

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

main {
  padding:
    15px 17px;
}

.summary,
.details,
.hours-grid {
  display: grid;

  gap: 7px;
}

.summary {
  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );
}

.summary > div,
.details > div {
  padding: 9px;

  border:
    1px solid var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card-soft);
}

.summary span,
.summary strong,
.details span,
.details strong {
  display: block;
}

.summary span,
.details span {
  color:
    var(--text-muted);

  font-size: 7px;
  font-weight: 700;
}

.summary strong,
.details strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 8.5px;
}

.primary {
  color:
    var(--primary) !important;
}

section {
  margin-top: 14px;
}

.section-title {
  display: flex;

  align-items: center;

  gap: 6px;

  margin-bottom: 7px;

  color:
    var(--text-primary);

  font-size: 9px;
  font-weight: 700;
}

.details {
  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );
}

.hours-grid {
  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  margin-top: 10px;
}

.hours {
  display: flex;

  align-items: center;

  gap: 8px;

  padding: 10px;

  border-radius: 8px;
}

.hours.requested {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.hours.approved {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.hours span,
.hours strong {
  display: block;
}

.hours span {
  font-size: 7px;
  font-weight: 700;
}

.hours strong {
  margin-top: 2px;

  font-size: 11px;
}

.reason {
  margin: 0;

  padding: 10px;

  border-radius: 7px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-size: 8.5px;

  line-height: 1.6;
}

@media (max-width: 600px) {
  .summary,
  .details,
  .hours-grid {
    grid-template-columns:
      1fr;
  }
}
</style>