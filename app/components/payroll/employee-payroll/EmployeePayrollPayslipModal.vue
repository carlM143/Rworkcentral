<script setup lang="ts">
import {
  X,
  ReceiptText,
  Printer,
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
    print: []
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

            <div class="icon">
              <ReceiptText :size="18" />
            </div>

            <div>

              <h2>
                Payslip Preview
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

          <section class="company">

            <strong>
              RWorkCentral Inc.
            </strong>

            <span>
              Employee Payslip
            </span>

          </section>

          <section class="employee">

            <div>

              <span>
                EMPLOYEE
              </span>

              <strong>
                {{ payroll.employeeName }}
              </strong>

              <small>
                {{ payroll.employeeNumber }}
              </small>

            </div>

            <div>

              <span>
                DEPARTMENT
              </span>

              <strong>
                {{ payroll.department }}
              </strong>

              <small>
                {{ payroll.position }}
              </small>

            </div>

            <div>

              <span>
                PAY PERIOD
              </span>

              <strong>
                {{ payroll.periodName }}
              </strong>

              <small>
                {{ payroll.periodCode }}
              </small>

            </div>

          </section>

          <div class="columns">

            <section class="panel">

              <h3>
                Earnings
              </h3>

              <div class="row">
                <span>Basic Pay</span>
                <strong>
                  {{ money(payroll.basicPay) }}
                </strong>
              </div>

              <div class="row">
                <span>Overtime Pay</span>
                <strong>
                  {{ money(payroll.overtimePay) }}
                </strong>
              </div>

              <div class="row">
                <span>Holiday Pay</span>
                <strong>
                  {{ money(payroll.holidayPay) }}
                </strong>
              </div>

              <div class="row">
                <span>Night Differential</span>
                <strong>
                  {{ money(payroll.nightDifferential) }}
                </strong>
              </div>

              <div class="row">
                <span>Allowances</span>
                <strong>
                  {{ money(payroll.allowances) }}
                </strong>
              </div>

              <div class="row">
                <span>Other Earnings</span>
                <strong>
                  {{ money(payroll.otherEarnings) }}
                </strong>
              </div>

              <div class="row total">
                <span>Gross Pay</span>
                <strong>
                  {{ money(payroll.grossPay) }}
                </strong>
              </div>

            </section>

            <section class="panel">

              <h3>
                Deductions
              </h3>

              <div class="row">
                <span>SSS</span>
                <strong>
                  {{ money(payroll.sss) }}
                </strong>
              </div>

              <div class="row">
                <span>PhilHealth</span>
                <strong>
                  {{ money(payroll.philHealth) }}
                </strong>
              </div>

              <div class="row">
                <span>Pag-IBIG</span>
                <strong>
                  {{ money(payroll.pagIbig) }}
                </strong>
              </div>

              <div class="row">
                <span>Loans</span>
                <strong>
                  {{ money(payroll.loanDeduction) }}
                </strong>
              </div>

              <div class="row">
                <span>Late</span>
                <strong>
                  {{ money(payroll.lateDeduction) }}
                </strong>
              </div>

              <div class="row">
                <span>Undertime</span>
                <strong>
                  {{ money(payroll.undertimeDeduction) }}
                </strong>
              </div>

              <div class="row">
                <span>Absence</span>
                <strong>
                  {{ money(payroll.absenceDeduction) }}
                </strong>
              </div>

              <div class="row">
                <span>Others</span>
                <strong>
                  {{ money(payroll.otherDeductions) }}
                </strong>
              </div>

              <div class="row total red">
                <span>Total Deductions</span>
                <strong>
                  {{ money(payroll.totalDeductions) }}
                </strong>
              </div>

            </section>

          </div>

          <section class="net-pay">

            <span>
              NET PAY
            </span>

            <strong>
              {{ money(payroll.netPay) }}
            </strong>

          </section>

          <section class="payment">

            <div>

              <span>
                PAYROLL STATUS
              </span>

              <strong>
                {{ payroll.payrollStatus }}
              </strong>

            </div>

            <div>

              <span>
                PAYMENT STATUS
              </span>

              <strong>
                {{ payroll.paymentStatus }}
              </strong>

            </div>

            <div>

              <span>
                REFERENCE
              </span>

              <strong>
                {{ payroll.referenceNumber || '—' }}
              </strong>

            </div>

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

          <AppButton
            :icon="Printer"
            @click="
              emit('print')
            "
          >
            Print Payslip
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
  display: flex;

  align-items: center;
  justify-content: space-between;

  padding:
    15px 18px;

  border-bottom:
    1px solid var(--border-soft);
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
    18px;
}

.company {
  padding:
    14px;

  border-radius: 8px;

  background:
    var(--primary-soft);

  text-align: center;
}

.company strong,
.company span {
  display: block;
}

.company strong {
  color:
    var(--primary);

  font-size: 15px;
}

.company span {
  margin-top: 3px;

  color:
    var(--text-secondary);

  font-size: 8px;
}

.employee {
  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 7px;

  margin-top: 10px;
}

.employee > div {
  padding: 9px;

  border:
    1px solid var(--border-soft);

  border-radius: 7px;
}

.employee span,
.employee strong,
.employee small {
  display: block;
}

.employee span {
  color:
    var(--text-muted);

  font-size: 6px;
}

.employee strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 8px;
}

.employee small {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 7px;
}

.columns {
  display: grid;

  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 10px;

  margin-top: 12px;
}

.panel {
  padding: 11px;

  border:
    1px solid var(--border);

  border-radius: 8px;
}

.panel h3 {
  margin:
    0 0 8px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.row {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 10px;

  padding:
    6px 0;

  border-bottom:
    1px solid var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 8px;
}

.row strong {
  color:
    var(--text-primary);
}

.row.total {
  margin-top: 5px;

  padding:
    8px;

  border: 0;
  border-radius: 6px;

  background:
    var(--primary-soft);
}

.row.total strong {
  color:
    var(--primary);
}

.row.total.red {
  background:
    var(--red-soft);
}

.row.total.red strong {
  color:
    var(--red);
}

.net-pay {
  margin-top: 11px;

  padding: 13px;

  border-radius: 8px;

  background:
    var(--green-soft);

  text-align: right;
}

.net-pay span,
.net-pay strong {
  display: block;
}

.net-pay span {
  color:
    var(--text-muted);

  font-size: 7px;
}

.net-pay strong {
  margin-top: 3px;

  color:
    var(--green);

  font-size: 18px;
}

.payment {
  display: grid;

  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 7px;

  margin-top: 10px;
}

.payment > div {
  padding: 9px;

  border:
    1px solid var(--border-soft);

  border-radius: 7px;
}

.payment span,
.payment strong {
  display: block;
}

.payment span {
  color:
    var(--text-muted);

  font-size: 6px;
}

.payment strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 8px;
}

footer {
  display: flex;

  justify-content: flex-end;

  gap: 7px;

  padding:
    13px 18px;

  border-top:
    1px solid var(--border-soft);
}

@media (max-width: 650px) {
  .employee,
  .columns,
  .payment {
    grid-template-columns: 1fr;
  }
}
</style>