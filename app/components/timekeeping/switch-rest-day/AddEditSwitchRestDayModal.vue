<script setup lang="ts">
import {
  X,
  RefreshCw,
  UserRound,
  CalendarDays,
  FileText,
  Paperclip,
  Save,
} from 'lucide-vue-next'

import type {
  SwitchRestDayFormData,
  SwitchRestDayRecord,
} from '~/types/switchRestDay'

interface EmployeeOption {
  id: number

  employeeNumber: string

  firstName: string
  middleName?: string
  lastName: string

  department: string
  position: string

  status: string
}

const props = defineProps<{
  open: boolean

  record:
    SwitchRestDayRecord | null

  employees:
    EmployeeOption[]

  restDays:
    string[]

  getScheduleInfo: (
    employeeId: number,
  ) => {
    schedule: string
    restDay: string
  }

  getEffectiveWeek: (
    date: string,
  ) => string
}>()

const emit = defineEmits<{
  close: []

  save: [
    data:
      SwitchRestDayFormData,
  ]
}>()

const {
  error,
} = useToast()

const form =
  reactive<
    SwitchRestDayFormData
  >({
    employeeId:
      null,

    requestedRestDay:
      '',

    effectiveDate:
      '',

    reason:
      '',

    attachmentName:
      '',
  })

const fileInputKey =
  ref(0)

const isEdit =
  computed(() => {
    return Boolean(
      props.record,
    )
  })

/* =========================================================
   EMPLOYEE
========================================================= */

const activeEmployees =
  computed(() => {
    return props.employees.filter(
      employee =>
        employee.status ===
        'Active',
    )
  })

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

