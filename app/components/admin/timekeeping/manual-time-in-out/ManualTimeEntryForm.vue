
<script setup lang="ts">
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  FileText,
  Paperclip,
  Save,
  Search,
  UserRound,
  X,
} from 'lucide-vue-next'

import type {
  ManualTimeEntry,
  ManualTimeEntryFormData,
} from '~/types/manualTimeEntry'

const props = withDefaults(defineProps<{
  mode?: 'create' | 'edit'
  entry?: ManualTimeEntry | null
}>(), {
  mode: 'create',
  entry: null,
})

const router = useRouter()
const { employees } = useEmployees()

const {
  saveManualAttendance,
  updateManualAttendance,
} = useManualTimeEntries()


const { success, error } = useToast()

const saving = ref(false)
const employeeSearch = ref('')
const showEmployees = ref(false)
const employeeBox = ref<HTMLElement | null>(null)
const attachment = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const getLocalDate = () => {
  const now = new Date()
  const local = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000,
  )
  return local.toISOString().slice(0, 10)
}

const form = reactive({
  employeeId: null as number | null,
  attendanceDate: getLocalDate(),
  timeIn: '',
  timeOut: '',
  remarks: '',
  attachmentName: '',
})

const isEdit = computed(() => props.mode === 'edit')

const employeeOptions = computed(() =>
  employees.value.filter(employee =>
    employee.status === 'Active' ||
    employee.id === form.employeeId,
  ),
)

const employeeName = (employee: typeof employeeOptions.value[number]) =>
  [
    employee.firstName,
    employee.middleName,
    employee.lastName,
  ].filter(Boolean).join(' ')

const selectedEmployee = computed(() =>
  employeeOptions.value.find(employee =>
    employee.id === form.employeeId,
  ) ?? null,
)

const filteredEmployees = computed(() => {
  const keyword = employeeSearch.value.trim().toLowerCase()

  if (!keyword) return employeeOptions.value.slice(0, 30)

  return employeeOptions.value.filter(employee =>
    [
      employeeName(employee),
      employee.employeeNumber,
      employee.department,
    ].some(value => String(value ?? '').toLowerCase().includes(keyword)),
  ).slice(0, 30)
})

const selectEmployee = (employee: typeof employeeOptions.value[number]) => {
  form.employeeId = employee.id
  employeeSearch.value =
    `${employeeName(employee)} - ${employee.employeeNumber}`
  showEmployees.value = false
}

const handleEmployeeInput = () => {
  form.employeeId = null
  showEmployees.value = true
}

const closeEmployeeOptions = (event: MouseEvent) => {
  if (
    employeeBox.value &&
    !employeeBox.value.contains(event.target as Node)
  ) {
    showEmployees.value = false
  }
}

const to24Hour = (value: string) => {
  if (!value) return ''

  const match = value.trim().match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i,
  )

  if (match) {
    let hour = Number(match[1])
    const minute = match[2]
    const period = match[3]?.toUpperCase()

    if (period === 'PM' && hour !== 12) hour += 12
    if (period === 'AM' && hour === 12) hour = 0

    return `${String(hour).padStart(2, '0')}:${minute}`
  }

  return value.slice(0, 5)
}


const loadEntry = () => {
  if (!props.entry) return

  const entry = props.entry

  form.employeeId = entry.employeeId
  form.attendanceDate = entry.attendanceDate

  form.timeIn = entry.timeIn
    ? to24Hour(entry.timeIn)
    : ''

  form.timeOut = entry.timeOut
    ? to24Hour(entry.timeOut)
    : ''

  form.remarks = entry.remarks ?? ''
  form.attachmentName = entry.attachment?.name ?? ''

  employeeSearch.value =
    `${entry.employeeName} - ${entry.employeeNumber}`

  showEmployees.value = false
}

watch(
  () => props.entry,
  loadEntry,
  { immediate: true },
)

onMounted(() => {
  document.addEventListener('click', closeEmployeeOptions)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeEmployeeOptions)
})

const chooseFile = () => fileInput.value?.click()

const handleFile = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0] ?? null

  if (!file) return

  const allowed = [
    'image/jpeg',
    'image/png',
    'application/pdf',
  ]

  if (!allowed.includes(file.type) || file.size > 5 * 1024 * 1024) {
    error(
      'Invalid Attachment',
      'Please select a JPG, PNG, or PDF file up to 5 MB.',
    )
    input.value = ''
    return
  }

  attachment.value = file
  form.attachmentName = file.name
}

const removeAttachment = () => {
  attachment.value = null
  form.attachmentName = ''
  if (fileInput.value) fileInput.value.value = ''
}

const goBack = () => {
  router.push('/admin/manual-time-in-out')
}



