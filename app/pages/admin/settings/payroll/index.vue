<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  Calculator,
  CalendarDays,
  CalendarRange,
  Coins,
  HandCoins,
  Info,
  Landmark,
  MinusCircle,
  ReceiptText,
  RotateCcw,
  Save,
  TriangleAlert,
  Users,
  WalletCards,
} from 'lucide-vue-next'
import AppSwitch from '~/components/shared/AppSwitch.vue'
import {
  defaultPayrollSettings,
  usePayrollSettings,
  type PayrollSettings,
} from '~/composables/admin/settings/usePayrollSettings'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const api = usePayrollSettings()
const { success, error: toastError } = useToast()

// =====================================================
// DATA + DIRTY TRACKING
// =====================================================

const form = ref<PayrollSettings>(defaultPayrollSettings())
const snapshot = ref('')
const loading = ref(true)
const saving = ref(false)

const isDirty = computed(() => !loading.value && JSON.stringify(form.value) !== snapshot.value)

onMounted(async () => {
  try {
    const response = await api.load()
    form.value = response.data
    snapshot.value = JSON.stringify(response.data)
  } finally {
    loading.value = false
  }
})

onBeforeRouteLeave(() => {
  if (isDirty.value && !saving.value) {
    return window.confirm('You have unsaved changes. Leave this page without saving?')
  }
})

// =====================================================
// VALIDATION
// =====================================================

const between = (value: number, min: number, max: number) =>
  Number.isFinite(value) && value >= min && value <= max

const isSemiMonthly = computed(() => form.value.schedule.default_frequency === 'semi_monthly')
const isMonthly = computed(() => form.value.schedule.default_frequency === 'monthly')

const errors = computed(() => {
  const s = form.value.schedule
  const e: Record<string, string> = {}
  if (isSemiMonthly.value) {
    if (!between(s.first_cutoff_end_day, 10, 20)) e.cutoff = 'Enter day 10 to 20.'
    if (!between(s.first_payday, 1, 31)) e.firstPay = 'Enter day 1 to 31.'
    else if (s.first_payday <= s.first_cutoff_end_day) e.firstPay = 'Must be after the 1st cutoff ends.'
  }
  if ((isSemiMonthly.value || isMonthly.value) && !between(s.second_payday, 1, 31)) e.secondPay = 'Enter day 1 to 31.'
  if (!between(form.value.rates.hours_per_day, 1, 12)) e.hours = 'Enter 1 to 12 hours.'
  return e
})

const hasErrors = computed(() => Object.keys(errors.value).length > 0)

// =====================================================
// SAVE / RESET
// =====================================================

const save = async () => {
  if (hasErrors.value) {
    toastError('Check the highlighted fields', 'Some values are outside the allowed range.')
    return
  }
  saving.value = true
  try {
    const response = await api.save(form.value)
    form.value = response.data
    snapshot.value = JSON.stringify(response.data)
    success('Settings saved', response.message)
  } catch {
    toastError('Unable to save', 'Please try again.')
  } finally {
    saving.value = false
  }
}

const discard = () => {
  form.value = JSON.parse(snapshot.value)
}

const restoreDefaults = () => {
  if (window.confirm('Replace all values on this page with the recommended defaults? Nothing is saved until you click Save Changes.')) {
    form.value = defaultPayrollSettings()
  }
}

// =====================================================
// PREVIEW: RATES
// =====================================================

const previewMonthly = ref(18000)
const previewLateMinutes = ref(30)

const round = (n: number) =>
  form.value.rates.rounding === 'peso' ? Math.round(n) : Math.round(n * 100) / 100

