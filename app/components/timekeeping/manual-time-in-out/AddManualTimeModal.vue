<script setup lang="ts">
import {
  X,
  Clock3,
  UserRound,
  CalendarDays,
  FileText,
  Paperclip,
  Save,
} from 'lucide-vue-next'

import type {
  ManualTimeEntry,
  ManualTimeEntryFormData,
  ManualTimeEntryType,
} from '~/types/manualTimeEntry'

interface EmployeeOption {
  id: number

  employeeNumber: string

  firstName: string
  middleName?: string
  lastName: string

  department: string
  position: string

  status: string

  workSchedule?: string
}

const props = defineProps<{
  open: boolean

  employees:
    EmployeeOption[]

  entry:
    ManualTimeEntry | null
}>()

const emit = defineEmits<{
  close: []

  save: [
    data:
      ManualTimeEntryFormData,
  ]
}>()

const {
  error,
} = useToast()

const types:
  ManualTimeEntryType[] = [
    'Time In',
    'Break Out',
    'Break In',
    'Time Out',
  ]

const form =
  reactive<
    ManualTimeEntryFormData
  >({
    employeeId:
      null,

    attendanceDate:
      '',

    entryType:
      'Time In',

    time:
      '',

    reason:
      '',

    attachmentName:
      '',
  })

const fileInputKey =
  ref(0)

/* =========================================================
   EDIT MODE
========================================================= */

const isEdit =
  computed(() => {
    return Boolean(
      props.entry,
    )
  })

/* =========================================================
   EMPLOYEE
========================================================= */

const selectedEmployee =
  computed(() => {
    if (
      form.employeeId ===
      null
    ) {
      return null
    }

    return props.employees.find(
      employee =>
        employee.id ===
        form.employeeId,
    ) ?? null
  })

const employeeOptions =
  computed(() => {
    return props.employees
      .filter(
        employee =>
          employee.status ===
          'Active',
      )
  })

const employeeLabel = (
  employee:
    EmployeeOption,
) => {
  return [
    employee.firstName,
    employee.middleName,
    employee.lastName,
  ]
    .filter(Boolean)
    .join(' ')
}

/* =========================================================
   TIME INPUT
========================================================= */

const toInputTime = (
  value?: string,
) => {
  if (!value) {
    return ''
  }

  const match =
    value
      .trim()
      .toUpperCase()
      .match(
        /^(\d{1,2}):(\d{2})\s*(AM|PM)$/,
      )

  if (!match) {
    return value
      .slice(
        0,
        5,
      )
  }

  let hour =
    Number(
      match[1],
    )

  const minute =
    match[2] ?? '00'

  const period =
    match[3]

  if (
    period === 'PM' &&
    hour !== 12
  ) {
    hour += 12
  }

  if (
    period === 'AM' &&
    hour === 12
  ) {
    hour = 0
  }

  return `${String(
    hour,
  ).padStart(
    2,
    '0',
  )}:${minute}`
}

/* =========================================================
   RESET / LOAD
========================================================= */

const resetForm = () => {
  const now =
    new Date()

  const localDate =
    new Date(
      now.getTime() -
      now.getTimezoneOffset() *
        60000,
    )
      .toISOString()
      .slice(
        0,
        10,
      )

  form.employeeId =
    null

  form.attendanceDate =
    localDate

  form.entryType =
    'Time In'

  form.time =
    ''

  form.reason =
    ''

  form.attachmentName =
    ''

  fileInputKey.value++
}

const loadEntry = () => {
  if (!props.entry) {
    resetForm()

    return
  }

  form.employeeId =
    props.entry.employeeId

  form.attendanceDate =
    props.entry.attendanceDate

  form.entryType =
    props.entry.entryType

  form.time =
    toInputTime(
      props.entry.time,
    )

  form.reason =
    props.entry.reason

  form.attachmentName =
    props.entry
      .attachment
      ?.name ?? ''

  fileInputKey.value++
}

watch(
  [
    () => props.open,
    () => props.entry?.id,
  ],
  () => {
    if (props.open) {
      loadEntry()
    }
  },
  {
    immediate: true,
  },
)

/* =========================================================
   FILE
========================================================= */

const handleFile = (
  event: Event,
) => {
  const input =
    event.target as HTMLInputElement

  const file =
    input.files?.[0]

  form.attachmentName =
    file?.name ?? ''
}

const removeFile = () => {
  form.attachmentName =
    ''

  fileInputKey.value++
}

/* =========================================================
   SAVE
========================================================= */

const handleSave = () => {
  if (
    form.employeeId ===
    null
  ) {
    error(
      'Employee Required',
      'Please select an employee.',
    )

    return
  }

  if (
    !form.attendanceDate
  ) {
    error(
      'Date Required',
      'Please select the attendance date.',
    )

    return
  }

  if (!form.time) {
    error(
      'Time Required',
      'Please enter the manual attendance time.',
    )

    return
  }

  if (
    !form.reason.trim()
  ) {
    error(
      'Reason Required',
      'Please provide the reason for manual attendance entry.',
    )

    return
  }

  emit('save', {
    employeeId:
      form.employeeId,

    attendanceDate:
      form.attendanceDate,

    entryType:
      form.entryType,

    time:
      form.time,

    reason:
      form.reason.trim(),

    attachmentName:
      form.attachmentName,
  })
}
</script>

