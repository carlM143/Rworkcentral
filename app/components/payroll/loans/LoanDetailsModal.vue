<script setup lang="ts">
import {
  X,
  WalletCards,
  UserRound,
  BadgeDollarSign,
  CalendarDays,
  FileText,
  Paperclip,
  ShieldCheck,
} from 'lucide-vue-next'

import type {
  LoanRecord,
} from '~/types/loan'

defineProps<{
  open: boolean

  loan:
    LoanRecord | null
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

const date = (
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

const dateTime = (
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
  loan:
    LoanRecord,
) => {
  if (
    !loan.principalAmount
  ) {
    return 0
  }

  return Math.min(
    100,
    Math.round(
      (
        loan.totalPaid /
        loan.principalAmount
      ) *
        100,
    ),
  )
}
</script>

<template>
  <Teleport to="body">

    <div
      v-if="
        open &&
        loan
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
              <WalletCards :size="20" />
            </div>

            <div>

              <h2>
                Loan Details
              </h2>

              <p>
                {{ loan.loanNumber }}
                ·
                {{ loan.employeeName }}
              </p>

            </div>

          </div>

          <div class="header-right">

            <StatusBadge
              :status="
                loan.status
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
                <strong>{{ loan.employeeName }}</strong>
              </div>

              <div>
                <span>Employee ID</span>
                <strong>{{ loan.employeeNumber }}</strong>
              </div>

              <div>
                <span>Department</span>
                <strong>{{ loan.department }}</strong>
              </div>

              <div>
                <span>Position</span>
                <strong>{{ loan.position }}</strong>
              </div>

            </div>

          </section>

          <section class="section-card">

            <div class="section-heading">

              <BadgeDollarSign :size="16" />

              <h3>
                Loan Information
              </h3>

            </div>

            <div class="info-grid">

              <div>
                <span>Loan Type</span>
                <strong>{{ loan.loanType }}</strong>
              </div>

              <div>
                <span>Principal</span>
                <strong>{{ money(loan.principalAmount) }}</strong>
              </div>

              <div>
                <span>Monthly Deduction</span>
                <strong>{{ money(loan.monthlyDeduction) }}</strong>
              </div>

              <div>
                <span>Status</span>
                <StatusBadge :status="loan.status" />
              </div>

            </div>

          </section>

          <section class="section-card">

            <div class="section-heading">

              <BadgeDollarSign :size="16" />

              <h3>
                Payment Summary
              </h3>

            </div>

            <div class="summary-grid">

              <div>
                <span>Principal</span>
                <strong>{{ money(loan.principalAmount) }}</strong>
              </div>

              <div>
                <span>Total Paid</span>
                <strong class="green">{{ money(loan.totalPaid) }}</strong>
              </div>

              <div>
                <span>Outstanding</span>
                <strong class="orange">{{ money(loan.outstandingBalance) }}</strong>
              </div>

            </div>

            <div class="progress-info">

              <div>
                <span>Payment Progress</span>
                <strong>{{ progress(loan) }}%</strong>
              </div>

              <div class="progress-track">
                <div
                  class="progress-bar"
                  :style="{
                    width:
                      `${progress(loan)}%`,
                  }"
                />
              </div>

            </div>

          </section>

          <section class="section-card">

            <div class="section-heading">

              <CalendarDays :size="16" />

              <h3>
                Loan Period
              </h3>

            </div>

            <div class="info-grid two">

              <div>
                <span>Start Date</span>
                <strong>{{ date(loan.startDate) }}</strong>
              </div>

              <div>
                <span>End Date</span>
                <strong>{{ date(loan.endDate) }}</strong>
              </div>

            </div>

          </section>

          <section
            v-if="loan.remarks"
            class="section-card"
          >

            <div class="section-heading">

              <FileText :size="16" />

              <h3>
                Remarks
              </h3>

            </div>

            <p class="notes">
              {{ loan.remarks }}
            </p>

          </section>

          <section
            v-if="loan.attachment"
            class="section-card"
          >

            <div class="section-heading">

              <Paperclip :size="16" />

              <h3>
                Attachment
              </h3>

            </div>

            <div class="attachment">
              <Paperclip :size="15" />
              {{ loan.attachment.name }}
            </div>

          </section>

          <section class="section-card">

            <div class="section-heading">

              <ShieldCheck :size="16" />

              <h3>
                Audit Information
              </h3>

            </div>

            <div class="audit-grid">

              <div>
                <span>Requested By</span>
                <strong>{{ loan.requestedBy }}</strong>
              </div>

              <div>
                <span>Requested At</span>
                <strong>{{ dateTime(loan.requestedAt) }}</strong>
              </div>

              <div>
                <span>Approved By</span>
                <strong>{{ loan.approvedBy || '—' }}</strong>
              </div>

              <div>
                <span>Approved At</span>
                <strong>{{ dateTime(loan.approvedAt) }}</strong>
              </div>

              <div v-if="loan.rejectionReason">
                <span>Rejection Reason</span>
                <strong>{{ loan.rejectionReason }}</strong>
              </div>

              <div v-if="loan.cancellationReason">
                <span>Cancellation Reason</span>
                <strong>{{ loan.cancellationReason }}</strong>
              </div>

            </div>

          </section>

        </div>

        <div class="modal-footer">

          <span>
            Loan ID: #{{ loan.id }}
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
    var(--purple-soft);

  color:
    var(--purple);
}

.modal-header h2 {
  margin: 0;

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
.summary-grid {
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

.summary-grid {
  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );
}

.info-grid > div,
.audit-grid > div,
.summary-grid > div {
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
.summary-grid strong {
  display: block;
}

.info-grid span,
.audit-grid span,
.summary-grid span {
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

.green {
  color:
    var(--green) !important;
}

.orange {
  color:
    var(--orange) !important;
}

.progress-info {
  margin-top: 10px;
}

.progress-info > div:first-child {
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

  transition:
    width 0.3s ease;
}

.notes {
  margin: 0;

  color:
    var(--text-secondary);

  font-size: 9px;

  line-height: 1.6;
}

.attachment {
  display: flex;

  align-items: center;

  gap: 7px;

  padding: 9px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card);

  color:
    var(--text-primary);

  font-size: 9px;
}

.modal-footer > span {
  color:
    var(--text-muted);

  font-size: 8px;
}

@media (max-width: 700px) {
  .info-grid,
  .audit-grid,
  .summary-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }
}
</style>