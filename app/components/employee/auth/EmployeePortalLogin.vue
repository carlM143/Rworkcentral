<script setup lang="ts">
import {
  ArrowRight,
  CalendarDays,
  Check,
  Eye,
  EyeOff,
  FileText,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-vue-next'

const router = useRouter()
const { $api } = useNuxtApp()
const auth = useAuth()

interface LoginResponse {
  token?: string
  access_token?: string
  user?: AuthUser
  data?: {
    token?: string
    access_token?: string
    user?: AuthUser
  }
}

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const helpMessage = ref('')

const features = [
  { icon: CalendarDays, title: 'Stay on top of your schedule', text: 'Your attendance and leave credits, together.' },
  { icon: FileText, title: 'Less paperwork. More clarity.', text: 'Track requests and download your payslips.' },
  { icon: UserRound, title: 'Your details, in one place', text: 'Keep your contact information up to date.' },
]

const handleLogin = async () => {
  if (isSubmitting.value) return
  errorMessage.value = ''
  helpMessage.value = ''

  if (!email.value.trim()) {
    errorMessage.value = 'Please enter your email address.'
    return
  }

  if (!password.value) {
    errorMessage.value = 'Please enter your password.'
    return
  }

  isSubmitting.value = true

  try {
    const response = await $api<LoginResponse>(
      '/login',
      {
        method: 'POST',
        body: {
          email: email.value.trim(),
          password: password.value,
          remember: rememberMe.value,
        },
      },
    )

    const token =
      response.token
      ?? response.access_token
      ?? response.data?.token
      ?? response.data?.access_token
    const user = response.user ?? response.data?.user

    if (!token || !user) {
      throw new Error('The login response did not include a user and access token.')
    }

    auth.setSession({
      token,
      user,
      remember: rememberMe.value,
    })

    if (auth.portal.value !== 'employee' || !auth.homePath.value) {
      auth.clearSession()
      errorMessage.value = 'This login is for employees only. Administrators should sign in via /admin.'
      return
    }

    await router.push(auth.homePath.value)
  } catch (error: unknown) {
    const apiError = error as {
      data?: {
        message?: string
        errors?: Record<string, string[]>
      }
    }
    const validationMessage = apiError.data?.errors
      ? Object.values(apiError.data.errors)[0]?.[0]
      : undefined

    errorMessage.value =
      validationMessage
      ?? apiError.data?.message
      ?? 'Unable to sign in. Please check your credentials and try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="employee-login">
    <aside class="login-brand" aria-label="About the employee portal">
      <div class="brand-top">
        <img src="/logo-white.png" alt="RWorkCentral" width="170" height="48">
        <span class="portal-pill"><span aria-hidden="true" />Employee Portal — Employee</span>
      </div>
      <div class="brand-message">
        <p class="eyebrow">YOUR EVERYDAY WORKSPACE</p>
        <h2>Your workday.<br><span>A little simpler.</span></h2>
        <p class="brand-description">A single place for your schedule, requests, and everything that keeps you moving.</p>
        <div class="brand-features">
          <div v-for="feature in features" :key="feature.title" class="brand-feature">
            <span class="feature-icon"><component :is="feature.icon" :size="20" /></span>
            <div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.text }}</p>
            </div>
          </div>
        </div>
      </div>
      <p class="brand-footer">Built around your work, and you.</p>
      <div class="brand-orbit orbit-one" aria-hidden="true" />
      <div class="brand-orbit orbit-two" aria-hidden="true" />
    </aside>

    <main class="login-main">
      <section class="login-card" aria-labelledby="employee-login-title">
        <div class="welcome-icon" aria-hidden="true"><UserRound :size="25" /></div>
        <header>
          <p class="card-eyebrow">GOOD TO SEE YOU</p>
          <h1 id="employee-login-title">Welcome back.</h1>
          <p class="login-description">Sign in to your employee workspace.</p>
        </header>

        <p v-if="errorMessage" class="login-feedback error" role="alert">{{ errorMessage }}</p>

        <form class="login-form" :aria-busy="isSubmitting" @submit.prevent="handleLogin">
          <div class="field-group">
            <label for="employee-login-email">Email address</label>
            <div class="input-wrap">
              <Mail :size="19" class="field-icon" aria-hidden="true" />
              <input
                id="employee-login-email"
                v-model="email"
                type="email"
                autocomplete="username"
                inputmode="email"
                autocapitalize="none"
                spellcheck="false"
                placeholder="employee@rworkcentral.com"
                required
              >
            </div>
          </div>

          <div class="field-group">
            <div class="password-label">
              <label for="employee-login-password">Password</label>
              <button
                type="button"
                class="help-button"
                @click="helpMessage = 'Please contact HR or your system administrator for password assistance.'"
              >
                Need help?
              </button>
            </div>
            <div class="input-wrap">
              <LockKeyhole :size="19" class="field-icon" aria-hidden="true" />
              <input
                id="employee-login-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Enter your password"
                required
              >
              <button
                type="button"
                class="password-eye"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                :aria-pressed="showPassword"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" :size="19" />
                <Eye v-else :size="19" />
              </button>
            </div>
          </div>

          <div class="options-row">
            <label class="remember-label">
              <input v-model="rememberMe" type="checkbox">
              <span>Remember me</span>
            </label>
          </div>

          <p v-if="helpMessage" class="login-feedback" role="status">{{ helpMessage }}</p>

          <button type="submit" class="sign-in-button" :disabled="isSubmitting">
            <span>{{ isSubmitting ? 'Signing in…' : 'Sign In' }}</span>
            <ArrowRight v-if="!isSubmitting" :size="19" aria-hidden="true" />
            <span v-else class="loading-ring" aria-hidden="true" />
          </button>
        </form>

        <div class="login-note">
          <span class="note-icon" aria-hidden="true"><Check :size="15" /></span>
          <p>Your attendance, requests, and payslips.<br>One workspace, just for you.</p>
        </div>
      </section>

      <footer class="login-footer">
        © {{ new Date().getFullYear() }} RWorkCentral Inc.<span>Employee self-service</span>
      </footer>
    </main>
  </div>
</template>

<style scoped>
.employee-login {
  --login-bg: #f3f6fc;
  --login-card: #fff;
  --login-text: #17243b;
  --login-muted: #6b778c;
  --login-border: #e3e9f3;
  --login-input: #f8faff;
  --login-soft: #edf4ff;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  min-height: 100dvh;
  background: var(--login-bg);
  color: var(--login-text);
}
:global(html.dark) .employee-login {
  --login-bg: #0d1421;
  --login-card: #141d2c;
  --login-text: #f1f5f9;
  --login-muted: #acb9cc;
  --login-border: #2b3a50;
  --login-input: #192334;
  --login-soft: #1a2d4c;
}
.login-brand {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 64px;
  padding: clamp(28px, 4.2vw, 68px);
  overflow: hidden;
  color: #fff;
  background: radial-gradient(ellipse at 100% 0%, #2872d469, transparent 60%), linear-gradient(145deg, #073e83, #062a61 55%, #041e48);
}
.brand-top, .brand-message, .brand-footer {
  position: relative;
  z-index: 1;
}
.brand-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}
.brand-top img {
  max-width: 100%;
  object-fit: contain;
  object-position: left;
}
.portal-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 11px;
  border: 1px solid #ffffff24;
  border-radius: 30px;
  font-size: 10px;
  color: #e1edff;
  background: #ffffff0a;
  white-space: nowrap;
}
.portal-pill > span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #88d5b4;
}
.eyebrow, .card-eyebrow {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.8px;
  margin: 0 0 18px;
}
.eyebrow {
  color: #b4cdf0;
}
.brand-message h2 {
  margin: 0;
  font-size: clamp(34px, 3.8vw, 57px);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -1.8px;
}
.brand-message h2 span {
  color: #a9cdfd;
}
.brand-description {
  max-width: 380px;
  font-size: 14px;
  line-height: 1.85;
  color: #bed1eb;
  margin: 22px 0 0;
}
.brand-features {
  display: grid;
  gap: 23px;
  margin-top: 42px;
}
.brand-feature {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 43px;
  height: 43px;
  border: 1px solid #ffffff18;
  border-radius: 12px;
  background: #ffffff0b;
  color: #c1dcff;
}
.brand-feature h3 {
  font-size: 12px;
  font-weight: 500;
  margin: 0 0 5px;
}
.brand-feature p {
  font-size: 11px;
  line-height: 1.7;
  color: #aac1df;
  margin: 0;
}
.brand-footer {
  color: #a7bedc;
  font-size: 11px;
  margin: 0;
}
.brand-orbit {
  position: absolute;
  border: 1px solid #ffffff08;
  border-radius: 50%;
  pointer-events: none;
}
.orbit-one {
  width: 560px;
  height: 560px;
  bottom: -350px;
  right: -260px;
}
.orbit-two {
  width: 730px;
  height: 730px;
  bottom: -435px;
  right: -345px;
}
.login-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 48px 28px;
  min-width: 0;
}
.login-card {
  width: 100%;
  max-width: 430px;
  padding: 36px;
  border: 1px solid var(--login-border);
  border-radius: 22px;
  background: var(--login-card);
  box-shadow: 0 12px 48px #15315b06;
}
.welcome-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  margin-bottom: 25px;
  border-radius: 15px;
  color: #246bfd;
  background: var(--login-soft);
}
.card-eyebrow {
  margin-bottom: 9px;
  color: #3973cc;
  font-size: 9px;
  letter-spacing: 1.5px;
}
h1 {
  font-size: 30px;
  line-height: 1.25;
  letter-spacing: -1px;
  margin: 0;
  font-weight: 600;
}
.login-description {
  color: var(--login-muted);
  font-size: 13px;
  line-height: 1.7;
  margin: 10px 0 0;
}
.login-form {
  display: grid;
  gap: 20px;
  margin-top: 30px;
}
.field-group {
  min-width: 0;
}
label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 9px;
}
.input-wrap {
  display: flex;
  align-items: center;
  min-width: 0;
  min-height: 52px;
  border: 1px solid var(--login-border);
  border-radius: 11px;
  background: var(--login-input);
  transition: border-color .15s, box-shadow .15s;
}
.input-wrap:focus-within {
  border-color: #6d9df6;
  box-shadow: 0 0 0 3px #246bfd12;
}
.field-icon {
  flex-shrink: 0;
  margin-left: 15px;
  color: #8b9bb1;
}
.input-wrap input {
  min-width: 0;
  width: 100%;
  height: 50px;
  padding: 12px;
  border: 0;
  border-radius: inherit;
  outline: 0;
  background: transparent;
  color: var(--login-text);
  font: inherit;
  font-size: 15px;
  box-shadow: none;
}
.input-wrap input::placeholder {
  color: #8a98ad;
  font-size: 14px;
}
.password-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 9px;
}
.password-label label {
  margin-bottom: 0;
}
.help-button {
  min-height: 32px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #3973cc;
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}
.password-eye {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 44px;
  height: 48px;
  margin-right: 3px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--login-muted);
  cursor: pointer;
}
.password-eye:hover {
  color: #246bfd;
  background: var(--login-soft);
}
.options-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: -4px;
}
.remember-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0;
  font-size: 12px;
  color: var(--login-muted);
  cursor: pointer;
  user-select: none;
}
.remember-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  cursor: pointer;
}
.sign-in-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 11px;
  min-height: 52px;
  margin-top: 4px;
  padding: 14px 16px;
  border: 0;
  border-radius: 11px;
  background: linear-gradient(105deg, #246bfd, #1b5be1);
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 6px 15px #246bfd24;
  cursor: pointer;
}
.sign-in-button:hover {
  filter: brightness(1.06);
}
.sign-in-button:disabled {
  opacity: .7;
  cursor: wait;
}
.employee-login button:focus-visible {
  outline: 2px solid #4e8fff;
  outline-offset: 3px;
}
.loading-ring {
  width: 17px;
  height: 17px;
  border: 2px solid #ffffff66;
  border-top-color: #fff;
  border-radius: 50%;
  animation: login-spin .7s linear infinite;
}
@keyframes login-spin {
  to { transform: rotate(360deg); }
}
.login-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 26px;
  padding-top: 22px;
  border-top: 1px solid var(--login-border);
}
.note-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: var(--login-soft);
  color: #3973cc;
}
.login-note p {
  margin: 0;
  color: var(--login-muted);
  font-size: 11px;
  line-height: 1.8;
}
.login-feedback {
  padding: 12px;
  margin: 16px 0 0;
  border-radius: 9px;
  background: var(--login-soft);
  color: var(--login-text);
  font-size: 12px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}
