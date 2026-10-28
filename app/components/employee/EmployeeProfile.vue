<script setup lang="ts">
import {
  MapPin,
  BriefcaseBusiness,
  Phone,
  WalletCards,
  CalendarDays,
  ShieldCheck,
  Files,
  Eye,
  EyeOff,
  LockKeyhole,
  User,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Building2,
  Clock,
  Sparkles,
  Camera,
} from 'lucide-vue-next'
import EmployeePhotoModal from './EmployeePhotoModal.vue'
import { employeeTenure } from '~/utils/employeeTenure'
import type { EmployeeRequirement } from '~/composables/employee/useEmployeePortal'

const {
  profile,
  isLoadingProfile,
  profileError,
  fetchProfile,
  updateContactInfo,
  updatePassword,
  isSavingContact,
  contactError,
  isSavingPassword,
  passwordError,
} = useEmployeePortal()

const today = ref(new Date())
let dateRefresh: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  dateRefresh = setInterval(() => { today.value = new Date() }, 60_000)
  if (!profile.value.rawEmpId) {
    fetchProfile()
  }
})

onBeforeUnmount(() => {
  if (dateRefresh) clearInterval(dateRefresh)
})

// Photo Modal State
const photoModalOpen = ref(false)

// Contact Editing
const editing = ref(false)
const contactSavedMessage = ref('')

const contactDraft = reactive({
  mobile: '',
  address: '',
  emergencyName: '',
  emergencyRelationship: '',
  emergencyPhone: '',
  emergencyAddress: '',
})

const resetContactDraft = () => {
  contactDraft.mobile = profile.value.phone || ''
  contactDraft.address = profile.value.address || ''
  contactDraft.emergencyName = profile.value.emergencyName || ''
  contactDraft.emergencyRelationship = profile.value.emergencyRelationship || ''
  contactDraft.emergencyPhone = profile.value.emergencyPhone || ''
  contactDraft.emergencyAddress = profile.value.emergencyAddress || ''
}

watch(profile, () => {
  if (!editing.value) resetContactDraft()
}, { deep: true, immediate: true })

const startEditContact = () => {
  resetContactDraft()
  editing.value = true
  contactSavedMessage.value = ''
}

const cancelEditContact = () => {
  resetContactDraft()
  editing.value = false
}

const handleSaveContact = async () => {
  contactSavedMessage.value = ''
  const result = await updateContactInfo({
    mobile: contactDraft.mobile.trim(),
    residential_address: contactDraft.address.trim(),
    emergency_name: contactDraft.emergencyName.trim(),
    emergency_relationship: contactDraft.emergencyRelationship.trim(),
    emergency_phone: contactDraft.emergencyPhone.trim(),
    emergency_address: contactDraft.emergencyAddress.trim(),
  })

  if (result.success) {
    editing.value = false
    contactSavedMessage.value = result.message
    setTimeout(() => { contactSavedMessage.value = '' }, 5000)
  }
}

// Password Management
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const passwordSuccessMessage = ref('')
const clientPasswordError = ref('')

const handleSavePassword = async () => {
  passwordSuccessMessage.value = ''
  clientPasswordError.value = ''

  if (!currentPassword.value) {
    clientPasswordError.value = 'Please provide your current password.'
    return
  }
  if (!newPassword.value || newPassword.value.length < 8) {
    clientPasswordError.value = 'New password must be at least 8 characters long.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    clientPasswordError.value = 'New password and confirmation do not match.'
    return
  }

  const result = await updatePassword({
    current_password: currentPassword.value,
    password: newPassword.value,
    password_confirmation: confirmPassword.value,
  })

  if (result.success) {
    passwordSuccessMessage.value = result.message
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    setTimeout(() => { passwordSuccessMessage.value = '' }, 6000)
  }
}

// Sensitive Field Masks
const revealed = reactive<Record<string, boolean>>({})

const toggleRevealed = (key: string) => {
  revealed[key] = !revealed[key]
}

