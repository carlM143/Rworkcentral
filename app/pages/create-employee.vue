<script setup lang="ts">
import {
  ArrowLeft,
  ArrowRight,
  Save,
} from 'lucide-vue-next'

const router = useRouter()

const {
  form,
  currentStep,
  totalSteps,
  nextStep,
  previousStep,
  goToStep,
  resetForm,
} = useEmployeeForm()

const {
  success,
  warning,
} = useToast()

onMounted(() => {
  resetForm()
})

/* =========================================================
   STEP LABELS
========================================================= */

const stepLabels: Record<number, string> = {
  1: 'Personal Information',
  2: 'Employment Information',
  3: 'Government Information',
  4: 'Payroll Information',
  5: 'Emergency Contact',
  6: 'Documents',
  7: 'Review',
}

const handleSaveEmployee = () => {
  console.log(
    'FINAL EMPLOYEE DATA:',
    form.value,
  )

  success(
    'Employee Ready',
    'Employee information has passed the frontend review.',
  )

  /*
   * UI phase pa lang.
   * Dito natin tatawagin later
   * ang Laravel API.
   */
}

const nextLabels: Record<number, string> = {
  1: 'Next: Employment',
  2: 'Next: Government',
  3: 'Next: Payroll',
  4: 'Next: Contact',
  5: 'Next: Documents',
  6: 'Next: Review',
}

/* =========================================================
   PERSONAL VALIDATION
========================================================= */

const validatePersonalStep = () => {
  const missing: string[] = []

  if (!form.value.firstName.trim()) {
    missing.push('First Name')
  }

  if (!form.value.lastName.trim()) {
    missing.push('Last Name')
  }

  if (!form.value.birthDate) {
    missing.push('Birth Date')
  }

  if (!form.value.gender) {
    missing.push('Gender')
  }

  if (missing.length) {
    warning(
      'Incomplete Personal Information',
      `Please complete: ${missing.join(', ')}.`,
    )

    return false
  }

  return true
}

const validateDocumentsStep = () => {
  if (!form.value.documents.length) {
    warning(
      'No Documents Added',
      'Please upload at least one employee document before continuing.',
    )

    return false
  }

  return true
}

/* =========================================================
   EMPLOYMENT VALIDATION
========================================================= */

const validateEmploymentStep = () => {
  const missing: string[] = []

  if (!form.value.employeeNumber.trim()) {
    missing.push('Employee ID')
  }

  if (!form.value.dateHired) {
    missing.push('Date Hired')
  }

  if (!form.value.department) {
    missing.push('Department')
  }

  if (!form.value.position) {
    missing.push('Position')
  }

  if (!form.value.employmentType) {
    missing.push('Employment Type')
  }

  if (!form.value.employmentStatus) {
    missing.push('Employment Status')
  }

  if (missing.length) {
    warning(
      'Incomplete Employment Information',
      `Please complete: ${missing.join(', ')}.`,
    )

    return false
  }

  return true
}

/* =========================================================
   GOVERNMENT VALIDATION
========================================================= */

const validateGovernmentStep = () => {
  /*
   * Optional muna ang government IDs.
   */
  return true
}

/* =========================================================
   PAYROLL VALIDATION
========================================================= */

const validatePayrollStep = () => {
  const missing: string[] = []

  if (!form.value.salaryType) {
    missing.push('Salary Type')
  }

  if (!form.value.payrollGroup) {
    missing.push('Payroll Group')
  }

  if (
    form.value.salaryType === 'Monthly' &&
    !form.value.basicSalary
  ) {
    missing.push('Basic Monthly Salary')
  }

  if (
    form.value.salaryType === 'Daily' &&
    !form.value.dailyRate
  ) {
    missing.push('Daily Rate')
  }

  if (
    form.value.salaryType === 'Hourly' &&
    !form.value.hourlyRate
  ) {
    missing.push('Hourly Rate')
  }

  if (missing.length) {
    warning(
      'Incomplete Payroll Information',
      `Please complete: ${missing.join(', ')}.`,
    )

    return false
  }

  return true
}

