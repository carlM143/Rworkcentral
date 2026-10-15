<script setup lang="ts">
import {
  X,
  MapPin,
  UserRound,
  CalendarDays,
  Building2,
  FileText,
  Navigation,
  Paperclip,
  Save,
} from 'lucide-vue-next'

import type {
  ManageTrip,
} from '~/types/manageTrip'

import type {
  FieldLeaveFormData,
  FieldLeaveRecord,
  FieldLeaveType,
} from '~/types/fieldLeave'

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
    FieldLeaveRecord | null

  employees:
    EmployeeOption[]

  trips:
    ManageTrip[]

  types:
    FieldLeaveType[]
}>()

const emit = defineEmits<{
  close: []

  save: [
    data:
      FieldLeaveFormData,
  ]
}>()

const {
  error,
} = useToast()

const form =
  reactive<
    FieldLeaveFormData
  >({
    employeeId:
      null,

    leaveType:
      'Official Business',

    fieldDate:
      '',

    timeFrom:
      '',

    timeTo:
      '',

    destination:
      '',

    client:
      '',

    purpose:
      '',

    relatedTripId:
      null,

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
   RELATED TRIPS
========================================================= */

const availableTrips =
  computed(() => {
    if (
      form.employeeId ===
      null
    ) {
      return props.trips
    }

    return props.trips.filter(
      trip =>
        trip.employeeId ===
        form.employeeId,
    )
  })

const selectedTrip =
  computed(() => {
    if (
      form.relatedTripId ===
      null
    ) {
      return null
    }

    return props.trips.find(
      trip =>
        trip.id ===
        form.relatedTripId,
    ) ?? null
  })

/* =========================================================
   RESET
========================================================= */

const resetForm = () => {
  const today =
    new Date()
      .toLocaleDateString(
        'en-CA',
      )

  form.employeeId =
    null

  form.leaveType =
    'Official Business'

  form.fieldDate =
    today

  form.timeFrom =
    ''

  form.timeTo =
    ''

  form.destination =
    ''

  form.client =
    ''

  form.purpose =
    ''

  form.relatedTripId =
    null

  form.attachmentName =
    ''

  fileInputKey.value++
}

/* =========================================================
   LOAD EDIT
========================================================= */

const loadRecord = () => {
  if (!props.record) {
    resetForm()

    return
  }

  form.employeeId =
    props.record.employeeId

  form.leaveType =
    props.record.leaveType

  form.fieldDate =
    props.record.fieldDate

  form.timeFrom =
    props.record.timeFrom

  form.timeTo =
    props.record.timeTo

  form.destination =
    props.record.destination

  form.client =
    props.record.client ??
    ''

  form.purpose =
    props.record.purpose

  form.relatedTripId =
    props.record.relatedTripId ??
    null

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
   RESET RELATED TRIP IF EMPLOYEE CHANGES
========================================================= */

watch(
  () => form.employeeId,
  employeeId => {
    if (
      form.relatedTripId ===
      null
    ) {
      return
    }

    const trip =
      props.trips.find(
        item =>
          item.id ===
          form.relatedTripId,
      )

    if (
      trip &&
      trip.employeeId !==
        employeeId
    ) {
      form.relatedTripId =
        null
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
    !form.fieldDate
  ) {
    error(
      'Date Required',
      'Please select the field leave date.',
    )

    return
  }

  if (
    !form.timeFrom ||
    !form.timeTo
  ) {
    error(
      'Time Required',
      'Please enter the field leave start and end time.',
    )

    return
  }

  if (
    form.timeTo <=
    form.timeFrom
  ) {
    error(
      'Invalid Time',
      'Time To must be later than Time From.',
    )

    return
  }

  if (
    !form.destination.trim()
  ) {
    error(
      'Destination Required',
      'Please enter the destination or field location.',
    )

    return
  }

  if (
    !form.purpose.trim()
  ) {
    error(
      'Purpose Required',
      'Please provide the purpose of the field leave.',
    )

    return
  }

  emit('save', {
    employeeId:
      form.employeeId,

    leaveType:
      form.leaveType,

    fieldDate:
      form.fieldDate,

    timeFrom:
      form.timeFrom,

    timeTo:
      form.timeTo,

    destination:
      form.destination.trim(),

    client:
      form.client.trim(),

    purpose:
      form.purpose.trim(),

    relatedTripId:
      form.relatedTripId,

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
                <MapPin :size="20" />
              </div>

              <div>

                <h2>
                  {{
                    isEdit
                      ? 'Edit Field Leave'
                      : 'Add Field Leave'
                  }}
                </h2>

                <p>
                  Create an employee field
                  assignment or official business request.
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
                    Select the employee requesting field leave.
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

            <!-- FIELD LEAVE -->

            <section class="section-card">

              <div class="section-heading">

                <CalendarDays :size="16" />

                <div>
                  <h3>
                    Field Leave Information
                  </h3>

                  <p>
                    Define field activity type, date and time.
                  </p>
                </div>

              </div>

              <div class="form-grid">

                <div class="field-group full">

                  <label>
                    Field Leave Type
                    <span>*</span>
                  </label>

                  <select
                    v-model="
                      form.leaveType
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
                    Date
                    <span>*</span>
                  </label>

                  <input
                    v-model="
                      form.fieldDate
                    "
                    type="date"
                    class="native-input"
                  >

                </div>

                <div class="field-group">

                  <label>
                    Time From
                    <span>*</span>
                  </label>

                  <input
                    v-model="
                      form.timeFrom
                    "
                    type="time"
                    class="native-input"
                  >

                </div>

                <div class="field-group">

                  <label>
                    Time To
                    <span>*</span>
                  </label>

                  <input
                    v-model="
                      form.timeTo
                    "
                    type="time"
                    class="native-input"
                  >

                </div>

              </div>

            </section>

            <!-- LOCATION -->

            <section class="section-card">

              <div class="section-heading">

                <Building2 :size="16" />

                <div>
                  <h3>
                    Location
                  </h3>

                  <p>
                    Enter destination and client information.
                  </p>
                </div>

              </div>

              <div class="form-grid">

                <div class="field-group">

                  <label>
                    Destination / Location
                    <span>*</span>
                  </label>

                  <input
                    v-model="
                      form.destination
                    "
                    class="native-input"
                    placeholder="Example: Davao City Warehouse"
                  >

                </div>

                <div class="field-group">

                  <label>
                    Client / Company
                  </label>

                  <input
                    v-model="
                      form.client
                    "
                    class="native-input"
                    placeholder="Optional client or company"
                  >

                </div>

              </div>

            </section>

            <!-- PURPOSE -->

            <section class="section-card">

              <div class="section-heading">

                <FileText :size="16" />

                <div>
                  <h3>
                    Purpose
                  </h3>

                  <p>
                    Explain the purpose of the field assignment.
                  </p>
                </div>

              </div>

              <textarea
                v-model="
                  form.purpose
                "
                rows="4"
                placeholder="Enter field leave purpose..."
              />

            </section>

            <!-- RELATED TRIP -->

            <section class="section-card">

              <div class="section-heading">

                <Navigation :size="16" />

                <div>
                  <h3>
                    Related Trip
                  </h3>

                  <p>
                    Link this field leave to a trip if applicable.
                  </p>
                </div>

              </div>

              <div class="field-group">

                <label>
                  Related Trip
                </label>

                <select
                  v-model.number="
                    form.relatedTripId
                  "
                  class="native-input"
                >

                  <option
                    :value="null"
                  >
                    No Related Trip
                  </option>

                  <option
                    v-for="
                      trip in
                      availableTrips
                    "
                    :key="
                      trip.id
                    "
                    :value="
                      trip.id
                    "
                  >
                    {{
                      trip.tripNumber
                    }}
                    -
                    {{
                      trip.destination
                    }}
                  </option>

                </select>

              </div>

              <div
                v-if="
                  selectedTrip
                "
                class="trip-preview"
              >

                <div>
                  <span>
                    Trip No.
                  </span>

                  <strong>
                    {{
                      selectedTrip.tripNumber
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Client
                  </span>

                  <strong>
                    {{
                      selectedTrip.client
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Route
                  </span>

                  <strong>
                    {{
                      selectedTrip.origin
                    }}
                    →
                    {{
                      selectedTrip.destination
                    }}
                  </strong>
                </div>

              </div>

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
              New requests will initially
              be marked as Pending.
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
                    : 'Submit Field Leave'
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

.field-group.full {
  grid-column:
    1 / -1;
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

.trip-preview {
  display: grid;

  grid-template-columns:
    140px
    1fr
    2fr;

  gap: 8px;

  margin-top: 10px;
}

.employee-preview > div,
.trip-preview > div {
  padding: 9px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.employee-preview span,
.employee-preview strong,
.trip-preview span,
.trip-preview strong {
  display: block;
}

.employee-preview span,
.trip-preview span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.employee-preview strong,
.trip-preview strong {
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
  .trip-preview {
    grid-template-columns:
      1fr;
  }

  .field-group.full {
    grid-column: auto;
  }
}
</style>