// Documents
const documentDetailsOpen = ref(false)
const selectedDocument = ref<EmployeeRequirement | null>(null)
const viewDocument = (document: EmployeeRequirement) => {
  selectedDocument.value = document
  documentDetailsOpen.value = true
}

// Helpers
const show = (value: string | number | undefined | null) => {
  if (value === undefined || value === null) return 'Not provided'
  const str = String(value).trim()
  return str || 'Not provided'
}

const money = (value: string | number | undefined | null) => {
  if (value === undefined || value === null) return 'Not provided'
  const str = String(value).trim()
  if (!str || !Number.isFinite(Number(str))) return 'Not provided'
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(str))
}

const mask = (value: string | undefined | null) => {
  if (!value) return 'Not provided'
  const identifier = String(value).replace(/[^a-z0-9]/gi, '')
  return identifier ? identifier.length > 4 ? `•••• •••• ${identifier.slice(-4)}` : '•••• ••••' : 'Not provided'
}

const formatDisplayDate = (dateStr: string | undefined | null) => {
  if (!dateStr) return 'Not provided'
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return dateStr
  }
}

const formatTime = (value: string | undefined | null) => {
  if (!value) return 'Not provided'
  const trimmed = value.trim()
  if (!/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(trimmed)) return trimmed
  const [hour, minute] = trimmed.split(':')
  const h = Number(hour)
  return `${h % 12 || 12}:${minute} ${h >= 12 ? 'PM' : 'AM'}`
}

const initials = computed(() => {
  return profile.value.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join('') || 'EM'
})

// Personal info fields
const personalFields = computed(() => [
  { label: 'First Name', value: show(profile.value.firstName) },
  { label: 'Middle Name', value: show(profile.value.middleName) },
  { label: 'Last Name', value: show(profile.value.lastName) },
  { label: 'Suffix', value: show(profile.value.suffix) },
  { label: 'Age', value: profile.value.age ? `${profile.value.age} years old` : 'Not provided' },
  { label: 'Gender', value: show(profile.value.gender || profile.value.sex) },
  { label: 'Birthday', value: formatDisplayDate(profile.value.birthday) },
  { label: 'Civil Status', value: show(profile.value.civilStatus) },
])

// Employment fields
const employmentFields = computed(() => [
  { label: 'Employee ID', value: profile.value.employeeId },
  { label: 'Department', value: profile.value.departmentCode ? `${profile.value.department} (${profile.value.departmentCode})` : profile.value.department },
  { label: 'Position', value: show(profile.value.position) },
  { label: 'Employment Type', value: show(profile.value.employmentType) },
  { label: 'Employment Status', value: profile.value.employmentStatus },
  { label: 'Date Hired', value: formatDisplayDate(profile.value.employmentStartDate) },
  { label: 'Length of Service', value: employeeTenure(profile.value.employmentStartDate, today.value) },
  { label: 'Primary Rest Day', value: show(profile.value.restDays) },
])

// Salary fields
const salaryFields = computed(() => [
  { label: 'Salary Type / Basis', value: show(profile.value.salaryType) },
  { label: 'Basic Salary Rate', value: profile.value.salaryRate ? `${money(profile.value.salaryRate)} / ${profile.value.salaryType.toLowerCase().includes('day') ? 'day' : 'cutoff'}` : 'Not provided' },
  { label: 'Allowance', value: profile.value.allowance ? money(profile.value.allowance) : 'None on record' },
  { label: 'Bank Name', value: show(profile.value.bankName) },
  { label: 'Account Name', value: show(profile.value.bankAccountName) },
  { label: 'Bank Account Number', value: profile.value.bankAccountNumber, sensitive: true },
])

// Government Fields (Merged from dynamic + fallback)
const governmentItems = computed(() => {
  if (profile.value.governmentIds && profile.value.governmentIds.length > 0) {
    return profile.value.governmentIds.map(g => ({
      label: g.name,
      value: g.number,
      key: `govt-${g.id}`,
    }))
  }
  return [
    { label: 'Tax Identification Number (TIN)', value: profile.value.tinNumber, key: 'govt-tin' },
    { label: 'Social Security System (SSS) Number', value: profile.value.sssNumber, key: 'govt-sss' },
    { label: 'PhilHealth Number', value: profile.value.philhealthNumber, key: 'govt-philhealth' },
    { label: 'Pag-IBIG (HDMF) Number', value: profile.value.pagibigNumber, key: 'govt-pagibig' },
  ]
})
</script>

