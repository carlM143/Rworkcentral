<script setup lang="ts">
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
} from 'lucide-vue-next'

const { form } = useEmployeeForm()

const genderOptions = [
  {
    label: 'Male',
    value: 'Male',
  },
  {
    label: 'Female',
    value: 'Female',
  },
]

const civilStatusOptions = [
  'Single',
  'Married',
  'Widowed',
  'Separated',
]

const suffixOptions = [
  'Jr.',
  'Sr.',
  'II',
  'III',
  'IV',
]

const age = computed(() => {
  if (!form.value.birthDate) {
    return ''
  }

  const today = new Date()
  const birthDate = new Date(
    form.value.birthDate,
  )

  let calculatedAge =
    today.getFullYear() -
    birthDate.getFullYear()

  const monthDifference =
    today.getMonth() -
    birthDate.getMonth()

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      today.getDate() <
        birthDate.getDate()
    )
  ) {
    calculatedAge--
  }

  return calculatedAge >= 0
    ? calculatedAge
    : ''
})

const fullName = computed(() => {
  return [
    form.value.firstName,
    form.value.middleName,
    form.value.lastName,
    form.value.suffix,
  ]
    .filter(Boolean)
    .join(' ')
})
</script>

<template>
  <FormSection
    title="Personal Information"
    description="Enter the employee's basic personal and contact information."
    :icon="UserRound"
  >
    <div class="personal-layout">

      <!-- ========================= -->
      <!-- LEFT PROFILE -->
      <!-- ========================= -->
      <aside class="profile-column">
        <div class="profile-preview">
          <div class="profile-avatar">
            <UserRound :size="32" />
          </div>

          <strong>
            {{
              fullName ||
              'New Employee'
            }}
          </strong>

          <span>
            Employee Profile
          </span>
        </div>

        <AppFileUpload
          v-model="form.profilePhoto"
          label="Profile Photo"
          description="Upload JPG or PNG employee photo."
          accept=".jpg,.jpeg,.png"
          :max-size-mb="5"
        />

        <div class="photo-note">
          Recommended square image with a clear
          employee photo.
        </div>
      </aside>

      <!-- ========================= -->
      <!-- RIGHT FORM -->
      <!-- ========================= -->
      <div class="personal-form">

        <!-- NAME -->
        <div class="form-grid name-grid">

          <div class="form-field">
            <label class="field-label">
              First Name
              <span>*</span>
            </label>

            <AppInput
              v-model="form.firstName"
              placeholder="Enter first name"
            />
          </div>

          <div class="form-field">
            <label class="field-label">
              Middle Name
            </label>

            <AppInput
              v-model="form.middleName"
              placeholder="Enter middle name"
            />
          </div>

          <div class="form-field">
            <label class="field-label">
              Last Name
              <span>*</span>
            </label>

            <AppInput
              v-model="form.lastName"
              placeholder="Enter last name"
            />
          </div>

          <div class="form-field suffix-field">
            <label class="field-label">
              Suffix
            </label>

            <AppSelect
              v-model="form.suffix"
              :options="suffixOptions"
              placeholder="None"
            />
          </div>

        </div>

        <!-- PERSONAL DETAILS -->
        <div class="form-grid personal-details-grid">

          <AppDateInput
            v-model="form.birthDate"
            label="Birth Date"
            required
          />

          <div class="form-field">
            <label class="field-label">
              Age
            </label>

            <div class="age-input">
              <CalendarDays :size="16" />

              <span v-if="age">
                {{ age }} years old
              </span>

              <span
                v-else
                class="placeholder"
              >
                Auto-calculated
              </span>
            </div>
          </div>

          <div class="form-field">
            <label class="field-label">
              Civil Status
            </label>

            <AppSelect
              v-model="form.civilStatus"
              :options="civilStatusOptions"
              placeholder="Select civil status"
            />
          </div>

        </div>

        <!-- GENDER -->
        <div class="form-field gender-field">
          <AppRadioGroup
            v-model="form.gender"
            label="Gender"
            :options="genderOptions"
          />
        </div>

        <!-- CONTACT -->
        <div class="section-divider">
          <div class="divider-icon">
            <Mail :size="16" />
          </div>

          <div>
            <strong>
              Contact Information
            </strong>

            <span>
              Employee email, mobile number and
              residential address.
            </span>
          </div>
        </div>

        <div class="form-grid contact-grid">

          <div class="form-field">
            <label class="field-label">
              Email Address
              <span>*</span>
            </label>

            <div class="input-with-icon">
              <Mail :size="16" />

              <AppInput
                v-model="form.email"
                placeholder="employee@example.com"
              />
            </div>
          </div>

          <div class="form-field">
            <label class="field-label">
              Mobile Number
            </label>

            <div class="input-with-icon">
              <Phone :size="16" />

              <AppInput
                v-model="form.mobileNumber"
                placeholder="09XX XXX XXXX"
              />
            </div>
          </div>

        </div>

        <!-- ADDRESS -->
        <div class="address-field">
          <div class="address-label">
            <MapPin :size="15" />

            <label>
              Residential Address
              <span>*</span>
            </label>
          </div>

          <AppTextarea
            v-model="form.address"
            placeholder="House/Unit No., Street, Barangay, City/Municipality, Province"
            :rows="3"
            :maxlength="255"
          />
        </div>

      </div>
    </div>
  </FormSection>
