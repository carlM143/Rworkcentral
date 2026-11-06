<script setup lang="ts">
import {
  ArrowLeft,
  RefreshCw,
  UserRound,
  CalendarDays,
  FileText,
  Search,
  ChevronDown,
  Check,
  Save,
  AlertCircle,
} from 'lucide-vue-next'

import type {
  SwitchRestDayFormData,
  SwitchRestDayRecord,
} from '~/types/switchRestDay'

const props = withDefaults(defineProps<{
  mode?: 'create' | 'edit'
  recordId?: number
}>(), {
  mode: 'create',
  recordId: undefined,
})

const router = useRouter()
const { success, error } = useToast()

const {
  employees,
  employeesLoading,
  saving,
  actionError,
  restDayOptions,
  getScheduleInfo,
  getEffectiveWeek,
  fetchRequest,
  createRequest,
  updateRequest,
} = useSwitchRestDays()

const isEdit = computed(() => props.mode === 'edit')

const existingRecord = ref<SwitchRestDayRecord | null>(null)
const recordLoading = ref(false)
const recordLoaded = ref(false)

const today = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const form = reactive<SwitchRestDayFormData>({
  employeeId: null,
  requestedRestDay: '',
  effectiveDate: today(),
  reason: '',
  attachmentName: '',
})

const employeeSearch = ref('')
const employeeDropdownOpen = ref(false)
const employeeSearchRef = ref<HTMLElement | null>(null)

const employeeName = (employee: {
  firstName: string
  middleName?: string
  lastName: string
}) => [
  employee.firstName,
  employee.middleName,
  employee.lastName,
].filter(Boolean).join(' ')

const selectedEmployee = computed(() =>
  employees.value.find(
    employee => employee.id === form.employeeId,
  ) ?? null,
)

const activeEmployees = computed(() =>
  employees.value.filter(
    employee => String(employee.status).toLowerCase() === 'active',
  ),
)

const filteredEmployees = computed(() => {
  const keyword = employeeSearch.value.trim().toLowerCase()

  if (!keyword) return activeEmployees.value

  return activeEmployees.value.filter(employee =>
    [
      employeeName(employee),
      employee.employeeNumber,
      employee.department,
    ].some(value =>
      String(value ?? '').toLowerCase().includes(keyword),
    ),
  )
})

const currentSchedule = computed(() => {
  if (form.employeeId === null) return null

  const schedule = getScheduleInfo(form.employeeId)

  // Preserve the saved schedule when viewing an existing record.
  if (isEdit.value && existingRecord.value && !schedule.restDay) {
    return {
      schedule: existingRecord.value.currentSchedule,
      restDay: existingRecord.value.currentRestDay,
    }
  }

  return schedule
})

const availableRestDays = computed(() =>
  restDayOptions.filter(
    day => day !== currentSchedule.value?.restDay,
  ),
)

const effectiveWeek = computed(() =>
  form.effectiveDate
    ? getEffectiveWeek(form.effectiveDate)
    : '',
)

const selectEmployee = (
  employee: typeof employees.value[number],
) => {
  if (form.employeeId !== employee.id) {
    form.requestedRestDay = ''
  }

  form.employeeId = employee.id
  employeeSearch.value = employeeName(employee)
  employeeDropdownOpen.value = false
}

const clearEmployee = () => {
  if (isEdit.value) return

  form.employeeId = null
  form.requestedRestDay = ''
  employeeSearch.value = ''
  employeeDropdownOpen.value = true
}

const openEmployees = () => {
  if (isEdit.value) return
  employeeDropdownOpen.value = true
}

const handleOutsideClick = (event: MouseEvent) => {
  const target = event.target as Node

  if (!employeeSearchRef.value?.contains(target)) {
    employeeDropdownOpen.value = false
  }
}

