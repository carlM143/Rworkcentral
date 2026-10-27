<script setup lang="ts">
import {
  Phone,
  UserRound,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Info,
} from 'lucide-vue-next'

const {
  form,
} = useEmployeeForm()

const relationships = [
  'Spouse',
  'Father',
  'Mother',
  'Brother',
  'Sister',
  'Son',
  'Daughter',
  'Guardian',
  'Relative',
  'Friend',
  'Other',
]

const contactSummary = computed(() => {
  return {
    name:
      form.value.emergencyContactName ||
      'Not provided',

    relationship:
      form.value.emergencyRelationship ||
      'Not selected',

    mobile:
      form.value.emergencyMobileNumber ||
      'Not provided',
  }
})
</script>

<template>
  <FormSection
    title="Emergency Contact"
    description="Provide the employee's primary emergency contact person and contact details."
    :icon="Phone"
  >
    <div class="contact-layout">

      <!-- =========================================
           LEFT SUMMARY
      ========================================== -->
      <aside class="summary-column">

        <div class="summary-heading">
          <div class="summary-main-icon">
            <HeartHandshake :size="29" />
          </div>

          <strong>
            Emergency Contact
          </strong>

          <span>
            Primary contact person
          </span>
        </div>

        <div class="contact-summary">

          <!-- NAME -->
          <div class="summary-item">
            <div class="summary-icon">
              <UserRound :size="15" />
            </div>

            <div>
              <span>
                Contact Person
              </span>

              <strong>
                {{ contactSummary.name }}
              </strong>
            </div>
          </div>

          <!-- RELATIONSHIP -->
          <div class="summary-item">
            <div class="summary-icon">
              <HeartHandshake :size="15" />
            </div>

            <div>
              <span>
                Relationship
              </span>

              <strong>
                {{ contactSummary.relationship }}
              </strong>
            </div>
          </div>

          <!-- MOBILE -->
          <div class="summary-item">
            <div class="summary-icon">
              <Phone :size="15" />
            </div>

            <div>
              <span>
                Mobile Number
              </span>

              <strong>
                {{ contactSummary.mobile }}
              </strong>
            </div>
          </div>

        </div>

        <div class="summary-note">
          This information will only be used when
          HR needs to contact someone during an
          employee emergency or urgent situation.
        </div>

      </aside>

      <!-- =========================================
           RIGHT FORM
      ========================================== -->
      <div class="contact-form">

        <!-- CONTACT PERSON -->
        <div class="section-title">
          <div class="section-title-icon">
            <UserRound :size="17" />
          </div>

          <div>
            <strong>
              Contact Person
            </strong>

            <span>
              Enter the employee's designated
              emergency contact.
            </span>
          </div>
        </div>

        <div class="form-grid two-column">

          <!-- FULL NAME -->
          <div class="form-field">
            <label class="field-label">
              Contact Person Name
              <span>*</span>
            </label>

            <AppInput
              v-model="form.emergencyContactName"
              placeholder="Enter full name"
            />

            <small class="field-hint">
              Full name of the employee's primary
              emergency contact.
            </small>
          </div>

          <!-- RELATIONSHIP -->
          <div class="form-field">
            <label class="field-label">
              Relationship
              <span>*</span>
            </label>

            <AppSelect
              v-model="form.emergencyRelationship"
              :options="relationships"
              placeholder="Select relationship"
            />
          </div>

        </div>

        <!-- CONTACT DETAILS -->
        <div class="section-divider" />

        <div class="section-title">
          <div class="section-title-icon green">
            <Phone :size="17" />
          </div>

          <div>
            <strong>
              Contact Details
            </strong>

            <span>
              Provide a contact number and an optional
              contact address.
            </span>
          </div>
        </div>

        <div class="form-grid two-column">

          <!-- MOBILE -->
          <div class="form-field">
            <label class="field-label">
              Mobile Number
              <span>*</span>
            </label>

            <AppInput
              v-model="form.emergencyMobileNumber"
              placeholder="09XX XXX XXXX"
            />

            <small class="field-hint">
              Primary number HR can call during
              an emergency.
            </small>
          </div>

          <!-- EMPTY FOR BALANCE -->
          <div class="contact-status-card">
            <div class="status-icon">
              <ShieldCheck :size="18" />
            </div>

            <div>
              <strong>
                Primary Emergency Contact
              </strong>

              <span>
                This person will be marked as the
                employee's primary emergency contact.
              </span>
            </div>
          </div>

        </div>

        <!-- ADDRESS -->
        <div class="address-field">
          <div class="address-label">
            <MapPin :size="15" />

            <label>
              Contact Address
            </label>
          </div>

          <AppTextarea
            v-model="form.emergencyAddress"
            placeholder="House/Unit No., Street, Barangay, City/Municipality, Province"
            :rows="4"
            :maxlength="255"
          />
        </div>

        <!-- INFORMATION -->
        <div class="information-card">
          <div class="information-icon">
            <Info :size="18" />
          </div>

          <div>
            <strong>
              Emergency Information
            </strong>

            <p>
              Emergency contact information forms
              part of the employee's confidential
              HR record and should only be accessed
              by authorized personnel.
            </p>
          </div>
        </div>

      </div>
    </div>
  </FormSection>
</template>

<style scoped>
.contact-layout {
  display: grid;

  grid-template-columns:
    230px minmax(0, 1fr);

  gap: 24px;
}

