<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { Money, PayrollRecord } from '~/types/payroll/payroll-generation/payrollGeneration'

const props = defineProps<{
  payroll: PayrollRecord | null
}>()

const emit = defineEmits<{ close: [] }>()

const num = (value: Money | null | undefined) => Number(value ?? 0)

const money = (value: Money | null | undefined) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(num(value))

const minutes = (value: number) => {
  if (!value) return '0m'
  const h = Math.floor(value / 60)
  const m = value % 60
  return h ? `${h}h${m ? ` ${m}m` : ''}` : `${m}m`
}

const name = computed(() => {
  const p = props.payroll
  if (!p) return ''
  return p.employee ? `${p.employee.firstname} ${p.employee.lastname}` : `Employee #${p.employee_id}`
})

const basicPayNote = computed(() => {
  const p = props.payroll
  if (!p) return ''
  if (p.breakdown?.rate_type === 'daily') return `${p.days_worked} day(s) × ${money(p.daily_rate)}`
  if (p.breakdown?.rate_type === 'hourly') return `${minutes(p.worked_minutes)} worked`
  return `${money(p.basic_salary)} monthly ÷ cutoff`
})

// Running totals: gross → after contributions & tax → net
const afterContributions = computed(() => {
  const p = props.payroll
  if (!p) return 0
  return num(p.gross_pay) - num(p.contributions_total) - num(p.withholding_tax)
})

const onKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.payroll) emit('close')
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <div
      v-if="payroll"
      class="overlay"
      @click.self="emit('close')"
    >
      <div
        class="card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payroll-breakdown-title"
      >
        <div class="head">
          <div>
            <h3 id="payroll-breakdown-title">{{ name }}</h3>
            <p>
              {{ payroll.employee?.emp_id }} · {{ payroll.salary_type?.type_name ?? '—' }}
              <template v-if="payroll.payroll_group"> · {{ payroll.payroll_group.group_name }}</template>
            </p>
          </div>
          <div class="head-actions">
            <span
              class="pill"
              :class="`pill--${payroll.status}`"
            >
              {{ payroll.status === 'finalized' ? 'Finalized' : 'Draft' }}
            </span>
            <button
              type="button"
              class="close"
              aria-label="Close"
              @click="emit('close')"
            >
              <X :size="17" />
            </button>
          </div>
        </div>

        <div class="body">
          <section>
            <h4>Earnings</h4>
            <dl>
              <div>
                <dt>Basic pay <small>{{ basicPayNote }}</small></dt>
                <dd>{{ money(payroll.basic_pay) }}</dd>
              </div>
              <div>
                <dt>Allowance</dt>
                <dd>{{ money(payroll.allowance_pay) }}</dd>
              </div>
              <div>
                <dt>Overtime <small>{{ minutes(payroll.overtime_minutes) }}</small></dt>
                <dd>{{ money(payroll.overtime_pay) }}</dd>
              </div>
              <div>
                <dt>Late <small>{{ minutes(payroll.late_minutes) }}</small></dt>
                <dd class="minus">− {{ money(payroll.late_deduction) }}</dd>
              </div>
              <div>
                <dt>Undertime <small>{{ minutes(payroll.undertime_minutes) }}</small></dt>
                <dd class="minus">− {{ money(payroll.undertime_deduction) }}</dd>
              </div>
              <div>
                <dt>Unpaid leave <small>{{ num(payroll.unpaid_leave_days) }} day(s)</small></dt>
                <dd class="minus">− {{ money(payroll.unpaid_leave_deduction) }}</dd>
              </div>
              <div class="total">
                <dt>Gross pay</dt>
                <dd>{{ money(payroll.gross_pay) }}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h4>Government contributions</h4>
            <dl class="carry">
              <div>
                <dt>Gross pay</dt>
                <dd>{{ money(payroll.gross_pay) }}</dd>
              </div>
            </dl>
            <dl v-if="payroll.contributions.length">
              <div
                v-for="c in payroll.contributions"
                :key="c.id"
              >
                <dt>
                  {{ c.contribution_type?.contribution_name ?? 'Contribution' }}
                  <small>Employer share {{ money(c.employer_share) }}</small>
                </dt>
                <dd class="minus">− {{ money(c.employee_share) }}</dd>
              </div>
              <div class="total">
                <dt>Total contributions</dt>
                <dd class="minus">− {{ money(payroll.contributions_total) }}</dd>
              </div>
            </dl>
            <p
              v-else
              class="empty"
            >
              No contributions deducted this cutoff.
            </p>

            <dl class="spaced">
              <div>
                <dt>Withholding tax</dt>
                <dd class="minus">− {{ money(payroll.withholding_tax) }}</dd>
              </div>
              <div class="total">
                <dt>Pay after contributions</dt>
                <dd>{{ money(afterContributions) }}</dd>
              </div>
            </dl>
          </section>

          <section>
            <h4>Loans</h4>
            <dl class="carry">
              <div>
                <dt>Pay after contributions</dt>
                <dd>{{ money(afterContributions) }}</dd>
              </div>
            </dl>
            <dl v-if="payroll.breakdown?.loans?.length">
              <div
                v-for="loan in payroll.breakdown.loans"
                :key="loan.employee_loan_id"
              >
                <dt>
                  {{ loan.loan_type }}
                  <small>
                    {{ loan.reference ?? 'No reference' }} ·
                    balance {{ money(loan.balance_before) }} → {{ money(loan.balance_after) }}
                    <template v-if="loan.partial"> · partial deduction</template>
                  </small>
                </dt>
                <dd class="minus">− {{ money(loan.amount) }}</dd>
              </div>
              <div class="total">
                <dt>Total loans</dt>
                <dd class="minus">− {{ money(payroll.loan_deductions_total) }}</dd>
              </div>
            </dl>
            <p
              v-else
              class="empty"
            >
              No loan deductions this cutoff.
            </p>

            <dl class="spaced">
              <div class="total net-line">
                <dt>Net pay</dt>
                <dd>{{ money(payroll.net_pay) }}</dd>
              </div>
            </dl>
          </section>
        </div>

      <div class="foot">
  <div class="net">
    <span>Net pay</span>
    <strong>{{ money(payroll.net_pay) }}</strong>
  </div>