<template>
  <section class="employee-profile">
    <!-- Top Bar with Refresh Action -->
    <div class="profile-header-bar">
      <div>
        <h1 class="page-title">Employee Profile</h1>
        <p class="page-subtitle">Your personal, employment, and compensation records on file.</p>
      </div>
      <button
        type="button"
        class="refresh-button"
        :disabled="isLoadingProfile"
        title="Sync profile from server"
        @click="fetchProfile"
      >
        <RefreshCw :size="15" :class="{ spinning: isLoadingProfile }" />
        <span>{{ isLoadingProfile ? 'Syncing…' : 'Sync Records' }}</span>
      </button>
    </div>

    <!-- Error Alert if profile fetch failed -->
    <div v-if="profileError" class="status-banner error" role="alert">
      <AlertCircle :size="18" />
      <div>
        <strong>Unable to sync profile:</strong> {{ profileError }}
      </div>
    </div>

    <!-- Identity Hero Card -->
    <article class="profile-card identity">
      <div class="avatar-hero-container">
        <div
          class="avatar-1to1-wrap"
          title="Click to upload or crop photo (1:1 Ratio)"
          @click="photoModalOpen = true"
        >
          <img
            v-if="profile.profilePhotoUrl"
            :src="profile.profilePhotoUrl"
            alt="Profile photo"
            class="avatar-photo-1to1"
          >
          <div v-else class="avatar-fallback-initials" aria-hidden="true">
            {{ initials }}
          </div>
          <button
            type="button"
            class="avatar-camera-overlay"
            aria-label="Upload profile photo (1:1 Ratio)"
            @click.stop="photoModalOpen = true"
          >
            <Camera :size="20" />
          </button>
        </div>
        <span class="ratio-tag">1:1 Ratio</span>
      </div>

      <div class="identity-details">
        <div class="identity-heading">
          <h2>{{ profile.name }}</h2>
          <span
            class="employment-status"
            :class="{ inactive: profile.employmentStatus === 'Inactive' }"
            :aria-label="`Employment status: ${profile.employmentStatus}`"
          >
            {{ profile.employmentStatus }}
          </span>
          <button
            type="button"
            class="change-photo-badge"
            @click="photoModalOpen = true"
          >
            <Camera :size="13" />
            <span>{{ profile.profilePhotoUrl ? 'Change Photo' : 'Upload Photo (1:1)' }}</span>
          </button>
        </div>
        <p class="role-line">
          <strong>{{ show(profile.position) }}</strong> · {{ show(profile.department) }}
        </p>
        <div class="meta-row">
          <span class="meta-item">
            <strong>Employee ID:</strong> {{ show(profile.employeeId) }}
          </span>
          <span class="meta-item">
            <Building2 :size="13" />
            {{ show(profile.departmentCode || profile.department) }}
          </span>
          <span class="meta-item">
            <MapPin :size="13" />
            {{ show(profile.location) }}
          </span>
        </div>
      </div>
    </article>

    <!-- Two-Column Grid: Personal & Employment -->
    <div class="profile-columns">
      <!-- Personal Details -->
      <article class="profile-card">
        <header>
          <div class="section-title">
            <User :size="19" />
            <h3>Personal Information</h3>
          </div>
          <span class="read-only">HR-Managed</span>
        </header>
        <dl class="detail-grid">
          <div v-for="field in personalFields" :key="field.label">
            <dt>{{ field.label }}</dt>
            <dd>{{ field.value }}</dd>
          </div>
        </dl>
      </article>

      <!-- Employment Information -->
      <article class="profile-card">
        <header>
          <div class="section-title">
            <BriefcaseBusiness :size="19" />
            <h3>Employment Information</h3>
          </div>
          <span class="read-only">HR-Managed</span>
        </header>
        <dl class="detail-grid">
          <div v-for="field in employmentFields" :key="field.label">
            <dt>{{ field.label }}</dt>
            <dd>{{ field.value }}</dd>
          </div>
        </dl>
      </article>
    </div>

    <!-- Contact Information (Editable with Live Backend Sync) -->
    <article class="profile-card">
      <header>
        <div class="section-title">
          <Phone :size="19" />
          <h3>Contact Details</h3>
        </div>
        <button v-if="!editing" type="button" class="action-btn" @click="startEditContact">
          Edit Contact Details
        </button>
      </header>

      <p v-if="contactSavedMessage" class="status-banner success" role="status">
        <CheckCircle2 :size="16" />
        <span>{{ contactSavedMessage }}</span>
      </p>

      <p v-if="contactError" class="status-banner error" role="alert">
        <AlertCircle :size="16" />
        <span>{{ contactError }}</span>
      </p>

      <form @submit.prevent="handleSaveContact">
        <label>
          Email Address
          <input :value="profile.email" type="email" readonly class="readonly-field" title="Login email cannot be edited directly">
          <span class="field-hint">Primary login account</span>
        </label>

        <label>
          Mobile Number
          <input
            v-model="contactDraft.mobile"
            type="tel"
            :readonly="!editing"
            maxlength="40"
            placeholder="09XXXXXXXXX"
          >
        </label>

        <label class="wide">
          Residential Address
          <input
            v-model="contactDraft.address"
            :readonly="!editing"
            maxlength="500"
            placeholder="House / Street, Barangay, City, Province"
          >
        </label>

        <label>
          Emergency Contact Person
          <input
            v-model="contactDraft.emergencyName"
            :readonly="!editing"
            maxlength="150"
            placeholder="e.g. Maria Santos"
          >
        </label>

        <label>
          Relationship
          <input
            v-model="contactDraft.emergencyRelationship"
            :readonly="!editing"
            maxlength="80"
            placeholder="e.g. Spouse, Parent, Sibling"
          >
        </label>

        <label>
          Emergency Contact Phone
          <input
            v-model="contactDraft.emergencyPhone"
            type="tel"
            :readonly="!editing"
            maxlength="40"
            placeholder="09XXXXXXXXX"
          >
        </label>

        <label>
          Emergency Address
          <input
            v-model="contactDraft.emergencyAddress"
            :readonly="!editing"
            maxlength="255"
            placeholder="Emergency contact address"
          >
        </label>

        <div v-if="editing" class="wide actions">
          <button type="button" class="secondary" :disabled="isSavingContact" @click="cancelEditContact">
            Cancel
          </button>
          <button type="submit" class="primary" :disabled="isSavingContact">
            {{ isSavingContact ? 'Saving to Database…' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </article>

    <!-- Two-Column Grid: Salary & Schedule -->
    <div class="profile-columns">
      <!-- Salary & Bank Details -->
      <article class="profile-card">
        <header>
          <div class="section-title">
            <WalletCards :size="19" />
            <h3>Salary &amp; Bank Details</h3>
          </div>
          <span class="read-only">Confidential</span>
        </header>
        <dl class="detail-grid">
          <div v-for="field in salaryFields" :key="field.label">
            <dt>{{ field.label }}</dt>
            <dd :class="{ 'sensitive-value': field.sensitive }">
              <span>
                {{ field.sensitive
                  ? (revealed[field.label] ? show(field.value) : mask(field.value))
                  : field.value
                }}
              </span>
              <button
                v-if="field.sensitive && field.value && field.value.trim()"
                type="button"
                class="eye-button"
                :aria-label="`${revealed[field.label] ? 'Hide' : 'Show'} ${field.label}`"
                :aria-pressed="!!revealed[field.label]"
                @click="toggleRevealed(field.label)"
              >
                <EyeOff v-if="revealed[field.label]" :size="16" />
                <Eye v-else :size="16" />
              </button>
            </dd>
          </div>
        </dl>
        <p class="note">
          Official payroll rate and disbursement accounts are managed by HR/Finance. Click the eye button to inspect your account number.
        </p>
      </article>

      <!-- Work Schedule Details -->
      <article class="profile-card">
        <header>
          <div class="section-title">
            <CalendarDays :size="19" />
            <h3>Work Schedule ({{ profile.workScheduleCode || 'WS-001' }})</h3>
          </div>
          <span class="read-only">{{ profile.workSchedule }}</span>
        </header>

        <div class="schedule-summary">
          <div class="summary-pill">
            <Clock :size="14" />
            <span>Shift: {{ formatTime(profile.scheduleTimeIn) }} – {{ formatTime(profile.scheduleTimeOut) }}</span>
          </div>
          <div v-if="profile.breakTime" class="summary-pill">
            <span>Break: {{ profile.breakTime }}</span>
          </div>
          <div v-if="profile.workScheduleHours" class="summary-pill">
            <span>Required: {{ profile.workScheduleHours }} hrs</span>
          </div>
          <div v-if="profile.workScheduleGracePeriod" class="summary-pill">
            <span>Grace Period: {{ profile.workScheduleGracePeriod }}m</span>
          </div>
        </div>

        <dl class="weekly-schedule">
          <div
            v-for="day in profile.workDays"
            :key="day.day"
            :class="{ 'rest-day': !day.start }"
          >
            <dt>{{ day.day }}</dt>
            <dd>{{ day.start ? `${formatTime(day.start)} – ${formatTime(day.end)}` : 'Rest day' }}</dd>
          </div>
        </dl>
      </article>
    </div>

    <!-- Government Identification Numbers -->
    <article class="profile-card">
      <header>
        <div class="section-title">
          <ShieldCheck :size="19" />
          <h3>Government Identification Numbers</h3>
        </div>
        <span class="read-only">Official IDs</span>
      </header>
      <dl class="detail-grid">
        <div v-for="item in governmentItems" :key="item.key">
          <dt>{{ item.label }}</dt>
          <dd class="sensitive-value">
            <span>
              {{ revealed[item.key] ? show(item.value) : mask(item.value) }}
            </span>
            <button
              v-if="item.value && item.value.trim()"
              type="button"
              class="eye-button"
              :aria-label="`${revealed[item.key] ? 'Hide' : 'Show'} ${item.label}`"
              :aria-pressed="!!revealed[item.key]"
              @click="toggleRevealed(item.key)"
            >
              <EyeOff v-if="revealed[item.key]" :size="16" />
              <Eye v-else :size="16" />
            </button>
          </dd>
        </div>
      </dl>
      <p class="note">Government records are used for statutory reporting (SSS, PhilHealth, Pag-IBIG, BIR). Contact HR to update registered ID numbers.</p>
    </article>

    <!-- Requirements & Official Documents -->
    <article class="profile-card requirements">
      <header>
        <div class="section-title">
          <Files :size="19" />
          <h3>Requirements &amp; Documents</h3>
        </div>
        <span class="read-only">{{ profile.requirements?.length || 0 }} on file</span>
      </header>
      <p class="note">Official records and employment requirements submitted to Human Resources.</p>
      <p class="mobile-table-hint">Tap a document row to view submission notes and status.</p>
      <div class="table-scroll" role="region" aria-label="Employee requirements" tabindex="0">
        <table class="mobile-compact-table">
          <thead>
            <tr>
              <th scope="col">Document Name</th>
              <th scope="col">Category</th>
              <th scope="col">Status</th>
              <th scope="col">Date On Record</th>
              <th scope="col">Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="requirement in profile.requirements ?? []"
              :key="requirement.id"
              class="record-row"
              @click="viewDocument(requirement)"
            >
              <th scope="row">
                <button
                  type="button"
                  class="row-open-button"
                  :aria-label="`Open ${requirement.name} details`"
                  @click.stop="viewDocument(requirement)"
                >
                  {{ requirement.name }}
                </button>
              </th>
              <td><span class="category-badge">{{ requirement.category || 'General' }}</span></td>
              <td>
                <span
                  class="requirement-status"
                  :class="{ submitted: requirement.status === 'Submitted', verified: requirement.status === 'Verified' }"
                >
                  {{ requirement.status }}
                </span>
              </td>
              <td>{{ requirement.submittedAt ? formatDisplayDate(requirement.submittedAt) : 'Pending' }}</td>
              <td><span class="document-remark">{{ requirement.remarks || '—' }}</span></td>
            </tr>
            <tr v-if="!profile.requirements?.length">
              <td colspan="5" class="empty">No document records found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <EmployeeRecordDialog v-model="documentDetailsOpen" title="Document Details" :subtitle="selectedDocument?.name">
      <dl v-if="selectedDocument" class="record-fields">
        <div class="wide"><dt>Requirement / Document</dt><dd>{{ selectedDocument.name }}</dd></div>
        <div><dt>Category</dt><dd>{{ selectedDocument.category || 'General' }}</dd></div>
        <div><dt>Status</dt><dd>{{ selectedDocument.status }}</dd></div>
        <div><dt>Date on Record</dt><dd>{{ selectedDocument.submittedAt ? formatDisplayDate(selectedDocument.submittedAt) : 'Not provided' }}</dd></div>
        <div class="wide"><dt>Remarks</dt><dd>{{ selectedDocument.remarks || 'No notes on file.' }}</dd></div>
        <div class="wide"><dt>File Attachment</dt><dd>{{ selectedDocument.filePath ? 'Uploaded to secure HR storage' : 'No document file has been uploaded yet. Contact HR.' }}</dd></div>
      </dl>
    </EmployeeRecordDialog>

    <!-- Change Password Section (FULLY CONNECTED TO BACKEND) -->
    <article class="profile-card password-card">
      <header>
        <div class="section-title">
          <LockKeyhole :size="19" />
          <h3>Account Security &amp; Password</h3>
        </div>
        <span class="read-only">Secured with Sanctum</span>
      </header>

      <p class="note">
        Update your employee account password. Passwords must be at least 8 characters long and match confirmation.
      </p>

      <p v-if="passwordSuccessMessage" class="status-banner success" role="status">
        <CheckCircle2 :size="16" />
        <span>{{ passwordSuccessMessage }}</span>
      </p>

      <p v-if="clientPasswordError || passwordError" class="status-banner error" role="alert">
        <AlertCircle :size="16" />
        <span>{{ clientPasswordError || passwordError }}</span>
      </p>

      <form class="password-form" @submit.prevent="handleSavePassword">
        <label>
          Current Password
          <div class="password-input-wrap">
            <input
              v-model="currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Enter your current password"
              required
            >
            <button
              type="button"
              class="eye-button inner"
              :aria-label="showCurrentPassword ? 'Hide password' : 'Show password'"
              @click="showCurrentPassword = !showCurrentPassword"
            >
              <EyeOff v-if="showCurrentPassword" :size="16" />
              <Eye v-else :size="16" />
            </button>
          </div>
        </label>

        <label>
          New Password
          <div class="password-input-wrap">
            <input
              v-model="newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="At least 8 characters"
              minlength="8"
              required
            >
            <button
              type="button"
              class="eye-button inner"
              :aria-label="showNewPassword ? 'Hide password' : 'Show password'"
              @click="showNewPassword = !showNewPassword"
            >
              <EyeOff v-if="showNewPassword" :size="16" />
              <Eye v-else :size="16" />
            </button>
          </div>
        </label>

        <label>
          Confirm New Password
          <div class="password-input-wrap">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Repeat your new password"
              minlength="8"
              required
            >
            <button
              type="button"
              class="eye-button inner"
              :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <EyeOff v-if="showConfirmPassword" :size="16" />
              <Eye v-else :size="16" />
            </button>
          </div>
        </label>

        <div class="wide actions">
          <button type="submit" class="primary" :disabled="isSavingPassword">
            {{ isSavingPassword ? 'Updating Password…' : 'Update Password' }}
          </button>
        </div>
      </form>
    </article>

    <!-- 1:1 Aspect Ratio Photo Cropper / Upload Modal -->
    <EmployeePhotoModal
      v-model="photoModalOpen"
      :current-photo-url="profile.profilePhotoUrl"
    />
  </section>
</template>

<style scoped>
.employee-profile { display: flex; flex-direction: column; gap: 18px; }

.profile-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}
.page-subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.refresh-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s ease;
}
.refresh-button:hover:not(:disabled) {
  background: var(--bg-card-soft);
  border-color: var(--primary);
  color: var(--primary);
}
.refresh-button:disabled { opacity: 0.6; cursor: not-allowed; }
.spinning { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

.profile-card {
  min-width: 0;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

.identity {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-hero-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.avatar-1to1-wrap {
  position: relative;
  width: 92px;
  height: 92px;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--border);
  box-shadow: 0 6px 20px rgba(6, 49, 111, 0.18);
  cursor: pointer;
  background: var(--bg-card-soft, #f1f5f9);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.2s ease,
              border-color 0.2s ease;
}

.avatar-1to1-wrap:hover {
  transform: scale(1.04);
  border-color: var(--primary, #1059b8);
  box-shadow: 0 10px 24px rgba(16, 89, 184, 0.28);
}

.avatar-photo-1to1 {
  width: 100%;
  height: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
}

.avatar-fallback-initials {
  width: 100%;
  height: 100%;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1059b8 0%, #06316f 100%);
  color: #ffffff;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  user-select: none;
}

.avatar-camera-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.52);
  backdrop-filter: blur(2px);
  color: #ffffff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.avatar-1to1-wrap:hover .avatar-camera-overlay,
.avatar-camera-overlay:focus-visible {
  opacity: 1;
}

.ratio-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding: 2px 7px;
  border-radius: 999px;
  background: var(--bg-card-soft, rgba(0, 0, 0, 0.05));
  color: var(--text-muted);
  border: 1px solid var(--border);
}

.change-photo-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: rgba(16, 89, 184, 0.08);
  color: var(--primary, #1059b8);
  border: 1px solid rgba(16, 89, 184, 0.25);
  cursor: pointer;
  transition: all 0.15s ease;
}

.change-photo-badge:hover {
  background: rgba(16, 89, 184, 0.16);
  border-color: var(--primary, #1059b8);
  transform: translateY(-1px);
}
.identity-details { flex: 1; min-width: 0; }
.identity-heading { display: flex; align-items: center; flex-wrap: wrap; gap: 8px 12px; }
.identity-heading h2 { margin: 0; font-size: 20px; font-weight: 700; color: var(--text-primary); text-transform: capitalize; }
.role-line { margin: 4px 0 0; font-size: 13px; color: var(--text-secondary); }
.meta-row { display: flex; align-items: center; flex-wrap: wrap; gap: 12px 18px; margin-top: 8px; font-size: 12px; color: var(--text-secondary); }
.meta-item { display: inline-flex; align-items: center; gap: 5px; }

.employment-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--green-soft);
  color: var(--green);
  font-size: 11px;
  font-weight: 700;
}
.employment-status::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.employment-status.inactive { background: var(--red-soft); color: var(--red); }

header { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
.section-title { display: flex; align-items: center; gap: 9px; }
.section-title svg { color: var(--primary); flex-shrink: 0; }
h3 { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); }
.read-only { font-size: 11px; color: var(--text-muted); font-weight: 500; }

.detail-grid, form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 22px;
  margin: 20px 0 0;
}
dt { font-size: 11px; color: var(--text-secondary); margin-bottom: 5px; font-weight: 500; }
dd { margin: 0; font-size: 13px; font-weight: 600; color: var(--text-primary); overflow-wrap: anywhere; }

