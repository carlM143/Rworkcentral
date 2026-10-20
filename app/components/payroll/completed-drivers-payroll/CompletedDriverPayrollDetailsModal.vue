<script setup lang="ts">
import {
  X,
  Truck,
  Route,
  ReceiptText,
  CreditCard,
} from 'lucide-vue-next'

import type {
  CompletedDriverPayroll,
} from '~/types/completedDriverPayroll'

defineProps<{
  open: boolean

  payroll:
    CompletedDriverPayroll |
    null
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

    <div
      v-if="
        open &&
        payroll
      "
      class="overlay"
      @click.self="
        emit('close')
      "
    >

      <article class="modal">

        <header>

          <div class="heading">

            <div class="icon">
              <Truck :size="18" />
            </div>

            <div>

              <h2>
                Completed Driver Payroll
              </h2>

              <p>
                {{ payroll.payrollNumber }}
              </p>

            </div>

          </div>

          <button
            class="close"
            @click="
              emit('close')
            "
          >
            <X :size="18" />
          </button>

        </header>

        <div class="body">

          <section class="driver-card">

            <div>

              <strong>
                {{ payroll.driverName }}
              </strong>

              <span>
                {{ payroll.employeeNumber }}
                ·
                {{ payroll.department }}
                ·
                {{ payroll.position }}
              </span>

            </div>

            <StatusBadge
              :status="
                payroll.payrollStatus
              "
            />

          </section>

          <section class="summary-grid">

            <div>
              <span>PAY PERIOD</span>

              <strong>
                {{ payroll.periodName }}
              </strong>
            </div>

            <div>
              <span>TRIPS</span>

              <strong>
                {{ payroll.totalTrips }}
              </strong>
            </div>

            <div>
              <span>REGULAR HOURS</span>

              <strong>
                {{ payroll.regularHours }}
              </strong>
            </div>

            <div>
              <span>OT HOURS</span>

              <strong>
                {{ payroll.overtimeHours }}
              </strong>
            </div>

          </section>

          <section class="section">

            <div class="section-title">

              <Route :size="15" />

              Earnings
            </div>

            <div class="money-grid">

              <div>
                <span>Regular Pay</span>
                <strong>
                  {{ money(payroll.regularPay) }}
                </strong>
              </div>

              <div>
                <span>Trip Pay</span>
                <strong>
                  {{ money(payroll.tripPay) }}
                </strong>
              </div>

              <div>
                <span>Overtime Pay</span>
                <strong>
                  {{ money(payroll.overtimePay) }}
                </strong>
              </div>

              <div>
                <span>Holiday Pay</span>
                <strong>
                  {{ money(payroll.holidayPay) }}
                </strong>
              </div>

              <div>
                <span>Allowance</span>
                <strong>
                  {{ money(payroll.allowance) }}
                </strong>
              </div>

              <div class="gross">
                <span>Gross Pay</span>

                <strong>
                  {{ money(payroll.grossPay) }}
                </strong>
              </div>

            </div>

          </section>

          <section class="section">

            <div class="section-title">

              <ReceiptText :size="15" />

              Deductions
            </div>

            <div class="money-grid">

              <div>
                <span>SSS</span>
                <strong>
                  {{ money(payroll.sss) }}
                </strong>
              </div>

              <div>
                <span>PhilHealth</span>
                <strong>
                  {{ money(payroll.philHealth) }}
                </strong>
              </div>

              <div>
                <span>Pag-IBIG</span>
                <strong>
                  {{ money(payroll.pagIbig) }}
                </strong>
              </div>

              <div>
                <span>Loan</span>
                <strong>
                  {{ money(payroll.loanDeduction) }}
                </strong>
              </div>

              <div>
                <span>Other</span>
                <strong>
                  {{ money(payroll.otherDeductions) }}
                </strong>
              </div>

              <div class="deduction">
                <span>Total Deductions</span>

                <strong>
                  {{ money(payroll.totalDeductions) }}
                </strong>
              </div>

            </div>

          </section>

          <section class="net-card">

            <div>

              <span>FINAL NET PAY</span>

              <strong>
                {{ money(payroll.netPay) }}
              </strong>

            </div>

            <div>

              <span>PAYMENT STATUS</span>

              <strong class="payment">
                {{ payroll.paymentStatus }}
              </strong>

            </div>

          </section>

          <section class="payment-card">

            <CreditCard :size="16" />

            <div>

              <strong>
                Payment Information
              </strong>

              <span>
                Reference:
                {{
                  payroll.referenceNumber ||
                  'Not yet assigned'
                }}
              </span>

              <span>
                Paid:
                {{
                  formatDateTime(
                    payroll.paidAt,
                  )
                }}
              </span>

            </div>

          </section>

          <section class="completion">

            <div>

              <span>COMPLETED BY</span>

              <strong>
                {{ payroll.completedBy }}
              </strong>

            </div>

            <div>

              <span>COMPLETED AT</span>

              <strong>
                {{
                  formatDateTime(
                    payroll.completedAt,
                  )
                }}
              </strong>

            </div>

          </section>

          <section
            v-if="
              payroll.remarks
            "
            class="remarks"
          >

            <strong>
              Remarks
            </strong>

            <p>
              {{ payroll.remarks }}
            </p>

          </section>

        </div>

        <footer>

          <AppButton
            variant="secondary"
            @click="
              emit('close')
            "
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
    rgba(3, 8, 18, 0.77);

  backdrop-filter:
    blur(4px);
}