</template>

<style scoped>
.personal-layout {
  display: grid;

  grid-template-columns:
    230px minmax(0, 1fr);

  gap: 24px;
}

/* =========================
   PROFILE
========================= */

.profile-column {
  padding-right: 22px;

  border-right:
    1px solid var(--border-soft);
}

.profile-preview {
  display: flex;
  flex-direction: column;
  align-items: center;

  margin-bottom: 18px;

  text-align: center;
}

.profile-avatar {
  display: flex;

  width: 82px;
  height: 82px;

  align-items: center;
  justify-content: center;

  margin-bottom: 11px;

  border:
    1px solid var(--border);

  border-radius: 50%;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.profile-preview strong {
  max-width: 190px;

  overflow: hidden;

  color:
    var(--text-primary);

  font-size: 12px;
  font-weight: 700;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.profile-preview span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9px;
}

.photo-note {
  margin-top: 9px;

  color:
    var(--text-muted);

  font-size: 8px;
  line-height: 1.5;

  text-align: center;
}

/* =========================
   FORM
========================= */

.personal-form {
  min-width: 0;
}

.form-grid {
  display: grid;

  gap: 14px;
}

.name-grid {
  grid-template-columns:
    repeat(3, minmax(0, 1fr))
    110px;
}

.personal-details-grid {
  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  margin-top: 17px;
}

.contact-grid {
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
}

.form-field {
  min-width: 0;
}

.field-label {
  display: block;

  margin-bottom: 7px;

  color:
    var(--text-secondary);

  font-size: 10px;
  font-weight: 600;
}

.field-label span {
  color:
    var(--red);
}

/* =========================
   AGE
========================= */

.age-input {
  display: flex;

  width: 100%;
  height: 40px;

  align-items: center;
  gap: 8px;

  padding: 0 12px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);

  font-size: 11px;
}

.age-input svg {
  color:
    var(--text-muted);
}

.age-input .placeholder {
  color:
    var(--text-muted);
}

/* =========================
   GENDER
========================= */

.gender-field {
  margin-top: 17px;
}

/* =========================
   DIVIDER
========================= */

.section-divider {
  display: flex;

  align-items: center;
  gap: 10px;

  margin:
    24px 0 16px;

  padding-top: 18px;

  border-top:
    1px solid var(--border-soft);
}

.divider-icon {
  display: flex;

  width: 30px;
  height: 30px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.section-divider strong,
.section-divider span {
  display: block;
}

.section-divider strong {
  color:
    var(--text-primary);

  font-size: 11px;
  font-weight: 650;
}

.section-divider span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 8px;
}

/* =========================
   ICON INPUT
========================= */

.input-with-icon {
  position: relative;
}

.input-with-icon > svg {
  position: absolute;

  top: 50%;
  left: 12px;

  z-index: 2;

  transform:
    translateY(-50%);

  color:
    var(--text-muted);

  pointer-events: none;
}

.input-with-icon :deep(.app-input) {
  padding-left: 38px;
}

/* =========================
   ADDRESS
========================= */

.address-field {
  margin-top: 17px;
}

.address-label {
  display: flex;

  align-items: center;
  gap: 6px;

  margin-bottom: 7px;

  color:
    var(--text-secondary);
}

.address-label svg {
  color:
    var(--text-muted);
}

.address-label label {
  font-size: 10px;
  font-weight: 600;
}

.address-label span {
  color: var(--red);
}

/* =========================
   RESPONSIVE
========================= */

@media (max-width: 1150px) {
  .name-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .suffix-field {
    max-width: none;
  }

  .personal-details-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 850px) {
  .personal-layout {
    grid-template-columns: 1fr;
  }

  .profile-column {
    padding-right: 0;
    padding-bottom: 22px;

    border-right: 0;

    border-bottom:
      1px solid var(--border-soft);
  }

  .profile-column {
    max-width: 400px;

    margin: 0 auto;

    width: 100%;
  }
}

@media (max-width: 600px) {
  .name-grid,
  .personal-details-grid,
  .contact-grid {
    grid-template-columns: 1fr;
  }
}
</style>
