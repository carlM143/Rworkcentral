<script setup lang="ts">
import {
  X,
  Truck,
  Clock3,
  Route,
  ReceiptText,
} from 'lucide-vue-next'

import type {
  PendingDriverPayroll,
} from '~/types/pendingDriverPayroll'

defineProps<{
  open: boolean

  payroll:
    PendingDriverPayroll |
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

            <div class="header-icon">
              <Truck :size="18" />
            </div>

            <div>
              <h2>
                Driver Payroll Details
              </h2>

              <p>
                {{ payroll.payrollNumber }}
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

        <div class="body">

          <section class="driver-card">

            <div class="driver-icon">
              <Truck :size="17" />
            </div>

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
              :status="payroll.status"
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
              <span>TOTAL TRIPS</span>

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

              <span>
                ESTIMATED NET PAY
              </span>

              <strong>
                {{ money(payroll.netPay) }}
              </strong>

            </div>

            <div class="prepared">

              <Clock3 :size="13" />

              Prepared by
              {{ payroll.preparedBy }}

            </div>

          </section>

          <section
            v-if="payroll.remarks"
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

  z-index: 3;
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

.header-icon,
.driver-icon {
  display: flex;

  width: 38px;
  height: 38px;

  flex-shrink: 0;

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

  cursor: pointer;
}

.body {
  padding: 17px 18px;
}

.driver-card {
  display: flex;

  align-items: center;

  gap: 9px;

  padding: 11px;

  border:
    1px solid var(--border-soft);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.driver-card > div:nth-child(2) {
  flex: 1;
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

.summary-grid,
.money-grid {
  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 7px;

  margin-top: 10px;
}

.summary-grid {
  grid-template-columns:
    repeat(4, minmax(0, 1fr));
}

.summary-grid > div,
.money-grid > div {
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
.money-grid strong {
  display: block;
}

.summary-grid span,
.money-grid span {
  color:
    var(--text-muted);

  font-size: 6.5px;
}

.summary-grid strong,
.money-grid strong {
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

.gross strong {
  color:
    var(--primary);
}

.deduction strong {
  color:
    var(--red);
}

.net-card {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  margin-top: 12px;

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
  margin-top: 3px;

  color:
    var(--green);

  font-size: 15px;
}

.prepared {
  display: flex;

  align-items: center;

  gap: 5px;

  color:
    var(--text-secondary);

  font-size: 8px;
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
  .money-grid {
    grid-template-columns:
      1fr;
  }

  .net-card {
    align-items:
      flex-start;

    flex-direction:
      column;
  }
}
</style>