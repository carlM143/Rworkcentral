<script setup lang="ts">
import {
  X,
  Clock3,
  UserRound,
  CalendarDays,
  AlertTriangle,
  Paperclip,
  Send,
  Info,
} from 'lucide-vue-next'

import type {
  TimeLogRecord,
} from '~/types/timekeeping'

import type {
  TimeCorrectionPriority,
  TimeCorrectionType,
  TimeLogCorrectionRequest,
} from '~/types/timeLogCorrection'

const props = defineProps<{
  open: boolean
  log: TimeLogRecord | null
}>()

const emit = defineEmits<{
  close: []

  submitted: [
    request:
      TimeLogCorrectionRequest,
  ]
}>()

const {
  createCorrectionRequest,
  hasPendingRequestForTimeLog,
} = useTimeLogCorrections()

const {
  success,
  error,
} = useToast()

/* =========================================================
   OPTIONS
========================================================= */

const correctionTypes:
  TimeCorrectionType[] = [
    'Time In',
    'Time Out',
    'Time In & Out',
    'Missing Log',
  ]

const priorityOptions:
  TimeCorrectionPriority[] = [
    'Normal',
    'Urgent',
  ]

/* =========================================================
   FORM
========================================================= */

const form =
  reactive<{
    correctionType:
      TimeCorrectionType

    requestedTimeIn:
      string

    requestedTimeOut:
      string

    reason:
      string

    priority:
      TimeCorrectionPriority

    attachmentName:
      string
  }>({
    correctionType:
      'Time In & Out',

    requestedTimeIn:
      '',

    requestedTimeOut:
      '',

    reason:
      '',

    priority:
      'Normal',

    attachmentName:
      '',
  })

const fileInputKey =
  ref(0)

/* =========================================================
   SHOW FIELDS
========================================================= */

const showTimeIn =
  computed(() => {
    return [
      'Time In',
      'Time In & Out',
      'Missing Log',
    ].includes(
      form.correctionType,
    )
  })

const showTimeOut =
  computed(() => {
    return [
      'Time Out',
      'Time In & Out',
      'Missing Log',
    ].includes(
      form.correctionType,
    )
  })

/* =========================================================
   TIME HELPERS
========================================================= */

const toInputTime = (
  value?: string,
) => {
  if (!value) {
    return ''
  }

  const clean =
    value
      .trim()
      .toUpperCase()

  const twelveHour =
    clean.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/,
    )

  if (twelveHour) {
    let hour =
      Number(
        twelveHour[1],
      )

    const minute =
      twelveHour[2] ?? '00'

    const period =
      twelveHour[3]

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

  const twentyFourHour =
    clean.match(
      /^(\d{1,2}):(\d{2})$/,
    )

  if (twentyFourHour) {
    return `${String(
      Number(
        twentyFourHour[1],
      ),
    ).padStart(
      2,
      '0',
    )}:${twentyFourHour[2]}`
  }

  return ''
}

const toDisplayTime = (
  value?: string,
) => {
  if (!value) {
    return undefined
  }

  const [
    hourValue = '0',
    minute = '00',
  ] =
    value.split(':')

  const hour =
    Number(hourValue)

  const period =
    hour >= 12
      ? 'PM'
      : 'AM'

  const displayHour =
    hour % 12 || 12

  return `${String(
    displayHour,
  ).padStart(
    2,
    '0',
  )}:${minute} ${period}`
}

/* =========================================================
   DATE FORMAT
========================================================= */

const formatDate = (
  value?: string,
) => {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    },
  ).format(
    new Date(
      `${value}T00:00:00`,
    ),
  )
}

/* =========================================================
   DEFAULT CORRECTION TYPE
========================================================= */

const getDefaultCorrectionType =
  (
    log:
      TimeLogRecord,
  ):
    TimeCorrectionType => {
    if (
      !log.timeIn &&
      !log.timeOut
    ) {
      return 'Missing Log'
    }

    if (!log.timeIn) {
      return 'Time In'
    }

    if (!log.timeOut) {
      return 'Time Out'
    }

    return 'Time In & Out'
  }

