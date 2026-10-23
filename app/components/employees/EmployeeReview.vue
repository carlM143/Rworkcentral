<script setup lang="ts">
import {
  ClipboardCheck,
  UserRound,
  BriefcaseBusiness,
  Landmark,
  WalletCards,
  Phone,
  Files,
  CheckCircle2,
  Pencil,
  FileText,
} from 'lucide-vue-next'

const emit = defineEmits<{
  edit: [step: number]
}>()

const props = withDefaults(
  defineProps<{
    mode?: 'create' | 'edit'
  }>(),
  {
    mode: 'create',
  },
)

const {
  form,
} = useEmployeeForm()

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

const salaryDisplay = computed(() => {
  if (form.value.salaryType === 'Monthly') {
    return formatCurrency(form.value.basicSalary)
  }

  if (form.value.salaryType === 'Daily') {
    return `${formatCurrency(form.value.dailyRate)} / day`
  }

  if (form.value.salaryType === 'Hourly') {
    return `${formatCurrency(form.value.hourlyRate)} / hour`
  }

  return 'Not provided'
})

function formatCurrency(
  value?: string,
) {
  if (!value) {
    return 'Not provided'
  }

  const amount = Number(value)

  if (Number.isNaN(amount)) {
    return value
  }

  return new Intl.NumberFormat(
    'en-PH',
    {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    },
  ).format(amount)
}

const displayValue = (
  value?: string,
) => {
  return value?.trim()
    ? value
    : 'Not provided'
}

const isEditMode = computed(() => {
  return props.mode === 'edit'
})

const reviewTitle = computed(() => {
  return isEditMode.value
    ? 'Review Employee Changes'
    : 'Review Employee Information'
})

const reviewDescription = computed(() => {
  return isEditMode.value
    ? 'Review all employee information before saving the changes.'
    : 'Review all employee information before creating the official employee record.'
})

const finalTitle = computed(() => {
  return isEditMode.value
    ? 'Ready to Save Changes'
    : 'Ready to Create Employee'
})

const finalDescription = computed(() => {
  return isEditMode.value
    ? 'Please verify all information above. Click Save Changes when the employee record is ready to be updated.'
    : 'Please verify all information above. Click Save Employee when the employee record is ready to be created.'
})
</script>

