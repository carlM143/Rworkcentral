<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  ArrowLeft,
  BriefcaseBusiness,
  CircleCheck,
  CircleX,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  MonitorSmartphone,
  Save,
  UserRound,
} from 'lucide-vue-next'
import AppSwitch from '~/components/shared/AppSwitch.vue'
import {
  accountApiError,
  useAccountApi,
  type AccountRecord,
} from '~/composables/admin/account/useAccountApi'

definePageMeta({
  layout: 'admin',
})

const router = useRouter()
const api = useAccountApi()
const { refreshUser } = useAuth()
const { success, error: toastError } = useToast()

// =====================================================
// LOAD
// =====================================================

const account = ref<AccountRecord | null>(null)
const loading = ref(true)
const loadError = ref('')

const load = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const response = await api.show()
    account.value = response.data
    details.name = response.data.name
    details.email = response.data.email
  } catch (err) {
    loadError.value = accountApiError(err, 'Unable to load your account.').message
  } finally {
    loading.value = false
  }
}

onMounted(load)

const initials = computed(() =>
  (account.value?.name ?? 'U')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase(),
)

const roleLabel = computed(() => {
  const role = account.value?.role ?? ''
  return role ? role.replace(/\b\w/g, c => c.toUpperCase()) : 'No assigned role'
})

const dateLabel = (value?: string | null) =>
  value ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value.length <= 10 ? `${value}T00:00:00` : value)) : '—'

// =====================================================
// ACCOUNT DETAILS
// =====================================================

const details = reactive({ name: '', email: '' })
const detailsErrors = ref<Record<string, string[]>>({})
const savingDetails = ref(false)

const detailsDirty = computed(() =>
  !!account.value && (details.name.trim() !== account.value.name || details.email.trim().toLowerCase() !== account.value.email),
)

const saveDetails = async () => {
  detailsErrors.value = {}
  if (!details.name.trim()) { detailsErrors.value = { name: ['Enter your name.'] }; return }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim())) { detailsErrors.value = { email: ['Enter a valid email address.'] }; return }

  savingDetails.value = true
  try {
    const response = await api.update({ name: details.name.trim(), email: details.email.trim() })
    account.value = response.data
    details.name = response.data.name
    details.email = response.data.email
    await refreshUser() // update the name in the sidebar and top bar
    success('Account updated', response.message)
  } catch (err) {
    const e = accountApiError(err, 'Unable to save your details.')
    detailsErrors.value = e.errors
    toastError('Unable to save', e.message)
  } finally {
    savingDetails.value = false
  }
}

const resetDetails = () => {
  if (!account.value) return
  details.name = account.value.name
  details.email = account.value.email
  detailsErrors.value = {}
}

// =====================================================
// PASSWORD
// =====================================================

const password = reactive({ current: '', next: '', confirm: '', signOutOthers: true })
const show = reactive({ current: false, next: false, confirm: false })
const passwordErrors = ref<Record<string, string[]>>({})
const savingPassword = ref(false)

const checks = computed(() => [
  { label: 'At least 8 characters', ok: password.next.length >= 8 },
  { label: 'A letter', ok: /[A-Za-z]/.test(password.next) },
  { label: 'A number', ok: /\d/.test(password.next) },
  { label: 'Matches the confirmation', ok: !!password.next && password.next === password.confirm },
])

const passwordReady = computed(() => !!password.current && checks.value.every(c => c.ok))

const changePassword = async () => {
  passwordErrors.value = {}
  if (!passwordReady.value) return

  savingPassword.value = true
  try {
    const response = await api.updatePassword({
      current_password: password.current,
      password: password.next,
      password_confirmation: password.confirm,
      sign_out_other_devices: password.signOutOthers,
    })
    account.value = response.data
    Object.assign(password, { current: '', next: '', confirm: '' })
    success('Password changed', password.signOutOthers ? 'Other devices were signed out.' : response.message)
  } catch (err) {
    const e = accountApiError(err, 'Unable to change your password.')
    passwordErrors.value = e.errors
    toastError('Unable to change password', e.message)
  } finally {
    savingPassword.value = false
  }
}

// =====================================================
// SESSIONS
// =====================================================

const signingOut = ref(false)

const otherSessions = computed(() => Math.max(0, (account.value?.sessions.active ?? 1) - 1))

const signOutOthers = async () => {
  if (!window.confirm('Sign out of RWorkCentral on every other device? This device stays signed in.')) return
  signingOut.value = true
  try {
    const response = await api.signOutOtherDevices()
    account.value = response.data
    success('Signed out other devices', response.message)
  } catch (err) {
    toastError('Unable to sign out other devices', accountApiError(err, 'Please try again.').message)
  } finally {
    signingOut.value = false
  }
}

