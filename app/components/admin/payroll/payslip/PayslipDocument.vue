<script setup lang="ts">
import type { Payslip } from '~/types/payroll/payslip/payslip'

defineProps<{
  payslip: Payslip
}>()

const money = (value: number | null | undefined) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value ?? 0))

const date = (value?: string | null) => {
  if (!value) return '—'
  const d = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(d.getTime())
    ? value
    : new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(d)
}

const range = (start?: string | null, end?: string | null) => `${date(start)} – ${date(end)}`
</script>

<template>
  <article class="payslip">
    <!-- HEADER -->
    <header class="ps-head">
      <div>
        <h2>{{ payslip.company.name }}</h2>
        <p v-if="payslip.company.address">{{ payslip.company.address }}</p>
      </div>
      <div class="ps-title">
        <strong>PAYSLIP</strong>
        <span>{{ payslip.payslip_no }}</span>
      </div>
    </header>

    <!-- EMPLOYEE & PERIOD -->
    <section class="ps-info">
      <dl>
        <div><dt>Employee</dt><dd>{{ payslip.employee.name }}</dd></div>
        <div><dt>Employee ID</dt><dd>{{ payslip.employee.emp_id ?? '—' }}</dd></div>
        <div><dt>Department</dt><dd>{{ payslip.employee.department ?? '—' }}</dd></div>
        <div><dt>Salary Type</dt><dd>{{ payslip.employee.salary_type ?? '—' }}</dd></div>
      </dl>
      <dl>
        <div><dt>Payroll Period</dt><dd>{{ range(payslip.period.pay_period_start, payslip.period.pay_period_end) }}</dd></div>
        <div><dt>Cut-off Period</dt><dd>{{ range(payslip.period.cutoff_start, payslip.period.cutoff_end) }}</dd></div>
        <div><dt>Payment Date</dt><dd>{{ date(payslip.period.payment_date) }}</dd></div>
        <div><dt>Basic Salary</dt><dd>{{ money(payslip.employee.basic_salary) }}</dd></div>
      </dl>
    </section>

    <!-- EARNINGS / DEDUCTIONS -->
    <section class="ps-columns">
      <div class="ps-col">
        <h3>Earnings</h3>
        <table>
          <tbody>
            <tr v-for="line in payslip.earnings" :key="line.label">
              <td>{{ line.label }} <small v-if="line.note">{{ line.note }}</small></td>
              <td class="amt">{{ money(line.amount) }}</td>
            </tr>
            <tr v-for="line in payslip.time_deductions" :key="line.label">
              <td>Less: {{ line.label }} <small v-if="line.note">{{ line.note }}</small></td>
              <td class="amt minus">({{ money(line.amount) }})</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>Gross Pay</td>
              <td class="amt">{{ money(payslip.totals.gross_pay) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="ps-col">
        <h3>Deductions</h3>
        <table>
          <tbody>
            <tr v-for="(line, index) in payslip.deductions" :key="`${line.label}-${index}`">
              <td>{{ line.label }} <small v-if="line.note">{{ line.note }}</small></td>
              <td class="amt">{{ money(line.amount) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>Total Deductions</td>
              <td class="amt">{{ money(payslip.totals.total_deductions) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>

    <!-- NET PAY -->
    <section class="ps-net">
      <div>
        <span>Net Pay</span>
        <small>{{ money(payslip.totals.gross_pay) }} − {{ money(payslip.totals.total_deductions) }}</small>
      </div>
      <strong>{{ money(payslip.totals.net_pay) }}</strong>
    </section>

    <!-- BANK & EMPLOYER SHARE -->
    <section class="ps-foot-grid">
      <div>
        <h4>Paid to</h4>
        <p v-if="payslip.bank.bank_name">
          {{ payslip.bank.bank_name }} · {{ payslip.bank.account_number }}<br>
          <small>{{ payslip.bank.account_name }}</small>
        </p>
        <p v-else>Cash / no bank account on file</p>
      </div>

      <div v-if="payslip.employer_shares.length">
        <h4>Employer share (paid by the company)</h4>
        <p v-for="line in payslip.employer_shares" :key="line.label" class="ps-row">
          <span>{{ line.label }} <small v-if="line.note">{{ line.note }}</small></span>
          <span>{{ money(line.amount) }}</span>
        </p>
      </div>
    </section>

    <footer class="ps-footer">
      This is a system-generated payslip<template v-if="payslip.finalized_at"> · finalized {{ payslip.finalized_at }}</template>.
    </footer>
  </article>
</template>

<style scoped>
.payslip { padding: 28px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); color: var(--text-primary); font-size: 13px; }

.ps-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding-bottom: 16px; border-bottom: 2px solid var(--border); }
.ps-head h2 { margin: 0; font-size: 20px; }
.ps-head p { margin: 4px 0 0; color: var(--text-muted); font-size: 12px; }
.ps-title { text-align: right; }
.ps-title strong { display: block; font-size: 18px; letter-spacing: .12em; }
.ps-title span { color: var(--text-muted); font-size: 12px; }

.ps-info { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; padding: 16px 0; border-bottom: 1px solid var(--border-soft); }
.ps-info dl { display: grid; gap: 8px; margin: 0; }
.ps-info dl div { display: flex; justify-content: space-between; gap: 12px; }
.ps-info dt { color: var(--text-muted); }
.ps-info dd { margin: 0; font-weight: 600; text-align: right; }

.ps-columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; padding: 18px 0; }
.ps-col h3 { margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: .06em; color: var(--text-secondary); }
.ps-col table { width: 100%; border-collapse: collapse; }
.ps-col td { padding: 7px 0; border-bottom: 1px solid var(--border-soft); vertical-align: top; }
.ps-col td small { display: block; color: var(--text-muted); font-size: 11px; }
.ps-col tfoot td { padding-top: 10px; border-bottom: none; font-weight: 700; }
.amt { text-align: right; white-space: nowrap; }
.minus { color: #f87171; }

.ps-net { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 18px; border-radius: 10px; background: rgb(34 197 94 / 10%); }
.ps-net span { display: block; font-size: 15px; font-weight: 700; }
.ps-net small { color: var(--text-muted); font-size: 12px; }
.ps-net strong { color: #22c55e; font-size: 26px; }

.ps-foot-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; padding-top: 18px; }
.ps-foot-grid h4 { margin: 0 0 8px; color: var(--text-secondary); font-size: 12px; }
.ps-foot-grid p { margin: 0 0 4px; font-size: 12px; }
.ps-foot-grid small { color: var(--text-muted); font-size: 11px; }
.ps-row { display: flex; justify-content: space-between; gap: 12px; }

.ps-footer { margin-top: 20px; padding-top: 12px; border-top: 1px solid var(--border-soft); color: var(--text-muted); font-size: 11px; text-align: center; }

@media (max-width: 760px) {
  .ps-info, .ps-columns, .ps-foot-grid { grid-template-columns: 1fr; }
}

@media print {
  .payslip { border: none; border-radius: 0; background: #ffffff; color: #111827; }
  .payslip * { color: #111827 !important; }
  .ps-net { background: #f0fdf4; }
  .ps-net strong { color: #15803d !important; }
  .minus { color: #b91c1c !important; }
}
</style>