<template>
  <FormSection
  :title="reviewTitle"
  :description="reviewDescription"
  :icon="ClipboardCheck"
  >
    <div class="review-layout">

      <!-- ==================================================
           LEFT SUMMARY
      =================================================== -->
      <aside class="summary-column">
        <div class="employee-summary">
          <div class="summary-avatar">
            <UserRound :size="30" />
          </div>

          <strong>
            {{ fullName || 'New Employee' }}
          </strong>

        </div>

        <div class="summary-status">
          <div class="status-icon">
            <CheckCircle2 :size="18" />
          </div>

          <div>
            <strong>
              Ready for Review
            </strong>

            <span>
              Verify the information before saving.
            </span>
          </div>
        </div>

        <div class="summary-items">
          <div class="summary-item">
            <span>Department</span>

            <strong>
              {{ displayValue(form.department) }}
            </strong>
          </div>

          <div class="summary-item">
            <span>Position</span>

            <strong>
              {{ displayValue(form.position) }}
            </strong>
          </div>

          <div class="summary-item">
            <span>Employment</span>

            <strong>
              {{ displayValue(form.employmentType) }}
            </strong>
          </div>

          <div class="summary-item">
            <span>Documents</span>

            <strong>
              {{ form.documents.length }}
              uploaded
            </strong>
          </div>
        </div>

        <div class="summary-note">
          Once saved, this information will become
          part of the employee's official HRIS
          master record.
        </div>
      </aside>

      <!-- ==================================================
           RIGHT CONTENT
      =================================================== -->
      <div class="review-content">

        <!-- ================================================
             PERSONAL
        ================================================= -->
        <section class="review-card">
          <div class="card-header">
            <div class="card-heading">
              <div class="card-icon">
                <UserRound :size="17" />
              </div>

              <div>
                <strong>
                  Personal Information
                </strong>

                <span>
                  Basic identity and contact information
                </span>
              </div>
            </div>

            <button
              type="button"
              class="edit-button"
              @click="emit('edit', 1)"
            >
              <Pencil :size="13" />

              Edit
            </button>
          </div>

          <div class="details-grid">
            <div class="detail-item">
              <span>Full Name</span>
              <strong>{{ fullName }}</strong>
            </div>

            <div class="detail-item">
              <span>Birth Date</span>
              <strong>
                {{ displayValue(form.birthDate) }}
              </strong>
            </div>

            <div class="detail-item">
              <span>Gender</span>
              <strong>
                {{ displayValue(form.gender) }}
              </strong>
            </div>

            <div class="detail-item">
              <span>Civil Status</span>
              <strong>
                {{ displayValue(form.civilStatus) }}
              </strong>
            </div>

            <div class="detail-item">
              <span>Email Address</span>
              <strong>
                {{ displayValue(form.email) }}
              </strong>
            </div>

            <div class="detail-item">
              <span>Mobile Number</span>
              <strong>
                {{ displayValue(form.mobileNumber) }}
              </strong>
            </div>

            <div class="detail-item full-width">
              <span>Residential Address</span>
              <strong>
                {{ displayValue(form.address) }}
              </strong>
            </div>
          </div>
        </section>

        <!-- ================================================
             EMPLOYMENT
        ================================================= -->
        <section class="review-card">
          <div class="card-header">
            <div class="card-heading">
              <div class="card-icon green">
                <BriefcaseBusiness :size="17" />
              </div>

              <div>
                <strong>
                  Employment Information
                </strong>

                <span>
                  Assignment and employment setup
                </span>
              </div>
            </div>

            <button
              type="button"
              class="edit-button"
              @click="emit('edit', 2)"
            >
              <Pencil :size="13" />

              Edit
            </button>
          </div>

          <div class="details-grid">
            <div class="detail-item">
              <span>Date Hired</span>
              <strong>
                {{ displayValue(form.dateHired) }}
              </strong>
            </div>

            <div class="detail-item">
              <span>Department</span>
              <strong>
                {{ displayValue(form.department) }}
              </strong>
            </div>

            <div class="detail-item">
              <span>Position / Designation</span>
              <strong>
                {{ displayValue(form.position) }}
              </strong>
            </div>

            <div class="detail-item">
              <span>Employment Type</span>
              <strong>
                {{ displayValue(form.employmentType) }}
              </strong>
            </div>

            <div class="detail-item">
              <span>Work Schedule</span>
              <strong>
                {{ displayValue(form.workSchedule) }}
              </strong>
            </div>

            <div class="detail-item">
              <span>Rest Day</span>
              <strong>
                {{ displayValue(form.restDay) }}
              </strong>
            </div>
          </div>
        </section>

        <!-- ================================================
             GOVERNMENT
        ================================================= -->
        <section class="review-card">
          <div class="card-header">
            <div class="card-heading">
              <div class="card-icon purple">
                <Landmark :size="17" />
              </div>

              <div>
                <strong>
                  Government Information
                </strong>

                <span>
                  Statutory identification records
                </span>
              </div>
            </div>

            <button
              type="button"
              class="edit-button"
              @click="emit('edit', 3)"
            >
              <Pencil :size="13" />

              Edit
            </button>
          </div>

          <div class="details-grid">
            <div class="detail-item">
              <span>SSS Number</span>
              <strong>
                {{ displayValue(form.sssNumber) }}
              </strong>
            </div>

            <div class="detail-item">
              <span>PhilHealth Number</span>
              <strong>
                {{ displayValue(form.philHealthNumber) }}
              </strong>
            </div>

            <div class="detail-item">
              <span>Pag-IBIG MID</span>
              <strong>
                {{ displayValue(form.pagIbigNumber) }}
              </strong>
            </div>

            <div class="detail-item">
              <span>TIN</span>
              <strong>
                {{ displayValue(form.tinNumber) }}
              </strong>
            </div>
          </div>
        </section>

        <!-- ================================================
             PAYROLL
        ================================================= -->
        <section class="review-card">
          <div class="card-header">
            <div class="card-heading">
              <div class="card-icon orange">
                <WalletCards :size="17" />
              </div>

              <div>
                <strong>
                  Payroll Information
                </strong>

                <span>
                  Compensation and payment setup
                </span>
              </div>
            </div>

            <button
              type="button"
              class="edit-button"
              @click="emit('edit', 4)"
            >
              <Pencil :size="13" />

              Edit
            </button>
          </div>

          <div class="details-grid">
            <div class="detail-item">
              <span>Salary Type</span>
              <strong>
                {{ displayValue(form.salaryType) }}
              </strong>
            </div>

            <div class="detail-item">
              <span>Primary Rate</span>
              <strong>
                {{ salaryDisplay }}
              </strong>
            </div>

            <div class="detail-item">
              <span>Fixed Allowance</span>
              <strong>
                {{
                  form.allowance
                    ? formatCurrency(form.allowance)
                    : 'No allowance'
                }}
              </strong>
            </div>

            <div class="detail-item">
              <span>Payroll Group</span>
              <strong>
                {{ displayValue(form.payrollGroup) }}
              </strong>
            </div>

            <div class="detail-item">
              <span>Bank Name</span>
              <strong>
                {{ displayValue(form.bankName) }}
              </strong>
            </div>

            <div class="detail-item">
              <span>Account Name</span>
              <strong>
                {{ displayValue(form.accountName) }}
              </strong>
            </div>

            <div class="detail-item">
              <span>Account Number</span>
              <strong>
                {{ displayValue(form.accountNumber) }}
              </strong>
            </div>
          </div>
        </section>

        <!-- ================================================
             EMERGENCY CONTACT
        ================================================= -->
        <section class="review-card">
          <div class="card-header">
            <div class="card-heading">
              <div class="card-icon red">
                <Phone :size="17" />
              </div>

              <div>
                <strong>
                  Emergency Contact
                </strong>

                <span>
                  Primary emergency contact details
                </span>
              </div>
            </div>

            <button
              type="button"
              class="edit-button"
              @click="emit('edit', 5)"
            >
              <Pencil :size="13" />

              Edit
            </button>
          </div>

          <div class="details-grid">
            <div class="detail-item">
              <span>Contact Person</span>
              <strong>
                {{
                  displayValue(
                    form.emergencyContactName,
                  )
                }}
              </strong>
            </div>

            <div class="detail-item">
              <span>Relationship</span>
              <strong>
                {{
                  displayValue(
                    form.emergencyRelationship,
                  )
                }}
              </strong>
            </div>

            <div class="detail-item">
              <span>Mobile Number</span>
              <strong>
                {{
                  displayValue(
                    form.emergencyMobileNumber,
                  )
                }}
              </strong>
            </div>

            <div class="detail-item full-width">
              <span>Contact Address</span>
              <strong>
                {{
                  displayValue(
                    form.emergencyAddress,
                  )
                }}
              </strong>
            </div>
          </div>
        </section>

        <!-- ================================================
             DOCUMENTS
        ================================================= -->
        <section class="review-card">
          <div class="card-header">
            <div class="card-heading">
              <div class="card-icon">
                <Files :size="17" />
              </div>

              <div>
                <strong>
                  Employment Documents
                </strong>

                <span>
                  {{ form.documents.length }}
                  uploaded document(s)
                </span>
              </div>
            </div>

            <button
              type="button"
              class="edit-button"
              @click="emit('edit', 6)"
            >
              <Pencil :size="13" />

              Edit
            </button>
          </div>

          <div class="document-list">
            <div
              v-for="document in form.documents"
              :key="document.id"
              class="document-item"
            >
              <div class="document-icon">
                <FileText :size="16" />
              </div>

              <div>
                <strong>
                  {{ document.type }}
                </strong>

                <span>
                  {{ document.name }}
                </span>
              </div>

              <div class="ready-status">
                <CheckCircle2 :size="13" />

                Ready
              </div>
            </div>
          </div>
        </section>

        <!-- FINAL NOTICE -->
        <div class="final-notice">
          <CheckCircle2 :size="20" />

          <div>
            <strong>
              {{ finalTitle }}
            </strong>

            <p>
              {{ finalDescription }}
            </p>
          </div>
        </div>

      </div>
    </div>
  </FormSection>