.profile-columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }

label { display: flex; flex-direction: column; gap: 6px; font-size: 12px; font-weight: 500; color: var(--text-secondary); }
.field-hint { font-size: 10px; color: var(--text-muted); }
.wide { grid-column: 1 / -1; }

input {
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card);
  color: var(--text-primary);
  font: inherit;
  font-size: 13px;
  transition: border-color .15s ease, box-shadow .15s ease;
}
input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.12);
}
input:read-only, .readonly-field { background: var(--bg-card-soft); color: var(--text-secondary); }

.password-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.password-input-wrap input { width: 100%; padding-right: 40px; }
.eye-button.inner {
  position: absolute;
  right: 6px;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: 0;
  color: var(--text-secondary);
}

.schedule-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}
.summary-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: var(--bg-card-soft);
  border: 1px solid var(--border-soft);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
}

.weekly-schedule { margin: 16px 0 0; }
.weekly-schedule > div {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 9px 0;
  border-bottom: 1px solid var(--border-soft);
}
.weekly-schedule dt { margin: 0; font-size: 12px; color: var(--text-secondary); }
.weekly-schedule dd { font-size: 12px; font-weight: 600; }
.weekly-schedule .rest-day dd { color: var(--green); font-weight: 700; }

.sensitive-value { display: flex; align-items: center; gap: 8px; }
.sensitive-value span { min-width: 0; overflow-wrap: anywhere; }
.eye-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  padding: 4px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-card-soft);
  color: var(--primary);
  cursor: pointer;
  transition: all .15s ease;
}
.eye-button:hover { background: var(--primary-soft); }

