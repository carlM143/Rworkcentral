<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  AlarmClock,
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  PenLine,
  Clock3,
  FileWarning,
  Info,
  Moon,
  QrCode,
  RotateCcw,
  Save,
  ScanLine,
  TriangleAlert,
} from 'lucide-vue-next'
import AppSwitch from '~/components/shared/AppSwitch.vue'
import {
  defaultTimekeepingSettings,
  useTimekeepingSettings,
  type TimekeepingSettings,
} from '~/composables/admin/settings/useTimekeepingSettings'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const api = useTimekeepingSettings()
const { success, error: toastError } = useToast()

// =====================================================
// DATA + DIRTY TRACKING
// =====================================================

const form = ref<TimekeepingSettings>(defaultTimekeepingSettings())
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

const errors = computed(() => {
  const a = form.value.attendance
  const e: Record<string, string> = {}
  if (!between(a.default_grace_minutes, 0, 60)) e.grace = 'Enter 0 to 60 minutes.'
  if (!between(a.undertime_tolerance_minutes, 0, 60)) e.tolerance = 'Enter 0 to 60 minutes.'
  if (!between(a.half_day_hours, 1, 12)) e.halfDay = 'Enter 1 to 12 hours.'
  if (!between(a.absent_below_hours, 0, 12)) e.absent = 'Enter 0 to 12 hours.'
  else if (a.absent_below_hours >= a.half_day_hours) e.absent = 'Must be lower than the half-day threshold.'
  if (!between(form.value.missing_logs.flag_after_hours, 1, 24)) e.flagAfter = 'Enter 1 to 24 hours.'
  if (!between(form.value.corrections.filing_window_days, 1, 31)) e.filingWindow = 'Enter 1 to 31 days.'
  if (!between(form.value.corrections.max_waiver_minutes_per_month, 0, 1000)) e.waiver = 'Enter 0 to 1,000 minutes.'
  if (form.value.night_differential.enabled && !between(form.value.night_differential.rate_percent, 10, 100)) {
    e.ndRate = 'At least 10% (Labor Code minimum).'
  }
  const s = form.value.sources
  if (!s.qr_scan && !s.biometric_import && !s.manual_entry) e.sources = 'Keep at least one time log source on.'
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
    form.value = defaultTimekeepingSettings()
  }
}

// =====================================================
// LIVE PREVIEW
// =====================================================

const previewStart = ref('08:00')
const previewIn = ref('08:12')
const previewHours = ref(7)

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

const latePreview = computed(() => {
  const a = form.value.attendance
  const minutesLate = toMinutes(previewIn.value) - toMinutes(previewStart.value)

  if (minutesLate <= 0) return { tone: 'good', title: 'On time', text: 'Arrived at or before the schedule.' }
  if (minutesLate <= a.default_grace_minutes) {
    return { tone: 'good', title: 'On time', text: `${minutesLate} min after the schedule, within the ${a.default_grace_minutes}-minute grace period.` }
  }

  let counted = a.late_counting === 'after_grace' ? minutesLate - a.default_grace_minutes : minutesLate
  if (a.late_rounding_minutes > 0) counted = Math.ceil(counted / a.late_rounding_minutes) * a.late_rounding_minutes

  return {
    tone: 'warn',
    title: `Late: ${counted} min`,
    text: `Arrived ${minutesLate} min after the schedule${a.late_counting === 'after_grace' ? `, minus the ${a.default_grace_minutes}-minute grace period` : ''}${a.late_rounding_minutes ? `, rounded up to ${a.late_rounding_minutes} min` : ''}.`,
  }
})

const hoursPreview = computed(() => {
  const a = form.value.attendance
  const hours = Number(previewHours.value) || 0
  if (hours < a.absent_below_hours) return { tone: 'bad', title: 'Absent', text: `Less than ${a.absent_below_hours} hours worked.` }
  if (hours < a.half_day_hours) return { tone: 'warn', title: 'Half day', text: `Less than ${a.half_day_hours} hours worked.` }
  return { tone: 'good', title: 'Full day', text: `${a.half_day_hours} hours or more worked.` }
})

const links = [
  { label: 'Work Schedules', hint: 'Shift times, break and per-schedule grace period', to: '/admin/work-schedules', icon: CalendarClock },
  { label: 'Time Logs', hint: 'Daily attendance results', to: '/admin/time-logs', icon: Clock3 },
  { label: 'Manual Time In / Out', hint: 'HR entries for missing logs', to: '/admin/manual-time-in-out', icon: PenLine },
  { label: 'Manage QR Code', hint: 'Attendance QR sessions', to: '/admin/settings/qr-generation', icon: QrCode },
]
</script>

