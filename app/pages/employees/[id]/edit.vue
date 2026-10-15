<script setup lang="ts">
import {
  ArrowLeft,
  ArrowRight,
  Save,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const {
  getEmployeeById,
} = useEmployees()

const {
  form,
  currentStep,
  totalSteps,
  nextStep,
  previousStep,
  goToStep,
  setForm,
} = useEmployeeForm()

const {
  success,
  warning,
  info,
} = useToast()

/* =========================================================
   EMPLOYEE
========================================================= */

const employee = computed(() => {
  return getEmployeeById(
    route.params.id as string,
  )
})

const employeeId = computed(() => {
  return route.params.id as string
})

const employeeName = computed(() => {
  if (!employee.value) {
    return ''
  }

  return [
    employee.value.firstName,
    employee.value.middleName,
    employee.value.lastName,
  ]
    .filter(Boolean)
    .join(' ')
})

/* =========================================================
   LOAD EXISTING EMPLOYEE DATA
========================================================= */

onMounted(() => {
  if (!employee.value) {
    return
  }

  setForm({
    /* PERSONAL */
    firstName:
      employee.value.firstName ?? '',

    middleName:
      employee.value.middleName ?? '',

    lastName:
      employee.value.lastName ?? '',

    suffix: '',

    birthDate:
      employee.value.birthDate ?? '',

    gender:
      employee.value.gender ?? '',

    civilStatus:
      employee.value.civilStatus ?? '',

    email:
      employee.value.email ?? '',

    mobileNumber:
      employee.value.phone ?? '',

    address:
      employee.value.address ?? '',

    profilePhoto: null,

    /* EMPLOYMENT */
    employeeNumber:
      employee.value.employeeNumber ?? '',

    dateHired:
      employee.value.dateHired ?? '',

    department:
      employee.value.department ?? '',

    position:
      employee.value.position ?? '',

    supervisor:
      employee.value.supervisor ?? '',

    employmentType:
      employee.value.employmentType ?? '',

    employmentStatus:
      employee.value.status ?? 'Active',

    branch:
      employee.value.branch ?? '',

    workSchedule:
      employee.value.workSchedule ?? '',

    restDay:
      employee.value.restDay ?? '',

    /* GOVERNMENT */
    sssNumber:
      employee.value.sssNumber ?? '',

    philHealthNumber:
      employee.value.philHealthNumber ?? '',

    pagIbigNumber:
      employee.value.pagIbigNumber ?? '',

    tinNumber:
      employee.value.tinNumber ?? '',

    /* PAYROLL */
    salaryType:
      employee.value.salaryType ?? '',

    basicSalary:
      employee.value.basicSalary !== undefined
        ? String(employee.value.basicSalary)
        : '',

    dailyRate:
      employee.value.dailyRate !== undefined
        ? String(employee.value.dailyRate)
        : '',

    hourlyRate:
      employee.value.hourlyRate !== undefined
        ? String(employee.value.hourlyRate)
        : '',

    allowance:
      employee.value.allowance !== undefined
        ? String(employee.value.allowance)
        : '',

    payrollGroup:
      employee.value.payrollGroup ?? '',

    bankName:
      employee.value.bankName ?? '',

    accountName:
      employee.value.accountName ?? '',

    accountNumber:
      employee.value.accountNumber ?? '',

    /* EMERGENCY CONTACT */
    emergencyContactName:
      employee.value.emergencyContactName ?? '',

    emergencyRelationship:
      employee.value.emergencyRelationship ?? '',

    emergencyMobileNumber:
      employee.value.emergencyMobileNumber ?? '',

    emergencyAddress:
      employee.value.emergencyAddress ?? '',

    /* DOCUMENTS */
    documents:
      employee.value.documents?.map(
        document => ({
          id: String(document.id),
          type: document.type,
          name: document.name,
          file: null,
        }),
      ) ?? [],
  })
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
   DOCUMENT VALIDATION
========================================================= */

const validateDocumentsStep = () => {
  /*
   * Sa Edit Employee, hindi natin pipilitin
   * ang employee na magkaroon agad ng document.
   *
   * Existing employees may have no documents yet.
   */
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
  if (!import.meta.client) {
    return
  }

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
    `${completedStep} Updated`,
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
   SAVE CHANGES
========================================================= */

const handleSaveChanges = () => {
  if (!employee.value) {
    return
  }

  console.log(
    'UPDATED EMPLOYEE DATA:',
    form.value,
  )

  success(
    'Changes Ready',
    'Employee changes have passed the frontend review.',
  )

  /*
   * UI PHASE:
   *
   * Later dito natin tatawagin:
   *
   * PUT /api/employees/:id
   * or
   * PATCH /api/employees/:id
   */

  info(
    'Frontend Only',
    'The employee record has not been saved to the database yet.',
  )
}

/* =========================================================
   NAVIGATION
========================================================= */

const goBack = () => {
  router.push(
    `/employees/${employeeId.value}`,
  )
}

const handleCancel = () => {
  router.push(
    `/employees/${employeeId.value}`,
  )
}
</script>

<template>
  <section class="edit-employee-page">

    <!-- =====================================================
         EMPLOYEE NOT FOUND
    ====================================================== -->
    <div
      v-if="!employee"
      class="employee-not-found"
    >
      <h2>
        Employee Not Found
      </h2>

      <p>
        The employee record you are trying
        to edit does not exist.
      </p>

      <AppButton
        :icon="ArrowLeft"
        @click="router.push('/employees')"
      >
        Back to Employees
      </AppButton>
    </div>

    <!-- =====================================================
         EMPLOYEE FOUND
    ====================================================== -->
    <template v-else>

      <!-- ===================================================
           PAGE HEADER
      ==================================================== -->
      <div class="page-heading">

        <div>
          <button
            type="button"
            class="back-link"
            @click="goBack"
          >
            <ArrowLeft :size="16" />

            Back to Employee Profile
          </button>

          <div class="heading-title-row">
            <div>
              <h1>
                Edit Employee
              </h1>

              <p>
                Update employee information,
                employment records and HR settings.
              </p>
            </div>

            <div class="employee-reference">
              <strong>
                {{ employeeName }}
              </strong>

              <span>
                {{ employee.employeeNumber }}
                ·
                {{ employee.position }}
                ·
                {{ employee.department }}
              </span>
            </div>
          </div>
        </div>

        <AppButton
          variant="secondary"
          @click="handleCancel"
        >
          Cancel
        </AppButton>

      </div>

      <!-- ===================================================
           EDIT NOTICE
      ==================================================== -->
      <div class="edit-notice">
        <div class="notice-indicator" />

        <div>
          <strong>
            Editing Existing Employee
          </strong>

          <p>
            You are updating the current HR record
            of {{ employeeName }}. Review all changes
            before saving.
          </p>
        </div>
      </div>

      <!-- ===================================================
           STEPPER
      ==================================================== -->
      <EmployeeFormStepper
        :current-step="currentStep"
        @change="handleStepChange"
      />

      <!-- ===================================================
           CURRENT STEP
      ==================================================== -->
      <div class="current-step-info">

        <div>
          <span>
            Step
            {{ currentStep }}
            of
            {{ totalSteps }}
          </span>

          <strong>
            {{ stepLabels[currentStep] }}
          </strong>
        </div>

        <span class="step-percentage">
          {{
            Math.round(
              (
                currentStep /
                totalSteps
              ) * 100,
            )
          }}% Complete
        </span>

      </div>

      <!-- ===================================================
           STEP CONTENT
      ==================================================== -->
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

        <!-- STEP 4 -->
        <PayrollInformationForm
          v-else-if="currentStep === 4"
          key="payroll"
        />

        <!-- STEP 5 -->
        <EmergencyContactForm
          v-else-if="currentStep === 5"
          key="emergency-contact"
        />

        <!-- STEP 6 -->
        <EmployeeDocumentsForm
          v-else-if="currentStep === 6"
          key="documents"
        />

        <!-- STEP 7 -->
        <EmployeeReview
          v-else-if="currentStep === 7"
          key="review"
          mode="edit"
          @edit="handleStepChange"
        />

      </Transition>

      <!-- ===================================================
           FOOTER ACTIONS
      ==================================================== -->
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
          @click="handleSaveChanges"
        >
          Save Changes
        </AppButton>

      </div>

    </template>

  </section>
</template>

<style scoped>
.edit-employee-page {
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

  margin-bottom: 16px;
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

.heading-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 18px;
}

.heading-title-row h1 {
  margin: 0;

  color: var(--text-primary);

  font-size: 26px;
  font-weight: 750;

  letter-spacing: -0.6px;
}

.heading-title-row p {
  margin: 6px 0 0;

  color: var(--text-secondary);

  font-size: 11px;
}

/* ==============================
   EMPLOYEE REFERENCE
============================== */

.employee-reference {
  padding-left: 18px;

  border-left:
    1px solid var(--border);
}

.employee-reference strong,
.employee-reference span {
  display: block;
}

.employee-reference strong {
  color: var(--text-primary);

  font-size: 10px;
  font-weight: 650;
}

.employee-reference span {
  margin-top: 3px;

  color: var(--text-muted);

  font-size: 8px;
}

/* ==============================
   EDIT NOTICE
============================== */

.edit-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;

  margin-bottom: 14px;
  padding: 11px 13px;

  border:
    1px solid
    color-mix(
      in srgb,
      var(--primary) 20%,
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

.notice-indicator {
  width: 7px;
  height: 7px;

  flex-shrink: 0;

  margin-top: 4px;

  border-radius: 50%;

  background: var(--primary);

  box-shadow:
    0 0 0 4px var(--primary-soft);
}

.edit-notice strong {
  display: block;

  color: var(--text-primary);

  font-size: 9px;
}

.edit-notice p {
  margin: 3px 0 0;

  color: var(--text-secondary);

  font-size: 8px;
  line-height: 1.5;
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

  transform:
    translateX(8px);
}

.step-leave-to {
  opacity: 0;

  transform:
    translateX(-8px);
}

/* ==============================
   NOT FOUND
============================== */

.employee-not-found {
  display: flex;

  min-height:
    calc(100vh - 180px);

  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;
}

.employee-not-found h2 {
  margin: 0;

  color: var(--text-primary);

  font-size: 18px;
}

.employee-not-found p {
  margin: 6px 0 18px;

  color: var(--text-muted);

  font-size: 10px;
}

/* ==============================
   RESPONSIVE
============================== */

@media (max-width: 800px) {
  .page-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .heading-title-row {
    align-items: flex-start;
  }

  .employee-reference {
    width: 100%;

    padding-top: 10px;
    padding-left: 0;

    border-top:
      1px solid var(--border);

    border-left: 0;
  }
}

@media (max-width: 700px) {
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