const populateForm = (record: SwitchRestDayRecord) => {
  existingRecord.value = record
  form.employeeId = record.employeeId
  form.requestedRestDay = record.requestedRestDay
  form.effectiveDate = record.effectiveDate
  form.reason = record.reason
  form.attachmentName = ''

  const employee = employees.value.find(
    item => item.id === record.employeeId,
  )

  employeeSearch.value = employee
    ? employeeName(employee)
    : record.employeeName ?? ''
}

const loadExistingRecord = async () => {
  if (!isEdit.value || !props.recordId) return

  recordLoading.value = true
  recordLoaded.value = false

  try {
    const record = await fetchRequest(props.recordId)

    if (!record) {
      error(
        'Request Not Found',
        actionError.value || 'Unable to load the request.',
      )
      return
    }

    populateForm(record)
  } finally {
    recordLoading.value = false
    recordLoaded.value = true
  }
}

onMounted(async () => {
  document.addEventListener('mousedown', handleOutsideClick)
  await loadExistingRecord()
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleOutsideClick)
})

watch(selectedEmployee, employee => {
  if (employee && !employeeDropdownOpen.value) {
    employeeSearch.value = employeeName(employee)
  }
})

const goBack = () => {
  void router.push('/admin/switch-rest-day')
}



const handleSave = async () => {
  if (saving.value || recordLoading.value) return

  const fail = (title: string, message: string) => {
    error(title, message)
  }

  if (form.employeeId === null) {
    fail('Employee Required', 'Please select an employee.')
    return
  }

  if (!currentSchedule.value?.restDay) {
    fail(
      'Schedule Not Available',
      'The selected employee has no confirmed rest day.',
    )
    return
  }

  if (!form.requestedRestDay) {
    fail('Rest Day Required', 'Please select a requested rest day.')
    return
  }

  if (form.requestedRestDay === currentSchedule.value.restDay) {
    fail(
      'Invalid Rest Day',
      'Requested rest day must differ from the current rest day.',
    )
    return
  }

  if (!form.effectiveDate) {
    fail('Effective Date Required', 'Please select an effective date.')
    return
  }

  const selectedDate = new Date(`${form.effectiveDate}T00:00:00`)

  if (Number.isNaN(selectedDate.getTime())) {
    fail('Invalid Effective Date', 'Please select a valid effective date.')
    return
  }

  const actualDay = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday',
  ][selectedDate.getDay()]

  if (actualDay !== form.requestedRestDay) {
    fail(
      'Invalid Effective Date',
      `The effective date falls on ${actualDay}. Please select a ${form.requestedRestDay}.`,
    )
    return
  }

  if (!form.reason.trim()) {
    fail('Reason Required', 'Please provide the reason for this request.')
    return
  }

  if (isEdit.value && !existingRecord.value) {
    fail('Request Not Found', 'Unable to find the selected request.')
    return
  }

  if (isEdit.value && existingRecord.value?.status !== 'Pending') {
    fail('Cannot Edit Request', 'Only pending requests can be edited.')
    return
  }

  const payload: SwitchRestDayFormData = {
    employeeId: form.employeeId,
    requestedRestDay: form.requestedRestDay,
    effectiveDate: form.effectiveDate,
    reason: form.reason.trim(),
    attachmentName: '',
  }

  try {
    const record = isEdit.value && existingRecord.value
      ? await updateRequest(existingRecord.value.id, payload)
      : await createRequest(payload)

    if (!record) {
      const message = actionError.value ||
        'Unable to save the rest day switch request.'

      const duplicate = /already has|already exists/i.test(message)

      fail(
        duplicate ? 'Duplicate Rest Day Switch' :
          isEdit.value ? 'Update Failed' : 'Submission Failed',
        message,
      )
      return
    }

    success(
      isEdit.value ? 'Request Updated' : 'Request Submitted',
      `${record.requestNumber} has been ${
        isEdit.value ? 'updated' : 'submitted for approval'
      }.`,
    )

    await router.push('/admin/switch-rest-day')
  } catch (err: unknown) {
    fail(
      'Something Went Wrong',
      err instanceof Error ? err.message : 'Unable to save request.',
    )
  }
}