<template>
  <section class="settings-detail-page">
    <button type="button" class="back-link" @click="router.push('/admin/settings')">
      <ArrowLeft :size="14" /> Back to Settings
    </button>

    <PageHeader
      title="Timekeeping Settings"
      description="Company-wide attendance rules used when time logs are computed."
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
        <!-- ATTENDANCE RULES -->
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><AlarmClock :size="17" /></span>
            <div>
              <h2>Attendance Rules</h2>
              <p>How late, undertime, half day and absent are decided.</p>
            </div>
          </header>
          <div class="panel-body form-grid">
            <div class="field" :class="{ invalid: errors.grace }">
              <label for="tk-grace">Default grace period</label>
              <div class="unit-input">
                <input id="tk-grace" v-model.number="form.attendance.default_grace_minutes" type="number" min="0" max="60" inputmode="numeric">
                <span>minutes</span>
              </div>
              <small :class="{ 'field-error': errors.grace }">
                {{ errors.grace || 'Used when a work schedule has no grace period of its own.' }}
              </small>
            </div>

            <div class="field">
              <label for="tk-late-count">After the grace period</label>
              <select id="tk-late-count" v-model="form.attendance.late_counting">
                <option value="from_schedule">Count all minutes from schedule start</option>
                <option value="after_grace">Count only minutes beyond the grace period</option>
              </select>
              <small>Example with 10-minute grace, in at 8:12: 12 min vs 2 min late.</small>
            </div>

            <div class="field">
              <label for="tk-rounding">Round late minutes</label>
              <select id="tk-rounding" v-model.number="form.attendance.late_rounding_minutes">
                <option :value="0">No rounding (exact minutes)</option>
                <option :value="5">Round up to 5 minutes</option>
                <option :value="15">Round up to 15 minutes</option>
                <option :value="30">Round up to 30 minutes</option>
              </select>
            </div>

            <div class="field" :class="{ invalid: errors.tolerance }">
              <label for="tk-tolerance">Undertime tolerance</label>
              <div class="unit-input">
                <input id="tk-tolerance" v-model.number="form.attendance.undertime_tolerance_minutes" type="number" min="0" max="60" inputmode="numeric">
                <span>minutes</span>
              </div>
              <small :class="{ 'field-error': errors.tolerance }">
                {{ errors.tolerance || 'Leaving this many minutes early is not counted as undertime.' }}
              </small>
            </div>

            <div class="field" :class="{ invalid: errors.halfDay }">
              <label for="tk-halfday">Half day if worked less than</label>
              <div class="unit-input">
                <input id="tk-halfday" v-model.number="form.attendance.half_day_hours" type="number" min="1" max="12" step="0.5" inputmode="decimal">
                <span>hours</span>
              </div>
              <small v-if="errors.halfDay" class="field-error">{{ errors.halfDay }}</small>
            </div>

            <div class="field" :class="{ invalid: errors.absent }">
              <label for="tk-absent">Absent if worked less than</label>
              <div class="unit-input">
                <input id="tk-absent" v-model.number="form.attendance.absent_below_hours" type="number" min="0" max="12" step="0.5" inputmode="decimal">
                <span>hours</span>
              </div>
              <small v-if="errors.absent" class="field-error">{{ errors.absent }}</small>
            </div>
          </div>
        </section>

        <!-- SOURCES -->
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><ScanLine :size="17" /></span>
            <div>
              <h2>Time Log Sources</h2>
              <p>Where time in and time out records may come from.</p>
            </div>
          </header>
          <div class="panel-body">
            <AppSwitch id="tk-qr" v-model="form.sources.qr_scan" label="QR code scan" description="Employees scan the attendance QR code to time in and out." />
            <AppSwitch id="tk-bio" v-model="form.sources.biometric_import" label="Biometric import" description="HR imports time logs from the biometric device (CSV)." />
            <AppSwitch id="tk-manual" v-model="form.sources.manual_entry" label="Manual time in / out" description="HR can encode missing logs on the Manual Time In / Out page." />
            <AppSwitch
              id="tk-remarks"
              v-model="form.sources.manual_requires_remarks"
              label="Require remarks on manual entries"
              description="A reason must be written for every manual entry."
              :disabled="!form.sources.manual_entry"
            />
            <AppSwitch id="tk-filo" v-model="form.sources.first_in_last_out" label="Use first in, last out" description="When there are several scans in a day, the earliest is time in and the latest is time out." />
            <p v-if="errors.sources" class="field-error" style="margin: 8px 0 0; font-size: 12px;">{{ errors.sources }}</p>
          </div>
        </section>

        <!-- MISSING LOGS + CORRECTIONS -->
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><FileWarning :size="17" /></span>
            <div>
              <h2>Missing Logs &amp; Corrections</h2>
              <p>What happens when a log is incomplete, and how long employees have to correct it.</p>
            </div>
          </header>
          <div class="panel-body form-grid">
            <div class="field">
              <label for="tk-missing">No time out recorded</label>
              <select id="tk-missing" v-model="form.missing_logs.missing_time_out">
                <option value="incomplete">Mark as Incomplete (needs correction)</option>
                <option value="absent">Mark as Absent</option>
              </select>
            </div>

            <div class="field" :class="{ invalid: errors.flagAfter }">
              <label for="tk-flag">Flag open logs after</label>
              <div class="unit-input">
                <input id="tk-flag" v-model.number="form.missing_logs.flag_after_hours" type="number" min="1" max="24" inputmode="numeric">
                <span>hours past shift end</span>
              </div>
              <small v-if="errors.flagAfter" class="field-error">{{ errors.flagAfter }}</small>
            </div>

            <div class="field" :class="{ invalid: errors.filingWindow }">
              <label for="tk-window">Correction filing window</label>
              <div class="unit-input">
                <input id="tk-window" v-model.number="form.corrections.filing_window_days" type="number" min="1" max="31" inputmode="numeric">
                <span>days after the date</span>
              </div>
              <small :class="{ 'field-error': errors.filingWindow }">
                {{ errors.filingWindow || 'Time Log Correction Requests are not accepted after this.' }}
              </small>
            </div>

            <div class="field" :class="{ invalid: errors.waiver }">
              <label for="tk-waiver">Late adjustment limit</label>
              <div class="unit-input">
                <input id="tk-waiver" v-model.number="form.corrections.max_waiver_minutes_per_month" type="number" min="0" max="1000" inputmode="numeric">
                <span>minutes per month</span>
              </div>
              <small :class="{ 'field-error': errors.waiver }">
                {{ errors.waiver || '0 means no limit on waived minutes per employee.' }}
              </small>
            </div>

            <div class="field wide">
              <AppSwitch id="tk-notify" v-model="form.missing_logs.notify_employee" label="Notify the employee about incomplete logs" description="Shows a reminder in the Employee Portal to file a correction." />
              <AppSwitch id="tk-attach" v-model="form.corrections.require_attachment" label="Require an attachment on correction requests" description="For example a photo, gate pass or approval message." />
            </div>
          </div>
        </section>

        <!-- NIGHT DIFFERENTIAL -->
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><Moon :size="17" /></span>
            <div>
              <h2>Night Differential</h2>
              <p>Premium for hours worked at night (Labor Code: at least 10% between 10:00 PM and 6:00 AM).</p>
            </div>
          </header>
          <div class="panel-body">
            <AppSwitch id="tk-nd" v-model="form.night_differential.enabled" label="Compute night differential" />
            <div class="form-grid three" style="margin-top: 12px;">
              <div class="field">
                <label for="tk-nd-start">Starts</label>
                <input id="tk-nd-start" v-model="form.night_differential.start" type="time" :disabled="!form.night_differential.enabled">
              </div>
              <div class="field">
                <label for="tk-nd-end">Ends</label>
                <input id="tk-nd-end" v-model="form.night_differential.end" type="time" :disabled="!form.night_differential.enabled">
              </div>
              <div class="field" :class="{ invalid: errors.ndRate }">
                <label for="tk-nd-rate">Rate</label>
                <div class="unit-input">
                  <input id="tk-nd-rate" v-model.number="form.night_differential.rate_percent" type="number" min="10" max="100" inputmode="numeric" :disabled="!form.night_differential.enabled">
                  <span>% of hourly rate</span>
                </div>
                <small v-if="errors.ndRate" class="field-error">{{ errors.ndRate }}</small>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- SIDE -->
      <aside class="side-column">
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><Clock3 :size="17" /></span>
            <div>
              <h2>Preview</h2>
              <p>Try the rules before saving.</p>
            </div>
          </header>
          <div class="preview-body">
            <div class="form-grid">
              <div class="field">
                <label for="pv-start">Schedule start</label>
                <input id="pv-start" v-model="previewStart" type="time">
              </div>
              <div class="field">
                <label for="pv-in">Time in</label>
                <input id="pv-in" v-model="previewIn" type="time">
              </div>
            </div>
            <div class="preview-result" :class="`tone-${latePreview.tone}`">
              <strong>{{ latePreview.title }}</strong>
              <span>{{ latePreview.text }}</span>
            </div>

            <div class="field">
              <label for="pv-hours">Hours worked</label>
              <div class="unit-input">
                <input id="pv-hours" v-model.number="previewHours" type="number" min="0" max="24" step="0.5">
                <span>hours</span>
              </div>
            </div>
            <div class="preview-result" :class="`tone-${hoursPreview.tone}`">
              <strong>{{ hoursPreview.title }}</strong>
              <span>{{ hoursPreview.text }}</span>
            </div>
          </div>
        </section>

        <section class="panel">
          <header class="panel-header">
            <div>
              <h2>Related Pages</h2>
              <p>Schedules and logs that use these rules.</p>
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