<script setup lang="ts">
import {
  WalletCards,
} from 'lucide-vue-next'

import LoanActions from '~/components/admin/payroll/loans/LoanActions.vue'

import type {
  LoanRecord,
} from '~/types/loan'

defineProps<{
  loans: LoanRecord[]
}>()

const emit =
  defineEmits<{
    view: [loan: LoanRecord]
    edit: [loan: LoanRecord]
    approve: [loan: LoanRecord]
    reject: [loan: LoanRecord]
    activate: [loan: LoanRecord]
    employee: [loan: LoanRecord]
    history: [loan: LoanRecord]
    complete: [loan: LoanRecord]
    cancel: [loan: LoanRecord]
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
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          Employee Loans
        </h3>

        <p>
          Monitor approved loans, payroll deductions
          and outstanding balances.
        </p>

      </div>

    </div>

    <div
      v-if="loans.length"
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Loan No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Loan Type</th>
            <th>Principal</th>
            <th>Monthly Deduction</th>
            <th>Total Paid</th>
            <th>Outstanding</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="
              loan in loans
            "
            :key="loan.id"
          >

            <td>
              <strong class="loan-number">
                {{ loan.loanNumber }}
              </strong>
            </td>

            <td>

              <div class="employee-cell">

                <div class="avatar">
                  {{
                    loan.employeeName
                      .split(' ')
                      .map(item => item[0])
                      .slice(0, 2)
                      .join('')
                  }}
                </div>

                <div>

                  <strong>
                    {{ loan.employeeName }}
                  </strong>

                  <span>
                    {{ loan.employeeNumber }}
                    ·
                    {{ loan.position }}
                  </span>

                </div>

              </div>

            </td>

            <td>
              {{ loan.department }}
            </td>

            <td>
              <span class="type-badge">
                {{ loan.loanType }}
              </span>
            </td>

            <td>
              <strong class="money">
                {{
                  money(
                    loan.principalAmount,
                  )
                }}
              </strong>
            </td>

            <td>
              {{
                money(
                  loan.monthlyDeduction,
                )
              }}
            </td>

            <td>
              <span class="paid">
                {{
                  money(
                    loan.totalPaid,
                  )
                }}
              </span>
            </td>

            <td>
              <strong class="balance">
                {{
                  money(
                    loan.outstandingBalance,
                  )
                }}
              </strong>
            </td>

            <td>
              {{ date(loan.startDate) }}
            </td>

            <td>
              {{ date(loan.endDate) }}
            </td>

            <td>
              <StatusBadge
                :status="
                  loan.status
                "
              />
            </td>

            <td>

              <LoanActions
                :loan="loan"
                @view="
                  emit(
                    'view',
                    loan,
                  )
                "
                @edit="
                  emit(
                    'edit',
                    loan,
                  )
                "
                @approve="
                  emit(
                    'approve',
                    loan,
                  )
                "
                @reject="
                  emit(
                    'reject',
                    loan,
                  )
                "
                @activate="
                  emit(
                    'activate',
                    loan,
                  )
                "
                @employee="
                  emit(
                    'employee',
                    loan,
                  )
                "
                @history="
                  emit(
                    'history',
                    loan,
                  )
                "
                @complete="
                  emit(
                    'complete',
                    loan,
                  )
                "
                @cancel="
                  emit(
                    'cancel',
                    loan,
                  )
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

      <WalletCards :size="30" />

      <strong>
        No loan records found
      </strong>

      <span>
        Try changing your filters.
      </span>

    </div>

  </article>
</template>

<style scoped>
.table-card {
  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 11px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

.table-heading {
  padding:
    15px 16px;

  border-bottom:
    1px solid
    var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  font-size: 14px;
}

.table-heading p {
  margin:
    5px 0 0;

  color:
    var(--text-muted);

  font-size: 9px;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;

  min-width: 1600px;

  border-collapse:
    collapse;
}

th {
  padding:
    12px 13px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-size: 9px;

  text-align: left;

  text-transform:
    uppercase;
}

td {
  padding:
    13px;

  border-top:
    1px solid
    var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 9px;

  vertical-align:
    middle;
}

tbody tr:hover {
  background:
    var(--bg-card-soft);
}

.loan-number {
  color:
    var(--primary);

  white-space:
    nowrap;
}

.employee-cell {
  display: flex;

  min-width: 190px;

  align-items: center;

  gap: 9px;
}

.avatar {
  display: flex;

  width: 34px;
  height: 34px;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);

  font-size: 9px;
  font-weight: 700;
}

.employee-cell strong,
.employee-cell span {
  display: block;
}

.employee-cell strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.employee-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

.type-badge {
  padding:
    5px 7px;

  border-radius: 5px;

  background:
    var(--purple-soft);

  color:
    var(--purple);

  white-space:
    nowrap;
}

.money {
  color:
    var(--text-primary);
}

.paid {
  color:
    var(--green);
}

.balance {
  color:
    var(--orange);

  white-space:
    nowrap;
}

.empty {
  display: flex;

  min-height: 240px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 7px;

  color:
    var(--text-muted);
}

.empty strong {
  color:
    var(--text-primary);

  font-size: 11px;
}

.empty span {
  font-size: 9px;
}
</style>