.login-form .login-feedback {
  margin: 0;
}
.login-feedback.error {
  background: #fff0f0;
  color: #b42318;
}
.login-footer {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 7px 14px;
  color: var(--login-muted);
  font-size: 10px;
  text-align: center;
}
.login-footer span {
  padding-left: 14px;
  border-left: 1px solid var(--login-border);
}
@media(max-width: 1000px) {
  .employee-login {
    display: flex;
    flex-direction: column;
  }
  .login-brand {
    gap: 22px;
    min-height: 185px;
    padding: calc(22px + env(safe-area-inset-top, 0px)) max(24px, env(safe-area-inset-right, 0px)) 48px max(24px, env(safe-area-inset-left, 0px));
    border-radius: 0 0 26px 26px;
  }
  .brand-top {
    gap: 14px;
  }
  .brand-top img {
    width: 145px;
    height: 40px;
  }
  .portal-pill {
    font-size: 10px;
    padding: 7px 10px;
  }
  .brand-message .eyebrow, .brand-description, .brand-features, .brand-footer {
    display: none;
  }
  .brand-message h2 {
    font-size: 25px;
    line-height: 1.2;
    letter-spacing: -.6px;
  }
  .brand-message h2 br {
    display: none;
  }
  .brand-message h2 span {
    margin-left: 5px;
  }
  .login-main {
    position: relative;
    z-index: 1;
    justify-content: flex-start;
    flex: 1;
    gap: 22px;
    margin-top: -24px;
    padding: 0 max(16px, env(safe-area-inset-right, 0px)) calc(24px + env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px));
  }
  .login-card {
    max-width: 470px;
    padding: 26px;
    box-shadow: 0 10px 35px #15315b08;
  }
  .welcome-icon {
    width: 46px;
    height: 46px;
    margin-bottom: 18px;
  }
  .login-form {
    margin-top: 24px;
    gap: 18px;
  }
  h1 {
    font-size: 28px;
  }
  .login-description, label {
    font-size: 13px;
  }
  .help-button {
    min-height: 44px;
    font-size: 12px;
  }
  .password-label {
    margin-top: -9px;
    margin-bottom: 0;
  }
  .login-footer {
    font-size: 11px;
  }
}
@media(max-width: 380px) {
  .login-brand {
    padding-left: 20px;
    padding-right: 20px;
  }
  .brand-top img {
    width: 125px;
  }
  .portal-pill {
    padding: 7px 8px;
    font-size: 9px;
  }
  .brand-message h2 {
    font-size: 21px;
  }
  .login-main {
    padding-left: 12px;
    padding-right: 12px;
  }
  .login-card {
    padding: 22px 19px;
    border-radius: 18px;
  }
  h1 {
    font-size: 26px;
  }
  .login-footer span {
    border-left: 0;
    padding-left: 0;
  }
}
@media(prefers-reduced-motion: reduce) {
  .input-wrap { transition: none; }
  .loading-ring { animation: none; }
}
.portal-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 14px;
  font-size: 13px;
  color: var(--login-muted);
}
.portal-link {
  color: #007bff;
  font-weight: 600;
  text-decoration: none;
}
.portal-link:hover {
  text-decoration: underline;
}
</style>
