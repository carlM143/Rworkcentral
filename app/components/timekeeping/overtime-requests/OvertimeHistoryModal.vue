<script setup lang="ts">
import {
  CheckCircle2,
  Clock3,
  History,
  X,
  XCircle,
} from 'lucide-vue-next'

import type {
  OvertimeActionRequest,
} from '~/types/overtimeActions'

defineProps<{
  open: boolean

  request:
    OvertimeActionRequest | null
}>()

const emit =
  defineEmits<{
    close: []
  }>()

const formatDateTime = (
  value?: string,
) => {
  if (!value) {
    return '—'
  }

  const date =
    new Date(value)

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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    },
  ).format(date)
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

            <div class="icon">
              <History :size="18" />
            </div>

            <div>

              <h2>
                Approval History
              </h2>

              <p>
                {{ request.requestNo }}
                ·
                {{ request.employeeName }}
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

          <div class="timeline">

            <div class="timeline-row">

              <div class="marker blue">
                <Clock3 :size="13" />
              </div>

              <div>

                <strong>
                  Overtime Request Filed
                </strong>

                <span>
                  {{
                    formatDateTime(
                      request.requestedAt,
                    )
                  }}
                </span>

                <p>
                  Request for
                  {{ request.requestedHours }}
                  hours of
                  {{ request.otType }}.
                </p>

              </div>

            </div>

            <div
              v-if="
                request.status ===
                'Pending'
              "
              class="timeline-row"
            >

              <div class="marker orange">
                <Clock3 :size="13" />
              </div>

              <div>
                <strong>
                  Pending Review
                </strong>

                <span>
                  Awaiting reviewer action
                </span>
              </div>

            </div>

            <div
              v-else-if="
                request.status ===
                'For Review'
              "
              class="timeline-row"
            >

              <div class="marker orange">
                <Clock3 :size="13" />
              </div>

              <div>
                <strong>
                  For Review
                </strong>

                <span>
                  Request is currently under review.
                </span>
              </div>

            </div>

            <div
              v-else-if="
                request.status ===
                'Approved'
              "
              class="timeline-row"
            >

              <div class="marker green">
                <CheckCircle2
                  :size="13"
                />
              </div>

              <div>
                <strong>
                  Request Approved
                </strong>

                <span>
                  {{
                    request.reviewedBy ||
                    'HR Administrator'
                  }}
                  ·
                  {{
                    formatDateTime(
                      request.reviewedAt,
                    )
                  }}
                </span>

                <p>
                  Approved hours:
                  {{
                    request.approvedHours ??
                    request.requestedHours
                  }}
                  hrs
                </p>

              </div>

            </div>

            <div
              v-else-if="
                request.status ===
                'Rejected'
              "
              class="timeline-row"
            >

              <div class="marker red">
                <XCircle
                  :size="13"
                />
              </div>

              <div>
                <strong>
                  Request Rejected
                </strong>

                <span>
                  {{
                    request.reviewedBy ||
                    'HR Administrator'
                  }}
                  ·
                  {{
                    formatDateTime(
                      request.reviewedAt,
                    )
                  }}
                </span>

              </div>

            </div>

            <div
              v-else
              class="timeline-row"
            >

              <div class="marker">
                <XCircle
                  :size="13"
                />
              </div>

              <div>
                <strong>
                  Request Cancelled
                </strong>

                <span>
                  Overtime request is no longer active.
                </span>
              </div>

            </div>

          </div>

          <div
            v-if="request.remarks"
            class="remarks"
          >
            <span>
              REVIEW REMARKS
            </span>

            <p>
              {{ request.remarks }}
            </p>
          </div>

        </main>

        <footer>

          <AppButton
            variant="secondary"
            @click="emit('close')"
          >
            Close
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
  max-width: 540px;

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

.icon {
  display: flex;

  width: 37px;
  height: 37px;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

header p {
  margin:
    3px 0 0;

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
    16px 17px;
}

.timeline {
  position: relative;
}

.timeline-row {
  position: relative;

  display: grid;

  grid-template-columns:
    33px 1fr;

  gap: 9px;

  padding-bottom: 16px;
}

.timeline-row:not(:last-child)::before {
  content: '';

  position: absolute;

  top: 31px;
  bottom: 0;
  left: 15px;

  width: 1px;

  background:
    var(--border);
}

.marker {
  position: relative;

  z-index: 2;

  display: flex;

  width: 31px;
  height: 31px;

  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background:
    var(--bg-card-soft);

  color:
    var(--text-muted);
}

.marker.blue {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.marker.orange {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.marker.green {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.marker.red {
  background:
    var(--red-soft);

  color:
    var(--red);
}

.timeline-row strong,
.timeline-row span {
  display: block;
}

.timeline-row strong {
  color:
    var(--text-primary);

  font-size: 8.5px;
}

.timeline-row span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7.5px;
}

.timeline-row p {
  margin:
    4px 0 0;

  color:
    var(--text-secondary);

  font-size: 8px;
}

.remarks {
  padding: 9px;

  border-radius: 7px;

  background:
    var(--bg-card-soft);
}

.remarks span {
  color:
    var(--text-muted);

  font-size: 7px;
  font-weight: 700;
}

.remarks p {
  margin:
    4px 0 0;

  color:
    var(--text-secondary);

  font-size: 8px;
}
</style>