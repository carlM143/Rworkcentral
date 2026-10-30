<!-- edit employee -->
<script setup lang="ts">
import { ArrowLeft, ArrowRight, Save } from 'lucide-vue-next'
import type { EmployeeForm } from '~/types/employee-form'

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()
const { form, currentStep, totalSteps, nextStep, previousStep, goToStep, setForm } = useEmployeeForm()
const { success, warning, error: showError } = useToast()

interface EmployeeSummary {
  id: number
  employeeNumber: string
  firstName: string
  middleName: string
  lastName: string
  position: string
  department: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

const employee = ref<EmployeeSummary | null>(null)
const loadingEmployee = ref(true)
const savingEmployee = ref(false)
const employeeError = ref('')
const saveError = ref('')

const employeeId = computed(() => {
  const id = route.query.id
  return typeof id === 'string' && /^[1-9]\d*$/.test(id) ? id : ''
})

const employeeName = computed(() => employee.value
  ? [employee.value.firstName, employee.value.middleName, employee.value.lastName].filter(Boolean).join(' ')
  : ''
)

const firstRecord = (value: any) => Array.isArray(value) ? (value[0] ?? {}) : (value ?? {})
const asArray = (value: any): any[] => Array.isArray(value) ? value : []
const dateOnly = (value: any) => value ? String(value).slice(0, 10) : ''
const textValue = (value: any) => value == null ? '' : String(value)
const numericId = (value: any): number | null =>
  value != null && value !== '' && Number.isInteger(Number(value)) && Number(value) > 0 ? Number(value) : null

const relationName = (value: any, ...keys: string[]): string => {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object') return ''
  for (const key of keys) {
    if (value[key] != null) return String(value[key])
  }
  return ''
}

const getApiError = (problem: any) => {
  const data = problem?.data ?? problem?.response?._data ?? {}
  const firstError = Object.values(data.errors ?? {}).flat()[0]
  return String(firstError || data.message || problem?.message || 'An unexpected error occurred.')
}

const getGovernmentNumber = (records: any[], names: string[]) => {
  const aliases = names.map(name => name.toLowerCase().replace(/[^a-z0-9]/g, ''))
  const item = records.find(record =>
    aliases.includes(String(record.id_name ?? '').toLowerCase().replace(/[^a-z0-9]/g, ''))
  )
  return textValue(item?.id_number)
}

// GET /api/admin/employees/{employee}
const loadEmployee = async () => {
  loadingEmployee.value = true
  employeeError.value = ''
  employee.value = null

  if (!employeeId.value) {
    employeeError.value = 'No valid employee ID was provided in the URL.'
    loadingEmployee.value = false
    return
  }

  try {
    const response = await $api<ApiResponse<any>>(`/admin/employees/${employeeId.value}`, {
      method: 'GET',
    })

    if (response.success === false || !response.data) {
      throw new Error(response.message || 'Employee record not found.')
    }

    const data = response.data.employee ?? response.data
    const contact = firstRecord(data.contact_information ?? data.contactInformation ?? data.contact)
    const employment = latestRecord(data.employments ?? data.employment)
    const salarySetup = firstRecord(data.salary_setup ?? data.salarySetup)
    const emergency = firstRecord(data.contact_persons ?? data.contactPersons)
    const government = asArray(data.government_requirements ?? data.governmentRequirements)
    const documents = asArray(data.documents)


    const departmentName = relationName(
      employment.department ?? data.department,
      'department_name', 'name'
    )

    const positionName = relationName(
      employment.position ?? data.position,
      'position', 'name'
    )

    const employmentTypeName = relationName(
      employment.employment_type ?? employment.employmentType,
      'name', 'type_name', 'employment_type'
    )

    const scheduleName = relationName(
      employment.work_schedule ?? employment.workSchedule,
      'schedule_name', 'name'
    )

    const salaryTypeName = relationName(
      salarySetup.salary_type ?? salarySetup.salaryType,
      'type_name', 'name'
    )


    employee.value = {
      id: Number(data.id),
      employeeNumber: textValue(data.emp_id),
      firstName: textValue(data.firstname),
      middleName: textValue(data.middlename),
      lastName: textValue(data.lastname),
      position: positionName,
      department: departmentName,
    }

    const salaryRate = textValue(salarySetup.basic_salary)
    const status = data.status === false || data.status === 0 || data.status === '0'
      ? 'Inactive'
      : 'Active'

    setForm({
      // PERSONAL
      firstName: textValue(data.firstname),
      middleName: textValue(data.middlename),
      lastName: textValue(data.lastname),
      suffix: textValue(data.suffix),
      birthDate: dateOnly(data.birthday),
      gender: textValue(data.gender),
      civilStatus: textValue(data.civil_status),
      email: textValue(contact.email),
      mobileNumber: textValue(contact.mobile),
      address: textValue(contact.residential_address),
      profilePhoto: null,

      // EMPLOYMENT
      employeeNumber: textValue(data.emp_id),
      dateHired: dateOnly(employment.date_hired),
      departmentId: numericId(employment.department_id ?? data.department_id),
      department: departmentName,
      positionId: numericId(employment.position_id),
      position: positionName,
      employmentTypeId: numericId(employment.employment_type_id),
      employmentType: employmentTypeName,
      workScheduleId: numericId(employment.work_schedule_id),
      workSchedule: scheduleName,

      // GOVERNMENT
      sssNumber: getGovernmentNumber(government, [
        'SSS',
        'SSS Number',
      ]),

      philHealthNumber: getGovernmentNumber(government, [
        'PhilHealth',
        'PhilHealth Number',
      ]),

      pagIbigNumber: getGovernmentNumber(government, [
        'Pag-IBIG (HDMF) Number',
        'Pag-IBIG',
        'PagIBIG',
        'Pag-IBIG Number',
        'Pag-IBIG MID Number',
        'Pag-IBIG MID',
        'HDMF',
      ]),

      tinNumber: getGovernmentNumber(government, [
        'Tax Identification Number (TIN)',
        'TIN',
        'TIN Number',
        'Tax Identification Number',
      ]),

      // SALARY SETUP
      salaryTypeId: numericId(salarySetup.salary_type_id),
      salaryType: salaryTypeName,
      basicSalary: !['Daily', 'Hourly'].includes(salaryTypeName) ? salaryRate : '',
      dailyRate: salaryTypeName === 'Daily' ? salaryRate : '',
      hourlyRate: salaryTypeName === 'Hourly' ? salaryRate : '',
      allowance: textValue(salarySetup.allowance),
      bankName: textValue(salarySetup.bank_name),
      accountName: textValue(salarySetup.account_name),
      accountNumber: textValue(salarySetup.account_number),

      // EMERGENCY CONTACT
      emergencyContactName: textValue(emergency.name),
      emergencyRelationship: textValue(emergency.relationship),
      emergencyMobileNumber: textValue(emergency.contact_number),
      emergencyAddress: textValue(emergency.address),

      // DOCUMENTS
      documents: documents.map((document: any) => {
        const requirement = document.employment_document ?? document.employmentDocument ?? {}
        const documentName = textValue(
          requirement.document_name
          ?? document.doc_name
          ?? document.type
          ?? document.name,
        )

        return {
          id: `requirement-${document.employment_document_id}`,
          employmentDocumentId: numericId(document.employment_document_id) ?? undefined,
          type: documentName,
          name: documentName,
          file: null,
        }
      }),
    })

  } catch (problem: any) {
    employee.value = null
    employeeError.value = getApiError(problem)
    console.error('Employee GET Error:', problem)
  } finally {
    loadingEmployee.value = false
  }
}

onMounted(() => { void loadEmployee() })

watch(employeeId, () => {
  if (import.meta.client) void loadEmployee()
})

// STEPPER
const stepLabels: Record<number, string> = {
  1: 'Personal Information',
  2: 'Employment Information',
  3: 'Government Information',
  4: 'Salary Setup',
  5: 'Emergency Contact',
  6: 'Employment Documents',
  7: 'Review',
}

const nextLabels: Record<number, string> = {
  1: 'Next: Employment',
  2: 'Next: Government',
  3: 'Next: Salary Setup',
  4: 'Next: Contact',
  5: 'Next: Employment Documents',
  6: 'Next: Review',
}

const warnMissing = (title: string, fields: string[]) => {
  if (!fields.length) return true
  warning(title, `Please complete: ${fields.join(', ')}.`)
  return false
}

// Same required fields as Create Employee / StoreEmployeeRequest.
// Gender, civil status and mobile number are optional.
const validatePersonalStep = () => {
  const missing: string[] = []
  if (!form.value.firstName.trim()) missing.push('First Name')
  if (!form.value.lastName.trim()) missing.push('Last Name')
  if (!form.value.birthDate) missing.push('Birth Date')
  if (!form.value.email.trim()) missing.push('Email Address')
  if (!form.value.address.trim()) missing.push('Residential Address')
  return warnMissing('Incomplete Personal Information', missing)
}

// Work Schedule is nullable in Laravel; rest days come from the template's days.
const validateEmploymentStep = () => {
  const missing: string[] = []
  if (!form.value.dateHired) missing.push('Date Hired')
  if (form.value.employmentTypeId == null) missing.push('Employment Type')
  if (form.value.departmentId == null) missing.push('Department')
  if (form.value.positionId == null) missing.push('Position')
  return warnMissing('Incomplete Employment Information', missing)
}

const validateGovernmentStep = () => true

const selectedSalaryRate = (values: EmployeeForm) => {
  const type = values.salaryType.trim().toLowerCase()
  return type === 'daily' ? values.dailyRate : type === 'hourly' ? values.hourlyRate : values.basicSalary
}

const hasSalaryDetails = (values: EmployeeForm) => Boolean(
  values.salaryTypeId || values.salaryType || values.basicSalary || values.dailyRate ||
  values.hourlyRate || values.allowance || values.bankName || values.accountName || values.accountNumber,
)

const validatePayrollStep = () => {
  if (!hasSalaryDetails(form.value)) return true
  const missing: string[] = []
  if (form.value.salaryTypeId == null) missing.push('Salary Type')
  const rate = selectedSalaryRate(form.value).trim()
  if (rate && (!Number.isFinite(Number(rate)) || Number(rate) <= 0)) missing.push('Valid Salary Rate')
  const allowance = form.value.allowance.trim()
  if (allowance && (!Number.isFinite(Number(allowance)) || Number(allowance) < 0)) missing.push('Valid Allowance')
  return warnMissing('Incomplete Salary Setup', missing)
}

// Same required emergency fields as Create Employee.
// Contact address is nullable.
const validateEmergencyContactStep = () => {
  const missing: string[] = []
  if (!form.value.emergencyContactName.trim()) missing.push('Contact Person Name')
  if (!form.value.emergencyRelationship.trim()) missing.push('Relationship')
  if (!form.value.emergencyMobileNumber.trim()) missing.push('Contact Number')
  return warnMissing('Incomplete Emergency Contact', missing)
}

const validateCurrentStep = () => {
  switch (currentStep.value) {
    case 1: return validatePersonalStep()
    case 2: return validateEmploymentStep()
    case 3: return validateGovernmentStep()
    case 4: return validatePayrollStep()
    case 5: return validateEmergencyContactStep()
    default: return true
  }
}

const scrollToTop = () => {
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleNext = () => {
  if (!validateCurrentStep()) return
  const completedStep = stepLabels[currentStep.value]
  nextStep()
  success(`${completedStep} Reviewed`, `Continue to ${stepLabels[currentStep.value]}.`)
  scrollToTop()
}

const handlePrevious = () => {
  if (currentStep.value <= 1) return
  previousStep()
  scrollToTop()
}

const handleStepChange = (step: number) => {
  goToStep(step)
  scrollToTop()
}

// PATCH PAYLOAD
const buildUpdatePayload = (values: EmployeeForm) => {
  const employment = {
    department_id: values.departmentId,
    position_id: values.positionId,
    employment_type_id: values.employmentTypeId,
    // Work Schedule is optional. No independent restday_id column exists.
    work_schedule_id: values.workScheduleId ?? null,
    date_hired: values.dateHired,
  }

  const payload: Record<string, unknown> = {
    employee: {
      firstname: values.firstName.trim(),
      lastname: values.lastName.trim(),
      middlename: values.middleName.trim() || null,
      suffix: values.suffix || null,
      birthday: values.birthDate,
      gender: values.gender,
      civil_status: values.civilStatus,
    },
    contact: {
      email: values.email.trim(),
      mobile: values.mobileNumber.trim(),
      residential_address: values.address.trim() || null,
    },
    employment,
  }

  // Salary Setup is independent from payroll periods and groups.
  if (hasSalaryDetails(values)) {
    const rate = selectedSalaryRate(values).trim()
    payload.salary_setup = {
      salary_type_id: Number(values.salaryTypeId),
      basic_salary: rate ? Number(rate) : null,
      allowance: values.allowance.trim() ? Number(values.allowance) : null,
      bank_name: values.bankName.trim() || null,
      account_name: values.accountName.trim() || null,
      account_number: values.accountNumber.trim() || null,
    }
  }

  payload.documents = values.documents
    .filter(document => document.employmentDocumentId != null)
    .map(document => ({
      employment_document_id: document.employmentDocumentId,
      submitted: true,
    }))

  return payload
}

// PATCH /api/admin/employees/{employee}
const handleSaveChanges = async () => {
  if (!employee.value || savingEmployee.value) return

  saveError.value = ''

  if (!validatePersonalStep() || !validateEmploymentStep()) {
    saveError.value = 'Please complete the required personal and employment fields.'
    return
  }

  if (!validatePayrollStep()) {
    saveError.value = 'Please review the salary setup fields.'
    return
  }

  savingEmployee.value = true

  try {
    const payload = buildUpdatePayload(form.value)
    const response = await $api<ApiResponse<any>>(
      `/admin/employees/${employeeId.value}`,
      { method: 'PATCH', body: payload }
    )

    if (response.success === false) {
      throw new Error(response.message || 'The update was rejected.')
    }

    success('Employee Updated', response.message || 'Employee changes were saved.')
    await router.push('/admin/employees')
  } catch (problem) {
    saveError.value = getApiError(problem)
    showError('Employee Update Failed', saveError.value)
    console.error('Employee PATCH Error:', problem)
  } finally {
    savingEmployee.value = false
  }
}

const latestRecord = (value: any) => {
  if (!Array.isArray(value)) return value ?? {}

  return [...value]
    .sort((a, b) => Number(b.id ?? 0) - Number(a.id ?? 0))[0] ?? {}
}

const goBack = () => { void router.push('/admin/employees') }
const handleCancel = () => { void router.push('/admin/employees') }
</script>

<template>
  <section class="edit-employee-page">

    <!-- LOADING -->
    <div v-if="loadingEmployee" class="employee-not-found">
      <h2>Loading Employee...</h2>
      <p>Retrieving the employee record from Laravel.</p>
    </div>

    <!-- API ERROR -->
    <div v-else-if="employeeError" class="employee-not-found">
      <h2>Unable to Load Employee</h2>
      <p>{{ employeeError }}</p>
      <AppButton @click="loadEmployee">Retry</AppButton>
      <button type="button" class="back-link" @click="goBack">Back to Employees</button>
    </div>

    <!-- NOT FOUND -->
    <div v-else-if="!employee" class="employee-not-found">
      <h2>Employee Not Found</h2>
      <p>The requested employee record does not exist.</p>
      <AppButton :icon="ArrowLeft" @click="goBack">Back to Employees</AppButton>
    </div>

    <!-- EMPLOYEE EDIT FORM -->
    <template v-else>
      <div class="page-heading">
        <div>
          <button type="button" class="back-link" @click="goBack">
            <ArrowLeft :size="16" />
            Back to Employees
          </button>

          <div class="heading-title-row">
            <div>
              <h1>Edit Employee</h1>
              <p>Update employee information, employment records and HR settings.</p>
            </div>

            <div class="employee-reference">
              <strong>{{ employeeName }}</strong>
              <span>
                {{ employee.employeeNumber }}
                · {{ employee.position || 'No position' }}
                · {{ employee.department || 'No department' }}
              </span>
            </div>
          </div>
        </div>

        <AppButton variant="secondary" :disabled="savingEmployee" @click="handleCancel">
          Cancel
        </AppButton>
      </div>

      <!-- EDIT NOTICE -->
      <div class="edit-notice">
        <div class="notice-indicator" />
        <div>
          <strong>Editing Existing Employee</strong>
          <p>
            You are updating the current HR record of {{ employeeName }}.
            Review all changes before saving.
          </p>
        </div>
      </div>

      <!-- STEPPER -->
      <EmployeeFormStepper :current-step="currentStep" @change="handleStepChange" />

      <!-- CURRENT STEP -->
      <div class="current-step-info">
        <div>
          <span>Step {{ currentStep }} of {{ totalSteps }}</span>
          <strong>{{ stepLabels[currentStep] }}</strong>
        </div>
        <span class="step-percentage">
          {{ Math.round((currentStep / totalSteps) * 100) }}% Complete
        </span>
      </div>

      <!-- STEP CONTENT -->
      <Transition name="step" mode="out-in">
        <PersonalInformationForm v-if="currentStep === 1" key="personal" />
        <EmploymentInformationForm v-else-if="currentStep === 2" key="employment" />
        <GovernmentInformationForm v-else-if="currentStep === 3" key="government" />
        <PayrollInformationForm v-else-if="currentStep === 4" key="payroll" />
        <EmergencyContactForm v-else-if="currentStep === 5" key="emergency-contact" />
        <EmployeeDocumentsForm v-else-if="currentStep === 6" key="documents" />
        <EmployeeReview
          v-else-if="currentStep === 7"
          key="review"
          mode="edit"
          @edit="handleStepChange"
        />
      </Transition>

      <!-- SAVE ERROR -->
      <div v-if="saveError" class="save-error-panel" role="alert">
        <strong>Employee could not be updated</strong>
        <p>{{ saveError }}</p>
      </div>

      <!-- FOOTER ACTIONS -->
      <div class="form-actions">
        <div>
          <AppButton
            v-if="currentStep === 1"
            variant="secondary"
            :icon="ArrowLeft"
            :disabled="savingEmployee"
            @click="handleCancel"
          >
            Cancel
          </AppButton>

          <AppButton
            v-else
            variant="secondary"
            :icon="ArrowLeft"
            :disabled="savingEmployee"
            @click="handlePrevious"
          >
            Previous
          </AppButton>
        </div>

        <AppButton
          v-if="currentStep < 7"
          :icon="ArrowRight"
          :disabled="savingEmployee"
          @click="handleNext"
        >
          {{ nextLabels[currentStep] || 'Continue' }}
        </AppButton>

        <AppButton
          v-else
          :icon="Save"
          :disabled="savingEmployee"
          @click="handleSaveChanges"
        >
          {{ savingEmployee ? 'Saving Changes...' : 'Save Changes' }}
        </AppButton>
      </div>
    </template>
  </section>
</template>

<style scoped>
.edit-employee-page{width:100%;max-width:1500px;margin:0 auto}
.page-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:16px}
.back-link{display:inline-flex;align-items:center;gap:6px;margin-bottom:10px;padding:0;border:0;background:transparent;color:var(--primary);font-size:10px;font-weight:600;cursor:pointer}
.back-link:hover{text-decoration:underline}
.heading-title-row{display:flex;flex-wrap:wrap;align-items:flex-end;gap:18px}
.heading-title-row h1{margin:0;color:var(--text-primary);font-size:26px;font-weight:750;letter-spacing:-.6px}
.heading-title-row p{margin:6px 0 0;color:var(--text-secondary);font-size:11px}
.employee-reference{padding-left:18px;border-left:1px solid var(--border)}
.employee-reference strong,.employee-reference span{display:block}
.employee-reference strong{color:var(--text-primary);font-size:10px;font-weight:650}
.employee-reference span{margin-top:3px;color:var(--text-muted);font-size:8px}
.edit-notice{display:flex;align-items:flex-start;gap:10px;margin-bottom:14px;padding:11px 13px;border:1px solid color-mix(in srgb,var(--primary) 20%,var(--border));border-radius:9px;background:color-mix(in srgb,var(--primary-soft) 55%,var(--bg-card))}
.notice-indicator{width:7px;height:7px;flex-shrink:0;margin-top:4px;border-radius:50%;background:var(--primary);box-shadow:0 0 0 4px var(--primary-soft)}
.edit-notice strong{display:block;color:var(--text-primary);font-size:9px}
.edit-notice p{margin:3px 0 0;color:var(--text-secondary);font-size:8px;line-height:1.5}
.current-step-info{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px;padding:0 3px}
.current-step-info div>span{display:block;margin-bottom:2px;color:var(--text-muted);font-size:8px;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.current-step-info strong{color:var(--text-primary);font-size:11px}
.step-percentage{color:var(--primary);font-size:9px;font-weight:600}
.form-actions{display:flex;align-items:center;justify-content:space-between;margin-top:15px;padding:14px 0 5px}
.step-enter-active,.step-leave-active{transition:opacity .18s ease,transform .18s ease}
.step-enter-from{opacity:0;transform:translateX(8px)}
.step-leave-to{opacity:0;transform:translateX(-8px)}
.employee-not-found{display:flex;min-height:calc(100vh - 180px);flex-direction:column;align-items:center;justify-content:center;text-align:center}
.employee-not-found h2{margin:0;color:var(--text-primary);font-size:18px}
.employee-not-found p{margin:6px 0 18px;color:var(--text-muted);font-size:10px}
.save-error-panel{margin-top:15px;padding:14px 16px;border:1px solid color-mix(in srgb,var(--red) 35%,var(--border));border-radius:10px;background:color-mix(in srgb,var(--red) 8%,var(--bg-card))}
.save-error-panel strong{color:var(--red);font-size:12px}
.save-error-panel p{margin:6px 0 0;color:var(--text-secondary);font-size:10px}
@media(max-width:800px){.page-heading{flex-direction:column;align-items:flex-start}.heading-title-row{align-items:flex-start}.employee-reference{width:100%;padding-top:10px;padding-left:0;border-top:1px solid var(--border);border-left:0}}
@media(max-width:700px){.current-step-info{flex-direction:column;align-items:flex-start;gap:10px}.form-actions{gap:10px}}
</style>