button.action-btn, button.primary {
  padding: 8px 16px;
  border-radius: 7px;
  border: 1px solid var(--primary);
  background: var(--primary);
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s ease;
}
button.action-btn:hover, button.primary:hover:not(:disabled) {
  opacity: 0.92;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.25);
}
button.primary:disabled { opacity: 0.6; cursor: not-allowed; }

button.secondary {
  padding: 8px 16px;
  border-radius: 7px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
button.secondary:hover:not(:disabled) { background: var(--bg-card-soft); }

.actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }

.status-banner {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  margin-top: 12px;
}
.status-banner.success {
  background: var(--green-soft);
  color: var(--green);
  border: 1px solid rgba(16, 185, 129, 0.2);
}
.status-banner.error {
  background: var(--red-soft);
  color: var(--red);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.note { font-size: 11px; color: var(--text-muted); margin-top: 14px; line-height: 1.6; }

.table-scroll { overflow-x: auto; margin-top: 16px; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; }
th, td { padding: 12px 14px; border-bottom: 1px solid var(--border-soft); }
thead th { background: var(--bg-card-soft); color: var(--text-secondary); font-weight: 600; white-space: nowrap; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
tbody th { font-weight: 600; color: var(--text-primary); }
td { color: var(--text-secondary); }
.empty { text-align: center; padding: 28px 12px; color: var(--text-muted); }

.row-open-button {
  background: transparent;
  border: 0;
  padding: 0;
  font: inherit;
  font-weight: 600;
  color: var(--primary);
  cursor: pointer;
  text-align: left;
}
.row-open-button:hover { text-decoration: underline; }

.category-badge {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 4px;
  background: var(--bg-card-soft);
  border: 1px solid var(--border-soft);
  font-size: 11px;
}

.requirement-status {
  display: inline-block;
  padding: 3px 8px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.requirement-status.submitted { background: var(--primary-soft); color: var(--primary); }
.requirement-status.verified { background: var(--green-soft); color: var(--green); }

.password-card { border-top: 3px solid var(--primary); }
.password-form { grid-template-columns: repeat(3, minmax(0, 1fr)); }

@media(max-width: 1000px) {
  .profile-columns { grid-template-columns: 1fr; }
  .password-form { grid-template-columns: 1fr; }
}
@media(max-width: 600px) {
  form, .detail-grid { grid-template-columns: 1fr; }
  .profile-card { padding: 18px; }
  .identity { flex-direction: column; align-items: flex-start; }
  .actions { flex-direction: column; }
  .actions button { width: 100%; }
}
</style>