/* =========================================================
   RESET FORM
========================================================= */

const resetForm = () => {
  if (!props.log) {
    return
  }

  form.correctionType =
    getDefaultCorrectionType(
      props.log,
    )

  form.requestedTimeIn =
    toInputTime(
      props.log.timeIn,
    )

  form.requestedTimeOut =
    toInputTime(
      props.log.timeOut,
    )

  form.reason =
    ''

  form.priority =
    'Normal'

  form.attachmentName =
    ''

  fileInputKey.value++
}

/* =========================================================
   WATCH MODAL
========================================================= */

watch(
  [
    () => props.open,
    () => props.log?.id,
  ],
  () => {
    if (
      props.open &&
      props.log
    ) {
      resetForm()
    }
  },
  {
    immediate: true,
  },
)

/* =========================================================
   FILE
========================================================= */

const handleFileChange = (
  event: Event,
) => {
  const input =
    event.target as HTMLInputElement

  const file =
    input.files?.[0]

  if (!file) {
    form.attachmentName =
      ''

    return
  }

  form.attachmentName =
    file.name
}

const removeAttachment =
  () => {
    form.attachmentName =
      ''

    fileInputKey.value++
  }

/* =========================================================
   CLOSE
========================================================= */

const handleClose = () => {
  emit('close')
}

/* =========================================================
   SUBMIT
========================================================= */

const handleSubmit = () => {
  if (!props.log) {
    return
  }

  if (
    hasPendingRequestForTimeLog(
      props.log.id,
    )
  ) {
    error(
      'Pending Request Exists',
      'This attendance record already has a pending correction request.',
    )

    return
  }

  if (
    showTimeIn.value &&
    !form.requestedTimeIn
  ) {
    error(
      'Time In Required',
      'Please enter the requested time in.',
    )

    return
  }

  if (
    showTimeOut.value &&
    !form.requestedTimeOut
  ) {
    error(
      'Time Out Required',
      'Please enter the requested time out.',
    )

    return
  }

  if (
    !form.reason.trim()
  ) {
    error(
      'Reason Required',
      'Please provide the reason for the correction request.',
    )

    return
  }

  const newRequest =
    createCorrectionRequest({
      timeLogId:
        props.log.id,

      employeeId:
        props.log.employeeId,

      employeeNumber:
        props.log.employeeNumber,

      employeeName:
        props.log.employeeName,

      department:
        props.log.department,

      position:
        props.log.position,

      attendanceDate:
        props.log.date,

      correctionType:
        form.correctionType,

      originalTimeIn:
        props.log.timeIn,

      originalTimeOut:
        props.log.timeOut,

      requestedTimeIn:
        showTimeIn.value
          ? toDisplayTime(
              form.requestedTimeIn,
            )
          : props.log.timeIn,

      requestedTimeOut:
        showTimeOut.value
          ? toDisplayTime(
              form.requestedTimeOut,
            )
          : props.log.timeOut,

      reason:
        form.reason.trim(),

      attachment:
        form.attachmentName
          ? {
              name:
                form.attachmentName,
            }
          : undefined,

      priority:
        form.priority,

      requestedBy:
        'Maria Santos',
    })

  success(
    'Correction Request Submitted',
    `${newRequest.requestNumber} has been submitted for review.`,
  )

  emit(
    'submitted',
    newRequest,
  )

  emit('close')
}
</script>