.modal {
  width: 100%;
  max-width: 720px;

  max-height:
    calc(100vh - 40px);

  overflow-y: auto;

  border:
    1px solid var(--border);

  border-radius: 13px;

  background:
    var(--bg-card);
}

header {
  position: sticky;

  z-index: 2;
  top: 0;

  display: flex;

  align-items: center;
  justify-content: space-between;

  padding: 15px 18px;

  border-bottom:
    1px solid var(--border-soft);

  background:
    var(--bg-card);
}

.heading {
  display: flex;

  align-items: center;

  gap: 9px;
}

.icon {
  display: flex;

  width: 38px;
  height: 38px;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--green-soft);

  color:
    var(--green);
}

h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

.heading p {
  margin: 3px 0 0;

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

.body {
  padding: 17px 18px;
}

.driver-card {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding: 11px;

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.driver-card strong,
.driver-card span {
  display: block;
}

.driver-card strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.driver-card span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

.summary-grid {
  display: grid;

  grid-template-columns:
    repeat(4, minmax(0, 1fr));

  gap: 7px;

  margin-top: 10px;
}

.summary-grid > div,
.money-grid > div,
.completion > div {
  padding: 9px;

  border:
    1px solid var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card-soft);
}

.summary-grid span,
.summary-grid strong,
.money-grid span,
.money-grid strong,
.completion span,
.completion strong {
  display: block;
}

.summary-grid span,
.money-grid span,
.completion span {
  color:
    var(--text-muted);

  font-size: 6.5px;
}

.summary-grid strong,
.money-grid strong,
.completion strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 8.5px;
}

.section {
  margin-top: 15px;
}

.section-title {
  display: flex;

  align-items: center;

  gap: 6px;

  color:
    var(--text-primary);

  font-size: 9px;
  font-weight: 700;
}

.money-grid {
  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 7px;

  margin-top: 8px;
}

.gross strong {
  color:
    var(--primary);
}

.deduction strong {
  color:
    var(--red);
}

.net-card {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 8px;

  margin-top: 12px;
}

.net-card > div {
  padding: 12px;

  border-radius: 8px;

  background:
    var(--green-soft);
}

.net-card span,
.net-card strong {
  display: block;
}

.net-card span {
  color:
    var(--text-muted);

  font-size: 7px;
}

.net-card strong {
  margin-top: 4px;

  color:
    var(--green);

  font-size: 14px;
}

.net-card .payment {
  font-size: 10px;
}

.payment-card {
  display: flex;

  align-items: flex-start;

  gap: 8px;

  margin-top: 10px;

  padding: 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  color:
    var(--primary);
}

.payment-card strong,
.payment-card span {
  display: block;
}

.payment-card strong {
  color:
    var(--text-primary);

  font-size: 8px;
}

.payment-card span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 7px;
}

.completion {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 7px;

  margin-top: 10px;
}

.remarks {
  margin-top: 10px;

  padding: 10px;

  border:
    1px solid var(--border-soft);

  border-radius: 7px;
}

.remarks strong {
  color:
    var(--text-primary);

  font-size: 8px;
}

.remarks p {
  margin: 4px 0 0;

  color:
    var(--text-secondary);

  font-size: 8px;
}

footer {
  position: sticky;

  bottom: 0;

  display: flex;

  justify-content: flex-end;

  padding: 13px 18px;

  border-top:
    1px solid var(--border-soft);

  background:
    var(--bg-card);
}

@media (max-width: 600px) {
  .summary-grid,
  .money-grid,
  .net-card,
  .completion {
    grid-template-columns: 1fr;
  }
}
</style>