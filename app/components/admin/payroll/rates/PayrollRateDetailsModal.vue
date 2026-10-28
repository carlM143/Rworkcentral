<script setup lang="ts">
import {
  X,
  BadgeDollarSign,
  UserRound,
  WalletCards,
  CalendarDays,
  FileText,
  ShieldCheck,
  Truck,
} from 'lucide-vue-next'

import type {
  PayrollRate,
} from '~/types/payrollRate'

defineProps<{
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
                <BadgeDollarSign :size="20" />
              </div>

              <div>

                <h2>
                  Payroll Rate Details
                </h2>

                <p>
                  {{ rate.rateCode }}
                  ·
                  {{ rate.employeeName }}
                </p>

              </div>

            </div>

            <div class="header-right">

              <StatusBadge
                :status="
                  rate.status
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

            <!-- HERO -->

            <section class="rate-hero">

              <div class="hero-left">

                <div class="hero-icon">
                  <BadgeDollarSign :size="23" />
                </div>

                <div>

                  <span>
                    Rate Code
                  </span>

                  <strong>
                    {{ rate.rateCode }}
                  </strong>

                  <small>
                    {{
                      rate.rateType
                    }}
                    ·
                    {{
                      rate.payBasis
                    }}
                  </small>

                </div>

              </div>

              <StatusBadge
                :status="
                  rate.status
                "
              />

            </section>

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
                      rate.employeeName
                    }}
                  </strong>

                </div>

                <div>

                  <span>
                    Employee ID
                  </span>

                  <strong>
                    {{
                      rate.employeeNumber
                    }}
                  </strong>

                </div>

                <div>

                  <span>
                    Department
                  </span>

                  <strong>
                    {{
                      rate.department
                    }}
                  </strong>

                </div>

                <div>

                  <span>
                    Position
                  </span>

                  <strong>
                    {{
                      rate.position
                    }}
                  </strong>

                </div>

              </div>

            </section>

            <!-- RATE INFORMATION -->

            <section class="section-card">

              <div class="section-heading">

                <WalletCards :size="16" />

                <h3>
                  Rate Information
                </h3>

              </div>

              <div class="info-grid three">

                <div>

                  <span>
                    Rate Type
                  </span>

                  <strong class="blue">
                    {{
                      rate.rateType
                    }}
                  </strong>

                </div>

                <div>

                  <span>
                    Pay Basis
                  </span>

                  <strong>
                    {{
                      rate.payBasis
                    }}
                  </strong>

                </div>

                <div>

                  <span>
                    Effective Date
                  </span>

                  <strong>
                    {{
                      formatDate(
                        rate.effectiveDate,
                      )
                    }}
                  </strong>

                </div>

              </div>

            </section>

            <!-- BASIC COMPENSATION -->

            <section class="section-card">

              <div class="section-heading">

                <BadgeDollarSign :size="16" />

                <h3>
                  Basic Compensation
                </h3>

              </div>

              <div class="money-grid">

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

              </div>

            </section>

            <!-- PREMIUM -->

            <section class="section-card">

              <div class="section-heading">

                <BadgeDollarSign :size="16" />

                <h3>
                  Premium Rates
                </h3>

              </div>

              <div class="money-grid premium">

                <div>

                  <span>
                    OT Rate
                  </span>

                  <strong>
                    {{
                      formatMoney(
                        rate.overtimeRate,
                      )
                    }}
                  </strong>

                </div>

                <div>

                  <span>
                    Rest Day Rate
                  </span>

                  <strong>
                    {{
                      formatMoney(
                        rate.restDayRate,
                      )
                    }}
                  </strong>

                </div>

                <div>

                  <span>
                    Regular Holiday
                  </span>

                  <strong>
                    {{
                      formatMoney(
                        rate.regularHolidayRate,
                      )
                    }}
                  </strong>

                </div>

                <div>

                  <span>
                    Special Holiday
                  </span>

                  <strong>
                    {{
                      formatMoney(
                        rate.specialHolidayRate,
                      )
                    }}
                  </strong>

                </div>

                <div>

                  <span>
                    Night Differential
                  </span>

                  <strong>
                    {{
                      formatMoney(
                        rate.nightDifferentialRate,
                      )
                    }}
                  </strong>

                </div>

                <div>

                  <span>
                    Allowance
                  </span>

                  <strong>
                    {{
                      formatMoney(
                        rate.allowance,
                      )
                    }}
                  </strong>

                </div>

              </div>

            </section>

            <!-- DRIVER -->

            <section
              v-if="
                rate.rateType ===
                'Driver'
              "
              class="section-card"
            >

              <div class="section-heading">

                <Truck :size="16" />

                <h3>
                  Driver Compensation
                </h3>

              </div>

              <div class="driver-rate">

                <div class="driver-icon">
                  <Truck :size="18" />
                </div>

                <div>

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

            </section>

            <!-- REMARKS -->

            <section
              v-if="
                rate.remarks
              "
              class="section-card"
            >

              <div class="section-heading">

                <FileText :size="16" />

                <h3>
                  Remarks
                </h3>

              </div>

              <p class="remarks">
                {{ rate.remarks }}
              </p>

            </section>

            <!-- AUDIT -->

            <section class="section-card">

              <div class="section-heading">

                <ShieldCheck :size="16" />

                <h3>
                  Rate Audit
                </h3>

              </div>

              <div class="audit-grid">

                <div>

                  <span>
                    Created By
                  </span>

                  <strong>
                    {{
                      rate.createdBy
                    }}
                  </strong>

                </div>

                <div>

                  <span>
                    Created At
                  </span>

                  <strong>
                    {{
                      formatDateTime(
                        rate.createdAt,
                      )
                    }}
                  </strong>

                </div>

                <div>

                  <span>
                    Updated By
                  </span>

                  <strong>
                    {{
                      rate.updatedBy ||
                      '—'
                    }}
                  </strong>

                </div>

                <div>

                  <span>
                    Updated At
                  </span>

                  <strong>
                    {{
                      formatDateTime(
                        rate.updatedAt,
                      )
                    }}
                  </strong>

                </div>

              </div>

            </section>

          </div>

          <!-- FOOTER -->

          <div class="modal-footer">

            <div class="footer-reference">

              <CalendarDays :size="13" />

              Effective:
              {{
                formatDate(
                  rate.effectiveDate,
                )
              }}

            </div>

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

  box-shadow:
    0 24px 80px
    rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 15px;

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
    var(--green-soft);

  color:
    var(--green);
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

