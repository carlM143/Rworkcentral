<script setup lang="ts">
import {
  X,
  UserRound,
  WalletCards,
  ReceiptText,
  CreditCard,
} from 'lucide-vue-next'

import type {
  EmployeePayroll,
} from '~/types/employeePayroll'

defineProps<{
  open: boolean

  payroll:
    EmployeePayroll |
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

            <div class="header-icon">
              <UserRound :size="18" />
            </div>

            <div>

              <h2>
                Employee Payroll Details
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

          <section class="employee-card">

            <div>

              <strong>
                {{ payroll.employeeName }}
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
              <span>REGULAR DAYS</span>

              <strong>
                {{ payroll.regularDays }}
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

              <WalletCards :size="15" />

              Earnings

            </div>

            <div class="money-grid">

              <div>
                <span>Basic Pay</span>

                <strong>
                  {{ money(payroll.basicPay) }}
                </strong>
              </div>

              <div>
                <span>Overtime</span>

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
                <span>Night Differential</span>

                <strong>
                  {{ money(payroll.nightDifferential) }}
                </strong>
              </div>

              <div>
                <span>Allowances</span>

                <strong>
                  {{ money(payroll.allowances) }}
                </strong>
              </div>

              <div>
                <span>Other Earnings</span>

                <strong>
                  {{ money(payroll.otherEarnings) }}
                </strong>
              </div>

            </div>

            <div class="total-card gross">

              <span>
                GROSS PAY
              </span>

              <strong>
                {{ money(payroll.grossPay) }}
              </strong>

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
                <span>Late</span>

                <strong>
                  {{ money(payroll.lateDeduction) }}
                </strong>
              </div>

              <div>
                <span>Undertime</span>

                <strong>
                  {{ money(payroll.undertimeDeduction) }}
                </strong>
              </div>

              <div>
                <span>Absence</span>

                <strong>
                  {{ money(payroll.absenceDeduction) }}
                </strong>
              </div>

              <div>
                <span>Other Deductions</span>

                <strong>
                  {{ money(payroll.otherDeductions) }}
                </strong>
              </div>

            </div>

            <div class="total-card deductions">

              <span>
                TOTAL DEDUCTIONS
              </span>

              <strong>
                {{ money(payroll.totalDeductions) }}
              </strong>

            </div>

          </section>

          <section class="net-card">

            <div>

              <span>
                NET PAY
              </span>

              <strong>
                {{ money(payroll.netPay) }}
              </strong>

            </div>

            <div>

              <span>
                PAYMENT STATUS
              </span>

              <strong class="payment">
                {{ payroll.paymentStatus }}
              </strong>

            </div>

          </section>

          <section class="section">

            <div class="section-title">

              <CreditCard :size="15" />

              Processing Information

            </div>

            <div class="processing-grid">

              <div>

                <span>
                  Prepared By
                </span>

                <strong>
                  {{ payroll.preparedBy }}
                </strong>

                <small>
                  {{
                    formatDateTime(
                      payroll.preparedAt,
                    )
                  }}
                </small>

              </div>

              <div>

                <span>
                  Completed By
                </span>

                <strong>
                  {{ payroll.completedBy || '—' }}
                </strong>

                <small>
                  {{
                    formatDateTime(
                      payroll.completedAt,
                    )
                  }}
                </small>

              </div>

              <div>

                <span>
                  Paid By
                </span>

                <strong>
                  {{ payroll.paidBy || '—' }}
                </strong>

                <small>
                  {{
                    formatDateTime(
                      payroll.paidAt,
                    )
                  }}
                </small>

              </div>

              <div>

                <span>
                  Reference No.
                </span>

                <strong>
                  {{ payroll.referenceNumber || '—' }}
                </strong>

              </div>

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

  max-width: 760px;

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

  padding:
    15px 18px;

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

.header-icon {
  display: flex;

  width: 38px;
  height: 38px;

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

.body {
  padding:
    17px 18px;
}

.employee-card {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding: 11px;

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.employee-card strong,
.employee-card span {
  display: block;
}

.employee-card strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.employee-card span {
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
.processing-grid > div {
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
.processing-grid span,
.processing-grid strong,
.processing-grid small {
  display: block;
}

.summary-grid span,
.money-grid span,
.processing-grid span {
  color:
    var(--text-muted);

  font-size: 6.5px;
}

.summary-grid strong,
.money-grid strong,
.processing-grid strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 8.5px;
}

.processing-grid small {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 7px;
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

.processing-grid {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 7px;

  margin-top: 8px;
}

.total-card {
  margin-top: 7px;

  padding: 10px;

  border-radius: 8px;
}

.total-card span,
.total-card strong {
  display: block;
}

.total-card span {
  font-size: 7px;
}

.total-card strong {
  margin-top: 3px;

  font-size: 13px;
}

.total-card.gross {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.total-card.deductions {
  background:
    var(--red-soft);

  color:
    var(--red);
}

.net-card {
  display: grid;

  grid-template-columns:
    minmax(0, 1fr)
    180px;

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

  font-size: 15px;
}

.net-card .payment {
  font-size: 10px;
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
  margin:
    4px 0 0;

  color:
    var(--text-secondary);

  font-size: 8px;
}

footer {
  position: sticky;

  bottom: 0;

  display: flex;

  justify-content: flex-end;

  padding:
    13px 18px;

  border-top:
    1px solid var(--border-soft);

  background:
    var(--bg-card);
}

@media (max-width: 650px) {
  .summary-grid,
  .money-grid,
  .processing-grid,
  .net-card {
    grid-template-columns: 1fr;
  }
}
</style>