
<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  X,
  UserPlus,
  UserRound,
  Mail,
  ShieldCheck,
  LockKeyhole,
  Save,
  Eye,
  EyeOff,
} from 'lucide-vue-next'

import type { SystemUser } from '~/types/userAccess'
import type { SystemUserRoleOption } from '~/composables/admin/useUsersAccess'

type UserMode = 'add' | 'edit' | 'setup'

type UserPayload = {
  name: string
  email: string
  role: string
  roleId?: number
  status: string
  password?: string
  passwordConfirmation?: string
}

const props = defineProps<{
  open: boolean
  mode: UserMode
  user: SystemUser | null
  availableRoles?: SystemUserRoleOption[]
  loading?: boolean
  saving?: boolean
  apiError?: string
}>()

const emit = defineEmits<{
  close: []
  save: [payload: UserPayload]
}>()

const form = reactive({
  name: '',
  email: '',
  role: '',
  roleId: 0,
  status: 'Active',
  password: '',
  confirmPassword: '',
})

const errors = reactive<Record<string, string>>({})
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const isEdit = computed(() => props.mode === 'edit')
const isSetup = computed(() => props.mode === 'setup')
const isManagedAccount = computed(() => isEdit.value || isSetup.value)

const modalTitle = computed(() =>
  isSetup.value
    ? 'Set Up Employee Account'
    : isEdit.value
      ? 'Edit System User'
      : 'Add System User'
)

const modalDescription = computed(() =>
  isSetup.value
    ? 'Create login access and assign a role to this employee.'
    : isEdit.value
      ? 'Update the account email, role, or password.'
      : 'Create a new system user and assign account access.'
)

const addRoleOptions = [
  { label: 'Administrator', value: 'Administrator' },
  { label: 'Human Resources', value: 'Human Resources' },
  { label: 'Employee', value: 'Employee' },
]

const roleOptions = computed(() => (
  isManagedAccount.value
    ? (props.availableRoles ?? []).map(role => ({
        label: role.name,
        value: role.id,
      }))
    : addRoleOptions
))

const statusOptions = [
  { label: 'Active', value: 'Active' },
  { label: 'Invited', value: 'Invited' },
  { label: 'Disabled', value: 'Disabled' },
]

const resetErrors = () => {
  Object.keys(errors).forEach(key => delete errors[key])
}

const resetForm = () => {
  resetErrors()

  form.name = isManagedAccount.value ? props.user?.name ?? '' : ''
  form.email = isManagedAccount.value ? props.user?.email ?? '' : ''
  form.role = isManagedAccount.value ? props.user?.role ?? '' : ''
  form.roleId = isManagedAccount.value
    ? props.availableRoles?.find(role => role.name === props.user?.role)?.id ?? 0
    : 0
  form.status = isManagedAccount.value
    ? String((props.user as unknown as Record<string, unknown> | null)?.status ?? 'Active')
    : 'Active'

  form.password = ''
  form.confirmPassword = ''

  showPassword.value = false
  showConfirmPassword.value = false
}

watch(
  () => [props.open, props.mode, props.user, props.availableRoles],
  () => {
    if (props.open) resetForm()
  },
  { immediate: true }
)

