
<script setup lang="ts">
import {
  UserRound, Mail, Phone, ShieldCheck, LockKeyhole,
  Eye, EyeOff, Pencil, Save, X, Camera, CheckCircle2,
  Info, KeyRound,
} from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

const editing = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const showPasswordForm = ref(false)
const avatarPreview = ref<string | null>(null)

type Profile = {
  name: string
  username: string
  email: string
  phone: string
}

const profile = ref<Profile>({
  name: 'Maria Santos',
  username: 'maria.santos',
  email: 'maria@rworkcentral.com',
  phone: '',
})

const form = reactive<Profile>({ ...profile.value })

const password = reactive({
  current: '',
  next: '',
  confirm: '',
})

const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const initials = computed(() =>
  profile.value.name.split(' ')
    .map(item => item.charAt(0))
    .slice(0, 2).join('').toUpperCase()
)

const startEdit = () => {
  Object.assign(form, profile.value)
  editing.value = true
  message.value = ''
}

const cancelEdit = () => {
  Object.assign(form, profile.value)
  editing.value = false
}

const saveProfile = () => {
  if (!form.name.trim() || !form.username.trim() || !form.email.trim()) {
    message.value = 'Name, username and email are required.'
    messageType.value = 'error'
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    message.value = 'Please enter a valid email address.'
    messageType.value = 'error'
    return
  }

  profile.value = { ...form }
  editing.value = false
  messageType.value = 'success'
  message.value = 'Profile updated in this preview only. Backend saving is not connected.'
}

const chooseAvatar = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
    messageType.value = 'error'
    message.value = 'Select an image smaller than 2 MB.'
    input.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    avatarPreview.value = String(reader.result)
  }
  reader.readAsDataURL(file)
}

const changePassword = () => {
  if (!password.current || !password.next || !password.confirm) {
    messageType.value = 'error'
    message.value = 'Please complete all password fields.'
    return
  }

  if (password.next.length < 8) {
    messageType.value = 'error'
    message.value = 'New password must contain at least 8 characters.'
    return
  }

  if (password.next !== password.confirm) {
    messageType.value = 'error'
    message.value = 'New password and confirmation do not match.'
    return
  }

  messageType.value = 'success'
  message.value = 'Password form validated. Actual password changes require backend integration.'

  password.current = ''
  password.next = ''
  password.confirm = ''
  showPasswordForm.value = false
}
</script>