<template>
  <Teleport to="body">

    <Transition name="modal">

      <div
        v-if="
          open &&
          log
        "
        class="modal-backdrop"
        @click.self="
          handleClose
        "
      >

        <div class="modal-card">

          <!-- HEADER -->

          <div class="modal-header">

            <div class="header-left">

              <div class="header-icon">
                <Clock3 :size="21" />
              </div>

              <div>
                <h2>
                  Request Time Log Correction
                </h2>

                <p>
                  Submit a correction request
                  for an employee attendance record.
                </p>
              </div>

            </div>

            <button
              type="button"
              class="close-button"
              @click="
                handleClose
              "
            >
              <X :size="18" />
            </button>

          </div>

          <!-- BODY -->

          <div class="modal-body">

            <!-- EMPLOYEE -->

            <section class="section-card">

              <div class="section-heading">

                <div class="section-icon blue">
                  <UserRound :size="16" />
                </div>

                <div>
                  <h3>
                    Employee Information
                  </h3>

                  <p>
                    Selected employee and
                    attendance record.
                  </p>
                </div>

              </div>

              <div class="employee-grid">

                <div>
                  <span>
                    Employee
                  </span>

                  <strong>
                    {{ log.employeeName }}
                  </strong>
                </div>

                <div>
                  <span>
                    Employee ID
                  </span>

                  <strong>
                    {{ log.employeeNumber }}
                  </strong>
                </div>

                <div>
                  <span>
                    Department
                  </span>

                  <strong>
                    {{ log.department }}
                  </strong>
                </div>

                <div>
                  <span>
                    Position
                  </span>

                  <strong>
                    {{ log.position }}
                  </strong>
                </div>

              </div>

            </section>

            <!-- ATTENDANCE -->

            <section class="section-card">

              <div class="section-heading">

                <div class="section-icon green">
                  <CalendarDays :size="16" />
                </div>

                <div>
                  <h3>
                    Attendance Record
                  </h3>

                  <p>
                    Current time log information.
                  </p>
                </div>

              </div>

              <div class="date-banner">

                <CalendarDays :size="16" />

                <div>
                  <span>
                    Attendance Date
                  </span>

                  <strong>
                    {{
                      formatDate(
                        log.date,
                      )
                    }}
                  </strong>
                </div>

                <StatusBadge
                  :status="
                    log.status
                  "
                />

              </div>

              <div class="time-comparison">

                <div class="current-time-card">

                  <span>
                    Current Time In
                  </span>

                  <strong>
                    {{
                      log.timeIn ||
                      'No log'
                    }}
                  </strong>

                </div>

                <div class="current-time-card">

                  <span>
                    Current Time Out
                  </span>

                  <strong>
                    {{
                      log.timeOut ||
                      'No log'
                    }}
                  </strong>

                </div>

                <div class="current-time-card">

                  <span>
                    Schedule
                  </span>

                  <strong>
                    {{ log.schedule }}
                  </strong>

                </div>

                <div class="current-time-card">

                  <span>
                    Hours Worked
                  </span>

                  <strong>
                    {{
                      log.hoursWorked ??
                      '—'
                    }}
                  </strong>

                </div>

              </div>

            </section>

            <!-- CORRECTION -->

            <section class="section-card">

              <div class="section-heading">

                <div class="section-icon orange">
                  <AlertTriangle :size="16" />
                </div>

                <div>
                  <h3>
                    Requested Correction
                  </h3>

                  <p>
                    Enter the correct attendance
                    details to be reviewed.
                  </p>
                </div>

              </div>

              <div class="form-grid">

                <div class="field-group full">

                  <label>
                    Correction Type
                    <span>*</span>
                  </label>

                  <select
                    v-model="
                      form.correctionType
                    "
                    class="native-input"
                  >
                    <option
                      v-for="
                        item in
                        correctionTypes
                      "
                      :key="item"
                      :value="item"
                    >
                      {{ item }}
                    </option>
                  </select>

                </div>

                <div
                  v-if="showTimeIn"
                  class="field-group"
                >

                  <label>
                    Requested Time In
                    <span>*</span>
                  </label>

                  <input
                    v-model="
                      form.requestedTimeIn
                    "
                    type="time"
                    class="native-input"
                  >

                  <small>
                    Current:
                    {{
                      log.timeIn ||
                      'No log'
                    }}
                  </small>

                </div>

                <div
                  v-if="showTimeOut"
                  class="field-group"
                >

                  <label>
                    Requested Time Out
                    <span>*</span>
                  </label>

                  <input
                    v-model="
                      form.requestedTimeOut
                    "
                    type="time"
                    class="native-input"
                  >

                  <small>
                    Current:
                    {{
                      log.timeOut ||
                      'No log'
                    }}
                  </small>

                </div>

                <div class="field-group full">

                  <label>
                    Priority
                  </label>

                  <div class="priority-options">

                    <button
                      v-for="
                        item in
                        priorityOptions
                      "
                      :key="item"
                      type="button"
                      class="priority-button"
                      :class="{
                        selected:
                          form.priority ===
                          item,

                        urgent:
                          item ===
                          'Urgent',
                      }"
                      @click="
                        form.priority =
                          item
                      "
                    >
                      <span class="radio-circle">
                        <span
                          v-if="
                            form.priority ===
                            item
                          "
                        />
                      </span>

                      <div>
                        <strong>
                          {{ item }}
                        </strong>

                        <small>
                          {{
                            item ===
                            'Urgent'
                              ? 'Requires immediate review'
                              : 'Standard review process'
                          }}
                        </small>
                      </div>

                    </button>

                  </div>

                </div>

                <div class="field-group full">

                  <label>
                    Reason for Correction
                    <span>*</span>
                  </label>

                  <textarea
                    v-model="
                      form.reason
                    "
                    class="native-textarea"
                    rows="4"
                    placeholder="Explain why this time log needs to be corrected..."
                  />

                </div>

              </div>

            </section>

            <!-- ATTACHMENT -->

            <section class="section-card">

              <div class="section-heading">

                <div class="section-icon purple">
                  <Paperclip :size="16" />
                </div>

                <div>
                  <h3>
                    Supporting Attachment
                  </h3>

                  <p>
                    Optional proof or supporting
                    document for the request.
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
                    handleFileChange
                  "
                >

              </label>

              <div
                v-else
                class="attachment-row"
              >

                <div class="attachment-icon">
                  <Paperclip :size="17" />
                </div>

                <div>
                  <span>
                    Selected Attachment
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
                    removeAttachment
                  "
                >
                  <X :size="15" />
                </button>

              </div>

            </section>

            <!-- INFO -->

            <div class="info-box">

              <Info :size="17" />

              <p>
                Submitting this request will
                not immediately change the
                employee's time log. The
                correction must first be
                reviewed and approved.
              </p>

            </div>

          </div>

          <!-- FOOTER -->

          <div class="modal-footer">

            <span>
              The request will be marked as Pending.
            </span>

            <div class="footer-actions">

              <AppButton
                variant="secondary"
                @click="
                  handleClose
                "
              >
                Cancel
              </AppButton>

              <AppButton
                :icon="Send"
                @click="
                  handleSubmit
                "
              >
                Submit Request
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
  max-width: 900px;

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

  flex-shrink: 0;

  align-items: center;
  justify-content: space-between;

  gap: 16px;

  padding:
    16px 18px;

  border-bottom:
    1px solid
    var(--border-soft);
}