const employeeName = (
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
   CURRENT SCHEDULE
========================================================= */

const currentSchedule =
  computed(() => {
    if (
      form.employeeId ===
      null
    ) {
      return null
    }

    return props.getScheduleInfo(
      form.employeeId,
    )
  })

const availableRequestedDays =
  computed(() => {
    return props.restDays.filter(
      day =>
        day !==
        currentSchedule
          .value
          ?.restDay,
    )
  })

const effectiveWeek =
  computed(() => {
    return props.getEffectiveWeek(
      form.effectiveDate,
    )
  })

/* =========================================================
   RESET
========================================================= */

const resetForm = () => {
  form.employeeId =
    null

  form.requestedRestDay =
    ''

  form.effectiveDate =
    new Date()
      .toLocaleDateString(
        'en-CA',
      )

  form.reason =
    ''

  form.attachmentName =
    ''

  fileInputKey.value++
}

/* =========================================================
   LOAD
========================================================= */

const loadRecord = () => {
  if (!props.record) {
    resetForm()

    return
  }

  form.employeeId =
    props.record.employeeId

  form.requestedRestDay =
    props.record.requestedRestDay

  form.effectiveDate =
    props.record.effectiveDate

  form.reason =
    props.record.reason

  form.attachmentName =
    props.record
      .attachment
      ?.name ?? ''

  fileInputKey.value++
}

watch(
  [
    () => props.open,
    () => props.record?.id,
  ],
  () => {
    if (props.open) {
      loadRecord()
    }
  },
  {
    immediate: true,
  },
)

/* =========================================================
   EMPLOYEE CHANGE
========================================================= */

watch(
  () => form.employeeId,
  (
    employeeId,
    oldEmployeeId,
  ) => {
    if (
      employeeId ===
        oldEmployeeId ||
      employeeId ===
        null
    ) {
      return
    }

    if (
      !props.record ||
      props.record.employeeId !==
        employeeId
    ) {
      form.requestedRestDay =
        ''
    }
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
    !form.requestedRestDay
  ) {
    error(
      'Requested Rest Day Required',
      'Please select the requested rest day.',
    )

    return
  }

  if (
    form.requestedRestDay ===
    currentSchedule
      .value
      ?.restDay
  ) {
    error(
      'Invalid Rest Day',
      'Requested rest day must be different from the current rest day.',
    )

    return
  }

  if (
    !form.effectiveDate
  ) {
    error(
      'Effective Date Required',
      'Please select the effective date.',
    )

    return
  }

  if (
    !form.reason.trim()
  ) {
    error(
      'Reason Required',
      'Please provide the reason for switching the rest day.',
    )

    return
  }

  emit('save', {
    employeeId:
      form.employeeId,

    requestedRestDay:
      form.requestedRestDay,

    effectiveDate:
      form.effectiveDate,

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

          <!-- HEADER -->

          <div class="modal-header">

            <div class="header-left">

              <div class="header-icon">
                <RefreshCw :size="20" />
              </div>

              <div>

                <h2>
                  {{
                    isEdit
                      ? 'Edit Rest Day Switch'
                      : 'Request Rest Day Switch'
                  }}
                </h2>

                <p>
                  Request a temporary change
                  to an employee's scheduled rest day.
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
                    Select the employee requesting the change.
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
                      activeEmployees
                    "
                    :key="
                      employee.id
                    "
                    :value="
                      employee.id
                    "
                  >
                    {{
                      employeeName(
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

              </div>

            </section>

            <!-- CURRENT SCHEDULE -->

            <section
              v-if="
                currentSchedule
              "
              class="section-card"
            >

              <div class="section-heading">

                <CalendarDays :size="16" />

                <div>

                  <h3>
                    Current Work Schedule
                  </h3>

                  <p>
                    Current assigned schedule and rest day.
                  </p>

                </div>

              </div>

              <div class="schedule-preview">

                <div class="schedule-main">

                  <span>
                    Work Schedule
                  </span>

                  <strong>
                    {{
                      currentSchedule.schedule
                    }}
                  </strong>

                </div>

                <div class="current-rest">

                  <span>
                    Current Rest Day
                  </span>

                  <strong>
                    {{
                      currentSchedule.restDay
                    }}
                  </strong>

                </div>

              </div>

            </section>

            <!-- SWITCH INFORMATION -->

            <section class="section-card">

              <div class="section-heading">

                <RefreshCw :size="16" />

                <div>

                  <h3>
                    Rest Day Switch
                  </h3>

                  <p>
                    Select the requested rest day and effective date.
                  </p>

                </div>

              </div>

              <div class="form-grid">

                <div class="field-group">

                  <label>
                    Requested Rest Day
                    <span>*</span>
                  </label>

                  <select
                    v-model="
                      form.requestedRestDay
                    "
                    class="native-input"
                    :disabled="
                      !form.employeeId
                    "
                  >

                    <option
                      value=""
                      disabled
                    >
                      Select Rest Day
                    </option>

                    <option
                      v-for="
                        day in
                        availableRequestedDays
                      "
                      :key="day"
                      :value="day"
                    >
                      {{ day }}
                    </option>

                  </select>

                </div>

                <div class="field-group">

                  <label>
                    Effective Date
                    <span>*</span>
                  </label>

                  <input
                    v-model="
                      form.effectiveDate
                    "
                    type="date"
                    class="native-input"
                  >

                </div>

              </div>

              <div
                v-if="
                  effectiveWeek
                "
                class="week-preview"
              >

                <CalendarDays :size="15" />

                <div>

                  <span>
                    Effective Week
                  </span>

                  <strong>
                    {{
                      effectiveWeek
                    }}
                  </strong>

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
                    Explain why the rest day needs to be switched.
                  </p>

                </div>

              </div>

              <textarea
                v-model="
                  form.reason
                "
                rows="4"
                placeholder="Enter the reason for requesting a rest day switch..."
              />

            </section>

            <!-- ATTACHMENT -->

            <section class="section-card">

              <div class="section-heading">

                <Paperclip :size="16" />

                <div>

                  <h3>
                    Attachment
                  </h3>

                  <p>
                    Optional supporting document.
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
                  Upload supporting document
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
              New requests will be submitted
              with Pending status.
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
                    : 'Submit Request'
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
  max-width: 850px;

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

  font-family:
    inherit;

  font-size: 10px;
}

.native-input {
  height: 39px;

  padding:
    0 10px;
}

.native-input:disabled {
  cursor:
    not-allowed;

  opacity: 0.6;
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

.form-grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 10px;
}

.employee-preview {
  display: grid;

  grid-template-columns:
    repeat(
      2,
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

.schedule-preview {
  display: grid;

  grid-template-columns:
    1fr 190px;

  gap: 8px;
}

.schedule-main,
.current-rest {
  padding: 10px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.schedule-main span,
.schedule-main strong,
.current-rest span,
.current-rest strong {
  display: block;
}

.schedule-main span,
.current-rest span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.schedule-main strong,
.current-rest strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.current-rest strong {
  color:
    var(--orange);
}

.week-preview {
  display: flex;

  align-items: center;

  gap: 8px;

  margin-top: 10px;

  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card);

  color:
    var(--primary);
}

.week-preview span,
.week-preview strong {
  display: block;
}

.week-preview span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.week-preview strong {
  margin-top: 2px;

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
    1px dashed
    var(--border);

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

@media (max-width: 700px) {
  .form-grid,
  .employee-preview,
  .schedule-preview {
    grid-template-columns:
      1fr;
  }
}
</style>