const fieldError = (bag: Record<string, string[]>, key: string) => bag[key]?.[0] ?? ''
</script>

<template>
  <section class="settings-detail-page">
    <button type="button" class="back-link" @click="router.push('/admin/settings')">
      <ArrowLeft :size="14" /> Back to Settings
    </button>

    <PageHeader title="My Account" description="Your sign-in details, password and devices." />

    <div v-if="loading" class="state-card">Loading your account...</div>
    <div v-else-if="loadError || !account" class="state-card">
      <strong>Unable to load your account</strong>
      <span>{{ loadError }}</span>
      <AppButton variant="secondary" @click="load">Retry</AppButton>
    </div>

    <div v-else class="content-grid">
      <div class="form-column">
        <!-- PROFILE SUMMARY -->
        <section class="panel profile-card">
          <div class="avatar" aria-hidden="true">{{ initials }}</div>
          <div class="profile-text">
            <h2>{{ account.name }}</h2>
            <p>{{ account.email }}</p>
            <div class="badges">
              <span class="badge">{{ roleLabel }}</span>
              <span class="muted">Member since {{ dateLabel(account.member_since) }}</span>
            </div>
          </div>
        </section>

        <!-- ACCOUNT DETAILS -->
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><UserRound :size="17" /></span>
            <div>
              <h2>Account Details</h2>
              <p>The name shown in the HRIS and the email you sign in with.</p>
            </div>
          </header>
          <form class="panel-body" @submit.prevent="saveDetails">
            <div class="form-grid">
              <div class="field" :class="{ invalid: fieldError(detailsErrors, 'name') }">
                <label for="acc-name">Full name</label>
                <div class="unit-input">
                  <input id="acc-name" v-model="details.name" type="text" autocomplete="name" maxlength="255">
                </div>
                <small v-if="fieldError(detailsErrors, 'name')" class="field-error">{{ fieldError(detailsErrors, 'name') }}</small>
              </div>
              <div class="field" :class="{ invalid: fieldError(detailsErrors, 'email') }">
                <label for="acc-email">Email</label>
                <div class="unit-input">
                  <input id="acc-email" v-model="details.email" type="email" autocomplete="email" maxlength="255">
                </div>
                <small :class="{ 'field-error': fieldError(detailsErrors, 'email') }">
                  {{ fieldError(detailsErrors, 'email') || 'Changing this changes the email you sign in with.' }}
                </small>
              </div>
            </div>
            <div class="actions">
              <AppButton variant="secondary" :disabled="!detailsDirty || savingDetails" @click="resetDetails">Cancel</AppButton>
              <AppButton :icon="Save" :disabled="!detailsDirty || savingDetails" @click="saveDetails">
                {{ savingDetails ? 'Saving...' : 'Save Details' }}
              </AppButton>
            </div>
          </form>
        </section>

        <!-- PASSWORD -->
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><KeyRound :size="17" /></span>
            <div>
              <h2>Change Password</h2>
              <p>Use at least 8 characters with letters and numbers.</p>
            </div>
          </header>
          <form class="panel-body" @submit.prevent="changePassword">
            <div class="form-grid">
              <div class="field wide" :class="{ invalid: fieldError(passwordErrors, 'current_password') }">
                <label for="pw-current">Current password</label>
                <div class="unit-input">
                  <input id="pw-current" v-model="password.current" :type="show.current ? 'text' : 'password'" autocomplete="current-password">
                  <button type="button" class="eye" :aria-label="show.current ? 'Hide password' : 'Show password'" @click="show.current = !show.current">
                    <EyeOff v-if="show.current" :size="15" /><Eye v-else :size="15" />
                  </button>
                </div>
                <small v-if="fieldError(passwordErrors, 'current_password')" class="field-error">{{ fieldError(passwordErrors, 'current_password') }}</small>
              </div>

              <div class="field" :class="{ invalid: fieldError(passwordErrors, 'password') }">
                <label for="pw-new">New password</label>
                <div class="unit-input">
                  <input id="pw-new" v-model="password.next" :type="show.next ? 'text' : 'password'" autocomplete="new-password">
                  <button type="button" class="eye" :aria-label="show.next ? 'Hide password' : 'Show password'" @click="show.next = !show.next">
                    <EyeOff v-if="show.next" :size="15" /><Eye v-else :size="15" />
                  </button>
                </div>
                <small v-if="fieldError(passwordErrors, 'password')" class="field-error">{{ fieldError(passwordErrors, 'password') }}</small>
              </div>

              <div class="field">
                <label for="pw-confirm">Confirm new password</label>
                <div class="unit-input">
                  <input id="pw-confirm" v-model="password.confirm" :type="show.confirm ? 'text' : 'password'" autocomplete="new-password">
                  <button type="button" class="eye" :aria-label="show.confirm ? 'Hide password' : 'Show password'" @click="show.confirm = !show.confirm">
                    <EyeOff v-if="show.confirm" :size="15" /><Eye v-else :size="15" />
                  </button>
                </div>
              </div>
            </div>

            <ul class="checks" aria-label="Password requirements">
              <li v-for="check in checks" :key="check.label" :class="{ ok: check.ok }">
                <CircleCheck v-if="check.ok" :size="14" /><CircleX v-else :size="14" />
                {{ check.label }}
              </li>
            </ul>

            <AppSwitch
              id="pw-signout"
              v-model="password.signOutOthers"
              label="Sign out on other devices"
              description="Recommended if you think someone else knows your password."
            />

            <div class="actions">
              <AppButton :icon="KeyRound" :disabled="!passwordReady || savingPassword" @click="changePassword">
                {{ savingPassword ? 'Changing...' : 'Change Password' }}
              </AppButton>
            </div>
          </form>
        </section>
      </div>

      <!-- SIDE -->
      <aside class="side-column">
        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><BriefcaseBusiness :size="17" /></span>
            <div>
              <h2>Employee Record</h2>
              <p>The employee profile linked to this account.</p>
            </div>
          </header>
          <dl v-if="account.employee" class="info-list">
            <div><dt>Name</dt><dd>{{ account.employee.name }}</dd></div>
            <div><dt>Employee No.</dt><dd>{{ account.employee.emp_id ?? '—' }}</dd></div>
            <div><dt>Position</dt><dd>{{ account.employee.position ?? '—' }}</dd></div>
            <div><dt>Department</dt><dd>{{ account.employee.department ?? '—' }}</dd></div>
            <div><dt>Date Hired</dt><dd>{{ dateLabel(account.employee.date_hired) }}</dd></div>
          </dl>
          <p v-else class="empty">This account is not linked to an employee record (for example, a system administrator).</p>
        </section>

        <section class="panel">
          <header class="panel-header">
            <span class="panel-icon"><MonitorSmartphone :size="17" /></span>
            <div>
              <h2>Devices</h2>
              <p>Where you are signed in.</p>
            </div>
          </header>
          <div class="panel-body sessions">
            <p>
              <strong>{{ account.sessions.active }}</strong>
              active sign-in{{ account.sessions.active === 1 ? '' : 's' }}, including this device.
            </p>
            <AppButton variant="secondary" :icon="LogOut" :disabled="!otherSessions || signingOut" @click="signOutOthers">
              {{ signingOut ? 'Signing out...' : `Sign out ${otherSessions} other device${otherSessions === 1 ? '' : 's'}` }}
            </AppButton>
          </div>
        </section>
      </aside>
    </div>
  </section>