.rate-hero {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 12px;

  margin-bottom: 11px;

  padding: 13px;

  border:
    1px solid
    color-mix(
      in srgb,
      var(--green) 25%,
      var(--border)
    );

  border-radius: 9px;

  background:
    var(--green-soft);
}

.hero-left {
  display: flex;

  align-items: center;

  gap: 10px;
}

.hero-icon {
  display: flex;

  width: 42px;
  height: 42px;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background:
    var(--bg-card);

  color:
    var(--green);
}

.hero-left span,
.hero-left strong,
.hero-left small {
  display: block;
}

.hero-left span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.hero-left strong {
  margin-top: 2px;

  color:
    var(--text-primary);

  font-size: 13px;
}

.hero-left small {
  margin-top: 3px;

  color:
    var(--text-secondary);

  font-size: 8px;
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
.audit-grid,
.money-grid {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.info-grid.three,
.money-grid {
  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );
}

.money-grid.premium {
  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );
}

.info-grid > div,
.audit-grid > div,
.money-grid > div {
  padding: 10px;

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
.money-grid span,
.money-grid strong {
  display: block;
}

.info-grid span,
.audit-grid span,
.money-grid span {
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

.money-grid strong {
  margin-top: 4px;

  color:
    var(--green);

  font-size: 11px;
}

.blue {
  color:
    var(--primary) !important;
}

.driver-rate {
  display: flex;

  align-items: center;

  gap: 9px;

  padding: 11px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    var(--bg-card);
}

.driver-icon {
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

.driver-rate span,
.driver-rate strong {
  display: block;
}

.driver-rate span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.driver-rate strong {
  margin-top: 3px;

  color:
    var(--green);

  font-size: 12px;
}

.remarks {
  margin: 0;

  color:
    var(--text-secondary);

  font-size: 9px;

  line-height: 1.65;
}

.modal-footer {
  display: flex;

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

.footer-reference {
  display: flex;

  align-items: center;

  gap: 5px;

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
  .info-grid,
  .info-grid.three,
  .audit-grid,
  .money-grid,
  .money-grid.premium {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }
}

@media (max-width: 520px) {
  .info-grid,
  .info-grid.three,
  .audit-grid,
  .money-grid,
  .money-grid.premium {
    grid-template-columns:
      1fr;
  }

  .rate-hero {
    align-items:
      flex-start;

    flex-direction:
      column;
  }
}
</style>