const validateForm = () => {
  resetErrors()

  if (!form.name.trim()) {
    errors.name = 'Full name is required.'
  }

  if (!form.email.trim()) {
    errors.email = 'Email address is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (isManagedAccount.value && !form.roleId) {
    errors.role = 'Please select a system role.'
  } else if (!isManagedAccount.value && !form.role) {
    errors.role = 'Please select a system role.'
  }

  if (!form.status) {
    errors.status = 'Please select an account status.'
  }

  if ((isSetup.value || !isManagedAccount.value) && !form.password) {
    errors.password = 'Temporary password is required.'
  } else if (form.password && form.password.length < 8) {
    errors.password = 'Password must contain at least 8 characters.'
  }

  if (form.password && form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return Object.keys(errors).length === 0
}

const submitForm = () => {
  if (!validateForm()) return

  const payload: UserPayload = {
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    role: form.role,
    status: form.status,
  }

  if (isManagedAccount.value) {
    payload.roleId = form.roleId
    payload.role = props.availableRoles?.find(role => role.id === form.roleId)?.name ?? ''
  }

  if (form.password) {
    payload.password = form.password
    payload.passwordConfirmation = form.confirmPassword
  }

  emit('save', payload)
}

const closeModal = () => emit('close')

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.open) {
    closeModal()
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="user-form-overlay"
      @click.self="closeModal"
      @keydown="onKeydown"
    >
      <section
        class="user-form-modal"
        role="dialog"
        aria-modal="true"
        :aria-label="modalTitle"
        tabindex="-1"
      >
        <!-- HEADER -->
        <header class="modal-header">
          <div class="header-left">
            <div class="header-icon">
              <UserPlus v-if="!isEdit" :size="21" />
              <UserRound v-else :size="21" />
            </div>

            <div>
              <h2>{{ modalTitle }}</h2>
              <p>{{ modalDescription }}</p>
            </div>
          </div>

          <button
            type="button"
            class="icon-close"
            aria-label="Close modal"
            @click="closeModal"
          >
            <X :size="19" />
          </button>
        </header>

        <form @submit.prevent="submitForm">
          <div class="modal-body">
            <!-- PERSONAL -->
            <div class="section-title">
              <UserRound :size="16" />
              <span>User Information</span>
            </div>

            <div class="form-grid">
              <div class="form-group full">
                <label>Full Name <span>*</span></label>

                <div class="input-wrapper">
                  <UserRound :size="16" />

                  <input
                    v-model="form.name"
                    type="text"
                    :readonly="isManagedAccount"
                    placeholder="Enter full name"
                    autocomplete="name"
                    @input="delete errors.name"
                  />
                </div>

                <small v-if="errors.name" class="field-error">
                  {{ errors.name }}
                </small>
              </div>

              <div class="form-group full">
                <label>Email Address <span>*</span></label>

                <div class="input-wrapper">
                  <Mail :size="16" />

                  <input
                    v-model="form.email"
                    type="email"
                    placeholder="name@company.com"
                    autocomplete="email"
                    @input="delete errors.email"
                  />
                </div>

                <small v-if="errors.email" class="field-error">
                  {{ errors.email }}
                </small>
              </div>
            </div>

            <!-- ACCESS -->
            <div class="section-title section-spacing">
              <ShieldCheck :size="16" />
              <span>Account Access</span>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>System Role <span>*</span></label>

                <select
                  v-if="isManagedAccount"
                  v-model.number="form.roleId"
                  :disabled="loading || saving"
                >
                  <option disabled :value="0">
                    {{ loading ? 'Loading roles...' : 'Select a role' }}
                  </option>

                  <option
                    v-for="option in roleOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>

                <select v-else v-model="form.role">
                  <option disabled value="">Select a role</option>

                  <option
                    v-for="option in roleOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>

                <small v-if="errors.role" class="field-error">
                  {{ errors.role }}
                </small>
              </div>

              <div class="form-group">
                <label>Account Status <span>*</span></label>

                <select v-model="form.status" :disabled="isManagedAccount">
                  <option
                    v-for="option in statusOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>

                <small v-if="errors.status" class="field-error">
                  {{ errors.status }}
                </small>
              </div>
            </div>

            <p v-if="isManagedAccount" class="helper-text section-spacing">
              The employee name and account status are managed automatically.
              You can change the login email, assigned role, and password here.
            </p>

            <p v-if="apiError" class="api-error" role="alert">
              {{ apiError }}
            </p>

            <!-- SECURITY -->
            <div class="section-title section-spacing">
              <LockKeyhole :size="16" />
              <span>Account Security</span>
            </div>

            <p class="helper-text">
              {{ isEdit
                ? 'Leave both password fields blank to keep the current password.'
                : 'Set a temporary password for the employee account.'
              }}
            </p>

            <div class="form-grid">
              <div class="form-group">
                <label>
                  {{ isEdit ? 'New Password' : 'Temporary Password' }}
                  <span v-if="!isEdit">*</span>
                </label>

                <div class="input-wrapper">
                  <LockKeyhole :size="16" />

                  <input
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Minimum 8 characters"
                    autocomplete="new-password"
                    @input="delete errors.password"
                  />

                  <button
                    type="button"
                    class="toggle-password"
                    aria-label="Toggle password visibility"
                    @click="showPassword = !showPassword"
                  >
                    <EyeOff v-if="showPassword" :size="16" />
                    <Eye v-else :size="16" />
                  </button>
                </div>

                <small v-if="errors.password" class="field-error">
                  {{ errors.password }}
                </small>
              </div>

              <div class="form-group">
                <label>
                  Confirm Password
                  <span v-if="!isEdit">*</span>
                </label>

                <div class="input-wrapper">
                  <LockKeyhole :size="16" />

                  <input
                    v-model="form.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="Confirm password"
                    autocomplete="new-password"
                    @input="delete errors.confirmPassword"
                  />

                  <button
                    type="button"
                    class="toggle-password"
                    aria-label="Toggle confirmation visibility"
                    @click="showConfirmPassword = !showConfirmPassword"
                  >
                    <EyeOff v-if="showConfirmPassword" :size="16" />
                    <Eye v-else :size="16" />
                  </button>
                </div>

                <small v-if="errors.confirmPassword" class="field-error">
                  {{ errors.confirmPassword }}
                </small>
              </div>
            </div>

            <div class="security-note">
              <ShieldCheck :size="17" />

              <p>
                User permissions should be enforced by the server
                based on the assigned role.
              </p>
            </div>
          </div>

          <!-- FOOTER -->
          <footer class="modal-footer">
            <button
              type="button"
              class="cancel-button"
              @click="closeModal"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="save-button"
              :disabled="loading || saving"
            >
              <Save :size="16" />
              {{ saving
                ? 'Saving...'
                : isSetup
                  ? 'Create Account'
                  : isEdit
                    ? 'Save Changes'
                    : 'Create User'
              }}
            </button>
          </footer>
        </form>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.user-form-overlay {
  position: fixed;
  inset: 0;
  z-index: 10050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(3, 9, 23, 0.76);
  backdrop-filter: blur(5px);
}

.user-form-modal {
  width: 100%;
  max-width: 620px;
  max-height: 92vh;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 15px;
  background: var(--bg-card);
  box-shadow: 0 25px 70px rgba(0, 0, 0, .30);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 22px;
  border-bottom: 1px solid var(--border);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  display: flex;
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  background: var(--primary-soft);
  color: var(--primary);
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 750;
}

.modal-header p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.5;
}