<template>
  <section class="account-page">
    <PageHeader
      title="My Account"
      description="Manage your personal information, account details and security preferences."
    />

    <div
      v-if="message"
      class="notice"
      :class="messageType"
    >
      <CheckCircle2 v-if="messageType === 'success'" :size="17" />
      <Info v-else :size="17" />
      <span>{{ message }}</span>
      <button type="button" @click="message = ''">
        <X :size="16" />
      </button>
    </div>

    <div class="account-grid">
      <div class="main-column">

        <article class="panel">
          <div class="profile-banner"></div>

          <div class="profile-heading">
            <div class="avatar-wrap">
              <img
                v-if="avatarPreview"
                :src="avatarPreview"
                alt="Profile preview"
                class="avatar"
              />
              <div v-else class="avatar initials">{{ initials }}</div>

              <label class="avatar-edit" title="Change profile photo">
                <Camera :size="14" />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  @change="chooseAvatar"
                />
              </label>
            </div>

            <div class="profile-name">
              <h2>{{ profile.name }}</h2>
              <p>{{ profile.email }}</p>
              <span class="role-pill">
                <ShieldCheck :size="13" />
                HR Administrator
              </span>
            </div>
          </div>

          <div class="panel-heading">
            <div>
              <h3>Personal Information</h3>
              <p>Manage your administrator profile details.</p>
            </div>

            <button
              v-if="!editing"
              type="button"
              class="btn secondary"
              @click="startEdit"
            >
              <Pencil :size="15" />
              Edit Profile
            </button>
          </div>

          <form class="profile-form" @submit.prevent="saveProfile">
            <div class="form-grid">
              <label class="field">
                <span>Full Name <b>*</b></span>
                <div class="input-wrap">
                  <UserRound :size="16" />
                  <input
                    v-model="form.name"
                    :disabled="!editing"
                    required
                    placeholder="Full name"
                  />
                </div>
              </label>

              <label class="field">
                <span>Username <b>*</b></span>
                <div class="input-wrap">
                  <UserRound :size="16" />
                  <input
                    v-model="form.username"
                    :disabled="!editing"
                    required
                    placeholder="Username"
                  />
                </div>
              </label>

              <label class="field">
                <span>Email Address <b>*</b></span>
                <div class="input-wrap">
                  <Mail :size="16" />
                  <input
                    v-model="form.email"
                    type="email"
                    :disabled="!editing"
                    required
                    placeholder="Email address"
                  />
                </div>
              </label>

              <label class="field">
                <span>Contact Number</span>
                <div class="input-wrap">
                  <Phone :size="16" />
                  <input
                    v-model="form.phone"
                    type="tel"
                    :disabled="!editing"
                    placeholder="09XXXXXXXXX"
                  />
                </div>
              </label>
            </div>

            <div v-if="editing" class="form-actions">
              <button
                type="button"
                class="btn secondary"
                @click="cancelEdit"
              >
                <X :size="15" />
                Cancel
              </button>

              <button type="submit" class="btn primary">
                <Save :size="15" />
                Save Changes
              </button>
            </div>
          </form>
        </article>

        <article class="panel">
          <div class="panel-heading">
            <div>
              <h3>Account Security</h3>
              <p>Manage your password and account protection.</p>
            </div>
            <div class="heading-icon">
              <LockKeyhole :size="18" />
            </div>
          </div>

          <div class="security-content">
            <div class="security-intro">
              <div class="security-icon">
                <KeyRound :size="19" />
              </div>

              <div>
                <h4>Account Password</h4>
                <p>Use a strong password to protect your HRIS account.</p>
              </div>

              <button
                v-if="!showPasswordForm"
                type="button"
                class="btn secondary"
                @click="showPasswordForm = true"
              >
                Change Password
              </button>
            </div>

            <form
              v-if="showPasswordForm"
              class="password-form"
              @submit.prevent="changePassword"
            >
              <label class="field">
                <span>Current Password</span>
                <div class="input-wrap">
                  <LockKeyhole :size="16" />
                  <input
                    v-model="password.current"
                    :type="showCurrentPassword ? 'text' : 'password'"
                    autocomplete="current-password"
                    required
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    class="eye-button"
                    @click="showCurrentPassword = !showCurrentPassword"
                  >
                    <EyeOff v-if="showCurrentPassword" :size="16" />
                    <Eye v-else :size="16" />
                  </button>
                </div>
              </label>

              <div class="form-grid">
                <label class="field">
                  <span>New Password</span>
                  <div class="input-wrap">
                    <LockKeyhole :size="16" />
                    <input
                      v-model="password.next"
                      :type="showNewPassword ? 'text' : 'password'"
                      autocomplete="new-password"
                      required
                      minlength="8"
                      placeholder="New password"
                    />
                    <button
                      type="button"
                      class="eye-button"
                      @click="showNewPassword = !showNewPassword"
                    >
                      <EyeOff v-if="showNewPassword" :size="16" />
                      <Eye v-else :size="16" />
                    </button>
                  </div>
                </label>

                <label class="field">
                  <span>Confirm New Password</span>
                  <div class="input-wrap">
                    <LockKeyhole :size="16" />
                    <input
                      v-model="password.confirm"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      autocomplete="new-password"
                      required
                      minlength="8"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      class="eye-button"
                      @click="showConfirmPassword = !showConfirmPassword"
                    >
                      <EyeOff v-if="showConfirmPassword" :size="16" />
                      <Eye v-else :size="16" />
                    </button>
                  </div>
                </label>
              </div>

              <div class="form-actions">
                <button
                  type="button"
                  class="btn secondary"
                  @click="showPasswordForm = false; password.current = ''; password.next = ''; password.confirm = ''"
                >
                  Cancel
                </button>
                <button type="submit" class="btn primary">
                  <LockKeyhole :size="15" />
                  Update Password
                </button>
              </div>
            </form>

            <p class="helper">
              Password changes require Laravel API integration.
            </p>
          </div>
        </article>
      </div>

      <aside class="side-column">
        <article class="panel">
          <div class="panel-heading">
            <div>
              <h3>Account Overview</h3>
              <p>Your system access details.</p>
            </div>
          </div>

          <div class="detail-list">
            <div class="detail-row">
              <span>Account Name</span>
              <strong>{{ profile.name }}</strong>
            </div>
            <div class="detail-row">
              <span>User Role</span>
              <strong>HR Administrator</strong>
            </div>
            <div class="detail-row">
              <span>Company</span>
              <strong>RWorkCentral Inc.</strong>
            </div>
            <div class="detail-row">
              <span>Account Status</span>
              <span class="active-pill">
                <span class="status-dot"></span>
                Active
              </span>
            </div>
          </div>
        </article>

        <article class="panel access-panel">
          <div class="panel-heading">
            <div>
              <h3>Access & Permissions</h3>
              <p>Your administrative access.</p>
            </div>
            <ShieldCheck :size="18" class="blue-text" />
          </div>

          <div class="access-body">
            <div class="access-icon">
              <ShieldCheck :size="22" />
            </div>
            <h4>HR Administrator</h4>
            <p>
              Your permissions control which HRIS modules
              and actions are available to your account.
            </p>

            <div class="access-note">
              <Info :size="15" />
              Actual permissions will be loaded from your assigned role.
            </div>
          </div>
        </article>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.account-page {
  width: 100%;
  max-width: 1560px;
  margin: 0 auto;
}
.account-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 14px;
}
.main-column, .side-column {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}
.panel {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}
.profile-banner {
  height: 105px;
  background: linear-gradient(110deg, #0b3674, #2563eb 65%, #588cf8);
}
.profile-heading {
  display: flex;
  align-items: center;
  gap: 17px;
  padding: 0 22px 22px;
}
.avatar-wrap {
  position: relative;
  flex-shrink: 0;
  margin-top: -35px;
}
.avatar {
  display: flex;
  width: 88px;
  height: 88px;
  align-items: center;
  justify-content: center;
  border: 4px solid var(--bg-card);
  border-radius: 20px;
  background: #1d4ed8;
  object-fit: cover;
}
.initials {
  color: white;
  font-size: 25px;
  font-weight: 750;
}
.avatar-edit {
  position: absolute;
  right: -5px;
  bottom: -4px;
  display: flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--bg-card);
  border-radius: 50%;
  background: var(--primary);
  color: white;
  cursor: pointer;
}
.profile-name {
  padding-top: 15px;
}
.profile-name h2 {
  margin: 0 0 5px;
  color: var(--text-primary);
  font-size: 20px;
}
.profile-name p {
  margin: 0 0 9px;
  color: var(--text-muted);
  font-size: 11px;
}
.role-pill, .active-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  border-radius: 20px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 10px;
  font-weight: 650;
}
.active-pill {
  background: var(--green-soft);
  color: var(--green);
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 17px 20px;
  border-bottom: 1px solid var(--border-soft);
}
.panel-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
}
.panel-heading p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}
.profile-form, .security-content {
  padding: 20px;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.field > span {
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
}
.field b {
  color: var(--red);
}
.input-wrap {
  display: flex;
  height: 42px;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-muted);
}
.input-wrap:focus-within {
  border-color: var(--primary);
}
.input-wrap input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 11px;
}
.input-wrap input:disabled {
  cursor: default;
  opacity: .75;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 20px;
  padding-top: 17px;
  border-top: 1px solid var(--border-soft);
}
.btn {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: 7px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 650;
  cursor: pointer;
}
.btn.primary {
  background: var(--primary);
  color: white;
}
.btn.secondary {
  border-color: var(--border);
  background: var(--bg-card-soft);
  color: var(--text-primary);
}
.btn:hover {
  filter: brightness(1.12);
}
.security-intro {
  display: flex;
  align-items: center;
  gap: 12px;
}
.security-icon, .heading-icon, .access-icon {
  display: flex;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--primary);
}
.security-intro > div:nth-child(2) {
  flex: 1;
}
.security-intro h4, .access-body h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: 12px;
}
.security-intro p, .helper {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.6;
}
.password-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 22px;
  padding-top: 20px;
  border-top: 1px solid var(--border-soft);
}
.eye-button {
  display: flex;
  border: 0;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}
