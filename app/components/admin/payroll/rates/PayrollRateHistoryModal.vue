<script setup lang="ts">
import {
  X,
  History,
  BadgeDollarSign,
  CalendarDays,
  UserRound,
  ArrowRight,
} from 'lucide-vue-next'

import type {
  PayrollRate,
} from '~/types/payrollRate'

const props = defineProps<{
  open: boolean
  rate: PayrollRate | null
}>()

const emit = defineEmits<{
  close: []
}>()

const formatMoney = (
  value?: number | null,
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return '—'
  }

  return new Intl.NumberFormat(
    'en-PH',
    {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    },
  ).format(value)
}

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
   MOCK PREVIOUS VALUES
   Backend history table will replace this later.
========================================================= */

const previousDailyRate =
  computed(() => {
    if (
      !props.rate?.dailyRate
    ) {
      return null
    }

    return Math.max(
      0,
      props.rate.dailyRate -
        50,
    )
  })

const previousHourlyRate =
  computed(() => {
    if (
      !props.rate?.hourlyRate
    ) {
      return null
    }

    return Math.max(
      0,
      props.rate.hourlyRate -
        6.25,
    )
  })

const previousMonthlyRate =
  computed(() => {
    if (
      !props.rate?.monthlyRate
    ) {
      return null
    }

    return Math.max(
      0,
      props.rate.monthlyRate -
        1000,
    )
  })

const previousTripRate =
  computed(() => {
    if (
      !props.rate?.tripRate
    ) {
      return null
    }

    return Math.max(
      0,
      props.rate.tripRate -
        25,
    )
  })

const previousEffectiveDate =
  computed(() => {
    if (
      !props.rate?.effectiveDate
    ) {
      return ''
    }

    const date =
      new Date(
        `${props.rate.effectiveDate}T00:00:00`,
      )

    date.setMonth(
      date.getMonth() -
        3,
    )

    return date
      .toLocaleDateString(
        'en-CA',
      )
  })
</script>