const peso = (n: number) =>
  `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const ratePreview = computed(() => {
  const monthly = Math.max(0, Number(previewMonthly.value) || 0)
  const daily = (monthly * 12) / form.value.rates.working_days_per_year
  const hourly = daily / (form.value.rates.hours_per_day || 8)
  const perMinute = hourly / 60
  const late = form.value.deductions.deduct_late_undertime ? perMinute * (Number(previewLateMinutes.value) || 0) : 0

  return {
    daily: round(daily),
    hourly: round(hourly),
    late: round(late),
    perCutoff: round(isSemiMonthly.value ? monthly / 2 : monthly),
  }
})

// =====================================================
// PREVIEW: UPCOMING PAYDAYS
// =====================================================

const pad = (n: number) => String(n).padStart(2, '0')

const adjustPayday = (date: Date) => {
  const rule = form.value.schedule.payday_adjustment
  const d = new Date(date)
  while (rule !== 'no_change' && (d.getDay() === 0 || d.getDay() === 6)) {
    d.setDate(d.getDate() + (rule === 'previous_working_day' ? -1 : 1))
  }
  return d
}

const dayOf = (year: number, month: number, day: number) => {
  const last = new Date(year, month + 1, 0).getDate()
  return new Date(year, month, Math.min(day, last))
}

const fmt = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })

const upcomingPaydays = computed(() => {
  if (hasErrors.value) return []
  const s = form.value.schedule
  const today = new Date()
  const rows: { period: string, payday: string, moved: boolean }[] = []

  for (let offset = 0; offset < 2; offset++) {
    const year = today.getFullYear()
    const month = today.getMonth() + offset
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0)
    const label = monthStart.toLocaleDateString('en-US', { month: 'short' })

    if (isSemiMonthly.value) {
      const p1 = dayOf(year, month, s.first_payday)
      const p2 = dayOf(year, month + 1, s.second_payday)
      const a1 = adjustPayday(p1)
      const a2 = adjustPayday(p2)
      rows.push({ period: `${label} 1–${s.first_cutoff_end_day}`, payday: fmt(a1), moved: a1.getTime() !== p1.getTime() })
      rows.push({ period: `${label} ${s.first_cutoff_end_day + 1}–${monthEnd.getDate()}`, payday: fmt(a2), moved: a2.getTime() !== p2.getTime() })
    } else if (isMonthly.value) {
      const p = dayOf(year, month + 1, s.second_payday)
      const a = adjustPayday(p)
      rows.push({ period: `${label} 1–${monthEnd.getDate()}`, payday: fmt(a), moved: a.getTime() !== p.getTime() })
    }
  }

  return rows.filter(r => r).slice(0, 4)
})

// =====================================================
// RELATED PAGES
// =====================================================

const links = [
  { label: 'Payroll Groups', hint: 'Group-specific pay schedules', to: '/admin/payroll/payroll-group', icon: Users },
  { label: 'Pay Periods', hint: 'Open and close cutoffs', to: '/admin/payroll/payroll-period', icon: CalendarDays },
  { label: 'Salary Rates', hint: 'Basic pay per employee', to: '/admin/employees/salary-rates', icon: WalletCards },
  { label: 'Contribution Settings', hint: 'SSS, PhilHealth and Pag-IBIG deductions', to: '/admin/contribution/deduction-settings', icon: Landmark },
  { label: 'Loan Types', hint: 'Company and government loans', to: '/admin/loans/types', icon: HandCoins },
  { label: 'Wage Orders', hint: 'Regional minimum wage', to: '/admin/settings/compensation/wage-orders', icon: Coins },
]
</script>

<template>
  <section class="settings-detail-page">
    <button type="button" class="back-link" @click="router.push('/admin/settings')">
      <ArrowLeft :size="14" /> Back to Settings
    </button>

    <PageHeader
      title="Payroll Settings"
      description="Company-wide pay schedule, rate computation, deductions, tax and payslip rules."
    >
      <AppButton variant="secondary" :icon="RotateCcw" :disabled="loading || saving" @click="restoreDefaults">
        Restore Defaults
      </AppButton>
      <AppButton :icon="Save" :disabled="loading || saving || !isDirty" @click="save">
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </AppButton>
    </PageHeader>

    <p v-if="isDirty" class="dirty-bar" role="status">
      <TriangleAlert :size="15" /> You have unsaved changes.
      <button type="button" class="back-link" style="margin: 0 0 0 auto;" @click="discard">Discard</button>
    </p>

    <div class="content-grid">
      <div class="form-column">
        <!-- PAY SCHEDULE -->
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><CalendarRange :size="17" /></span>
            <div>
              <h2>Pay Schedule</h2>
              <p>Default cutoffs and paydays. A payroll group can use its own schedule.</p>
            </div>
          </header>
          <div class="panel-body form-grid">
            <div class="field">
              <label for="py-frequency">Default pay frequency</label>
              <select id="py-frequency" v-model="form.schedule.default_frequency">
                <option value="semi_monthly">Semi-monthly (twice a month)</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
              <small v-if="form.schedule.default_frequency === 'weekly'">Weekly cutoffs and paydays are set per payroll group.</small>
            </div>

            <div class="field">
              <label for="py-adjust">Payday on a weekend or holiday</label>
              <select id="py-adjust" v-model="form.schedule.payday_adjustment">
                <option value="previous_working_day">Pay on the previous working day</option>
                <option value="next_working_day">Pay on the next working day</option>
                <option value="no_change">Keep the same date</option>
              </select>
            </div>

            <template v-if="isSemiMonthly">
              <div class="field" :class="{ invalid: errors.cutoff }">
                <label for="py-cutoff">1st cutoff ends on day</label>
                <div class="unit-input">
                  <input id="py-cutoff" v-model.number="form.schedule.first_cutoff_end_day" type="number" min="10" max="20" inputmode="numeric">
                  <span>of the month</span>
                </div>
                <small :class="{ 'field-error': errors.cutoff }">
                  {{ errors.cutoff || `1st cutoff: day 1–${form.schedule.first_cutoff_end_day}. 2nd cutoff: day ${form.schedule.first_cutoff_end_day + 1}–end of month.` }}
                </small>
              </div>

              <div class="field" :class="{ invalid: errors.firstPay }">
                <label for="py-pay1">1st cutoff payday</label>
                <div class="unit-input">
                  <input id="py-pay1" v-model.number="form.schedule.first_payday" type="number" min="1" max="31" inputmode="numeric">
                  <span>same month</span>
                </div>
                <small v-if="errors.firstPay" class="field-error">{{ errors.firstPay }}</small>
              </div>
            </template>

            <div v-if="isSemiMonthly || isMonthly" class="field" :class="{ invalid: errors.secondPay }">
              <label for="py-pay2">{{ isSemiMonthly ? '2nd cutoff payday' : 'Payday' }}</label>
              <div class="unit-input">
                <input id="py-pay2" v-model.number="form.schedule.second_payday" type="number" min="1" max="31" inputmode="numeric">
                <span>of the next month</span>
              </div>
              <small :class="{ 'field-error': errors.secondPay }">
                {{ errors.secondPay || 'Days past the end of a short month use its last day.' }}
              </small>
            </div>
          </div>
        </section>

        <!-- RATE COMPUTATION -->
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><Calculator :size="17" /></span>
            <div>
              <h2>Rate Computation</h2>
              <p>How daily and hourly rates are derived from a monthly salary.</p>
            </div>
          </header>
          <div class="panel-body form-grid three">
            <div class="field">
              <label for="py-days">Working days per year</label>
              <select id="py-days" v-model.number="form.rates.working_days_per_year">
                <option :value="261">261 (Mon–Fri)</option>
                <option :value="313">313 (Mon–Sat)</option>
                <option :value="365">365 (every day)</option>
              </select>
              <small>Daily rate = monthly × 12 ÷ this.</small>
            </div>

            <div class="field" :class="{ invalid: errors.hours }">
              <label for="py-hours">Hours per day</label>
              <div class="unit-input">
                <input id="py-hours" v-model.number="form.rates.hours_per_day" type="number" min="1" max="12" step="0.5" inputmode="decimal">
                <span>hours</span>
              </div>
              <small :class="{ 'field-error': errors.hours }">{{ errors.hours || 'Hourly rate = daily ÷ this.' }}</small>
            </div>

            <div class="field">
              <label for="py-round">Round amounts to</label>
              <select id="py-round" v-model="form.rates.rounding">
                <option value="centavo">Nearest centavo (0.01)</option>
                <option value="peso">Nearest peso (1.00)</option>
              </select>
            </div>
          </div>
        </section>

        <!-- DEDUCTIONS -->
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><MinusCircle :size="17" /></span>
            <div>
              <h2>Deductions</h2>
              <p>Attendance deductions and when recurring deductions are taken.</p>
            </div>
          </header>
          <div class="panel-body form-grid">
            <div class="field wide">
              <AppSwitch
                id="py-late"
                v-model="form.deductions.deduct_late_undertime"
                label="Deduct late and undertime"
                description="Chargeable minutes from Time Logs (after Late Adjustment waivers) × per-minute rate."
              />
              <AppSwitch
                id="py-absent"
                v-model="form.deductions.deduct_absences"
                label="Deduct unpaid absences"
                description="Absent days without approved paid leave × daily rate."
              />
            </div>

            <div class="field">
              <label for="py-contrib">Government contributions</label>
              <select id="py-contrib" v-model="form.deductions.contributions_cutoff" :disabled="!isSemiMonthly">
                <option value="split">Split across both cutoffs</option>
                <option value="first">Deduct on the 1st cutoff</option>
                <option value="second">Deduct on the 2nd cutoff</option>
              </select>
              <small>SSS, PhilHealth and Pag-IBIG employee share.</small>
            </div>

            <div class="field">
              <label for="py-loans">Loan amortizations</label>
              <select id="py-loans" v-model="form.deductions.loans_cutoff" :disabled="!isSemiMonthly">
                <option value="split">Split across both cutoffs</option>
                <option value="first">Deduct on the 1st cutoff</option>
                <option value="second">Deduct on the 2nd cutoff</option>
              </select>
              <small>Company and government loans.</small>
            </div>
          </div>
        </section>

        <!-- TAX + 13TH MONTH -->
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><BadgePercent :size="17" /></span>
            <div>
              <h2>Withholding Tax &amp; 13th Month Pay</h2>
              <p>Tax on compensation (TRAIN law tables) and 13th month release.</p>
            </div>
          </header>
          <div class="panel-body form-grid">
            <div class="field wide">
              <AppSwitch id="py-tax" v-model="form.tax.compute_withholding" label="Compute withholding tax" description="Uses the BIR withholding tax table for compensation." />
              <AppSwitch
                id="py-mwe"
                v-model="form.tax.exempt_minimum_wage_earners"
                label="Exempt minimum wage earners"
                description="Statutory minimum wage, holiday, overtime and night differential pay of MWEs are not taxed."
                :disabled="!form.tax.compute_withholding"
              />
            </div>

            <div class="field">
              <label for="py-method">Tax computation</label>
              <select id="py-method" v-model="form.tax.method" :disabled="!form.tax.compute_withholding">
                <option value="per_period_table">Per pay period (BIR table)</option>
                <option value="annualized">Annualized, adjusted every period</option>
              </select>
            </div>

            <div class="field">
              <label for="py-13th">13th month release</label>
              <select id="py-13th" v-model="form.thirteenth_month.release">
                <option value="december">Full amount in December</option>
                <option value="split_may_december">Half in May, half in December</option>
              </select>
              <small>Must be paid on or before December 24.</small>
            </div>

            <div class="field wide">
              <AppSwitch
                id="py-13th-allow"
                v-model="form.thirteenth_month.include_allowances"
                label="Include allowances in the 13th month basis"
                description="By law only basic salary earned is required; turn on if your company includes regular allowances."
              />
            </div>
          </div>
        </section>

        <!-- RELEASE + PAYSLIPS -->
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><ReceiptText :size="17" /></span>
            <div>
              <h2>Payroll Release &amp; Payslips</h2>
              <p>Approval before release and what employees can see.</p>
            </div>
          </header>
          <div class="panel-body">
            <AppSwitch id="py-approve" v-model="form.release.require_approval" label="Require approval before release" description="A reviewer must approve the payroll run before payslips are released." />
            <AppSwitch id="py-lock" v-model="form.release.lock_after_release" label="Lock payroll after release" description="Released payroll cannot be edited; corrections go to the next cutoff as adjustments." />
            <AppSwitch id="py-portal" v-model="form.release.payslip_in_employee_portal" label="Show payslips in the Employee Portal" description="Employees can view and download their own payslips." />
            <AppSwitch
              id="py-ytd"
              v-model="form.release.show_year_to_date"
              label="Show year-to-date totals on payslips"
              description="Gross pay, tax and contributions for the year so far."
            />
          </div>
        </section>
      </div>

      <!-- SIDE -->
      <aside class="side-column">
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><Calculator :size="17" /></span>
            <div>
              <h2>Rate Preview</h2>
              <p>From a sample monthly salary.</p>
            </div>
          </header>
          <div class="preview-body">
            <div class="form-grid">
              <div class="field">
                <label for="pv-monthly">Monthly salary</label>
                <div class="unit-input">
                  <span>₱</span>
                  <input id="pv-monthly" v-model.number="previewMonthly" type="number" min="0" step="100">
                </div>
              </div>
              <div class="field">
                <label for="pv-late">Late</label>
                <div class="unit-input">
                  <input id="pv-late" v-model.number="previewLateMinutes" type="number" min="0" max="600">
                  <span>min</span>
                </div>
              </div>
            </div>

            <dl class="rate-list">
              <div><dt>Daily rate</dt><dd>{{ peso(ratePreview.daily) }}</dd></div>
              <div><dt>Hourly rate</dt><dd>{{ peso(ratePreview.hourly) }}</dd></div>
              <div><dt>Basic pay per cutoff</dt><dd>{{ peso(ratePreview.perCutoff) }}</dd></div>
              <div>
                <dt>Late deduction</dt>
                <dd>{{ form.deductions.deduct_late_undertime ? `− ${peso(ratePreview.late)}` : 'Not deducted' }}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section v-if="upcomingPaydays.length" class="panel">
          <header class="panel-header">
            <span class="panel-icon"><CalendarDays :size="17" /></span>
            <div>
              <h2>Upcoming Paydays</h2>
              <p>Weekends adjusted. Holidays are applied once connected to the Work Calendar.</p>
            </div>
          </header>
          <ul class="payday-list">
            <li v-for="row in upcomingPaydays" :key="row.period">
              <span>{{ row.period }}</span>
              <strong>{{ row.payday }}</strong>
              <small v-if="row.moved">Moved from a weekend</small>
            </li>
          </ul>
        </section>

        <section class="panel">
          <header class="panel-header">
            <div>
              <h2>Related Pages</h2>
              <p>Groups, rates and deductions used by payroll.</p>
            </div>
          </header>
          <ul class="link-list">
            <li v-for="link in links" :key="link.to">
              <button type="button" @click="router.push(link.to)">
                <component :is="link.icon" :size="16" />
                <span>
                  {{ link.label }}
                  <small>{{ link.hint }}</small>
                </span>
                <ArrowRight :size="14" class="link-arrow" />
              </button>
            </li>
          </ul>
        </section>

        <p class="note">
          <Info :size="15" />
          Saved in this browser session only for now. The values will be stored once the settings backend is connected.
        </p>
      </aside>
    </div>
  </section>
</template>

<style scoped src="../../../../assets/css/settings-form.css"></style>

<style scoped>
.rate-list {
  display: grid;
  gap: 8px;
  margin: 0;
}

.rate-list div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
}

.rate-list dt {
  color: var(--text-secondary);
  font-size: 12px;
}

.rate-list dd {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
}

.payday-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 14px 18px 18px;
  list-style: none;
}

.payday-list li {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2px 12px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  font-size: 12px;
}

.payday-list span { color: var(--text-secondary); }
.payday-list strong { text-align: right; }

.payday-list small {
  grid-column: 1 / -1;
  color: var(--orange);
  font-size: 11px;
}
</style>