.helper {
  margin-top: 18px;
}
.detail-list {
  padding: 6px 17px;
}
.detail-row {
  display: flex;
  min-height: 52px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--border-soft);
}
.detail-row:last-child {
  border: 0;
}
.detail-row > span:first-child {
  color: var(--text-muted);
  font-size: 10px;
}
.detail-row strong {
  color: var(--text-primary);
  font-size: 10px;
  font-weight: 650;
  text-align: right;
}
.access-body {
  padding: 20px;
}
.access-body h4 {
  margin-top: 15px;
}
.access-body > p {
  color: var(--text-secondary);
  font-size: 11px;
  line-height: 1.7;
}
.access-note {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 17px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-muted);
  font-size: 10px;
  line-height: 1.6;
}
.blue-text {
  color: var(--primary);
}
.notice {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  padding: 13px 15px;
  border-radius: 9px;
  font-size: 11px;
}
.notice.success {
  background: var(--green-soft);
  color: var(--green);
}
.notice.error {
  background: var(--red-soft);
  color: var(--red);
}
.notice span {
  flex: 1;
}
.notice button {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
@media (max-width: 1050px) {
  .account-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 650px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .profile-heading {
    padding: 0 14px 18px;
  }
  .panel-heading, .profile-form, .security-content {
    padding: 15px;
  }
  .security-intro {
    flex-wrap: wrap;
  }
  .security-intro > .btn {
    width: 100%;
  }
}
</style>