<template>
  <Teleport to="body">

    <Transition name="modal">

      <div
        v-if="
          open &&
          rate
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
                  Rate History
                </h2>

                <p>
                  Historical compensation changes
                  for {{ rate.employeeName }}.
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

          <div class="modal-body">

            <!-- EMPLOYEE -->

            <section class="employee-card">

              <div class="employee-icon">
                <UserRound :size="18" />
              </div>

              <div class="employee-info">

                <span>
                  Employee
                </span>

                <strong>
                  {{ rate.employeeName }}
                </strong>

                <small>
                  {{ rate.employeeNumber }}
                  ·
                  {{ rate.department }}
                  ·
                  {{ rate.position }}
                </small>

              </div>

              <StatusBadge
                :status="
                  rate.status
                "
              />

            </section>

            <!-- CURRENT -->

            <div class="timeline">

              <div class="timeline-item current">

                <div class="timeline-marker">
                  <BadgeDollarSign :size="14" />
                </div>

                <div class="timeline-content">

                  <div class="timeline-header">

                    <div>

                      <span class="timeline-label">
                        Current Rate
                      </span>

                      <h3>
                        Effective
                        {{
                          formatDate(
                            rate.effectiveDate,
                          )
                        }}
                      </h3>

                    </div>

                    <span class="current-badge">
                      Current
                    </span>

                  </div>

                  <div class="rate-meta">

                    <span>
                      {{ rate.rateType }}
                    </span>

                    <span>
                      {{ rate.payBasis }}
                    </span>

                    <span>
                      {{ rate.rateCode }}
                    </span>

                  </div>

                  <div class="rate-grid">

                    <div>

                      <span>
                        Monthly Rate
                      </span>

                      <strong>
                        {{
                          formatMoney(
                            rate.monthlyRate,
                          )
                        }}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Daily Rate
                      </span>

                      <strong>
                        {{
                          formatMoney(
                            rate.dailyRate,
                          )
                        }}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Hourly Rate
                      </span>

                      <strong>
                        {{
                          formatMoney(
                            rate.hourlyRate,
                          )
                        }}
                      </strong>

                    </div>

                    <div
                      v-if="
                        rate.rateType ===
                        'Driver'
                      "
                    >

                      <span>
                        Trip Rate
                      </span>

                      <strong>
                        {{
                          formatMoney(
                            rate.tripRate,
                          )
                        }}
                      </strong>

                    </div>

                  </div>

                  <div class="audit-line">

                    <UserRound :size="12" />

                    <span>
                      {{
                        rate.updatedBy ||
                        rate.createdBy
                      }}
                    </span>

                    <span>·</span>

                    <span>
                      {{
                        formatDateTime(
                          rate.updatedAt ||
                          rate.createdAt,
                        )
                      }}
                    </span>

                  </div>

                </div>

              </div>

              <!-- PREVIOUS -->

              <div class="timeline-item">

                <div class="timeline-marker old">
                  <History :size="14" />
                </div>

                <div class="timeline-content">

                  <div class="timeline-header">

                    <div>

                      <span class="timeline-label">
                        Previous Rate
                      </span>

                      <h3>
                        Effective
                        {{
                          formatDate(
                            previousEffectiveDate,
                          )
                        }}
                      </h3>

                    </div>

                    <span class="previous-badge">
                      Previous
                    </span>

                  </div>

                  <div class="change-list">

                    <div
                      v-if="
                        rate.monthlyRate
                      "
                      class="change-row"
                    >

                      <span>
                        Monthly Rate
                      </span>

                      <div>

                        <strong class="previous">
                          {{
                            formatMoney(
                              previousMonthlyRate,
                            )
                          }}
                        </strong>

                        <ArrowRight :size="13" />

                        <strong class="new">
                          {{
                            formatMoney(
                              rate.monthlyRate,
                            )
                          }}
                        </strong>

                      </div>

                    </div>

                    <div
                      v-if="
                        rate.dailyRate
                      "
                      class="change-row"
                    >

                      <span>
                        Daily Rate
                      </span>

                      <div>

                        <strong class="previous">
                          {{
                            formatMoney(
                              previousDailyRate,
                            )
                          }}
                        </strong>

                        <ArrowRight :size="13" />

                        <strong class="new">
                          {{
                            formatMoney(
                              rate.dailyRate,
                            )
                          }}
                        </strong>

                      </div>

                    </div>

                    <div
                      v-if="
                        rate.hourlyRate
                      "
                      class="change-row"
                    >

                      <span>
                        Hourly Rate
                      </span>

                      <div>

                        <strong class="previous">
                          {{
                            formatMoney(
                              previousHourlyRate,
                            )
                          }}
                        </strong>

                        <ArrowRight :size="13" />

                        <strong class="new">
                          {{
                            formatMoney(
                              rate.hourlyRate,
                            )
                          }}
                        </strong>

                      </div>

                    </div>

                    <div
                      v-if="
                        rate.tripRate
                      "
                      class="change-row"
                    >

                      <span>
                        Trip Rate
                      </span>

                      <div>

                        <strong class="previous">
                          {{
                            formatMoney(
                              previousTripRate,
                            )
                          }}
                        </strong>

                        <ArrowRight :size="13" />

                        <strong class="new">
                          {{
                            formatMoney(
                              rate.tripRate,
                            )
                          }}
                        </strong>

                      </div>

                    </div>

                  </div>

                  <div class="history-note">

                    <CalendarDays :size="13" />

                    Historical rate information
                    is currently using frontend mock data.
                    Backend audit records will replace
                    this later.

                  </div>

                </div>

              </div>

            </div>

          </div>

          <!-- FOOTER -->

          <div class="modal-footer">

            <span>
              Rate:
              {{ rate.rateCode }}
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
  max-width: 820px;

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

.header-left {
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
    var(--purple-soft);

  color:
    var(--purple);
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

  cursor: pointer;
}

.modal-body {
  flex: 1;

  overflow-y: auto;

  padding:
    16px 18px;
}