const saveEntry = async () => {
  if (saving.value) return

  if (!form.employeeId) {
    error('Employee Required', 'Please select an employee.')
    return
  }

  if (!form.attendanceDate) {
    error('Date Required', 'Please select an attendance date.')
    return
  }

  if (!form.timeIn && !form.timeOut) {
    error(
      'Attendance Time Required',
      'Please provide Time In, Time Out, or both.',
    )
    return
  }

  if (
    form.timeIn &&
    form.timeOut &&
    form.timeOut <= form.timeIn
  ) {
    error(
      'Invalid Attendance Time',
      'Time Out must be later than Time In.',
    )
    return
  }

  if (attachment.value) {
    error(
      'Attachment Not Supported',
      'Supporting file uploads are not connected to the backend.',
    )
    return
  }

  saving.value = true

  try {
    if (isEdit.value) {
      if (!props.entry) {
        throw new Error('Manual attendance record not found.')
      }

      const updated = await updateManualAttendance(
        props.entry.id,
        {
          time_in: form.timeIn || null,
          time_out: form.timeOut || null,
          remarks: form.remarks.trim() || null,
        },
      )

      success(
        'Manual Attendance Updated',
        `${updated.employeeName}'s attendance was updated successfully.`,
      )
    } else {
      const created = await saveManualAttendance({
        employee_id: form.employeeId,
        work_date: form.attendanceDate,
        time_in: form.timeIn || null,
        time_out: form.timeOut || null,
        remarks: form.remarks.trim() || null,
      })

      success(
        'Manual Attendance Saved',
        `${created.employeeName}'s attendance was saved successfully.`,
      )
    }

    await router.push('/admin/manual-time-in-out')
  } catch (err: unknown) {
    const apiError = err as {
      data?: {
        message?: string
        errors?: Record<string, string[]>
      }
      message?: string
    }

    const firstError = apiError.data?.errors
      ? Object.values(apiError.data.errors)[0]?.[0]
      : undefined

    error(
      isEdit.value
        ? 'Unable to Update Manual Attendance'
        : 'Unable to Save Manual Attendance',
      firstError ??
        apiError.data?.message ??
        apiError.message ??
        'Please check your attendance information.',
    )
  } finally {
    saving.value = false
  }
}

</script>

