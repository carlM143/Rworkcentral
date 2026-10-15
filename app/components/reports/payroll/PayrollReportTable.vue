<script setup lang="ts">
import {
  CircleDollarSign,
  MoreHorizontal,
  ReceiptText,
  UserRound,
  UsersRound,
} from 'lucide-vue-next'

import type {
  PayrollReportRecord,
  PayrollReportStatus,
} from '~/types/payrollReport'

defineProps<{
  records:
    PayrollReportRecord[]

  totals: {
    basicPay: number
    overtimePay: number
    holidayPay: number
    allowances: number
    otherEarnings: number
    grossPay: number
    sss: number
    philHealth: number
    pagibig: number
    tax: number
    loanDeductions: number
    otherDeductions: number
    totalDeductions: number
    netPay: number
  }
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
      maximumFractionDigits: 2,
    },
  ).format(value)
}

const statusClass = (
  status:
    PayrollReportStatus,
) => {
  if (
    status ===
    'Completed'
  ) {
    return 'completed'
  }

  if (
    status ===
    'Processed'
  ) {
    return 'processed'
  }

  if (
    status ===
    'Pending'
  ) {
    return 'pending'
  }

  return 'draft'
}
</script>

<template>
  <article class="table-card">

    <!-- HEADER -->

    <div class="table-heading">

      <div>

        <h3>
          Payroll Register
        </h3>

        <p>
          Detailed payroll earnings, statutory contributions,
          deductions and net pay for the selected pay period.
        </p>

      </div>

    </div>

    <!-- TABLE -->

    <div
      v-if="records.length"
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Payroll No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Employment</th>

            <th>Basic Pay</th>
            <th>OT Pay</th>
            <th>Holiday Pay</th>
            <th>Allowances</th>
            <th>Other Earnings</th>
            <th>Gross Pay</th>

            <th>SSS</th>
            <th>PhilHealth</th>
            <th>Pag-IBIG</th>
            <th>Tax</th>

            <th>Loans</th>
            <th>Other Deductions</th>
            <th>Total Deductions</th>

            <th>Net Pay</th>

            <th>Status</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="item in records"
            :key="item.id"
          >

            <!-- NUMBER -->

            <td>

              <strong class="payroll-number">
                {{ item.payrollNumber }}
              </strong>

            </td>

            <!-- EMPLOYEE -->

            <td>

              <div class="employee-cell">

                <div class="employee-avatar">

                  <UserRound
                    :size="17"
                  />

                </div>

                <div>

                  <strong>
                    {{ item.employeeName }}
                  </strong>

                  <span>
                    {{ item.employeeNumber }}
                  </span>

                  <span>
                    {{ item.position }}
                  </span>

                </div>

              </div>

            </td>

            <!-- DEPARTMENT -->

            <td>

              <strong class="department-name">
                {{ item.department }}
              </strong>

            </td>

            <!-- EMPLOYMENT -->

            <td>

              <span class="employment-badge">
                {{ item.employmentType }}
              </span>

            </td>

            <!-- EARNINGS -->

            <td class="money-cell">
              {{ money(item.basicPay) }}
            </td>

            <td class="money-cell earnings">
              {{ money(item.overtimePay) }}
            </td>

            <td class="money-cell earnings">
              {{ money(item.holidayPay) }}
            </td>

            <td class="money-cell earnings">
              {{ money(item.allowances) }}
            </td>

            <td class="money-cell earnings">
              {{ money(item.otherEarnings) }}
            </td>

            <td>

              <div class="gross-pay">

                <CircleDollarSign
                  :size="13"
                />

                <strong>
                  {{ money(item.grossPay) }}
                </strong>

              </div>

            </td>

            <!-- STATUTORY -->

            <td class="deduction-cell">
              {{ money(item.sss) }}
            </td>

            <td class="deduction-cell">
              {{ money(item.philHealth) }}
            </td>

            <td class="deduction-cell">
              {{ money(item.pagibig) }}
            </td>

            <td class="deduction-cell">
              {{ money(item.withholdingTax) }}
            </td>

            <!-- OTHER DEDUCTIONS -->

            <td class="deduction-cell">
              {{ money(item.loanDeductions) }}
            </td>

            <td class="deduction-cell">
              {{ money(item.otherDeductions) }}
            </td>

            <td>

              <div class="total-deduction">

                <ReceiptText
                  :size="13"
                />

                <strong>
                  {{ money(item.totalDeductions) }}
                </strong>

              </div>

            </td>

            <!-- NET -->

            <td>

              <div class="net-pay">

                <span>
                  NET
                </span>

                <strong>
                  {{ money(item.netPay) }}
                </strong>

              </div>

            </td>

            <!-- STATUS -->

            <td>

              <span
                class="status-badge"
                :class="
                  statusClass(
                    item.status,
                  )
                "
              >

                <span class="status-dot" />

                {{ item.status }}

              </span>

            </td>

            <!-- ACTION -->

            <td>

              <button
                type="button"
                class="action-button"
                title="Payroll details will be added later"
              >

                <MoreHorizontal
                  :size="18"
                />

              </button>

            </td>

          </tr>

        </tbody>

        <!-- TOTALS -->

        <tfoot>

          <tr>

            <td colspan="4">

              <div class="total-label">

                <UsersRound
                  :size="14"
                />

                <strong>
                  Payroll Totals
                </strong>

              </div>

            </td>

            <td>
              {{ money(totals.basicPay) }}
            </td>

            <td>
              {{ money(totals.overtimePay) }}
            </td>

            <td>
              {{ money(totals.holidayPay) }}
            </td>

            <td>
              {{ money(totals.allowances) }}
            </td>

            <td>
              {{ money(totals.otherEarnings) }}
            </td>

            <td class="footer-gross">
              {{ money(totals.grossPay) }}
            </td>

            <td>
              {{ money(totals.sss) }}
            </td>

            <td>
              {{ money(totals.philHealth) }}
            </td>

            <td>
              {{ money(totals.pagibig) }}
            </td>

            <td>
              {{ money(totals.tax) }}
            </td>

            <td>
              {{ money(totals.loanDeductions) }}
            </td>

            <td>
              {{ money(totals.otherDeductions) }}
            </td>

            <td class="footer-deductions">
              {{ money(totals.totalDeductions) }}
            </td>

            <td class="footer-net">
              {{ money(totals.netPay) }}
            </td>

            <td colspan="2">
              —
            </td>

          </tr>

        </tfoot>

      </table>

    </div>

    <!-- EMPTY -->

    <div
      v-else
      class="empty-state"
    >

      <ReceiptText
        :size="38"
      />

      <strong>
        No payroll records found
      </strong>

      <span>
        Try changing your payroll report filters.
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
    16px 17px;

  border-bottom:
    1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 15px;
}

