<script setup lang="ts">
import {
  CalendarDays,
  ClipboardCheck,
  ExternalLink,
  UserRound,
  X,
} from 'lucide-vue-next'

import type {
  LeaveRequest,
} from '~/types/leave'

defineProps<{
  open: boolean

  request:
    LeaveRequest |
    null
}>()

const emit =
  defineEmits<{
    close: []

    employee: [
      request:
        LeaveRequest,
    ]

    review: [
      request:
        LeaveRequest,
    ]
  }>()

const formatDate = (
  value: string,
) => {
  return new Intl.DateTimeFormat(
    'en-US',
    {
      month:
        'long',

      day:
        'numeric',

      year:
        'numeric',
    },
  ).format(
    new Date(
      `${value}T00:00:00`,
    ),
  )
}
</script>

<template>
  <Teleport to="body">

    <Transition name="modal-fade">

      <div
        v-if="
          open &&
          request
        "
        class="modal-overlay"
        @click.self="
          emit('close')
        "
      >

        <article class="modal-card">

          <header class="modal-header">

            <div class="header-main">

              <div class="header-icon">

                <ClipboardCheck
                  :size="18"
                />

              </div>

              <div>

                <h2>
                  Leave Request Details
                </h2>

                <p>
                  Leave request #{{ request.id }}
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

          </header>

          <div class="modal-body">

            <!-- STATUS -->

            <div class="status-row">

              <div>

                <span>
                  STATUS
                </span>

                <StatusBadge
                  :status="
                    request.status
                  "
                />

              </div>

              <div>

                <span>
                  LEAVE TYPE
                </span>

                <strong>
                  {{ request.leaveType }}
                </strong>

              </div>

            </div>

            <!-- EMPLOYEE -->

            <section>

              <h3>
                Employee
              </h3>

              <div class="employee-card">

                <div class="employee-icon">

                  <UserRound
                    :size="18"
                  />

                </div>

                <div>

                  <strong>
                    {{ request.employeeName }}
                  </strong>

                  <span>
                    {{ request.employeeNumber }}
                    ·
                    {{ request.department }}
                    ·
                    {{ request.position }}
                  </span>

                </div>

              </div>

            </section>

            <!-- DATES -->

            <section>

              <h3>
                Leave Period
              </h3>

              <div class="date-grid">

                <div>

                  <CalendarDays
                    :size="15"
                  />

                  <span>
                    From
                  </span>

                  <strong>
                    {{
                      formatDate(
                        request.dateFrom,
                      )
                    }}
                  </strong>

                </div>

                <div>

                  <CalendarDays
                    :size="15"
                  />

                  <span>
                    To
                  </span>

                  <strong>
                    {{
                      formatDate(
                        request.dateTo,
                      )
                    }}
                  </strong>

                </div>

                <div>

                  <span>
                    Requested Days
                  </span>

                  <strong>
                    {{ request.days }}
                    day<span
                      v-if="
                        request.days !== 1
                      "
                    >s</span>
                  </strong>

                </div>

                <div>

                  <span>
                    Filed Date
                  </span>

                  <strong>
                    {{
                      formatDate(
                        request.filedAt,
                      )
                    }}
                  </strong>

                </div>

              </div>

            </section>

            <!-- REASON -->

            <section>

              <h3>
                Reason
              </h3>

              <div class="reason-card">
                {{
                  request.reason ||
                  'No reason provided.'
                }}
              </div>

            </section>

          </div>

          <footer class="modal-footer">

            <AppButton
              variant="secondary"
              :icon="UserRound"
              @click="
                emit(
                  'employee',
                  request,
                )
              "
            >
              View Employee
            </AppButton>

            <AppButton
              v-if="
                request.status ===
                'Pending'
              "
              :icon="ExternalLink"
              @click="
                emit(
                  'review',
                  request,
                )
              "
            >
              Review in Approval Center
            </AppButton>

          </footer>

        </article>

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

  padding: 20px;

  background:
    rgba(3, 10, 24, 0.78);

  backdrop-filter:
    blur(4px);
}

.modal-card {
  width: 100%;
  max-width: 610px;

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

  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding:
    16px 18px;

  border-bottom:
    1px solid var(--border);
}

.header-main {
  display: flex;

  align-items: center;

  gap: 10px;
}

.header-icon {
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

.modal-header h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

.modal-header p {
  margin:
    3px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

.close-button {
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

  cursor: pointer;
}

.modal-body {
  padding:
    17px 18px;
}

.status-row {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 8px;

  margin-bottom: 18px;
}

.status-row > div {
  padding: 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.status-row span {
  display: block;

  margin-bottom: 5px;

  color:
    var(--text-muted);

  font-size: 6px;
}

.status-row strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

section + section {
  margin-top: 17px;
}

section h3 {
  margin:
    0 0 7px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.employee-card {
  display: flex;

  align-items: center;

  gap: 9px;

  padding: 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.employee-icon {
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

.employee-card strong,
.employee-card span {
  display: block;
}

.employee-card strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

.employee-card span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 7px;
}

.date-grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.date-grid > div {
  padding: 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.date-grid svg {
  margin-bottom: 5px;

  color:
    var(--primary);
}

.date-grid span,
.date-grid strong {
  display: block;
}

.date-grid span {
  color:
    var(--text-muted);

  font-size: 7px;
}

.date-grid strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 8px;
}

.reason-card {
  padding: 11px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-size: 8px;

  line-height: 1.6;
}

.modal-footer {
  display: flex;

  justify-content: flex-end;

  gap: 7px;

  padding:
    13px 18px;

  border-top:
    1px solid var(--border);
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

@media (max-width: 650px) {
  .status-row,
  .date-grid {
    grid-template-columns:
      1fr;
  }

  .modal-footer {
    align-items: stretch;

    flex-direction: column;
  }
}
</style>