<template>
  <section class="manual-form-page">
    <button type="button" class="back-link" @click="goBack">
      <ArrowLeft :size="15" />
      Back to Manual Entries
    </button>

    <div class="page-heading">
      <div>
        <h1>
          {{ isEdit ? 'Edit Manual Time Entry' : 'Add Manual Time Entry' }}
        </h1>
        <p>
          Record employee attendance manually when biometric or
          automatic attendance is unavailable.
        </p>
      </div>

      <span class="status-pill">
        {{ isEdit ? 'Editing Attendance' : 'Direct Attendance Entry' }}</span>
    </div>

    <form class="form-layout" @submit.prevent="saveEntry">
      <div class="form-main">
        <!-- EMPLOYEE -->
        <section class="form-card">
          <div class="section-title">
            <div class="section-icon">
              <UserRound :size="18" />
            </div>
            <div>
              <h2>Employee Information</h2>
              <p>Search and select an existing employee.</p>
            </div>
          </div>

          <div class="field">
            <label>Employee <em>*</em></label>

            <div ref="employeeBox" class="employee-combobox">
              <div class="employee-search">
                <Search :size="17" />

                <input
                    v-model="employeeSearch"
                    type="text"
                    autocomplete="off"
                    :readonly="isEdit"
                    placeholder="Search employee name or employee ID..."
                    @focus="!isEdit && (showEmployees = true)"
                    @input="handleEmployeeInput"
                    @keydown.esc="showEmployees = false"
                  >

                <button
                  v-if="employeeSearch"
                  type="button"
                  aria-label="Clear employee"
                  @click="
                    employeeSearch = '';
                    handleEmployeeInput()
                  "
                >
                  <X :size="15" />
                </button>
              </div>

              <div
                v-if="showEmployees"
                class="employee-dropdown"
              >
                <p v-if="!filteredEmployees.length" class="empty-result">
                  No matching employees found.
                </p>

                <button
                  v-for="employee in filteredEmployees"
                  :key="employee.id"
                  type="button"
                  class="employee-option"
                  @click="selectEmployee(employee)"
                >
                  <div class="employee-avatar">
                    <UserRound :size="16" />
                  </div>

                  <div class="employee-option-text">
                    <strong>{{ employeeName(employee) }}</strong>
                    <small>
                      {{ employee.employeeNumber }} ·
                      {{ employee.department }}
                    </small>
                  </div>

                  <Check
                    v-if="form.employeeId === employee.id"
                    :size="16"
                  />
                </button>
              </div>
            </div>
          </div>

          <div v-if="selectedEmployee" class="employee-details">
            <div>
              <span>Department</span>
              <strong>{{ selectedEmployee.department }}</strong>
            </div>
            <div>
              <span>Position</span>
              <strong>{{ selectedEmployee.position }}</strong>
            </div>
            <div>
              <span>Work Schedule</span>
              <strong>
                {{ selectedEmployee.workSchedule || 'Not assigned' }}
              </strong>
            </div>
          </div>
        </section>

        <!-- ATTENDANCE -->
        <section class="form-card">
          <div class="section-title">
            <div class="section-icon">
              <CalendarDays :size="18" />
            </div>
            <div>
              <h2>Attendance Details</h2>
              <p>Enter the verified attendance date and times.</p>
            </div>
          </div>

          <div class="field">
            <label>Attendance Date <em>*</em></label>
            <input
                v-model="form.attendanceDate"
                type="date"
                class="form-input"
                :disabled="isEdit"
              >
          </div>

          <div class="field-grid">
            <div class="field">
              <label>Time In</label>
              <div class="time-field">
                <Clock3 :size="16" />
                <input v-model="form.timeIn" type="time">
              </div>
            </div>

            <div class="field">
              <label>Time Out</label>
              <div class="time-field">
                <Clock3 :size="16" />
                <input v-model="form.timeOut" type="time">
              </div>
            </div>
          </div>

          <p class="helper">
            Provide at least one time. You may leave the other blank
            if only one attendance punch needs to be recorded.
          </p>
        </section>

        <!-- REMARKS -->
        <section class="form-card">
          <div class="section-title">
            <div class="section-icon">
              <FileText :size="18" />
            </div>
            <div>
              <h2>Additional Information</h2>
              <p>Optional remarks and supporting evidence.</p>
            </div>
          </div>

          <div class="field">
            <label>Remarks <span class="optional">(Optional)</span></label>
            <textarea
              v-model="form.remarks"
              rows="4"
              maxlength="2000"
              placeholder="Add remarks about this manual attendance entry..."
            />
            <span class="char-count">
              {{ form.remarks.length }}/2000
            </span>
          </div>

          <div class="field">
            <label>
              Supporting Attachment
              <span class="optional">(Not Available Yet)</span>
            </label>

            <div class="attachment-notice">
              Supporting file uploads will be enabled once
              attachment storage is connected to the backend.
            </div>
          </div>
        </section>
      </div>

      <!-- SIDE PANEL -->
      <aside class="form-aside">
        <div class="summary-card">
          <h3>Entry Summary</h3>

          <div class="summary-row">
            <span>Employee</span>
            <strong>
              {{ selectedEmployee ? employeeName(selectedEmployee) : 'Not selected' }}
            </strong>
          </div>

          <div class="summary-row">
            <span>Attendance Date</span>
            <strong>{{ form.attendanceDate || '—' }}</strong>
          </div>

          <div class="summary-row">
            <span>Time In</span>
            <strong>{{ form.timeIn || 'Not provided' }}</strong>
          </div>

          <div class="summary-row">
            <span>Time Out</span>
            <strong>{{ form.timeOut || 'Not provided' }}</strong>
          </div>

          <div class="summary-row">
            <span>Remarks</span>
            <strong>{{ form.remarks.trim() ? 'Provided' : 'None' }}</strong>
          </div>

          <div class="summary-row">
            <span>Attachment</span>
            <strong>{{ form.attachmentName ? 'Attached' : 'None' }}</strong>
          </div>

          <div class="summary-note">
            Manual attendance is saved directly to Time Logs
            after backend validation.
          </div>
        </div>
      </aside>

      <!-- ACTIONS -->
      <div class="form-actions">
        <p>
          Changes are recorded in the attendance database.
          Existing recorded punches cannot be overwritten.
        </p>

        <div>
          <AppButton variant="secondary" @click="goBack">
            Cancel
          </AppButton>

          <AppButton :icon="Save" :disabled="saving" @click="saveEntry">
            {{ saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Manual Entry' }}
          </AppButton>
        </div>
      </div>
    </form>
  </section>
</template>

<style scoped>
.manual-form-page {
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  padding-bottom: 35px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0;
  margin: 0 0 18px;
  border: 0;
  background: transparent;
  color: var(--primary);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 22px;
}

.page-heading h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 23px;
  font-weight: 750;
}

.page-heading p {
  margin: 7px 0 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.status-pill {
  padding: 8px 12px;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
  font-size: 11px;
  font-weight: 650;
}

.form-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 310px;
  gap: 18px;
}

.form-main {
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 0;
}

.form-card,
.summary-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-card);
  padding: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 19px;
}