.table-heading p {
  margin:
    5px 0 0;

  color:
    var(--text-muted);

  font-size: 11px;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;

  min-width: 3100px;

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

  font-size: 10px;
  font-weight: 700;

  text-align: left;

  text-transform:
    uppercase;

  white-space:
    nowrap;
}

td {
  padding:
    13px;

  border-top:
    1px solid var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 10.5px;

  vertical-align:
    middle;
}

tbody tr:hover {
  background:
    var(--bg-card-soft);
}

/* PAYROLL NUMBER */

.payroll-number {
  color:
    var(--primary);

  white-space:
    nowrap;
}

/* EMPLOYEE */

.employee-cell {
  display: flex;

  min-width: 210px;

  align-items: center;

  gap: 9px;
}

.employee-avatar {
  display: flex;

  width: 37px;
  height: 37px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.employee-cell strong,
.employee-cell span {
  display: block;
}

.employee-cell strong {
  color:
    var(--text-primary);

  font-size: 11px;
}

.employee-cell span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 9.5px;
}

.department-name {
  color:
    var(--text-primary);

  white-space:
    nowrap;
}

/* EMPLOYMENT */

.employment-badge {
  display: inline-flex;

  padding:
    5px 8px;

  border-radius:
    20px;

  background:
    var(--primary-soft);

  color:
    var(--primary);

  font-size: 9px;
  font-weight: 650;

  white-space:
    nowrap;
}

/* MONEY */

.money-cell {
  color:
    var(--text-primary);

  font-variant-numeric:
    tabular-nums;

  white-space:
    nowrap;
}

.money-cell.earnings {
  color:
    var(--green);
}

.deduction-cell {
  color:
    var(--red);

  font-variant-numeric:
    tabular-nums;

  white-space:
    nowrap;
}

/* GROSS */

.gross-pay {
  display: flex;

  min-width: 115px;

  align-items: center;

  gap: 5px;

  color:
    var(--green);

  white-space:
    nowrap;
}

.gross-pay strong {
  color:
    var(--text-primary);
}

/* DEDUCTION */

.total-deduction {
  display: flex;

  min-width: 120px;

  align-items: center;

  gap: 5px;

  color:
    var(--red);

  white-space:
    nowrap;
}

.total-deduction strong {
  color:
    var(--red);
}

/* NET */

.net-pay {
  min-width: 125px;

  padding:
    7px 9px;

  border-radius: 8px;

  background:
    var(--green-soft);
}

.net-pay span,
.net-pay strong {
  display: block;
}

.net-pay span {
  color:
    var(--green);

  font-size: 8px;
  font-weight: 700;

  letter-spacing:
    0.6px;
}

.net-pay strong {
  margin-top: 2px;

  color:
    var(--green);

  font-size: 11px;

  white-space:
    nowrap;
}

/* STATUS */

.status-badge {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  padding:
    5px 8px;

  border-radius:
    20px;

  font-size: 9px;
  font-weight: 650;

  white-space:
    nowrap;
}

.status-dot {
  width: 5px;
  height: 5px;

  border-radius:
    50%;

  background:
    currentColor;
}

.status-badge.completed {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.status-badge.processed {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.status-badge.pending {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.status-badge.draft {
  background:
    var(--bg-card-soft);

  color:
    var(--text-muted);
}

/* ACTION */

.action-button {
  display: flex;

  width: 32px;
  height: 32px;

  align-items: center;
  justify-content: center;

  border:
    1px solid transparent;

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);
}

.action-button:hover {
  border-color:
    var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--primary);
}

/* TOTAL FOOTER */

tfoot td {
  border-top:
    1px solid var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);

  font-size: 10px;
  font-weight: 700;

  white-space:
    nowrap;
}

.total-label {
  display: flex;

  align-items: center;

  gap: 6px;

  color:
    var(--primary);
}

.footer-gross {
  color:
    var(--green);
}

.footer-deductions {
  color:
    var(--red);
}

.footer-net {
  color:
    var(--green);

  font-size: 11px;
}

/* EMPTY */

.empty-state {
  display: flex;

  min-height: 280px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 8px;

  color:
    var(--text-muted);
}

.empty-state strong {
  color:
    var(--text-primary);

  font-size: 13px;
}

.empty-state span {
  font-size: 11px;
}
</style>