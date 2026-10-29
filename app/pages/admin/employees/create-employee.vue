<!-- create employee -->
<script setup lang="ts">
import {
  ArrowLeft,
  ArrowRight,
  Save,
} from 'lucide-vue-next'
import type { EmployeeForm } from '~/types/employee-form'

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
  error: showError,
  warning,
} = useToast()

const {
  loading: savingEmployee,
  errors: employeeApiErrors,
  buildEmployeePayload,
  createEmployee,
} = useEmployeeApi()

const saveErrorMessage = ref('')
const saveErrorDetails = ref<string[]>([])

onMounted(() => {
  // Retain existing form data when navigating steps or returning from review
})

/* =========================================================
   STEP LABELS
========================================================= */

const stepLabels: Record<number, string> = {
  1: 'Personal Information',
  2: 'Employment Information',
  3: 'Government Information',
  4: 'Salary Setup',
  5: 'Emergency Contact',
  6: 'Employment Documents',
  7: 'Review',
}

const getSavePreflightErrors = () => {
  const missing: string[] = []

  // Personal Information
  if (!form.value.firstName.trim()) missing.push('First Name')
  if (!form.value.lastName.trim()) missing.push('Last Name')
  if (!form.value.birthDate) missing.push('Birth Date')
  if (!form.value.email.trim()) missing.push('Email Address')
  if (!form.value.address.trim()) missing.push('Residential Address')

  // Employment Information
  if (!form.value.dateHired) missing.push('Date Hired')
  if (form.value.employmentTypeId == null) missing.push('Employment Type')
  if (form.value.departmentId == null) missing.push('Department')
  if (form.value.positionId == null) missing.push('Position')

  // Emergency Contact
  if (!form.value.emergencyContactName.trim()) missing.push('Contact Person Name')
  if (!form.value.emergencyRelationship.trim()) missing.push('Relationship')
  if (!form.value.emergencyMobileNumber.trim()) missing.push('Contact Number')

  // Validate provided salary values without requiring salary setup
  missing.push(...salaryErrors(form.value))

  return missing
}


// Salary setup is optional. Never require Payroll Group / Period during hiring.
const salaryRate = (values: EmployeeForm) => {
  const type = values.salaryType.trim().toLowerCase()
  return type === 'daily' ? values.dailyRate : type === 'hourly' ? values.hourlyRate : values.basicSalary
}

const hasSalaryDetails = (values: EmployeeForm) => Boolean(
  values.salaryTypeId || values.salaryType || values.basicSalary || values.dailyRate ||
  values.hourlyRate || values.allowance || values.bankName || values.accountName || values.accountNumber,
)

const salaryErrors = (values: EmployeeForm): string[] => {
  if (!hasSalaryDetails(values)) return []
  const errors: string[] = []
  if (values.salaryTypeId == null) errors.push('Salary Type')
  const rate = salaryRate(values).trim()
  if (rate && (!Number.isFinite(Number(rate)) || Number(rate) <= 0)) errors.push('Valid Salary Rate')
  const allowance = values.allowance.trim()
  if (allowance && (!Number.isFinite(Number(allowance)) || Number(allowance) < 0)) errors.push('Valid Allowance')
  return errors
}

// Preserve all existing FormData fields (documents/photo), but use salary_setup instead of payroll.
const attachSalarySetup = <T extends FormData | Record<string, unknown>>(payload: T, values: EmployeeForm): T => {
  const included = hasSalaryDetails(values)
  const rate = salaryRate(values).trim()
  const setup = included ? {
    salary_type_id: Number(values.salaryTypeId),
    basic_salary: rate ? Number(rate) : null,
    allowance: values.allowance.trim() ? Number(values.allowance) : null,
    bank_name: values.bankName.trim() || null,
    account_name: values.accountName.trim() || null,
    account_number: values.accountNumber.trim() || null,
  } : null

  if (payload instanceof FormData) {
    const oldKeys: string[] = []
    payload.forEach((_value, key) => {
      if (key === 'payroll' || key.startsWith('payroll[') || key === 'salary_setup' || key.startsWith('salary_setup[')) oldKeys.push(key)
    })
    oldKeys.forEach(key => payload.delete(key))
    if (setup) for (const [key, value] of Object.entries(setup)) {
      if (value != null) payload.set(`salary_setup[${key}]`, String(value))
    }
  } else {
    const fields = payload as Record<string, unknown>
    delete fields.payroll
    delete fields.salary_setup
    if (setup) fields.salary_setup = setup
  }
  return payload
}