.section-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 38px;
  height: 38px;
  border-radius: 9px;
  background: var(--primary-soft);
  color: var(--primary);
}

.section-title h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 700;
}

.section-title p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.field {
  margin-bottom: 16px;
}

.field:last-child {
  margin-bottom: 0;
}

.field label {
  display: block;
  margin-bottom: 7px;
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 600;
}

.field label em {
  color: #ef4444;
  font-style: normal;
}

.optional {
  color: var(--text-muted);
  font-weight: 400;
}

.form-input,
.field textarea,
.employee-search,
.time-field {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--text-primary);
  font: inherit;
  font-size: 12px;
}

.form-input {
  height: 43px;
  padding: 0 12px;
  color-scheme: dark;
}

.form-input:focus,
.field textarea:focus,
.employee-search:focus-within,
.time-field:focus-within {
  outline: none;
  border-color: var(--primary);
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.time-field {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  color: var(--text-muted);
}

.time-field input {
  flex: 1;
  width: 100%;
  height: 43px;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--text-primary);
  color-scheme: dark;
  font: inherit;
  font-size: 12px;
}

.helper {
  margin: -3px 0 0;
  color: var(--text-muted);
  font-size: 10px;
}

.field textarea {
  display: block;
  resize: vertical;
  padding: 12px;
  min-height: 100px;
}

.char-count {
  display: block;
  margin-top: 5px;
  text-align: right;
  color: var(--text-muted);
  font-size: 10px;
}

.employee-combobox {
  position: relative;
}

.employee-search {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  color: var(--text-muted);
}

.employee-search input {
  height: 43px;
  width: 100%;
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary);
  font: inherit;
  font-size: 12px;
}

.employee-search button {
  border: 0;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.employee-dropdown {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  right: 0;
  z-index: 30;
  max-height: 260px;
  overflow-y: auto;
  padding: 5px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-card);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
}

.employee-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
}

.employee-option:hover {
  background: var(--primary-soft);
}

.employee-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  border-radius: 8px;
  background: var(--primary-soft);
  color: var(--primary);
}

.employee-option-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  gap: 4px;
}

.employee-option-text strong {
  font-size: 11px;
}

.employee-option-text small {
  color: var(--text-muted);
  font-size: 10px;
}

.empty-result {
  padding: 13px;
  margin: 0;
  color: var(--text-muted);
  font-size: 11px;
}

.employee-details {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 9px;
  margin-top: 12px;
}

.employee-details > div {
  padding: 12px;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  background: var(--bg-card-soft);
}

.employee-details span,
.employee-details strong {
  display: block;
}

.employee-details span {
  color: var(--text-muted);
  font-size: 10px;
}

.employee-details strong {
  margin-top: 5px;
  color: var(--text-primary);
  font-size: 11px;
}

.hidden-file {
  display: none;
}

.upload-area {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  min-height: 125px;
  border: 1px dashed var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  color: var(--primary);
  cursor: pointer;
}

.upload-area:hover {
  border-color: var(--primary);
}

.upload-area strong {
  color: var(--text-primary);
  font-size: 12px;
}

.upload-area small {
  color: var(--text-muted);
  font-size: 10px;
}

.selected-file {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-card-soft);
  color: var(--primary);
}

.selected-file span {
  flex: 1;
  overflow-wrap: anywhere;
  color: var(--text-primary);
  font-size: 11px;
}

.selected-file button {
  border: 0;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.form-aside {
  min-width: 0;
}

.summary-card {
  position: sticky;
  top: 25px;
}

.summary-card h3 {
  margin: 0 0 17px;
  color: var(--text-primary);
  font-size: 13px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px solid var(--border-soft);
}

.summary-row span {
  color: var(--text-muted);
  font-size: 10px;
}

.summary-row strong {
  color: var(--text-primary);
  font-size: 10px;
  font-weight: 600;
  text-align: right;
}

.summary-note {
  margin-top: 18px;
  padding: 12px;
  border-radius: 8px;
  background: var(--primary-soft);
  color: var(--text-secondary);
  font-size: 10px;
  line-height: 1.6;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.form-actions p {
  margin: 0;
  color: var(--text-muted);
  font-size: 10px;
}

.form-actions > div {
  display: flex;
  gap: 9px;
}

@media (max-width: 950px) {
  .form-layout {
    grid-template-columns: 1fr;
  }

  .form-aside {
    grid-row: 2;
  }
}

@media (max-width: 650px) {
  .field-grid,
  .employee-details {
    grid-template-columns: 1fr;
  }

  .page-heading,
  .form-actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .form-actions > div {
    width: 100%;
  }
}

.attachment-notice {
  padding: 14px;
  border: 1px dashed var(--border);
  border-radius: 9px;
  background: var(--bg-card-soft);
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1.6;
}
</style>