/* =========================================================
   EMERGENCY CONTACT VALIDATION
========================================================= */

const validateEmergencyContactStep = () => {
  const missing: string[] = []

  if (
    !form.value.emergencyContactName.trim()
  ) {
    missing.push('Contact Person')
  }

  if (
    !form.value.emergencyRelationship
  ) {
    missing.push('Relationship')
  }

  if (
    !form.value.emergencyMobileNumber.trim()
  ) {
    missing.push('Mobile Number')
  }

  if (missing.length) {
    warning(
      'Incomplete Emergency Contact',
      `Please complete: ${missing.join(', ')}.`,
    )

    return false
  }

  return true
}

/* =========================================================
   CURRENT STEP VALIDATION
========================================================= */

const validateCurrentStep = () => {
  if (currentStep.value === 1) {
    return validatePersonalStep()
  }

  if (currentStep.value === 2) {
    return validateEmploymentStep()
  }

  if (currentStep.value === 3) {
    return validateGovernmentStep()
  }

  if (currentStep.value === 4) {
    return validatePayrollStep()
  }

  if (currentStep.value === 5) {
    return validateEmergencyContactStep()
  }

  if (currentStep.value === 6) {
    return validateDocumentsStep()
  }

  return true
}

/* =========================================================
   SCROLL
========================================================= */

const scrollToTop = () => {
  if (!import.meta.client) return

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

/* =========================================================
   NEXT
========================================================= */

const handleNext = () => {
  if (!validateCurrentStep()) {
    return
  }

  const completedStep =
    stepLabels[currentStep.value]

  nextStep()

  success(
    `${completedStep} Completed`,
    `You can continue to ${stepLabels[currentStep.value]}.`,
  )

  scrollToTop()
}

/* =========================================================
   PREVIOUS
========================================================= */

const handlePrevious = () => {
  if (currentStep.value === 1) {
    return
  }

  previousStep()

  scrollToTop()
}

/* =========================================================
   STEPPER
========================================================= */

const handleStepChange = (
  step: number,
) => {
  goToStep(step)

  scrollToTop()
}

/* =========================================================
   CANCEL / BACK
========================================================= */

const goBack = () => {
  router.push('/employees')
}

const handleCancel = () => {
  router.push('/employees')
}
</script>

<template>
  <section class="create-employee-page">

    <!-- =====================================================
         PAGE HEADER
    ====================================================== -->
    <div class="page-heading">
      <div>
        <button
          type="button"
          class="back-link"
          @click="goBack"
        >
          <ArrowLeft :size="16" />

          Back to Employees
        </button>

        <h1>
          Add New Employee
        </h1>

        <p>
          Create a complete employee record
          and configure the required HR
          information.
        </p>
      </div>

      <AppButton
        variant="secondary"
        @click="handleCancel"
      >
        Cancel
      </AppButton>
    </div>

    <!-- =====================================================
         STEPPER
    ====================================================== -->
    <EmployeeFormStepper
      :current-step="currentStep"
      @change="handleStepChange"
    />

    <!-- =====================================================
         CURRENT STEP INFORMATION
    ====================================================== -->
    <div class="current-step-info">
      <div>
        <span>
          Step {{ currentStep }} of {{ totalSteps }}
        </span>

        <strong>
          {{ stepLabels[currentStep] }}
        </strong>
      </div>

      <span class="step-percentage">
        {{
          Math.round(
            (currentStep / totalSteps) * 100,
          )
        }}% Complete
      </span>
    </div>

    <!-- =====================================================
         STEP CONTENT
    ====================================================== -->
    <Transition
      name="step"
      mode="out-in"
    >

      <!-- STEP 1 -->
      <PersonalInformationForm
        v-if="currentStep === 1"
        key="personal"
      />

      <!-- STEP 2 -->
      <EmploymentInformationForm
        v-else-if="currentStep === 2"
        key="employment"
      />

      <!-- STEP 3 -->
      <GovernmentInformationForm
        v-else-if="currentStep === 3"
        key="government"
      />

      <PayrollInformationForm
        v-else-if="currentStep === 4"
        key="payroll"
      />

      <EmergencyContactForm
        v-else-if="currentStep === 5"
        key="emergency-contact"
      />

      <EmployeeDocumentsForm
        v-else-if="currentStep === 6"
        key="documents"
      />

      <EmployeeReview
        v-else-if="currentStep === 7"
        key="review"
        mode="create"
        @edit="handleStepChange"
      />

    </Transition>

    <!-- =====================================================
         FOOTER ACTIONS
    ====================================================== -->
    <div class="form-actions">

      <!-- LEFT -->
      <div>
        <AppButton
          v-if="currentStep === 1"
          variant="secondary"
          :icon="ArrowLeft"
          @click="handleCancel"
        >
          Cancel
        </AppButton>

        <AppButton
          v-else
          variant="secondary"
          :icon="ArrowLeft"
          @click="handlePrevious"
        >
          Previous
        </AppButton>
      </div>

      <!-- RIGHT -->
      <AppButton
        v-if="currentStep < 7"
        :icon="ArrowRight"
        @click="handleNext"
      >
        {{
          nextLabels[currentStep] ||
          'Continue'
        }}
      </AppButton>

      <AppButton
        v-else
        :icon="Save"
        @click="handleSaveEmployee"
      >
        Save Employee
      </AppButton>

    </div>

  </section>
</template>

<style scoped>
.create-employee-page {
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
}

/* ==============================
   HEADER
============================== */

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;

  margin-bottom: 20px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  margin-bottom: 10px;
  padding: 0;

  border: 0;

  background: transparent;
  color: var(--primary);

  font-size: 10px;
  font-weight: 600;
}

