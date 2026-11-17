<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CircleCheck,
  CircleX,
  Construction,
  FileClock,
  Globe,
  Info,
  KeyRound,
  LockKeyhole,
  RotateCcw,
  Save,
  ShieldCheck,
  TriangleAlert,
  UserCog,
  UserRound,
} from 'lucide-vue-next'
import AppSwitch from '~/components/shared/AppSwitch.vue'
import {
  defaultSystemSettings,
  useSystemSettings,
  type SystemSettings,
} from '~/composables/admin/settings/useSystemSettings'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const api = useSystemSettings()
const { success, error: toastError } = useToast()

const TIMEZONES = [
  { value: 'Asia/Manila', label: 'Asia/Manila (UTC+8, Philippines)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (UTC+8)' },
  { value: 'Asia/Hong_Kong', label: 'Asia/Hong_Kong (UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (UTC+9)' },
  { value: 'UTC', label: 'UTC (UTC+0)' },
]

// =====================================================
// DATA + DIRTY TRACKING
// =====================================================

const form = ref<SystemSettings>(defaultSystemSettings())
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
  const g = form.value.general
  const s = form.value.security
  const e: Record<string, string> = {}
  if (!g.system_name.trim()) e.name = 'Enter the system name.'
  else if (g.system_name.length > 60) e.name = 'Use 60 characters or fewer.'
  if (!between(s.session_timeout_minutes, 5, 720)) e.session = 'Enter 5 to 720 minutes.'
  if (!between(s.password_min_length, 8, 64)) e.minLength = 'Enter 8 to 64 characters.'
  if (!between(s.password_expiry_days, 0, 365)) e.expiry = 'Enter 0 to 365 days.'
  if (!between(s.max_login_attempts, 3, 20)) e.attempts = 'Enter 3 to 20 attempts.'
  if (!between(s.lockout_minutes, 1, 1440)) e.lockout = 'Enter 1 to 1,440 minutes.'
  if (!between(form.value.audit.retention_days, 30, 3650)) e.retention = 'Enter 30 to 3,650 days.'
  if (form.value.maintenance.enabled && !form.value.maintenance.message.trim()) e.maintenance = 'Enter the message users will see.'
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
  if (
    form.value.maintenance.enabled
    && JSON.parse(snapshot.value).maintenance.enabled === false
    && !window.confirm('Turn on maintenance mode? Everyone except administrators will be signed out and blocked until it is turned off.')
  ) {
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
    form.value = defaultSystemSettings()
  }
}

// =====================================================
// PREVIEW: FORMATS
// =====================================================

const formatPreview = computed(() => {
  const g = form.value.general
  const now = new Date()
  let date: string
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: g.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(now)
    const get = (t: string) => parts.find(p => p.type === t)?.value ?? ''
    const [y, m, d] = [get('year'), get('month'), get('day')]
    date = {
      'MMM D, YYYY': new Intl.DateTimeFormat('en-US', { timeZone: g.timezone, month: 'short', day: 'numeric', year: 'numeric' }).format(now),
      'MM/DD/YYYY': `${m}/${d}/${y}`,
      'DD/MM/YYYY': `${d}/${m}/${y}`,
      'YYYY-MM-DD': `${y}-${m}-${d}`,
    }[g.date_format]
  } catch {
    date = '—'
  }

  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: g.timezone, hour: 'numeric', minute: '2-digit', hour12: g.time_format === '12h',
  }).format(now)

  return { date, time, amount: '₱12,345.67' }
})

// =====================================================
// PREVIEW: PASSWORD POLICY
// =====================================================

const samplePassword = ref('')

const passwordChecks = computed(() => {
  const s = form.value.security
  const p = samplePassword.value
  const checks = [{ label: `At least ${s.password_min_length} characters`, ok: p.length >= s.password_min_length }]
  if (s.require_uppercase) checks.push({ label: 'An uppercase letter', ok: /[A-Z]/.test(p) })
  if (s.require_number) checks.push({ label: 'A number', ok: /\d/.test(p) })
  if (s.require_symbol) checks.push({ label: 'A symbol (e.g. ! @ # $)', ok: /[^A-Za-z0-9]/.test(p) })
  return checks
})

const links = [
  { label: 'Company Information', hint: 'Company profile and branches', to: '/admin/settings/company', icon: Building2 },
  { label: 'Users & Access', hint: 'System users and their roles', to: '/admin/settings/users', icon: UserCog },
  { label: 'Roles & Permissions', hint: 'What each role can do', to: '/admin/settings/roles', icon: ShieldCheck },
  { label: 'My Account', hint: 'Your password and profile', to: '/admin/settings/my-account', icon: UserRound },
]
</script>