</script>

<template>
  <section class="rest-page">
    <button class="back-link" type="button" @click="goBack">
      <ArrowLeft :size="15" />
      Back to Switch Rest Day
    </button>

    <div class="page-heading">
      <div>
        <h1>{{ isEdit ? 'Edit Rest Day Switch' : 'Request Rest Day Switch' }}</h1>
        <p>Manage a temporary change to an employee's scheduled rest day.</p>
      </div>

      <span class="pending-pill">
        {{ isEdit ? existingRecord?.status ?? 'Pending' : 'Pending Approval' }}
      </span>
    </div>

     <div
        v-if="isEdit && !recordLoaded"
        class="empty-card"
      >
        <RefreshCw :size="25" class="animate-spin" />
        <h3>Loading Request...</h3>
        <p>Retrieving rest day switch details.</p>
      </div>

      <div
        v-else-if="isEdit && !existingRecord"
        class="empty-card"
      >
      <AlertCircle :size="30" />
      <h3>Request Not Found</h3>
      <p>The selected rest day switch request is unavailable.</p>
      <AppButton @click="goBack">Back to Requests</AppButton>
    </div>

    <div
      v-else
      class="form-layout"
    >
      <div class="form-content">
        <section class="section-card">
          <div class="section-title">
            <div class="section-icon"><UserRound :size="16" /></div>
            <div>
              <h3>Employee Information</h3>
              <p>Search and select an active employee.</p>
            </div>
          </div>

          <div ref="employeeSearchRef" class="employee-field">
            <label>Employee <em>*</em></label>

            <div class="search-input">
              <Search :size="16" />
              <input
                v-model="employeeSearch"
                type="text"
                placeholder="Search employee name or employee ID..."
                autocomplete="off"
                :readonly="isEdit"
                @focus="openEmployees"
                @input="employeeDropdownOpen = true"
                @keydown.esc="employeeDropdownOpen = false"
              />
              <ChevronDown :size="15" />
            </div>

            <div
              v-if="employeeDropdownOpen && !isEdit"
              class="employee-options"
            >
              <button
                v-for="employee in filteredEmployees"
                :key="employee.id"
                type="button"
                class="employee-option"
                @click="selectEmployee(employee)"
              >
                <span class="option-icon">
                  <UserRound :size="15" />
                </span>

                <span class="option-details">
                  <strong>{{ employeeName(employee) }}</strong>
                  <small>
                    {{ employee.employeeNumber }} · {{ employee.department }}
                  </small>
                </span>

                <Check
                  v-if="employee.id === form.employeeId"
                  :size="15"
                  class="selected-check"
                />
              </button>

              <p v-if="!filteredEmployees.length" class="no-results">
                No active employees found.
              </p>
            </div>
          </div>

          <div v-if="selectedEmployee" class="info-grid">
            <div>
              <span>Department</span>
              <strong>{{ selectedEmployee.department || 'Not assigned' }}</strong>
            </div>
            <div>
              <span>Position</span>
              <strong>{{ selectedEmployee.position || 'Not assigned' }}</strong>
            </div>
            <div>
              <span>Employee ID</span>
              <strong>{{ selectedEmployee.employeeNumber }}</strong>
            </div>
          </div>
        </section>

        <section class="section-card">
          <div class="section-title">
            <div class="section-icon"><CalendarDays :size="16" /></div>
            <div>
              <h3>Current Work Schedule</h3>
              <p>Assigned schedule and regular rest day.</p>
            </div>
          </div>

          <div class="info-grid two-col">
            <div>
              <span>Work Schedule</span>
              <strong>{{ currentSchedule?.schedule || 'Select an employee' }}</strong>
            </div>
            <div>
              <span>Current Rest Day</span>
              <strong class="rest-day-value">
                {{ currentSchedule?.restDay || 'Not available' }}
              </strong>
            </div>
          </div>
        </section>

        <section class="section-card">
          <div class="section-title">
            <div class="section-icon"><RefreshCw :size="16" /></div>
            <div>
              <h3>Rest Day Switch Details</h3>
              <p>Choose the requested rest day and effective date.</p>
            </div>
          </div>

          <div class="form-grid">
            <div class="field">
              <label>Requested Rest Day <em>*</em></label>
              <select
                v-model="form.requestedRestDay"
                :disabled="!form.employeeId || !currentSchedule?.restDay"
              >
                <option value="">Select Rest Day</option>
                <option
                  v-for="day in availableRestDays"
                  :key="day"
                  :value="day"
                >
                  {{ day }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Effective Date <em>*</em></label>
              <input v-model="form.effectiveDate" type="date" />
            </div>
          </div>

          <div v-if="effectiveWeek" class="week-preview">
            <CalendarDays :size="15" />
            <div>
              <span>Effective Week</span>
              <strong>{{ effectiveWeek }}</strong>
            </div>
          </div>
        </section>

        <section class="section-card">
          <div class="section-title">
            <div class="section-icon"><FileText :size="16" /></div>
            <div>
              <h3>Reason for Request</h3>
              <p>Explain why this temporary rest day change is necessary.</p>
            </div>
          </div>

          <div class="field">
            <label>Reason <em>*</em></label>
            <textarea
              v-model="form.reason"
              rows="5"
              maxlength="2000"
              placeholder="Enter the reason for requesting a rest day switch..."
            />
            <small class="counter">{{ form.reason.length }}/2000</small>
          </div>
        </section>
      </div>

      <aside class="summary-card">
        <h3>Request Summary</h3>

        <div class="summary-row">
          <span>Employee</span>
          <strong>{{ selectedEmployee ? employeeName(selectedEmployee) : 'Not selected' }}</strong>
        </div>
        <div class="summary-row">
          <span>Current Rest Day</span>
          <strong>{{ currentSchedule?.restDay || 'Not available' }}</strong>
        </div>
        <div class="summary-row">
          <span>Requested Rest Day</span>
          <strong>{{ form.requestedRestDay || 'Not selected' }}</strong>
        </div>
        <div class="summary-row">
          <span>Effective Date</span>
          <strong>{{ form.effectiveDate || 'Not selected' }}</strong>
        </div>
        <div class="summary-row">
          <span>Effective Week</span>
          <strong>{{ effectiveWeek || 'Not available' }}</strong>
        </div>

        <div class="summary-note">
          The request is subject to approval. The employee's permanent
          work schedule should remain unchanged.
        </div>
      </aside>
    </div>

    <div v-if="!isEdit || existingRecord" class="page-footer">
      <span>Rest day switch requests require approval before taking effect.</span>
      <div class="footer-actions">
        <AppButton variant="secondary" @click="goBack">
          Cancel
        </AppButton>
        <AppButton :icon="Save" :disabled="saving" @click="handleSave">
          {{ saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Submit Request' }}
        </AppButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rest-page {
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  color: var(--text-primary);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  margin-bottom: 14px;
  background: transparent;
  border: 0;
  color: var(--primary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 18px;
}

.page-heading h1 {
  margin: 0;
  font-size: 21px;
  font-weight: 750;
}

.page-heading p {
  margin: 6px 0 0;
  font-size: 11px;
  color: var(--text-muted);
}

.pending-pill {
  padding: 8px 12px;
  border-radius: 7px;
  background: rgba(245,158,11,.12);
  color: #f59e0b;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.form-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 270px;
  gap: 15px;
  align-items: start;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 13px;
  min-width: 0;
}

.section-card,
.summary-card,
.empty-card {
  padding: 17px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 11px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 17px;
}

.section-icon,
.option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 33px;
  height: 33px;
  border-radius: 8px;
  background: var(--primary-soft);
  color: var(--primary);
}

.section-title h3,
.summary-card h3 {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
}

.section-title p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 9px;
}

.employee-field {
  position: relative;
}

.employee-field label,
.field label {
  display: block;
  margin-bottom: 7px;
  font-size: 10px;
  font-weight: 600;
}

em {
  color: var(--red);
  font-style: normal;
}

.search-input {
  display: flex;
  height: 41px;
  align-items: center;
  gap: 9px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-muted);
}

.search-input:focus-within {
  border-color: var(--primary);
}

.search-input input {
  width: 100%;
  min-width: 0;
  height: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 11px;
}

.employee-options {
  position: absolute;
  z-index: 50;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  max-height: 260px;
  overflow-y: auto;
  padding: 5px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 15px 40px rgba(0,0,0,.3);
}

.employee-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.employee-option:hover {
  background: var(--primary-soft);
}

.option-details {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.option-details strong {
  color: var(--text-primary);
  font-size: 10px;
}

.option-details small {
  color: var(--text-muted);
  font-size: 9px;
}

.selected-check {
  color: var(--primary);
}

.no-results {
  padding: 12px;
  color: var(--text-muted);
  text-align: center;
  font-size: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 9px;
  margin-top: 12px;
}

.info-grid.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 0;
}

.info-grid > div {
  padding: 12px;
  border: 1px solid var(--border-soft);
  border-radius: 7px;
  background: var(--bg-card-soft);
}

.info-grid span,
.info-grid strong {
  display: block;
}

.info-grid span {
  color: var(--text-muted);
  font-size: 9px;
}

.info-grid strong {
  margin-top: 6px;
  font-size: 10px;
}

.rest-day-value {
  color: #f59e0b;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.field select,
.field input,
.field textarea {
  width: 100%;
  min-width: 0;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 7px;
  outline: none;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 11px;
}

.field select,
.field input {
  height: 41px;
}

.field textarea {
  resize: vertical;
  min-height: 110px;
}

.field select:focus,
.field input:focus,
.field textarea:focus {
  border-color: var(--primary);
}

.field select:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.counter {
  display: block;
  margin-top: 5px;
  color: var(--text-muted);
  font-size: 9px;
  text-align: right;
}

.week-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 13px;
  padding: 12px;
  border: 1px solid var(--border-soft);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--primary);
}