</template>

<style scoped src="../../../assets/css/settings-form.css"></style>

<style scoped>
.state-card {
  display: flex; min-height: 220px; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
  border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); color: var(--text-muted); font-size: 13px;
}

.state-card strong { color: var(--text-primary); font-size: 15px; }

.profile-card { display: flex; align-items: center; gap: 16px; padding: 18px; }

.avatar {
  display: flex; width: 60px; height: 60px; flex-shrink: 0; align-items: center; justify-content: center; border-radius: 50%;
  background: linear-gradient(135deg, #ddeaff, #b8d1ff); color: #164b9b; font-size: 20px; font-weight: 700;
}

.profile-text h2 { margin: 0; font-size: 18px; }
.profile-text p { margin: 3px 0 0; color: var(--text-secondary); font-size: 13px; }
.badges { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-top: 8px; }
.badge { padding: 4px 10px; border-radius: 999px; background: var(--primary-soft); color: var(--primary); font-size: 11px; font-weight: 700; }
.muted { color: var(--text-muted); font-size: 12px; }

.actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }

.eye {
  display: flex; align-items: center; padding: 0 12px; border: 0; background: transparent; color: var(--text-muted); cursor: pointer;
}

.eye:focus-visible { outline: 2px solid var(--primary); outline-offset: -2px; }

.checks { display: flex; flex-wrap: wrap; gap: 8px 16px; margin: 14px 0 6px; padding: 0; list-style: none; }
.checks li { display: flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 12px; }
.checks li.ok { color: var(--green); }

.info-list { display: grid; gap: 0; margin: 0; padding: 6px 18px 14px; }
.info-list div { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border-soft); font-size: 13px; }
.info-list div:last-child { border-bottom: 0; }
.info-list dt { color: var(--text-secondary); }
.info-list dd { margin: 0; font-weight: 600; text-align: right; }

.empty { margin: 0; padding: 16px 18px; color: var(--text-muted); font-size: 13px; line-height: 1.5; }

.sessions p { margin: 0 0 12px; color: var(--text-secondary); font-size: 13px; }
.sessions strong { color: var(--text-primary); }
</style>