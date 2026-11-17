<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CalendarRange,
  Calculator,
  ClipboardCheck,
  Hourglass,
  Info,
  ListChecks,
  Percent,
  RotateCcw,
  Save,
  Timer,
  TriangleAlert,
  Umbrella,
  Wallet,
} from 'lucide-vue-next'
import AppSwitch from '~/components/shared/AppSwitch.vue'
import {
  defaultLeaveOvertimeSettings,
  useLeaveOvertimeSettings,
  type LeaveOvertimeSettings,
  type OvertimeDayType,
} from '~/composables/admin/settings/useLeaveOvertimeSettings'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const api = useLeaveOvertimeSettings()
const { success, error: toastError } = useToast()

// =====================================================
// DATA + DIRTY TRACKING
// =====================================================

const form = ref<LeaveOvertimeSettings>(defaultLeaveOvertimeSettings())
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
// CARRY-OVER DEADLINE (stored as MM-DD)
// =====================================================

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

const carryMonth = computed({
  get: () => Number(form.value.leave.carry_over_deadline.split('-')[0]) || 3,
  set: (month: number) => {
    const day = Math.min(carryDay.value, DAYS_IN_MONTH[month - 1] ?? 31)
    form.value.leave.carry_over_deadline = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  },
})

const carryDay = computed({
  get: () => Number(form.value.leave.carry_over_deadline.split('-')[1]) || 31,
  set: (day: number) => {
    form.value.leave.carry_over_deadline = `${String(carryMonth.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  },
})

const daysForMonth = computed(() => DAYS_IN_MONTH[carryMonth.value - 1] ?? 31)

// =====================================================
// VALIDATION
// =====================================================

const between = (value: number, min: number, max: number) =>
  Number.isFinite(value) && value >= min && value <= max

const errors = computed(() => {
  const l = form.value.leave
  const o = form.value.overtime
  const e: Record<string, string> = {}
  if (!between(l.advance_notice_days, 0, 60)) e.notice = 'Enter 0 to 60 days.'
  if (!between(l.sick_filing_days_after, 0, 30)) e.sickFiling = 'Enter 0 to 30 days.'
  if (!between(l.medical_certificate_after_days, 0, 30)) e.medCert = 'Enter 0 to 30 days.'
  if (!between(o.minimum_minutes, 0, 240)) e.otMin = 'Enter 0 to 240 minutes.'
  if (!between(o.max_hours_per_day, 1, 12)) e.otMax = 'Enter 1 to 12 hours.'
  if (!between(o.filing_deadline_days, 0, 31)) e.otDeadline = 'Enter 0 to 31 days.'
  if (!between(o.starts_after_minutes, 0, 120)) e.otBuffer = 'Enter 0 to 120 minutes.'
  if (!between(form.value.undertime.max_hours_per_day, 1, 8)) e.utMax = 'Enter 1 to 8 hours.'
  form.value.rates.forEach((rate) => {
    if (!between(rate.percent, 100, 500)) e[`rate_${rate.key}`] = 'Enter 100% to 500%.'
  })
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
    form.value = defaultLeaveOvertimeSettings()
  }
}

// =====================================================
// OVERTIME PAY PREVIEW
// =====================================================

const previewDailyRate = ref(645)
const previewDayType = ref<OvertimeDayType>('regular_ot')
const previewMinutes = ref(95)

const peso = (n: number) =>
  `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const otPreview = computed(() => {
  const o = form.value.overtime
  const rate = form.value.rates.find(r => r.key === previewDayType.value)
  const worked = Math.max(0, Number(previewMinutes.value) || 0)
  const hourly = (Number(previewDailyRate.value) || 0) / 8

  if (worked === 0) {
    return { tone: 'warn', title: peso(0), text: 'Enter the overtime minutes worked.' }
  }

  if (worked < o.minimum_minutes) {
    return { tone: 'warn', title: peso(0), text: `${worked} min is below the ${o.minimum_minutes}-minute minimum, so it is not paid as overtime.` }
  }

  const capped = Math.min(worked, o.max_hours_per_day * 60)
  const counted = o.rounding_minutes > 0 ? Math.floor(capped / o.rounding_minutes) * o.rounding_minutes : capped
  const pay = hourly * ((rate?.percent ?? 100) / 100) * (counted / 60)

  const notes = [
    `Hourly rate ${peso(hourly)} (daily ÷ 8)`,
    `${counted} of ${worked} min counted${o.rounding_minutes ? ` (rounded down to ${o.rounding_minutes} min)` : ''}${capped < worked ? `, capped at ${o.max_hours_per_day} h` : ''}`,
    `${rate?.percent ?? 100}% for ${rate?.label.toLowerCase() ?? 'overtime'}`,
  ]

  return { tone: 'good', title: peso(pay), text: notes.join(' · ') }
})

const links = [
  { label: 'Leave Types', hint: 'Vacation, sick and other leave types', to: '/admin/leave-management/leave-types', icon: Umbrella },
  { label: 'Leave Policies', hint: 'Credits per employment type', to: '/admin/leave-management/leave-policies', icon: ListChecks },
  { label: 'Leave Balances', hint: 'Remaining credits per employee', to: '/admin/leave-management/leave-balances', icon: Wallet },
  { label: 'Overtime Approvals', hint: 'Pending overtime requests', to: '/admin/approvals/overtime', icon: ClipboardCheck },
  { label: 'Holidays', hint: 'Regular and special days used for rates', to: '/admin/work-calendar', icon: CalendarDays },
]
</script>

<template>
  <section class="settings-detail-page">
    <button type="button" class="back-link" @click="router.push('/admin/settings')">
      <ArrowLeft :size="14" /> Back to Settings
    </button>

    <PageHeader
      title="Leave & Overtime Settings"
      description="Company-wide rules for filing leave, overtime and undertime, and the overtime premium rates."
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
        <!-- LEAVE RULES -->
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><CalendarRange :size="17" /></span>
            <div>
              <h2>Leave Filing Rules</h2>
              <p>Applies to every leave type. Credits per employment type are set in Leave Policies.</p>
            </div>
          </header>
          <div class="panel-body form-grid">
            <div class="field" :class="{ invalid: errors.notice }">
              <label for="lv-notice">Advance notice for planned leave</label>
              <div class="unit-input">
                <input id="lv-notice" v-model.number="form.leave.advance_notice_days" type="number" min="0" max="60" inputmode="numeric">
                <span>days before</span>
              </div>
              <small :class="{ 'field-error': errors.notice }">{{ errors.notice || 'For example vacation leave. 0 allows same-day filing.' }}</small>
            </div>

            <div class="field" :class="{ invalid: errors.sickFiling }">
              <label for="lv-sick">File sick leave within</label>
              <div class="unit-input">
                <input id="lv-sick" v-model.number="form.leave.sick_filing_days_after" type="number" min="0" max="30" inputmode="numeric">
                <span>days after returning</span>
              </div>
              <small v-if="errors.sickFiling" class="field-error">{{ errors.sickFiling }}</small>
            </div>

            <div class="field" :class="{ invalid: errors.medCert }">
              <label for="lv-med">Medical certificate required after</label>
              <div class="unit-input">
                <input id="lv-med" v-model.number="form.leave.medical_certificate_after_days" type="number" min="0" max="30" inputmode="numeric">
                <span>consecutive sick days</span>
              </div>
              <small :class="{ 'field-error': errors.medCert }">{{ errors.medCert || '0 means never required.' }}</small>
            </div>

            <div class="field">
              <label for="lv-reset">Leave credits reset on</label>
              <select id="lv-reset" v-model="form.leave.reset_basis">
                <option value="calendar_year">January 1 (calendar year)</option>
                <option value="hire_anniversary">Each employee's hire anniversary</option>
              </select>
            </div>

            <div class="field wide">
              <label for="lv-carry-month">Carried-over credits expire after</label>
              <div class="form-grid">
                <select id="lv-carry-month" v-model.number="carryMonth" aria-label="Month">
                  <option v-for="(name, index) in MONTHS" :key="name" :value="index + 1">{{ name }}</option>
                </select>
                <select v-model.number="carryDay" aria-label="Day">
                  <option v-for="day in daysForMonth" :key="day" :value="day">{{ day }}</option>
                </select>
              </div>
              <small>Only for leave types whose policy allows carry-over.</small>
            </div>

            <div class="field wide">
              <AppSwitch id="lv-half" v-model="form.leave.allow_half_day" label="Allow half-day leave" description="Employees can file 0.5 day for the morning or afternoon." />
              <AppSwitch id="lv-negative" v-model="form.leave.allow_negative_balance" label="Allow filing beyond available credits" description="Excess days are treated as leave without pay." />
            </div>
          </div>
        </section>

        <!-- OVERTIME RULES -->
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><Timer :size="17" /></span>
            <div>
              <h2>Overtime Rules</h2>
              <p>When work beyond the schedule counts as paid overtime.</p>
            </div>
          </header>
          <div class="panel-body form-grid">
            <div class="field wide">
              <AppSwitch
                id="ot-pre"
                v-model="form.overtime.requires_pre_approval"
                label="Require approval before overtime is paid"
                description="Only approved overtime requests are included in payroll."
              />
            </div>

            <div class="field" :class="{ invalid: errors.otBuffer }">
              <label for="ot-buffer">Overtime starts after</label>
              <div class="unit-input">
                <input id="ot-buffer" v-model.number="form.overtime.starts_after_minutes" type="number" min="0" max="120" inputmode="numeric">
                <span>min past shift end</span>
              </div>
              <small :class="{ 'field-error': errors.otBuffer }">{{ errors.otBuffer || 'Time to wrap up before overtime begins.' }}</small>
            </div>

            <div class="field" :class="{ invalid: errors.otMin }">
              <label for="ot-min">Minimum overtime</label>
              <div class="unit-input">
                <input id="ot-min" v-model.number="form.overtime.minimum_minutes" type="number" min="0" max="240" inputmode="numeric">
                <span>minutes</span>
              </div>
              <small :class="{ 'field-error': errors.otMin }">{{ errors.otMin || 'Shorter overtime is not paid.' }}</small>
            </div>

            <div class="field">
              <label for="ot-round">Round overtime</label>
              <select id="ot-round" v-model.number="form.overtime.rounding_minutes">
                <option :value="0">No rounding (exact minutes)</option>
                <option :value="15">Round down to 15 minutes</option>
                <option :value="30">Round down to 30 minutes</option>
              </select>
            </div>

            <div class="field" :class="{ invalid: errors.otMax }">
              <label for="ot-max">Maximum per day</label>
              <div class="unit-input">
                <input id="ot-max" v-model.number="form.overtime.max_hours_per_day" type="number" min="1" max="12" step="0.5" inputmode="decimal">
                <span>hours</span>
              </div>
              <small v-if="errors.otMax" class="field-error">{{ errors.otMax }}</small>
            </div>

            <div class="field" :class="{ invalid: errors.otDeadline }">
              <label for="ot-deadline">File overtime within</label>
              <div class="unit-input">
                <input id="ot-deadline" v-model.number="form.overtime.filing_deadline_days" type="number" min="0" max="31" inputmode="numeric">
                <span>days after the date</span>
              </div>
              <small v-if="errors.otDeadline" class="field-error">{{ errors.otDeadline }}</small>
            </div>
          </div>
        </section>

        <!-- UNDERTIME -->
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><Hourglass :size="17" /></span>
            <div>
              <h2>Undertime</h2>
              <p>Leaving before the scheduled end of the shift.</p>
            </div>
          </header>
          <div class="panel-body form-grid">
            <div class="field wide">
              <AppSwitch
                id="ut-filing"
                v-model="form.undertime.requires_filing"
                label="Require an undertime request"
                description="Employees file a request that goes to Undertime Approvals."
              />
            </div>
            <div class="field" :class="{ invalid: errors.utMax }">
              <label for="ut-max">Maximum undertime per day</label>
              <div class="unit-input">
                <input id="ut-max" v-model.number="form.undertime.max_hours_per_day" type="number" min="1" max="8" step="0.5" inputmode="decimal">
                <span>hours</span>
              </div>
              <small :class="{ 'field-error': errors.utMax }">{{ errors.utMax || 'Longer absences should be filed as half-day leave.' }}</small>
            </div>
          </div>
        </section>

        <!-- RATES -->
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><Percent :size="17" /></span>
            <div>
              <h2>Overtime &amp; Premium Rates</h2>
              <p>Percent of the hourly rate. Defaults follow the Labor Code; raise them if your company pays more.</p>
            </div>
          </header>
          <div class="panel-body" style="overflow-x: auto;">
            <table class="rate-table">
              <thead>
                <tr>
                  <th scope="col">Day type</th>
                  <th scope="col">Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="rate in form.rates" :key="rate.key">
                  <td>
                    <label :for="`rate-${rate.key}`">{{ rate.label }}</label>
                    <small>{{ rate.description }}</small>
                  </td>
                  <td>
                    <div class="field" :class="{ invalid: errors[`rate_${rate.key}`] }">
                      <div class="unit-input">
                        <input :id="`rate-${rate.key}`" v-model.number="rate.percent" type="number" min="100" max="500" inputmode="numeric">
                        <span>%</span>
                      </div>
                      <small v-if="errors[`rate_${rate.key}`]" class="field-error">{{ errors[`rate_${rate.key}`] }}</small>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <!-- SIDE -->
      <aside class="side-column">
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><Calculator :size="17" /></span>
            <div>
              <h2>Overtime Pay Preview</h2>
              <p>Try the rules and rates before saving.</p>
            </div>
          </header>
          <div class="preview-body">
            <div class="field">
              <label for="pv-rate">Daily rate</label>
              <div class="unit-input">
                <span>₱</span>
                <input id="pv-rate" v-model.number="previewDailyRate" type="number" min="0" step="1">
              </div>
            </div>
            <div class="field">
              <label for="pv-type">Day type</label>
              <select id="pv-type" v-model="previewDayType">
                <option v-for="rate in form.rates" :key="rate.key" :value="rate.key">{{ rate.label }}</option>
              </select>
            </div>
            <div class="field">
              <label for="pv-min">Overtime worked</label>
              <div class="unit-input">
                <input id="pv-min" v-model.number="previewMinutes" type="number" min="0" max="720">
                <span>minutes</span>
              </div>
            </div>
            <div class="preview-result" :class="`tone-${otPreview.tone}`">
              <strong>{{ otPreview.title }}</strong>
              <span>{{ otPreview.text }}</span>
            </div>
          </div>
        </section>

        <section class="panel">
          <header class="panel-header">
            <div>
              <h2>Related Pages</h2>
              <p>Leave setup, requests and holidays.</p>
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