</template>

<style scoped>
.review-layout {
  display: grid;
  grid-template-columns:
    230px minmax(0, 1fr);
  gap: 24px;
}

.summary-column {
  padding-right: 22px;

  border-right:
    1px solid var(--border-soft);
}

.employee-summary {
  display: flex;
  flex-direction: column;
  align-items: center;

  padding-bottom: 18px;

  text-align: center;
}

.summary-avatar {
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

.employee-summary strong {
  color: var(--text-primary);
  font-size: 12px;
}

.employee-summary span {
  margin-top: 3px;

  color: var(--text-muted);
  font-size: 9px;
}

.summary-status {
  display: flex;
  align-items: center;
  gap: 9px;

  margin-bottom: 12px;
  padding: 11px;

  border: 1px solid var(--border);
  border-radius: 9px;

  background: var(--green-soft);
}

.status-icon {
  display: flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;

  border-radius: 8px;

  color: var(--green);
}

.summary-status strong,
.summary-status span {
  display: block;
}

.summary-status strong {
  color: var(--text-primary);
  font-size: 9px;
}

.summary-status span {
  margin-top: 2px;

  color: var(--text-secondary);
  font-size: 7px;
}

.summary-items {
  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 9px;

  background: var(--bg-card-soft);
}

.summary-item {
  padding: 10px;

  border-bottom:
    1px solid var(--border-soft);
}

.summary-item:last-child {
  border-bottom: 0;
}

.summary-item span,
.summary-item strong {
  display: block;
}

.summary-item span {
  color: var(--text-muted);
  font-size: 7px;
}

.summary-item strong {
  margin-top: 2px;

  color: var(--text-primary);
  font-size: 9px;
}

.summary-note {
  margin-top: 12px;
  padding: 10px;

  border-radius: 8px;

  background: var(--primary-soft);
  color: var(--text-secondary);

  font-size: 8px;
  line-height: 1.5;
}

.review-content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 12px;
}

