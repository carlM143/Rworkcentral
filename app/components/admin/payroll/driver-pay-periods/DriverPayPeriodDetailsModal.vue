<script setup lang="ts">
import {
  X,
  CalendarRange,
  CalendarDays,
  Users,
  BadgeDollarSign,
  FileText,
  ShieldCheck,
} from 'lucide-vue-next'

import type {
  DriverPayPeriod,
} from '~/types/driverPayPeriod'

defineProps<{
  open: boolean

  period:
    DriverPayPeriod | null
}>()

const emit =
  defineEmits<{
    close: []
  }>()

const money = (
  value: number,
) => {
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

const progress = (
  period:
    DriverPayPeriod,
) => {
  if (
    period.totalDrivers ===
    0
  ) {
    return 0
  }

  return Math.round(
    (
      period.completedDrivers /
      period.totalDrivers
    ) *
      100,
  )
}
</script>

<template>
  <Teleport to="body">

    <div
      v-if="
        open &&
        period
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
              <CalendarRange :size="20" />
            </div>

            <div>

              <h2>
                Driver Pay Period Details
              </h2>

              <p>
                {{ period.periodCode }}
                ·
                {{ period.periodName }}
              </p>

            </div>

          </div>

          <div class="header-right">

            <StatusBadge
              :status="
                period.status
              "
            />

            <button
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

          <!-- PERIOD -->

          <section class="section-card">

            <div class="section-heading">

              <CalendarRange :size="16" />

              <h3>
                Period Information
              </h3>

            </div>

            <div class="info-grid">

              <div>
                <span>Period Code</span>
                <strong class="blue">
                  {{ period.periodCode }}
                </strong>
              </div>

              <div>
                <span>Payroll Type</span>
                <strong>{{ period.payrollType }}</strong>
              </div>

              <div>
                <span>Start Date</span>
                <strong>{{ formatDate(period.startDate) }}</strong>
              </div>

              <div>
                <span>End Date</span>
                <strong>{{ formatDate(period.endDate) }}</strong>
              </div>

            </div>

          </section>

          <!-- SCHEDULE -->

          <section class="section-card">

            <div class="section-heading">

              <CalendarDays :size="16" />

              <h3>
                Payroll Schedule
              </h3>

            </div>

            <div class="info-grid two">

              <div>
                <span>Cutoff Date</span>
                <strong>{{ formatDate(period.cutoffDate) }}</strong>
              </div>

              <div>
                <span>Pay Date</span>
                <strong>{{ formatDate(period.payDate) }}</strong>
              </div>

            </div>

          </section>

          <!-- DRIVER SUMMARY -->

          <section class="section-card">

            <div class="section-heading">

              <Users :size="16" />

              <h3>
                Driver Summary
              </h3>

            </div>

            <div class="summary-grid">

              <div>
                <span>Total Drivers</span>
                <strong>{{ period.totalDrivers }}</strong>
              </div>

              <div>
                <span>Pending</span>
                <strong class="orange">{{ period.pendingDrivers }}</strong>
              </div>

              <div>
                <span>Processed</span>
                <strong class="blue">{{ period.processedDrivers }}</strong>
              </div>

              <div>
                <span>Completed</span>
                <strong class="green">{{ period.completedDrivers }}</strong>
              </div>

            </div>

            <div class="progress-wrapper">

              <div class="progress-header">

                <span>
                  Payroll Completion
                </span>

                <strong>
                  {{
                    progress(
                      period,
                    )
                  }}%
                </strong>

              </div>

              <div class="progress-track">

                <div
                  class="progress-bar"
                  :style="{
                    width:
                      `${progress(period)}%`,
                  }"
                />

              </div>

            </div>

          </section>

          <!-- PAYROLL -->

          <section class="section-card">

            <div class="section-heading">

              <BadgeDollarSign :size="16" />

              <h3>
                Payroll Summary
              </h3>

            </div>

            <div class="money-grid">

              <div>

                <span>
                  Gross Amount
                </span>

                <strong>
                  {{
                    money(
                      period.grossAmount,
                    )
                  }}
                </strong>

              </div>

              <div>

                <span>
                  Total Deductions
                </span>

                <strong class="red">
                  {{
                    money(
                      period.totalDeductions,
                    )
                  }}
                </strong>

              </div>

              <div>

                <span>
                  Net Amount
                </span>

                <strong class="green">
                  {{
                    money(
                      period.netAmount,
                    )
                  }}
                </strong>

              </div>

            </div>

          </section>

          <!-- REMARKS -->

          <section
            v-if="
              period.remarks
            "
            class="section-card"
          >

            <div class="section-heading">

              <FileText :size="16" />

              <h3>
                Remarks
              </h3>

            </div>

            <p class="notes">
              {{ period.remarks }}
            </p>

          </section>

          <!-- CANCELLATION -->

          <section
            v-if="
              period.cancellationReason
            "
            class="
              section-card
              danger-card
            "
          >

            <div class="section-heading danger">

              <FileText :size="16" />

              <h3>
                Cancellation Information
              </h3>

            </div>

            <p class="notes">
              {{
                period.cancellationReason
              }}
            </p>

          </section>

          <!-- AUDIT -->

          <section class="section-card">

            <div class="section-heading">

              <ShieldCheck :size="16" />

              <h3>
                Audit Information
              </h3>

            </div>

            <div class="audit-grid">

              <div>
                <span>Created By</span>
                <strong>{{ period.createdBy }}</strong>
              </div>

              <div>
                <span>Created At</span>
                <strong>{{ formatDateTime(period.createdAt) }}</strong>
              </div>

              <div>
                <span>Opened By</span>
                <strong>{{ period.openedBy || '—' }}</strong>
              </div>

              <div>
                <span>Opened At</span>
                <strong>{{ formatDateTime(period.openedAt) }}</strong>
              </div>

              <div>
                <span>Processing By</span>
                <strong>{{ period.processingBy || '—' }}</strong>
              </div>

              <div>
                <span>Processing At</span>
                <strong>{{ formatDateTime(period.processingAt) }}</strong>
              </div>

              <div>
                <span>Closed By</span>
                <strong>{{ period.closedBy || '—' }}</strong>
              </div>

              <div>
                <span>Closed At</span>
                <strong>{{ formatDateTime(period.closedAt) }}</strong>
              </div>

            </div>

          </section>

        </div>

        <div class="modal-footer">

          <span>
            Period ID:
            #{{ period.id }}
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
  max-width: 900px;

  max-height:
    calc(100vh - 40px);

  flex-direction: column;

  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 13px;

  background:
    var(--bg-card);
}