.icon-close,
.toggle-password {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.icon-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.icon-close:hover,
.toggle-password:hover {
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.modal-body {
  padding: 21px 22px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-soft);
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 750;
}

.section-title svg {
  color: var(--primary);
}

.section-spacing {
  margin-top: 25px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px;
}

.form-group {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 7px;
}

.form-group.full {
  grid-column: 1 / -1;
}

.form-group label {
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 650;
}

.form-group label span {
  color: var(--red);
}

.input-wrapper {
  display: flex;
  height: 41px;
  align-items: center;
  gap: 9px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-muted);
}

.input-wrapper:focus-within {
  border-color: var(--primary);
}

.input-wrapper > svg {
  flex-shrink: 0;
}

.input-wrapper input {
  width: 100%;
  min-width: 0;
  height: 100%;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 12px;
}

.input-wrapper input::placeholder {
  color: var(--text-muted);
}

.input-wrapper input:read-only,
.form-group select:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.form-group select {
  width: 100%;
  height: 41px;
  padding: 0 11px;
  border: 1px solid var(--border);
  border-radius: 8px;
  outline: none;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-size: 12px;
}

.form-group select:focus {
  border-color: var(--primary);
}

.toggle-password {
  flex-shrink: 0;
  width: 27px;
  height: 27px;
}

.field-error {
  color: var(--red);
  font-size: 10px;
}

.helper-text {
  margin: -6px 0 15px;
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.6;
}

.api-error {
  margin: 0 0 15px;
  padding: 10px 12px;
  border: 1px solid color-mix(in srgb, var(--red) 45%, transparent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--red) 10%, transparent);
  color: var(--red);
  font-size: 11px;
  line-height: 1.5;
}

.security-note {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 20px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--primary);
}

.security-note svg {
  flex-shrink: 0;
}

.security-note p {
  margin: 0;
  font-size: 11px;
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  padding: 16px 22px;
  border-top: 1px solid var(--border);
}

.cancel-button,
.save-button {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 650;
  cursor: pointer;
}

.cancel-button {
  border: 1px solid var(--border);
  background: var(--bg-card-soft);
  color: var(--text-primary);
}

.save-button {
  border: 1px solid var(--primary);
  background: var(--primary);
  color: #fff;
}

.save-button:hover {
  filter: brightness(1.08);
}

.save-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

@media (max-width: 560px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 15px;
  }

  .modal-header h2 {
    font-size: 14px;
  }
}
</style>