</div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.65);backdrop-filter:blur(3px)}
.card{display:flex;width:100%;max-width:1080px;max-height:calc(100vh - 40px);flex-direction:column;border:1px solid var(--border);border-radius:14px;background:var(--bg-card);box-shadow:0 24px 70px rgba(0,0,0,.3)}
.head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:20px 24px;border-bottom:1px solid var(--border-soft)}
.head h3{margin:0;color:var(--text-primary);font-size:20px}
.head p{margin:6px 0 0;color:var(--text-muted);font-size:13px}
.head-actions{display:flex;align-items:center;gap:12px}
.close{display:flex;width:34px;height:34px;align-items:center;justify-content:center;border:1px solid var(--border);border-radius:8px;background:transparent;color:var(--text-secondary);cursor:pointer}
.body{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;overflow-y:auto}
section{padding:20px 24px}
section + section{border-left:1px solid var(--border-soft)}
h4{margin:0 0 14px;color:var(--text-primary);font-size:15px}
dl{display:grid;gap:12px;margin:0}
dl div{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;font-size:14px}
dt{color:var(--text-secondary)}
dt small{display:block;margin-top:2px;color:var(--text-muted);font-size:12px}
dd{margin:0;color:var(--text-primary);font-weight:600;white-space:nowrap}
dl .total{padding-top:12px;border-top:1px solid var(--border-soft);font-size:15px;font-weight:700}
.spaced{margin-top:18px}
.minus{color:#f87171}
.empty{margin:0;color:var(--text-muted);font-size:13px}
.pill{display:inline-flex;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600}
.pill--draft{background:rgb(251 146 60 / 12%);color:#fb923c}
.pill--finalized{background:rgb(34 197 94 / 11%);color:#22c55e}
.foot{display:flex;align-items:center;justify-content:flex-end;gap:12px;padding:16px 24px;border-top:1px solid var(--border-soft)}
.foot-right{display:flex;align-items:center;gap:20px}
.formula{margin:0;color:var(--text-muted);font-size:13px}
.net{text-align:right}
.net span{display:block;color:var(--text-muted);font-size:12px}
.net strong{color:#22c55e;font-size:24px}
.carry{padding-bottom:12px;margin-bottom:12px;border-bottom:1px dashed var(--border-soft)}
.carry dd{color:var(--text-secondary)}
.net-line dd{color:#22c55e;font-size:17px}
@media (max-width:900px){
  .body{grid-template-columns:1fr}
  section + section{border-top:1px solid var(--border-soft);border-left:0}
}
</style>