.review-card {
  overflow: hidden;

  border: 1px solid var(--border);
  border-radius: 10px;

  background: var(--bg-card-soft);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  padding: 11px 13px;

  border-bottom:
    1px solid var(--border-soft);
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 9px;
}

.card-icon {
  display: flex;
  width: 31px;
  height: 31px;
  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background: var(--primary-soft);
  color: var(--primary);
}

.card-icon.green {
  background: var(--green-soft);
  color: var(--green);
}

.card-icon.orange {
  background: var(--orange-soft);
  color: var(--orange);
}

.card-icon.purple {
  background: var(--purple-soft);
  color: var(--purple);
}

.card-icon.red {
  background: var(--red-soft);
  color: var(--red);
}

.card-heading strong,
.card-heading span {
  display: block;
}

.card-heading strong {
  color: var(--text-primary);
  font-size: 10px;
}

.card-heading span {
  margin-top: 2px;

  color: var(--text-muted);
  font-size: 7px;
}

.edit-button {
  display: flex;
  align-items: center;
  gap: 5px;

  padding: 6px 9px;

  border: 1px solid var(--border);
  border-radius: 7px;

  background: var(--bg-card);
  color: var(--primary);

  font-size: 8px;
  font-weight: 600;
}

.edit-button:hover {
  border-color: var(--primary);
}

.details-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));

  gap: 0;

  padding: 4px 13px 12px;
}

.detail-item {
  padding: 9px 6px;

  border-bottom:
    1px solid var(--border-soft);
}

.detail-item:nth-last-child(-n + 2) {
  border-bottom: 0;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item span,
.detail-item strong {
  display: block;
}

.detail-item span {
  color: var(--text-muted);
  font-size: 7px;
}

.detail-item strong {
  margin-top: 3px;

  color: var(--text-primary);
  font-size: 9px;
  font-weight: 600;

  word-break: break-word;
}

.document-list {
  display: flex;
  flex-direction: column;
  gap: 7px;

  padding: 11px 13px;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 9px;

  padding: 9px;

  border: 1px solid var(--border);
  border-radius: 8px;

  background: var(--bg-card);
}

.document-icon {
  display: flex;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  border-radius: 7px;

  background: var(--primary-soft);
  color: var(--primary);
}

.document-item > div:nth-child(2) {
  min-width: 0;
  flex: 1;
}

.document-item strong,
.document-item span {
  display: block;
}

.document-item strong {
  color: var(--text-primary);
  font-size: 9px;
}

.document-item span {
  overflow: hidden;

  margin-top: 2px;

  color: var(--text-muted);
  font-size: 7px;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.ready-status {
  display: flex;
  align-items: center;
  gap: 4px;

  color: var(--green);

  font-size: 8px;
  font-weight: 600;
}

.final-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;

  padding: 13px;

  border: 1px solid
    color-mix(
      in srgb,
      var(--green) 25%,
      var(--border)
    );

  border-radius: 9px;

  background: var(--green-soft);
  color: var(--green);
}

.final-notice strong {
  display: block;

  color: var(--text-primary);
  font-size: 10px;
}

.final-notice p {
  margin: 3px 0 0;

  color: var(--text-secondary);
  font-size: 8px;
  line-height: 1.5;
}

@media (max-width: 900px) {
  .review-layout {
    grid-template-columns: 1fr;
  }

  .summary-column {
    padding-right: 0;
    padding-bottom: 20px;

    border-right: 0;
    border-bottom:
      1px solid var(--border-soft);
  }
}

@media (max-width: 650px) {
  .details-grid {
    grid-template-columns: 1fr;
  }

  .detail-item,
  .detail-item:nth-last-child(-n + 2) {
    border-bottom:
      1px solid var(--border-soft);
  }

  .detail-item:last-child {
    border-bottom: 0;
  }
}
</style>