.back-link:hover {
  text-decoration: underline;
}

.page-heading h1 {
  margin: 0;

  color: var(--text-primary);

  font-size: 26px;
  font-weight: 750;
  letter-spacing: -0.6px;
}

.page-heading p {
  margin: 6px 0 0;

  color: var(--text-secondary);

  font-size: 11px;
}

/* ==============================
   CURRENT STEP
============================== */

.current-step-info {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 11px;
  padding: 0 3px;
}

.current-step-info div > span {
  display: block;

  margin-bottom: 2px;

  color: var(--text-muted);

  font-size: 8px;
  font-weight: 600;

  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.current-step-info strong {
  color: var(--text-primary);

  font-size: 11px;
}

.step-percentage {
  color: var(--primary);

  font-size: 9px;
  font-weight: 600;
}

/* ==============================
   FUTURE STEP
============================== */

.future-step {
  display: flex;
  min-height: 330px;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  border: 1px solid var(--border);
  border-radius: 12px;

  background: var(--bg-card);

  box-shadow: var(--shadow);

  text-align: center;
}

.future-step-icon {
  display: flex;
  width: 48px;
  height: 48px;

  align-items: center;
  justify-content: center;

  margin-bottom: 12px;

  border-radius: 12px;

  background: var(--primary-soft);
  color: var(--primary);

  font-size: 17px;
  font-weight: 700;
}

.future-step h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 14px;
}

.future-step p {
  margin: 5px 0 0;

  color: var(--text-muted);

  font-size: 10px;
}

/* ==============================
   ACTIONS
============================== */

.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-top: 15px;
  padding: 14px 0 5px;
}

/* ==============================
   TRANSITION
============================== */

.step-enter-active,
.step-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.step-enter-from {
  opacity: 0;
  transform: translateX(8px);
}

.step-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

/* ==============================
   RESPONSIVE
============================== */

@media (max-width: 700px) {
  .page-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .current-step-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .form-actions {
    gap: 10px;
  }
}
</style>