const handleSaveEmployee = async () => {
  saveErrorMessage.value = ''
  saveErrorDetails.value = []

  const missing = getSavePreflightErrors()

  if (missing.length) {
    saveErrorMessage.value = 'Required employee information is missing.'
    saveErrorDetails.value = missing.map(field => `${field} is required.`)
    showError('Employee Not Saved', 'Complete the fields shown in the save error details.')
    return
  }

  try {
    const payload = attachSalarySetup(buildEmployeePayload(form.value), form.value)
    const response = await createEmployee(payload)

    console.info('Employee Save Success:', {
      id: response.data.id,
      employeeNumber: response.data.emp_id,
      message: response.message,
    })

    success(
      'Employee Saved',
      `Employee ${response.data.emp_id} was created successfully. Salary setup can be completed later.`,
    )

    resetForm()
    await router.push('/admin/employees')
  } catch (problem: any) {
    const responseData = problem?.data ?? problem?.response?._data ?? {}
    const status = problem?.statusCode ?? problem?.status ?? problem?.response?.status
    const validationErrors = Object.keys(employeeApiErrors.value).length
      ? employeeApiErrors.value
      : (responseData.errors ?? {})

    saveErrorMessage.value = responseData.message
      ?? problem?.message
      ?? 'The backend did not return an error message.'

    saveErrorDetails.value = Object.entries(validationErrors).flatMap(
      ([field, messages]) => (Array.isArray(messages) ? messages : [String(messages)])
        .map(message => `${field}: ${message}`),
    )

    if (!saveErrorDetails.value.length) {
      saveErrorDetails.value.push(
        status ? `Request failed with HTTP status ${status}.` : 'No validation details were returned by the backend.',
      )
    }

    console.groupCollapsed('Employee Save Debug')
    console.error('Request failed:', problem)
    console.error('HTTP status:', status ?? 'unknown')
    console.error('Backend message:', saveErrorMessage.value)
    console.error('Validation errors:', validationErrors)
    console.info('Required database selections:', {
      employmentTypeId: form.value.employmentTypeId,
      departmentId: form.value.departmentId,
      positionId: form.value.positionId,
      workScheduleId: form.value.workScheduleId,
      restDayId: form.value.restDayId,
    })

    console.groupEnd()

    showError('Employee Save Failed', saveErrorMessage.value)
  }
}

const nextLabels: Record<number, string> = {
  1: 'Next: Employment',
  2: 'Next: Government',
  3: 'Next: Salary Setup',
  4: 'Next: Contact',
  5: 'Next: Employment Documents',
  6: 'Next: Review',
}

/* =========================================================
   PERSONAL VALIDATION
========================================================= */

const validatePersonalStep = () => {
  const missing: string[] = []

  if (!form.value.firstName.trim()) missing.push('First Name')
  if (!form.value.lastName.trim()) missing.push('Last Name')
  if (!form.value.birthDate) missing.push('Birth Date')
  if (!form.value.email.trim()) missing.push('Email Address')
  if (!form.value.address.trim()) missing.push('Residential Address')

  if (missing.length) {
    warning('Incomplete Personal Information', `Please complete: ${missing.join(', ')}.`)
    return false
  }

  return true
}

const validateDocumentsStep = () => {
  return true
}

/* =========================================================
   EMPLOYMENT VALIDATION
========================================================= */

const validateEmploymentStep = () => {
  const missing: string[] = []

  if (!form.value.dateHired) missing.push('Date Hired')
  if (form.value.employmentTypeId == null) missing.push('Employment Type')
  if (form.value.departmentId == null) missing.push('Department')
  if (form.value.positionId == null) missing.push('Position')

  if (missing.length) {
    warning('Incomplete Employment Information', `Please complete: ${missing.join(', ')}.`)
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
  const invalid = salaryErrors(form.value)
  if (invalid.length) {
    warning('Incomplete Salary Setup', `Please check: ${invalid.join(', ')}. Or leave this step blank to configure later.`)
    return false
  }
  return true
}

/* =========================================================
   EMERGENCY CONTACT VALIDATION
========================================================= */

const validateEmergencyContactStep = () => {
  const missing: string[] = []

  if (!form.value.emergencyContactName.trim()) missing.push('Contact Person Name')
  if (!form.value.emergencyRelationship.trim()) missing.push('Relationship')
  if (!form.value.emergencyMobileNumber.trim()) missing.push('Contact Number')

  if (missing.length) {
    warning('Incomplete Emergency Contact', `Please complete: ${missing.join(', ')}.`)
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
    `${completedStep} Reviewed`,
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
  router.push('/admin/employees')
}

const handleCancel = () => {
  router.push('/admin/employees')
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

    <div
      v-if="saveErrorMessage"
      class="save-error-panel"
      role="alert"
    >
      <strong>Employee was not saved</strong>
      <p>{{ saveErrorMessage }}</p>

      <ul v-if="saveErrorDetails.length">
        <li
          v-for="detail in saveErrorDetails"
          :key="detail"
        >
          {{ detail }}
        </li>
      </ul>

      <small>
        More technical details are available in the browser console under “Employee Save Debug”.
      </small>
    </div>

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
        :disabled="savingEmployee"
        @click="handleSaveEmployee"
      >
        {{ savingEmployee ? 'Saving Employee...' : 'Save Employee' }}
      </AppButton>

    </div>

  </section>
</template>

<style scoped>
.create-employee-page {
  width: 100%;
  max-width: 1660px;
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

.save-error-panel {
  margin-top: 15px;
  padding: 14px 16px;

  border: 1px solid color-mix(in srgb, var(--red) 35%, var(--border));
  border-radius: 10px;

  background: color-mix(in srgb, var(--red) 8%, var(--bg-card));
  color: var(--text-secondary);

  font-size: 10px;
}

.save-error-panel strong {
  color: var(--red);
  font-size: 12px;
}

.save-error-panel p {
  margin: 5px 0 0;
}

.save-error-panel ul {
  margin: 10px 0;
  padding-left: 18px;
}

.save-error-panel li + li {
  margin-top: 4px;
}

.save-error-panel small {
  color: var(--text-muted);
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