.week-preview span,
.week-preview strong {
  display: block;
}

.week-preview span {
  color: var(--text-muted);
  font-size: 9px;
}

.week-preview strong {
  margin-top: 4px;
  color: var(--text-primary);
  font-size: 11px;
}

.summary-card {
  position: sticky;
  top: 90px;
}

.summary-card h3 {
  margin-bottom: 15px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-soft);
  font-size: 9px;
}

.summary-row span {
  color: var(--text-muted);
}

.summary-row strong {
  text-align: right;
  font-weight: 650;
  overflow-wrap: anywhere;
}

.summary-note {
  margin-top: 14px;
  padding: 12px;
  border-radius: 7px;
  background: var(--primary-soft);
  color: var(--text-secondary);
  font-size: 10px;
  line-height: 1.6;
}

.page-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 16px;
  padding: 14px 0;
  border-top: 1px solid var(--border);
}

.page-footer > span {
  color: var(--text-muted);
  font-size: 10px;
}

.footer-actions {
  display: flex;
  gap: 8px;
}

.empty-card {
  display: flex;
  min-height: 280px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  text-align: center;
  color: var(--text-muted);
}

.empty-card h3 {
  margin: 0;
  color: var(--text-primary);
}

.empty-card p {
  font-size: 11px;
}

@media (max-width: 950px) {
  .form-layout {
    grid-template-columns: 1fr;
  }

  .summary-card {
    position: static;
  }
}

@media (max-width: 650px) {
  .form-grid,
  .info-grid,
  .info-grid.two-col {
    grid-template-columns: 1fr;
  }

  .page-heading,
  .page-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