.employee-card {
  display: flex;

  align-items: center;

  gap: 10px;

  margin-bottom: 15px;

  padding: 12px;

  border:
    1px solid var(--border);

  border-radius: 9px;

  background:
    var(--bg-card-soft);
}

.employee-icon {
  display: flex;

  width: 40px;
  height: 40px;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.employee-info {
  min-width: 0;

  flex: 1;
}

.employee-info span,
.employee-info strong,
.employee-info small {
  display: block;
}

.employee-info span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.employee-info strong {
  margin-top: 2px;

  color:
    var(--text-primary);

  font-size: 11px;
}

.employee-info small {
  margin-top: 3px;

  color:
    var(--text-secondary);

  font-size: 8px;
}

.timeline {
  position: relative;

  padding-left: 18px;
}

.timeline::before {
  position: absolute;

  top: 9px;
  bottom: 15px;
  left: 7px;

  width: 1px;

  background:
    var(--border);

  content: '';
}

.timeline-item {
  position: relative;

  display: grid;

  grid-template-columns:
    28px 1fr;

  gap: 8px;

  margin-bottom: 14px;
}

.timeline-marker {
  position: relative;

  z-index: 1;

  display: flex;

  width: 28px;
  height: 28px;

  align-items: center;
  justify-content: center;

  margin-left: -18px;

  border:
    3px solid var(--bg-card);

  border-radius: 50%;

  background:
    var(--green-soft);

  color:
    var(--green);
}

.timeline-marker.old {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.timeline-content {
  padding: 13px;

  border:
    1px solid var(--border);

  border-radius: 9px;

  background:
    var(--bg-card-soft);
}

.timeline-header {
  display: flex;

  align-items: flex-start;
  justify-content: space-between;

  gap: 10px;
}

.timeline-label {
  display: block;

  color:
    var(--text-muted);

  font-size: 8px;
}

.timeline-header h3 {
  margin:
    3px 0 0;

  color:
    var(--text-primary);

  font-size: 11px;
}

.current-badge,
.previous-badge {
  padding:
    4px 7px;

  border-radius: 20px;

  font-size: 8px;
  font-weight: 650;
}

.current-badge {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.previous-badge {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.rate-meta {
  display: flex;

  flex-wrap: wrap;

  gap: 5px;

  margin-top: 10px;
}

.rate-meta span {
  padding:
    4px 7px;

  border-radius: 5px;

  background:
    var(--bg-card);

  color:
    var(--text-secondary);

  font-size: 8px;
}

.rate-grid {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 7px;

  margin-top: 10px;
}

.rate-grid > div {
  padding: 9px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.rate-grid span,
.rate-grid strong {
  display: block;
}

.rate-grid span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.rate-grid strong {
  margin-top: 3px;

  color:
    var(--green);

  font-size: 10px;
}

.audit-line {
  display: flex;

  align-items: center;

  gap: 5px;

  margin-top: 10px;

  color:
    var(--text-muted);

  font-size: 8px;
}

.change-list {
  display: flex;

  flex-direction: column;

  gap: 7px;

  margin-top: 11px;
}

.change-row {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding: 9px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.change-row > span {
  color:
    var(--text-secondary);

  font-size: 9px;
}

.change-row > div {
  display: flex;

  align-items: center;

  gap: 7px;
}

.change-row svg {
  color:
    var(--primary);
}

.change-row strong {
  font-size: 9px;
}

.change-row .previous {
  color:
    var(--text-muted);
}

.change-row .new {
  color:
    var(--green);
}

.history-note {
  display: flex;

  align-items: center;

  gap: 6px;

  margin-top: 10px;

  padding: 8px;

  border-radius: 6px;

  background:
    var(--primary-soft);

  color:
    var(--text-secondary);

  font-size: 8px;
}

.history-note svg {
  flex-shrink: 0;

  color:
    var(--primary);
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

@media (max-width: 650px) {
  .rate-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }

  .change-row {
    align-items:
      flex-start;

    flex-direction:
      column;
  }
}
</style>