/* =========================
   LEFT SUMMARY
========================= */

.summary-column {
  padding-right: 22px;

  border-right:
    1px solid var(--border-soft);
}

.summary-heading {
  display: flex;
  flex-direction: column;
  align-items: center;

  padding-bottom: 18px;

  text-align: center;
}

.summary-main-icon {
  display: flex;

  width: 72px;
  height: 72px;

  align-items: center;
  justify-content: center;

  margin-bottom: 10px;

  border-radius: 50%;

  background: var(--primary-soft);
  color: var(--primary);
}

.summary-heading strong {
  color: var(--text-primary);

  font-size: 12px;
  font-weight: 700;
}

.summary-heading span {
  margin-top: 3px;

  color: var(--text-muted);

  font-size: 9px;
}

.contact-summary {
  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 10px;

  background: var(--bg-card-soft);
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 9px;

  padding: 11px;

  border-bottom:
    1px solid var(--border-soft);
}

.summary-item:last-child {
  border-bottom: 0;
}

.summary-icon {
  display: flex;

  width: 30px;
  height: 30px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: var(--primary-soft);
  color: var(--primary);
}

.summary-item span,
.summary-item strong {
  display: block;
}

.summary-item span {
  color: var(--text-muted);

  font-size: 8px;
}

.summary-item strong {
  margin-top: 2px;

  color: var(--text-primary);

  font-size: 9px;
  font-weight: 600;
}

.summary-note {
  margin-top: 13px;

  padding: 10px;

  border-radius: 8px;

  background: var(--primary-soft);
  color: var(--text-secondary);

  font-size: 8px;
  line-height: 1.55;
}

/* =========================
   FORM
========================= */

.contact-form {
  min-width: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 9px;

  margin-bottom: 15px;
}

.section-title-icon {
  display: flex;

  width: 32px;
  height: 32px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: var(--primary-soft);
  color: var(--primary);
}

.section-title-icon.green {
  background: var(--green-soft);
  color: var(--green);
}

.section-title strong,
.section-title span {
  display: block;
}

.section-title strong {
  color: var(--text-primary);

  font-size: 11px;
  font-weight: 650;
}

.section-title span {
  margin-top: 2px;

  color: var(--text-muted);

  font-size: 8px;
}

/* =========================
   GRID
========================= */

.form-grid {
  display: grid;

  gap: 14px;
}

.two-column {
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
}

.form-field {
  min-width: 0;
}

.field-label {
  display: block;

  margin-bottom: 7px;

  color: var(--text-secondary);

  font-size: 10px;
  font-weight: 600;
}

.field-label span {
  color: var(--red);
}

.field-hint {
  display: block;

  margin-top: 5px;

  color: var(--text-muted);

  font-size: 8px;
}

.section-divider {
  height: 1px;

  margin: 24px 0 18px;

  background: var(--border-soft);
}

/* =========================
   STATUS CARD
========================= */

.contact-status-card {
  display: flex;
  align-items: center;
  gap: 10px;

  min-height: 68px;

  padding: 11px;

  border: 1px solid var(--border);
  border-radius: 9px;

  background: var(--bg-card-soft);
}

.status-icon {
  display: flex;

  width: 36px;
  height: 36px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background: var(--green-soft);
  color: var(--green);
}

.contact-status-card strong,
.contact-status-card span {
  display: block;
}

.contact-status-card strong {
  color: var(--text-primary);

  font-size: 9px;
}

.contact-status-card span {
  margin-top: 3px;

  color: var(--text-muted);

  font-size: 8px;
  line-height: 1.4;
}

/* =========================
   ADDRESS
========================= */

.address-field {
  margin-top: 18px;
}

.address-label {
  display: flex;
  align-items: center;
  gap: 6px;

  margin-bottom: 7px;

  color: var(--text-secondary);
}

.address-label svg {
  color: var(--text-muted);
}

.address-label label {
  font-size: 10px;
  font-weight: 600;
}

.address-label span {
  color: var(--red);
}

/* =========================
   INFORMATION CARD
========================= */

.information-card {
  display: flex;
  align-items: flex-start;
  gap: 11px;

  margin-top: 22px;
  padding: 13px;

  border: 1px solid
    color-mix(
      in srgb,
      var(--primary) 18%,
      var(--border)
    );

  border-radius: 9px;

  background:
    color-mix(
      in srgb,
      var(--primary-soft) 55%,
      var(--bg-card)
    );
}

.information-icon {
  display: flex;

  width: 34px;
  height: 34px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: var(--primary-soft);
  color: var(--primary);
}

.information-card strong {
  display: block;

  color: var(--text-primary);

  font-size: 10px;
}

.information-card p {
  margin: 4px 0 0;

  color: var(--text-secondary);

  font-size: 8px;
  line-height: 1.55;
}

/* =========================
   RESPONSIVE
========================= */

@media (max-width: 900px) {
  .contact-layout {
    grid-template-columns: 1fr;
  }

  .summary-column {
    max-width: 450px;
    width: 100%;

    margin: 0 auto;
    padding-right: 0;
    padding-bottom: 20px;

    border-right: 0;
    border-bottom:
      1px solid var(--border-soft);
  }
}

@media (max-width: 650px) {
  .two-column {
    grid-template-columns: 1fr;
  }
}
</style>