.modal-header,
.modal-footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding:
    15px 18px;
}

.modal-header {
  border-bottom:
    1px solid
    var(--border-soft);
}

.modal-footer {
  border-top:
    1px solid
    var(--border-soft);

  background:
    var(--bg-card-soft);
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
  margin-top: 10px;
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
.audit-grid,
.summary-grid,
.money-grid {
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

.money-grid {
  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );
}

.info-grid > div,
.audit-grid > div,
.summary-grid > div,
.money-grid > div {
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
.audit-grid strong,
.summary-grid span,
.summary-grid strong,
.money-grid span,
.money-grid strong {
  display: block;
}

.info-grid span,
.audit-grid span,
.summary-grid span,
.money-grid span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.info-grid strong,
.audit-grid strong,
.summary-grid strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.money-grid strong {
  margin-top: 4px;

  color:
    var(--text-primary);

  font-size: 11px;
}

.blue {
  color:
    var(--primary) !important;
}

.green {
  color:
    var(--green) !important;
}

.orange {
  color:
    var(--orange) !important;
}

.red {
  color:
    var(--red) !important;
}

.progress-wrapper {
  margin-top: 10px;
}

.progress-header {
  display: flex;

  justify-content: space-between;

  color:
    var(--text-secondary);

  font-size: 9px;
}

.progress-track {
  height: 7px;

  margin-top: 6px;

  overflow: hidden;

  border-radius: 100px;

  background:
    var(--border-soft);
}

.progress-bar {
  height: 100%;

  border-radius: inherit;

  background:
    var(--green);
}

.notes {
  margin: 0;

  color:
    var(--text-secondary);

  font-size: 9px;

  line-height: 1.6;
}

.danger-card {
  border-color:
    color-mix(
      in srgb,
      var(--red) 25%,
      var(--border)
    );
}

.section-heading.danger {
  color:
    var(--red);
}

.modal-footer > span {
  color:
    var(--text-muted);

  font-size: 8px;
}

@media (max-width: 700px) {
  .info-grid,
  .audit-grid,
  .summary-grid,
  .money-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }
}
</style>