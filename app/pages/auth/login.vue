<script setup lang="ts">
import {
  Building2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
 ShieldCheck,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'auth',
})

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

const handleLogin = async () => {
  errorMessage.value = ''

  if (!email.value.trim()) {
    errorMessage.value =
      'Please enter your email address.'
    return
  }

  if (!password.value) {
    errorMessage.value =
      'Please enter your password.'
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

    if (auth.portal.value !== 'admin' || !auth.homePath.value) {
      auth.clearSession()
      errorMessage.value = 'This portal is for authorized administrators only.'
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
  <div class="login-page">


    <section class="brand-panel">

      <div class="brand-overlay" />

      <div class="brand-content">

        <!-- LOGO -->

        <div class="brand">

          <img
              src="/logo-white.png"
              alt="RWorkCentral"
              class="login-brand-image"
            >
        </div>

        <!-- CONTENT -->

        <div class="brand-message">

          <span class="eyebrow">
            Human Resource Information System
          </span>

          <h2>
            Manage your workforce
            <br>
            from one central place.
          </h2>

          <p>
            Access employee information,
            timekeeping, payroll, client
            assignments, billing and workforce
            operations securely.
          </p>

        </div>

        <!-- FEATURES -->

        <div class="feature-list">

          <div class="feature-item">

            <div class="feature-icon">

              <ShieldCheck
                :size="18"
              />

            </div>

            <div>

              <strong>
                Secure Administration
              </strong>

              <span>
                Centralized access for authorized HR administrators.
              </span>

            </div>

          </div>

          <div class="feature-item">

            <div class="feature-icon">

              <Building2
                :size="18"
              />

            </div>

            <div>

              <strong>
                Workforce Management
              </strong>

              <span>
                Manage employees, clients and company operations.
              </span>

            </div>

          </div>

        </div>

      </div>

      <div class="brand-footer">
        © 2026 RWorkCentral Inc.
      </div>

    </section>

    <!-- =====================================================
         LOGIN PANEL
    ====================================================== -->

    <section class="login-panel">

      <div class="login-wrapper">

        <!-- MOBILE BRAND -->

        <div class="mobile-brand">

  <img src="/logo-white.png" alt="RWorkCentral" class="mobile-brand-image">
  </div>

        <!-- HEADER -->

        <div class="login-header">

          <span class="admin-label">
            ADMINISTRATOR PORTAL — ADMIN
          </span>

          <h2>
            Welcome back
          </h2>

          <p>
            Sign in to continue to your
            RWorkCentral account.
          </p>

        </div>

        <!-- ERROR -->

        <div
          v-if="errorMessage"
          class="error-message"
        >
          {{ errorMessage }}
        </div>

        <!-- FORM -->

        <form
          class="login-form"
          @submit.prevent="handleLogin"
        >

          <!-- EMAIL -->

          <div class="field-group">

            <label>
              Email Address
            </label>

            <div class="input-control">

              <Mail
                :size="17"
                class="field-icon"
              />

              <input
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="admin@rworkcentral.com"
              >

            </div>

          </div>

          <!-- PASSWORD -->

          <div class="field-group">

            <div class="label-row">

              <label>
                Password
              </label>

              <button
                type="button"
                class="forgot-button"
              >
                Forgot password?
              </button>

            </div>

            <div class="input-control">

              <LockKeyhole
                :size="17"
                class="field-icon"
              />

              <input
                v-model="password"
                :type="
                  showPassword
                    ? 'text'
                    : 'password'
                "
                autocomplete="current-password"
                placeholder="Enter your password"
              >

              <button
                type="button"
                class="password-toggle"
                @click="
                  showPassword =
                    !showPassword
                "
              >

                <EyeOff
                  v-if="showPassword"
                  :size="17"
                />

                <Eye
                  v-else
                  :size="17"
                />

              </button>

            </div>

          </div>

          <!-- REMEMBER -->

          <label class="remember-row">

            <input
              v-model="rememberMe"
              type="checkbox"
            >

            <span>
              Remember me on this device
            </span>

          </label>

          <!-- BUTTON -->

          <button
            type="submit"
            class="login-button"
            :disabled="isSubmitting"
          >

            <span
              v-if="isSubmitting"
              class="spinner"
            />

            {{
              isSubmitting
                ? 'Signing in...'
                : 'Sign In'
            }}

          </button>

        </form>

        <!-- SECURITY -->

        <div class="security-note">

          <ShieldCheck
            :size="15"
          />

          <span>
            This portal is intended for authorized
            RWorkCentral users only.
          </span>

        </div>

      </div>

    </section>

  </div>
</template>

<style scoped>
.login-page {
  display: grid;

  min-height: 100vh;

  grid-template-columns:
    minmax(0, 1.05fr)
    minmax(0, 0.95fr);

  background: #f7f9fc;
}

/* =========================
   BRAND SIDE
========================= */

.brand-panel {
  position: relative;

  display: flex;

  min-height: 100vh;

  overflow: hidden;

  flex-direction: column;

  padding:
    44px 56px 32px;

  background:
    radial-gradient(
      circle at 80% 20%,
      rgba(48, 125, 255, 0.32),
      transparent 30%
    ),
    radial-gradient(
      circle at 20% 80%,
      rgba(38, 102, 246, 0.22),
      transparent 32%
    ),
    linear-gradient(
      145deg,
      #073c82 0%,
      #062b65 45%,
      #041d46 100%
    );

  color: white;
}

.brand-overlay {
  position: absolute;
  inset: 0;

  pointer-events: none;

  background:
    linear-gradient(
      120deg,
      rgba(255, 255, 255, 0.04),
      transparent 50%
    );
}

.brand-content,
.brand-footer {
  position: relative;
  z-index: 2;
}

.brand-content {
  display: flex;

  flex: 1;

  flex-direction: column;
}

.brand {
  display: flex;

  align-items: center;

  gap: 13px;
}

.brand-logo {
  display: flex;

  width: 46px;
  height: 46px;

  align-items: center;
  justify-content: center;

  border-radius: 13px;

  background:
    linear-gradient(
      135deg,
      #4e92ff,
      #1d6df7
    );

  box-shadow:
    0 12px 30px
    rgba(0, 0, 0, 0.18);
}

.brand h1 {
  margin: 0;

  font-size: 19px;
}

.brand span {
  display: block;

  margin-top: 2px;

  color: #bdd4f1;

  font-size: 11px;
  font-weight: 600;

  letter-spacing: 0.8px;
}

.brand-message {
  margin-top: 85px;
  margin-bottom: auto;

  max-width: 570px;
}

.eyebrow {
  display: inline-flex;

  padding:
    6px 9px;

  border:
    1px solid
    rgba(255, 255, 255, 0.12);

  border-radius: 6px;

  background:
    rgba(255, 255, 255, 0.06);

  color: #acd0ff;

  font-size: 9px;
  font-weight: 700;

  letter-spacing: 1px;
}

.brand-message h2 {
  margin:
    20px 0 16px;

  font-size:
    clamp(
      32px,
      3.2vw,
      48px
    );

  line-height: 1.14;

  letter-spacing: -1.5px;
}

.brand-message p {
  max-width: 500px;

  margin: 0;

  color: #b8cce6;

  font-size: 13px;

  line-height: 1.8;
}

.feature-list {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 12px;

  margin-top: 38px;
}

.feature-item {
  display: flex;

  align-items: flex-start;

  gap: 10px;

  padding: 14px;

  border:
    1px solid
    rgba(255, 255, 255, 0.1);

  border-radius: 10px;

  background:
    rgba(255, 255, 255, 0.05);
}

.feature-icon {
  display: flex;

  width: 32px;
  height: 32px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    rgba(62, 137, 255, 0.16);

  color: #77afff;
}

.feature-item strong,
.feature-item span {
  display: block;
}

.feature-item strong {
  font-size: 10px;
}

.feature-item span {
  margin-top: 4px;

  color: #9cb8d8;

  font-size: 8px;

  line-height: 1.5;
}

.brand-footer {
  color: #7396be;

  font-size: 9px;
}

/* =========================
   LOGIN SIDE
========================= */

.login-panel {
  display: flex;

  min-height: 100vh;

  align-items: center;
  justify-content: center;

  padding: 45px;

  background:
    #f7f9fc;
}

.login-wrapper {
  width: 100%;

  max-width: 410px;
}

.mobile-brand {
  display: none;
}

.admin-label {
  color: #246bfd;

  font-size: 9px;
  font-weight: 700;

  letter-spacing: 1.3px;
}

.login-header h2 {
  margin:
    9px 0 5px;

  color: #172033;

  font-size: 28px;

  letter-spacing: -0.6px;
}

.login-header p {
  margin: 0;

  color: #7d8899;

  font-size: 11px;

  line-height: 1.65;
}

.error-message {
  margin-top: 18px;

  padding:
    10px 12px;

  border:
    1px solid #ffd4d4;

  border-radius: 8px;

  background: #fff1f1;

  color: #dc2626;

  font-size: 10px;
}

.login-form {
  margin-top: 27px;
}

.field-group {
  margin-bottom: 17px;
}

.field-group label {
  display: block;

  margin-bottom: 7px;

  color: #344054;

  font-size: 10px;
  font-weight: 600;
}

.label-row {
  display: flex;

  align-items: center;
  justify-content: space-between;
}

.forgot-button {
  padding: 0;

  border: 0;

  background: transparent;

  color: #246bfd;

  font-size: 9px;
  font-weight: 600;
}

.input-control {
  position: relative;

  display: flex;

  height: 47px;

  align-items: center;

  border:
    1px solid #dfe5ee;

  border-radius: 9px;

  background: white;

  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.input-control:focus-within {
  border-color: #75a2ff;

  box-shadow:
    0 0 0 3px
    rgba(36, 107, 253, 0.08);
}

.field-icon {
  margin-left: 13px;

  flex-shrink: 0;

  color: #98a2b3;
}

.input-control input {
  width: 100%;
  height: 100%;

  padding:
    0 12px;

  border: 0;
  outline: 0;

  background: transparent;

  color: #172033;

  font-size: 11px;
}

.input-control input::placeholder {
  color: #aab3c1;
}

.password-toggle {
  display: flex;

  width: 43px;
  height: 100%;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border: 0;

  background: transparent;

  color: #98a2b3;
}

.remember-row {
  display: inline-flex;

  align-items: center;

  gap: 7px;

  color: #667085;

  font-size: 9px;

  cursor: pointer;
}

.remember-row input {
  width: 14px;
  height: 14px;

  accent-color: #246bfd;
}

.login-button {
  display: flex;

  width: 100%;
  height: 47px;

  align-items: center;
  justify-content: center;

  gap: 8px;

  margin-top: 20px;

  border: 0;

  border-radius: 9px;

  background:
    linear-gradient(
      90deg,
      #246bfd,
      #317bff
    );

  color: white;

  font-size: 11px;
  font-weight: 650;

  box-shadow:
    0 8px 18px
    rgba(36, 107, 253, 0.22);

  cursor: pointer;
}

.login-button:disabled {
  opacity: 0.7;

  cursor: wait;
}

.spinner {
  width: 14px;
  height: 14px;

  border:
    2px solid
    rgba(255, 255, 255, 0.35);

  border-top-color: white;

  border-radius: 50%;

  animation:
    spin 0.7s linear infinite;
}

.security-note {
  display: flex;

  align-items: flex-start;

  gap: 7px;

  margin-top: 22px;

  padding-top: 18px;

  border-top:
    1px solid #e9edf3;

  color: #98a2b3;

  font-size: 8px;

  line-height: 1.6;
}

.security-note svg {
  flex-shrink: 0;

  color: #667085;
}

@keyframes spin {
  to {
    transform:
      rotate(360deg);
  }
}

/* =========================
   RESPONSIVE (MATCHING EMPLOYEE LOGIN)
========================= */

@media (max-width: 1000px) {
  .login-page {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    background: #f3f6fc;
  }

  .brand-panel {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 16px;
    min-height: 185px;
    padding: calc(22px + env(safe-area-inset-top, 0px)) max(24px, env(safe-area-inset-right, 0px)) 52px max(24px, env(safe-area-inset-left, 0px));
    border-radius: 0 0 28px 28px;
    box-shadow: 0 12px 32px rgba(6, 43, 101, 0.22);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .login-brand-image {
    width: 145px;
    height: 40px;
    max-width: 100%;
    object-fit: contain;
    object-position: left center;
  }

  .brand-message {
    margin-top: 10px;
    margin-bottom: 0;
    max-width: 100%;
  }

  .brand-message .eyebrow,
  .brand-message p,
  .feature-list,
  .brand-footer {
    display: none;
  }

  .brand-message h2 {
    margin: 4px 0 0;
    font-size: clamp(22px, 4.8vw, 26px);
    line-height: 1.22;
    letter-spacing: -0.6px;
  }

  .brand-message h2 br {
    display: none;
  }

  .login-panel {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    flex: 1;
    margin-top: -26px;
    padding: 0 max(16px, env(safe-area-inset-right, 0px)) calc(28px + env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px));
    background: transparent;
    min-height: auto;
  }

  .login-wrapper {
    width: 100%;
    max-width: 460px;
    padding: 30px 24px;
    border: 1px solid #e3e9f3;
    border-radius: 22px;
    background: #ffffff;
    box-shadow: 0 12px 40px rgba(15, 33, 64, 0.08);
  }

  .mobile-brand {
    display: none;
  }

  .login-header h2 {
    font-size: 25px;
    margin: 6px 0 4px;
  }

  .login-header p {
    font-size: 13px;
  }

  .input-control {
    height: 50px;
    border-radius: 11px;
  }

  .input-control input {
    font-size: 15px;
  }

  .login-button {
    height: 50px;
    font-size: 13.5px;
    border-radius: 11px;
  }

  .forgot-button {
    font-size: 11.5px;
    min-height: 36px;
  }

  .remember-row {
    font-size: 11.5px;
  }
}

@media (max-width: 380px) {
  .brand-panel {
    padding-left: 18px;
    padding-right: 18px;
    border-radius: 0 0 22px 22px;
  }

  .login-brand-image {
    width: 125px;
  }

  .brand-message h2 {
    font-size: 20px;
  }

  .login-panel {
    padding-left: 12px;
    padding-right: 12px;
    margin-top: -22px;
  }

  .login-wrapper {
    padding: 22px 18px;
    border-radius: 18px;
  }

  .login-header h2 {
    font-size: 22px;
  }
}
</style>
