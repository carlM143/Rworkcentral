<script setup lang="ts">
import {
  X,
  History,
  BadgeDollarSign,
  UserRound,
} from 'lucide-vue-next'

import type {
  LoanPayment,
  LoanRecord,
} from '~/types/loan'

defineProps<{
  open: boolean

  loan:
    LoanRecord | null

  payments:
    LoanPayment[]
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
  value: string,
) => {
  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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
              <History :size="20" />
            </div>

            <div>

              <h2>
                Loan Payment History
              </h2>

              <p>
                {{ loan.loanNumber }}
                ·
                {{ loan.employeeName }}
              </p>

            </div>

          </div>

          <button
            class="close-button"
            @click="
              emit('close')
            "
          >
            <X :size="18" />
          </button>

        </div>

        <div class="modal-body">

          <div class="employee-card">

            <div class="employee-icon">
              <UserRound :size="18" />
            </div>

            <div>

              <span>
                Employee
              </span>

              <strong>
                {{ loan.employeeName }}
              </strong>

              <small>
                {{ loan.employeeNumber }}
                ·
                {{ loan.department }}
              </small>

            </div>

          </div>

          <div class="summary-grid">

            <div>

              <span>
                Principal
              </span>

              <strong>
                {{
                  money(
                    loan.principalAmount,
                  )
                }}
              </strong>

            </div>

            <div>

              <span>
                Total Paid
              </span>

              <strong class="green">
                {{
                  money(
                    loan.totalPaid,
                  )
                }}
              </strong>

            </div>

            <div>

              <span>
                Remaining
              </span>

              <strong class="orange">
                {{
                  money(
                    loan.outstandingBalance,
                  )
                }}
              </strong>

            </div>

          </div>

          <article class="history-card">

            <div class="history-heading">

              <BadgeDollarSign :size="16" />

              Payroll Deductions

            </div>

            <div
              v-if="
                payments.length
              "
              class="table-scroll"
            >

              <table>

                <thead>

                  <tr>
                    <th>Payroll Period</th>
                    <th>Reference No.</th>
                    <th>Deduction</th>
                    <th>Previous Balance</th>
                    <th>Remaining Balance</th>
                    <th>Date Posted</th>
                    <th>Status</th>
                  </tr>

                </thead>

                <tbody>

                  <tr
                    v-for="
                      payment in
                      payments
                    "
                    :key="
                      payment.id
                    "
                  >

                    <td>
                      {{
                        payment.payrollPeriod
                      }}
                    </td>

                    <td>
                      <strong class="reference">
                        {{
                          payment.referenceNumber
                        }}
                      </strong>
                    </td>

                    <td>
                      <strong class="green">
                        {{
                          money(
                            payment.deductionAmount,
                          )
                        }}
                      </strong>
                    </td>

                    <td>
                      {{
                        money(
                          payment.previousBalance,
                        )
                      }}
                    </td>

                    <td>
                      <strong>
                        {{
                          money(
                            payment.remainingBalance,
                          )
                        }}
                      </strong>
                    </td>

                    <td>
                      {{
                        date(
                          payment.datePosted,
                        )
                      }}
                    </td>

                    <td>
                      <StatusBadge
                        :status="
                          payment.status
                        "
                      />
                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

            <div
              v-else
              class="empty"
            >
              <History :size="26" />

              <strong>
                No payroll deductions yet
              </strong>

              <span>
                Payment history will appear once payroll deductions are posted.
              </span>
            </div>

          </article>

        </div>

        <div class="modal-footer">

          <span>
            {{
              payments.length
            }}
            payment record(s)
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
  max-width: 1050px;

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
    var(--green-soft);

  color:
    var(--green);
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

.employee-card {
  display: flex;

  align-items: center;

  gap: 9px;

  padding: 11px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    var(--bg-card-soft);
}

.employee-icon {
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

.employee-card span,
.employee-card strong,
.employee-card small {
  display: block;
}

.employee-card span,
.employee-card small {
  color:
    var(--text-muted);

  font-size: 8px;
}

.employee-card strong {
  margin-top: 2px;

  color:
    var(--text-primary);

  font-size: 10px;
}

.employee-card small {
  margin-top: 2px;
}

.summary-grid {
  display: grid;

  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );

  gap: 8px;

  margin-top: 10px;
}

.summary-grid > div {
  padding: 10px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card-soft);
}

.summary-grid span,
.summary-grid strong {
  display: block;
}

.summary-grid span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.summary-grid strong {
  margin-top: 3px;

  font-size: 11px;
}

.green {
  color:
    var(--green) !important;
}

.orange {
  color:
    var(--orange) !important;
}

.history-card {
  margin-top: 10px;

  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 8px;
}

.history-heading {
  display: flex;

  align-items: center;

  gap: 7px;

  padding:
    11px 13px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);

  font-size: 10px;
  font-weight: 650;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;

  min-width: 900px;

  border-collapse:
    collapse;
}

th,
td {
  padding:
    11px 12px;

  border-top:
    1px solid
    var(--border-soft);

  text-align: left;

  font-size: 9px;
}

th {
  color:
    var(--text-secondary);

  text-transform:
    uppercase;
}

td {
  color:
    var(--text-secondary);
}

.reference {
  color:
    var(--primary);
}

.empty {
  display: flex;

  min-height: 180px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 6px;

  color:
    var(--text-muted);
}

.empty strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.empty span {
  font-size: 8px;
}

.modal-footer > span {
  color:
    var(--text-muted);

  font-size: 8px;
}
</style>