<template>
  <section class="settings-detail-page">
    <button type="button" class="back-link" @click="router.push('/admin/settings')">
      <ArrowLeft :size="14" /> Back to Settings
    </button>

    <PageHeader
      title="System Settings"
      description="General preferences, sign-in security, audit logs and maintenance mode."
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
        <!-- GENERAL -->
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><Globe :size="17" /></span>
            <div>
              <h2>General</h2>
              <p>Name, time zone and how dates, times and amounts are shown.</p>
            </div>
          </header>
          <div class="panel-body form-grid">
            <div class="field wide" :class="{ invalid: errors.name }">
              <label for="sy-name">System name</label>
              <div class="unit-input">
                <input id="sy-name" v-model="form.general.system_name" type="text" maxlength="60">
              </div>
              <small :class="{ 'field-error': errors.name }">{{ errors.name || 'Shown in the browser tab, emails and payslips.' }}</small>
            </div>

            <div class="field">
              <label for="sy-tz">Time zone</label>
              <select id="sy-tz" v-model="form.general.timezone">
                <option v-for="tz in TIMEZONES" :key="tz.value" :value="tz.value">{{ tz.label }}</option>
              </select>
              <small>Used for time logs, cutoffs and trip times. Change with care.</small>
            </div>

            <div class="field">
              <label for="sy-week">Week starts on</label>
              <select id="sy-week" v-model="form.general.week_starts_on">
                <option value="monday">Monday</option>
                <option value="sunday">Sunday</option>
              </select>
            </div>

            <div class="field">
              <label for="sy-date">Date format</label>
              <select id="sy-date" v-model="form.general.date_format">
                <option value="MMM D, YYYY">Nov 13, 2026</option>
                <option value="MM/DD/YYYY">11/13/2026</option>
                <option value="DD/MM/YYYY">13/11/2026</option>
                <option value="YYYY-MM-DD">2026-11-13</option>
              </select>
            </div>

            <div class="field">
              <label for="sy-time">Time format</label>
              <select id="sy-time" v-model="form.general.time_format">
                <option value="12h">12-hour (2:30 PM)</option>
                <option value="24h">24-hour (14:30)</option>
              </select>
            </div>

            <div class="field">
              <label for="sy-currency">Currency</label>
              <select id="sy-currency" v-model="form.general.currency" disabled>
                <option value="PHP">Philippine peso (₱)</option>
              </select>
            </div>
          </div>
        </section>

        <!-- SECURITY -->
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><LockKeyhole :size="17" /></span>
            <div>
              <h2>Sign-in &amp; Passwords</h2>
              <p>Applies to admin and employee portal accounts.</p>
            </div>
          </header>
          <div class="panel-body form-grid">
            <div class="field" :class="{ invalid: errors.session }">
              <label for="sy-session">Sign out after inactivity</label>
              <div class="unit-input">
                <input id="sy-session" v-model.number="form.security.session_timeout_minutes" type="number" min="5" max="720" inputmode="numeric">
                <span>minutes</span>
              </div>
              <small v-if="errors.session" class="field-error">{{ errors.session }}</small>
            </div>

            <div class="field" :class="{ invalid: errors.minLength }">
              <label for="sy-minlen">Minimum password length</label>
              <div class="unit-input">
                <input id="sy-minlen" v-model.number="form.security.password_min_length" type="number" min="8" max="64" inputmode="numeric">
                <span>characters</span>
              </div>
              <small v-if="errors.minLength" class="field-error">{{ errors.minLength }}</small>
            </div>

            <div class="field" :class="{ invalid: errors.attempts }">
              <label for="sy-attempts">Lock account after</label>
              <div class="unit-input">
                <input id="sy-attempts" v-model.number="form.security.max_login_attempts" type="number" min="3" max="20" inputmode="numeric">
                <span>failed attempts</span>
              </div>
              <small v-if="errors.attempts" class="field-error">{{ errors.attempts }}</small>
            </div>

            <div class="field" :class="{ invalid: errors.lockout }">
              <label for="sy-lockout">Lock for</label>
              <div class="unit-input">
                <input id="sy-lockout" v-model.number="form.security.lockout_minutes" type="number" min="1" max="1440" inputmode="numeric">
                <span>minutes</span>
              </div>
              <small v-if="errors.lockout" class="field-error">{{ errors.lockout }}</small>
            </div>

            <div class="field" :class="{ invalid: errors.expiry }">
              <label for="sy-expiry">Require a new password every</label>
              <div class="unit-input">
                <input id="sy-expiry" v-model.number="form.security.password_expiry_days" type="number" min="0" max="365" inputmode="numeric">
                <span>days</span>
              </div>
              <small :class="{ 'field-error': errors.expiry }">{{ errors.expiry || '0 means passwords do not expire.' }}</small>
            </div>

            <div class="field wide">
              <AppSwitch id="sy-upper" v-model="form.security.require_uppercase" label="Require an uppercase letter" />
              <AppSwitch id="sy-number" v-model="form.security.require_number" label="Require a number" />
              <AppSwitch id="sy-symbol" v-model="form.security.require_symbol" label="Require a symbol" />
              <AppSwitch
                id="sy-2fa"
                v-model="form.security.two_factor_for_admins"
                label="Two-factor sign-in for administrators"
                description="Administrators enter a one-time code in addition to their password."
              />
            </div>
          </div>
        </section>

        <!-- AUDIT -->
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><FileClock :size="17" /></span>
            <div>
              <h2>Audit Log</h2>
              <p>Record of who did what in the HRIS.</p>
            </div>
          </header>
          <div class="panel-body form-grid">
            <div class="field wide">
              <AppSwitch id="sy-audit" v-model="form.audit.enabled" label="Keep an audit log" />
              <AppSwitch id="sy-logins" v-model="form.audit.log_logins" label="Sign-ins and sign-outs" :disabled="!form.audit.enabled" />
              <AppSwitch
                id="sy-changes"
                v-model="form.audit.log_data_changes"
                label="Changes to records"
                description="Employees, salaries, payroll, approvals and settings, with old and new values."
                :disabled="!form.audit.enabled"
              />
              <AppSwitch id="sy-exports" v-model="form.audit.log_exports" label="Exports and downloads" description="CSV exports, payslips and reports." :disabled="!form.audit.enabled" />
            </div>

            <div class="field" :class="{ invalid: errors.retention }">
              <label for="sy-retention">Keep audit entries for</label>
              <div class="unit-input">
                <input id="sy-retention" v-model.number="form.audit.retention_days" type="number" min="30" max="3650" inputmode="numeric" :disabled="!form.audit.enabled">
                <span>days</span>
              </div>
              <small :class="{ 'field-error': errors.retention }">{{ errors.retention || 'Older entries are deleted automatically.' }}</small>
            </div>
          </div>
        </section>

        <!-- MAINTENANCE -->
        <section class="panel" :class="{ 'panel-warning': form.maintenance.enabled }">
          <header class="panel-header">
            <span class="panel-icon"><Construction :size="17" /></span>
            <div>
              <h2>Maintenance Mode</h2>
              <p>Temporarily block access while the system is being updated.</p>
            </div>
          </header>
          <div class="panel-body">
            <AppSwitch
              id="sy-maint"
              v-model="form.maintenance.enabled"
              label="Turn on maintenance mode"
              description="Only administrators can sign in. Employees see the message below."
            />
            <div class="field" :class="{ invalid: errors.maintenance }" style="margin-top: 12px;">
              <label for="sy-maint-msg">Message</label>
              <textarea id="sy-maint-msg" v-model="form.maintenance.message" rows="3" maxlength="300" class="textarea" />
              <small v-if="errors.maintenance" class="field-error">{{ errors.maintenance }}</small>
            </div>
          </div>
        </section>
      </div>

      <!-- SIDE -->
      <aside class="side-column">
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><Globe :size="17" /></span>
            <div>
              <h2>Format Preview</h2>
              <p>Right now, in the selected time zone.</p>
            </div>
          </header>
          <dl class="format-list">
            <div><dt>Date</dt><dd>{{ formatPreview.date }}</dd></div>
            <div><dt>Time</dt><dd>{{ formatPreview.time }}</dd></div>
            <div><dt>Amount</dt><dd>{{ formatPreview.amount }}</dd></div>
          </dl>
        </section>

        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><KeyRound :size="17" /></span>
            <div>
              <h2>Password Check</h2>
              <p>Type a sample password to test the rules. It is not saved.</p>
            </div>
          </header>
          <div class="preview-body">
            <div class="field">
              <label for="pv-pass">Sample password</label>
              <div class="unit-input">
                <input id="pv-pass" v-model="samplePassword" type="text" autocomplete="off" spellcheck="false">
              </div>
            </div>
            <ul class="checks">
              <li v-for="check in passwordChecks" :key="check.label" :class="{ ok: check.ok }">
                <CircleCheck v-if="check.ok" :size="15" />
                <CircleX v-else :size="15" />
                {{ check.label }}
              </li>
            </ul>
          </div>
        </section>

        <section class="panel">
          <header class="panel-header">
            <div>
              <h2>Related Pages</h2>
              <p>Company, users and roles.</p>
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
.textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
  resize: vertical;
}

.textarea:focus-visible {
  border-color: var(--primary);
  outline: none;
}

.panel-warning { border-color: var(--orange); }
.panel-warning .panel-icon { background: var(--orange-soft); color: var(--orange); }

.format-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 14px 18px 18px;
}

.format-list div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
}

.format-list dt {
  color: var(--text-secondary);
  font-size: 12px;
}

.format-list dd {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
}

.checks {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.checks li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 12px;
}

.checks li.ok { color: var(--green); }
</style>