.header-left {
  display: flex;

  align-items: center;

  gap: 11px;
}

.header-icon {
  display: flex;

  width: 42px;
  height: 42px;

  flex-shrink: 0;

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
  font-weight: 700;
}

.modal-header p {
  margin:
    4px 0 0;

  color:
    var(--text-muted);

  font-size: 10px;
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

  cursor: pointer;
}

.close-button:hover {
  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);
}

.modal-body {
  flex: 1;

  overflow-y: auto;

  padding:
    17px 18px;
}

.section-card {
  padding: 14px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 10px;

  background:
    var(--bg-card-soft);
}

.section-card +
.section-card {
  margin-top: 12px;
}

.section-heading {
  display: flex;

  align-items: center;

  gap: 9px;

  margin-bottom: 13px;
}

.section-icon {
  display: flex;

  width: 35px;
  height: 35px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;
}

.section-icon.blue {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.section-icon.green {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.section-icon.orange {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.section-icon.purple {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.section-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 12px;
  font-weight: 700;
}

.section-heading p {
  margin:
    3px 0 0;

  color:
    var(--text-muted);

  font-size: 9px;
}

.employee-grid,
.time-comparison {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.employee-grid > div,
.current-time-card {
  padding: 10px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.employee-grid span,
.employee-grid strong,
.current-time-card span,
.current-time-card strong {
  display: block;
}

.employee-grid span,
.current-time-card span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.employee-grid strong,
.current-time-card strong {
  margin-top: 4px;

  color:
    var(--text-primary);

  font-size: 10px;
}

.date-banner {
  display: flex;

  align-items: center;

  gap: 9px;

  margin-bottom: 9px;

  padding:
    10px 11px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    var(--bg-card);
}

.date-banner > svg {
  color:
    var(--primary);
}

.date-banner > div {
  flex: 1;
}

.date-banner span,
.date-banner strong {
  display: block;
}

.date-banner span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.date-banner strong {
  margin-top: 2px;

  color:
    var(--text-primary);

  font-size: 10px;
}

.form-grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 11px;
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

.field-group > small {
  display: block;

  margin-top: 5px;

  color:
    var(--text-muted);

  font-size: 8px;
}

.native-input,
.native-textarea {
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

.native-textarea {
  min-height: 92px;

  padding: 10px;

  resize: vertical;
}

.native-input:focus,
.native-textarea:focus {
  border-color:
    var(--primary);
}

.priority-options {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.priority-button {
  display: flex;

  min-height: 56px;

  align-items: center;

  gap: 9px;

  padding:
    8px 10px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    var(--bg-card);

  color:
    var(--text-secondary);

  font-family: inherit;

  text-align: left;

  cursor: pointer;
}

.priority-button.selected {
  border-color:
    var(--primary);

  background:
    var(--primary-soft);
}

.priority-button.urgent.selected {
  border-color:
    var(--red);

  background:
    var(--red-soft);
}

.radio-circle {
  display: flex;

  width: 17px;
  height: 17px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border:
    1px solid var(--border);

  border-radius: 50%;
}

.priority-button.selected
.radio-circle {
  border-color:
    var(--primary);
}

.priority-button.urgent.selected
.radio-circle {
  border-color:
    var(--red);
}

.radio-circle span {
  width: 8px;
  height: 8px;

  border-radius: 50%;

  background:
    var(--primary);
}

.priority-button.urgent
.radio-circle span {
  background:
    var(--red);
}

.priority-button strong,
.priority-button small {
  display: block;
}

.priority-button strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.priority-button small {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 8px;
}

.upload-box {
  display: flex;

  min-height: 105px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 5px;

  border:
    1px dashed var(--border);

  border-radius: 9px;

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

.attachment-row {
  display: flex;

  align-items: center;

  gap: 9px;

  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    var(--bg-card);
}

.attachment-icon {
  display: flex;

  width: 34px;
  height: 34px;

  align-items: center;
  justify-content: center;

  border-radius: 7px;

  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.attachment-row > div:nth-child(2) {
  flex: 1;
}

.attachment-row span,
.attachment-row strong {
  display: block;
}

.attachment-row span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.attachment-row strong {
  margin-top: 2px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.attachment-row button {
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

.info-box {
  display: flex;

  gap: 9px;

  margin-top: 12px;

  padding: 11px;

  border:
    1px solid
    color-mix(
      in srgb,
      var(--primary) 25%,
      var(--border)
    );

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.info-box p {
  margin: 0;

  color:
    var(--text-secondary);

  font-size: 9px;

  line-height: 1.6;
}

.modal-footer {
  display: flex;

  flex-shrink: 0;

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

  font-size: 9px;
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

@media (max-width: 750px) {
  .employee-grid,
  .time-comparison {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }

  .form-grid {
    grid-template-columns:
      1fr;
  }

  .field-group.full {
    grid-column: auto;
  }
}

@media (max-width: 520px) {
  .employee-grid,
  .time-comparison,
  .priority-options {
    grid-template-columns:
      1fr;
  }

  .modal-footer {
    align-items: stretch;

    flex-direction: column;
  }

  .footer-actions {
    justify-content:
      flex-end;
  }
}
</style>