<template>
  <Teleport to="body">

    <Transition name="modal">

      <div
        v-if="open"
        class="modal-backdrop"
        @click.self="
          emit('close')
        "
      >

        <div class="modal-card">

          <div class="modal-header">

            <div class="header-left">

              <div class="header-icon">
                <Clock3 :size="20" />
              </div>

              <div>
                <h2>
                  {{
                    isEdit
                      ? 'Edit Manual Time Entry'
                      : 'Add Manual Time Entry'
                  }}
                </h2>

                <p>
                  Manually record an employee
                  attendance event.
                </p>
              </div>

            </div>

            <button
              type="button"
              class="close-button"
              @click="
                emit('close')
              "
            >
              <X :size="18" />
            </button>

          </div>

          <div class="modal-body">

            <!-- EMPLOYEE -->

            <section class="section-card">

              <div class="section-heading">

                <UserRound :size="16" />

                <div>
                  <h3>
                    Employee
                  </h3>

                  <p>
                    Select the employee for
                    this manual attendance entry.
                  </p>
                </div>

              </div>

              <div class="field-group">

                <label>
                  Employee
                  <span>*</span>
                </label>

                <select
                  v-model.number="
                    form.employeeId
                  "
                  class="native-input"
                >
                  <option
                    :value="null"
                    disabled
                  >
                    Select Employee
                  </option>

                  <option
                    v-for="
                      employee in
                      employeeOptions
                    "
                    :key="
                      employee.id
                    "
                    :value="
                      employee.id
                    "
                  >
                    {{
                      employeeLabel(
                        employee,
                      )
                    }}
                    -
                    {{
                      employee.employeeNumber
                    }}
                  </option>
                </select>

              </div>

              <div
                v-if="
                  selectedEmployee
                "
                class="employee-preview"
              >

                <div>
                  <span>
                    Department
                  </span>

                  <strong>
                    {{
                      selectedEmployee.department
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Position
                  </span>

                  <strong>
                    {{
                      selectedEmployee.position
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Schedule
                  </span>

                  <strong>
                    {{
                      selectedEmployee.workSchedule ||
                      '8:00 AM - 5:00 PM'
                    }}
                  </strong>
                </div>

              </div>

            </section>

            <!-- ATTENDANCE -->

            <section class="section-card">

              <div class="section-heading">

                <CalendarDays :size="16" />

                <div>
                  <h3>
                    Attendance Entry
                  </h3>

                  <p>
                    Specify the date, event type
                    and manual attendance time.
                  </p>
                </div>

              </div>

              <div class="form-grid">

                <div class="field-group">

                  <label>
                    Attendance Date
                    <span>*</span>
                  </label>

                  <input
                    v-model="
                      form.attendanceDate
                    "
                    type="date"
                    class="native-input"
                  >

                </div>

                <div class="field-group">

                  <label>
                    Entry Type
                    <span>*</span>
                  </label>

                  <select
                    v-model="
                      form.entryType
                    "
                    class="native-input"
                  >
                    <option
                      v-for="
                        type in types
                      "
                      :key="type"
                      :value="type"
                    >
                      {{ type }}
                    </option>
                  </select>

                </div>

                <div class="field-group full">

                  <label>
                    Manual Time
                    <span>*</span>
                  </label>

                  <input
                    v-model="
                      form.time
                    "
                    type="time"
                    class="native-input"
                  >

                </div>

              </div>

            </section>

            <!-- REASON -->

            <section class="section-card">

              <div class="section-heading">

                <FileText :size="16" />

                <div>
                  <h3>
                    Reason
                  </h3>

                  <p>
                    Provide an explanation
                    for the manual entry.
                  </p>
                </div>

              </div>

              <div class="field-group">

                <label>
                  Reason
                  <span>*</span>
                </label>

                <textarea
                  v-model="
                    form.reason
                  "
                  rows="4"
                  placeholder="Example: Biometric device was unavailable..."
                />

              </div>

            </section>

            <!-- FILE -->

            <section class="section-card">

              <div class="section-heading">

                <Paperclip :size="16" />

                <div>
                  <h3>
                    Supporting Attachment
                  </h3>

                  <p>
                    Optional supporting proof.
                  </p>
                </div>

              </div>

              <label
                v-if="
                  !form.attachmentName
                "
                class="upload-box"
              >

                <Paperclip :size="20" />

                <strong>
                  Upload supporting file
                </strong>

                <span>
                  JPG, PNG or PDF
                </span>

                <input
                  :key="
                    fileInputKey
                  "
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  @change="
                    handleFile
                  "
                >

              </label>

              <div
                v-else
                class="file-row"
              >

                <Paperclip :size="17" />

                <div>
                  <span>
                    Attachment
                  </span>

                  <strong>
                    {{
                      form.attachmentName
                    }}
                  </strong>
                </div>

                <button
                  type="button"
                  @click="
                    removeFile
                  "
                >
                  <X :size="15" />
                </button>

              </div>

            </section>

          </div>

          <div class="modal-footer">

            <span>
              New entries will initially be
              marked as Pending.
            </span>

            <div class="footer-actions">

              <AppButton
                variant="secondary"
                @click="
                  emit('close')
                "
              >
                Cancel
              </AppButton>

              <AppButton
                :icon="Save"
                @click="
                  handleSave
                "
              >
                {{
                  isEdit
                    ? 'Save Changes'
                    : 'Save Manual Entry'
                }}
              </AppButton>

            </div>

          </div>

        </div>

      </div>

    </Transition>

  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;

  z-index: 9999;

  display: flex;

  align-items: center;
  justify-content: center;

  padding: 20px;

  background:
    rgba(3, 8, 18, 0.76);

  backdrop-filter:
    blur(3px);
}

.modal-card {
  display: flex;

  width: 100%;
  max-width: 820px;

  max-height:
    calc(100vh - 40px);

  flex-direction: column;

  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 13px;

  background:
    var(--bg-card);

  box-shadow:
    0 24px 80px
    rgba(0, 0, 0, 0.4);
}

.modal-header {
  display: flex;

  align-items: center;
  justify-content: space-between;

  padding:
    16px 18px;

  border-bottom:
    1px solid
    var(--border-soft);
}

.header-left {
  display: flex;

  align-items: center;

  gap: 10px;
}

.header-icon {
  display: flex;

  width: 42px;
  height: 42px;

  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.modal-header h2 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 16px;
}

.modal-header p {
  margin:
    4px 0 0;

  color:
    var(--text-muted);

  font-size: 9px;
}

.close-button {
  display: flex;

  width: 34px;
  height: 34px;

  align-items: center;
  justify-content: center;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);
}

.modal-body {
  flex: 1;

  overflow-y: auto;

  padding:
    16px 18px;
}

.section-card {
  padding: 14px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 9px;

  background:
    var(--bg-card-soft);
}

.section-card +
.section-card {
  margin-top: 11px;
}

.section-heading {
  display: flex;

  align-items: center;

  gap: 8px;

  margin-bottom: 12px;

  color:
    var(--primary);
}

.section-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 11px;
}

.section-heading p {
  margin:
    3px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

.form-grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 10px;
}

.field-group.full {
  grid-column:
    1 / -1;
}

.field-group label {
  display: block;

  margin-bottom: 6px;

  color:
    var(--text-primary);

  font-size: 10px;
  font-weight: 600;
}

.field-group label span {
  color:
    var(--red);
}

.native-input,
textarea {
  width: 100%;

  border:
    1px solid var(--border);

  border-radius: 7px;

  outline: none;

  background:
    var(--bg-card);

  color:
    var(--text-primary);

  font-family: inherit;

  font-size: 10px;
}

.native-input {
  height: 39px;

  padding:
    0 10px;
}

textarea {
  min-height: 90px;

  padding: 10px;

  resize: vertical;
}

.native-input:focus,
textarea:focus {
  border-color:
    var(--primary);
}

.employee-preview {
  display: grid;

  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );

  gap: 8px;

  margin-top: 10px;
}

.employee-preview > div {
  padding: 9px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.employee-preview span,
.employee-preview strong {
  display: block;
}

.employee-preview span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.employee-preview strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.upload-box {
  display: flex;

  min-height: 100px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 5px;

  border:
    1px dashed var(--border);

  border-radius: 8px;

  background:
    var(--bg-card);

  color:
    var(--primary);

  cursor: pointer;
}

.upload-box input {
  display: none;
}

.upload-box strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.upload-box span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.file-row {
  display: flex;

  align-items: center;

  gap: 9px;

  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    var(--bg-card);

  color:
    var(--primary);
}

.file-row div {
  flex: 1;
}

.file-row span,
.file-row strong {
  display: block;
}

.file-row span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.file-row strong {
  margin-top: 2px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.file-row button {
  display: flex;

  width: 30px;
  height: 30px;

  align-items: center;
  justify-content: center;

  border:
    1px solid var(--border);

  border-radius: 6px;

  background:
    transparent;

  color:
    var(--text-muted);
}

.modal-footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding:
    13px 18px;

  border-top:
    1px solid
    var(--border-soft);

  background:
    var(--bg-card-soft);
}

.modal-footer > span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.footer-actions {
  display: flex;

  gap: 8px;
}

.modal-enter-active,
.modal-leave-active {
  transition:
    opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 650px) {
  .form-grid,
  .employee-preview {
    grid-template-columns:
      1fr;
  }

  .field-group.full {
    grid-column: auto;
  }
}
</style>