<script setup lang="ts">
import {
  X,
  Navigation,
  UserRound,
  MapPin,
  CalendarDays,
  Car,
  FileText,
  Save,
} from 'lucide-vue-next'

import type {
  ManageTrip,
  ManageTripFormData,
  TripPurpose,
} from '~/types/manageTrip'

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

  employees:
    EmployeeOption[]

  trip:
    ManageTrip | null

  purposes:
    TripPurpose[]
}>()

const emit = defineEmits<{
  close: []

  save: [
    data:
      ManageTripFormData,
  ]
}>()

const {
  error,
} = useToast()

const form =
  reactive<
    ManageTripFormData
  >({
    employeeId: null,

    client: '',

    origin:
      'Main Branch',

    destination: '',

    tripDate: '',

    purpose:
      'Official Business',

    expectedDeparture:
      '',

    expectedReturn:
      '',

    vehicle: '',

    plateNumber: '',

    tripTicketNumber:
      '',

    notes: '',
  })

const isEdit =
  computed(() => {
    return Boolean(
      props.trip,
    )
  })

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
   LOAD
========================================================= */

const resetForm = () => {
  const today =
    new Date()
      .toLocaleDateString(
        'en-CA',
      )

  form.employeeId =
    null

  form.client =
    ''

  form.origin =
    'Main Branch'

  form.destination =
    ''

  form.tripDate =
    today

  form.purpose =
    'Official Business'

  form.expectedDeparture =
    ''

  form.expectedReturn =
    ''

  form.vehicle =
    ''

  form.plateNumber =
    ''

  form.tripTicketNumber =
    ''

  form.notes =
    ''
}

const loadTrip = () => {
  if (!props.trip) {
    resetForm()

    return
  }

  form.employeeId =
    props.trip.employeeId

  form.client =
    props.trip.client

  form.origin =
    props.trip.origin

  form.destination =
    props.trip.destination

  form.tripDate =
    props.trip.tripDate

  form.purpose =
    props.trip.purpose

  form.expectedDeparture =
    props.trip.expectedDeparture

  form.expectedReturn =
    props.trip.expectedReturn

  form.vehicle =
    props.trip.vehicle

  form.plateNumber =
    props.trip.plateNumber

  form.tripTicketNumber =
    props.trip
      .tripTicketNumber ?? ''

  form.notes =
    props.trip.notes ?? ''
}

watch(
  [
    () => props.open,
    () => props.trip?.id,
  ],
  () => {
    if (props.open) {
      loadTrip()
    }
  },
  {
    immediate: true,
  },
)

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
      'Please select the employee or driver.',
    )

    return
  }

  if (
    !form.client.trim()
  ) {
    error(
      'Client Required',
      'Please enter the client.',
    )

    return
  }

  if (
    !form.origin.trim() ||
    !form.destination.trim()
  ) {
    error(
      'Route Required',
      'Please enter the origin and destination.',
    )

    return
  }

  if (
    !form.tripDate
  ) {
    error(
      'Trip Date Required',
      'Please select the trip date.',
    )

    return
  }

  if (
    !form.expectedDeparture ||
    !form.expectedReturn
  ) {
    error(
      'Trip Schedule Required',
      'Please enter the expected departure and return.',
    )

    return
  }

  if (
    !form.vehicle.trim() ||
    !form.plateNumber.trim()
  ) {
    error(
      'Vehicle Required',
      'Please provide vehicle and plate number.',
    )

    return
  }

  emit('save', {
    employeeId:
      form.employeeId,

    client:
      form.client.trim(),

    origin:
      form.origin.trim(),

    destination:
      form.destination.trim(),

    tripDate:
      form.tripDate,

    purpose:
      form.purpose,

    expectedDeparture:
      form.expectedDeparture,

    expectedReturn:
      form.expectedReturn,

    vehicle:
      form.vehicle.trim(),

    plateNumber:
      form.plateNumber.trim(),

    tripTicketNumber:
      form.tripTicketNumber.trim(),

    notes:
      form.notes.trim(),
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
                <Navigation :size="20" />
              </div>

              <div>
                <h2>
                  {{
                    isEdit
                      ? 'Edit Trip'
                      : 'Create Trip'
                  }}
                </h2>

                <p>
                  Configure driver, route,
                  schedule and vehicle information.
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

            <!-- DRIVER -->

            <section class="section-card">

              <div class="section-heading">
                <UserRound :size="16" />

                <div>
                  <h3>
                    Employee / Driver
                  </h3>

                  <p>
                    Select the employee assigned
                    to this trip.
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

            <!-- ROUTE -->

            <section class="section-card">

              <div class="section-heading">
                <MapPin :size="16" />

                <div>
                  <h3>
                    Trip Information
                  </h3>

                  <p>
                    Enter client and route details.
                  </p>
                </div>
              </div>

              <div class="form-grid">

                <div class="field-group full">

                  <label>
                    Client
                    <span>*</span>
                  </label>

                  <input
                    v-model="
                      form.client
                    "
                    class="native-input"
                    placeholder="Enter client name"
                  >

                </div>

                <div class="field-group">

                  <label>
                    Origin
                    <span>*</span>
                  </label>

                  <input
                    v-model="
                      form.origin
                    "
                    class="native-input"
                    placeholder="Trip origin"
                  >

                </div>

                <div class="field-group">

                  <label>
                    Destination
                    <span>*</span>
                  </label>

                  <input
                    v-model="
                      form.destination
                    "
                    class="native-input"
                    placeholder="Trip destination"
                  >

                </div>

                <div class="field-group">

                  <label>
                    Trip Purpose
                  </label>

                  <select
                    v-model="
                      form.purpose
                    "
                    class="native-input"
                  >
                    <option
                      v-for="
                        purpose in
                        purposes
                      "
                      :key="
                        purpose
                      "
                      :value="
                        purpose
                      "
                    >
                      {{ purpose }}
                    </option>
                  </select>

                </div>

                <div class="field-group">

                  <label>
                    Trip Ticket No.
                  </label>

                  <input
                    v-model="
                      form.tripTicketNumber
                    "
                    class="native-input"
                    placeholder="Example: TT-2026-001"
                  >

                </div>

              </div>

            </section>

            <!-- SCHEDULE -->

            <section class="section-card">

              <div class="section-heading">
                <CalendarDays :size="16" />

                <div>
                  <h3>
                    Trip Schedule
                  </h3>

                  <p>
                    Define expected travel schedule.
                  </p>
                </div>
              </div>

              <div class="form-grid">

                <div class="field-group full">

                  <label>
                    Trip Date
                    <span>*</span>
                  </label>

                  <input
                    v-model="
                      form.tripDate
                    "
                    type="date"
                    class="native-input"
                  >

                </div>

                <div class="field-group">

                  <label>
                    Expected Departure
                    <span>*</span>
                  </label>

                  <input
                    v-model="
                      form.expectedDeparture
                    "
                    type="time"
                    class="native-input"
                  >

                </div>

                <div class="field-group">

                  <label>
                    Expected Return
                    <span>*</span>
                  </label>

                  <input
                    v-model="
                      form.expectedReturn
                    "
                    type="time"
                    class="native-input"
                  >

                </div>

              </div>

            </section>

            <!-- VEHICLE -->

            <section class="section-card">

              <div class="section-heading">
                <Car :size="16" />

                <div>
                  <h3>
                    Vehicle
                  </h3>

                  <p>
                    Enter assigned vehicle information.
                  </p>
                </div>
              </div>

              <div class="form-grid">

                <div class="field-group">

                  <label>
                    Vehicle
                    <span>*</span>
                  </label>

                  <input
                    v-model="
                      form.vehicle
                    "
                    class="native-input"
                    placeholder="Example: Toyota Hiace"
                  >

                </div>

                <div class="field-group">

                  <label>
                    Plate Number
                    <span>*</span>
                  </label>

                  <input
                    v-model="
                      form.plateNumber
                    "
                    class="native-input"
                    placeholder="Example: ABC 1234"
                  >

                </div>

              </div>

            </section>

            <!-- NOTES -->

            <section class="section-card">

              <div class="section-heading">
                <FileText :size="16" />

                <div>
                  <h3>
                    Notes
                  </h3>

                  <p>
                    Optional trip instructions or notes.
                  </p>
                </div>
              </div>

              <textarea
                v-model="
                  form.notes
                "
                rows="4"
                placeholder="Enter trip notes..."
              />

            </section>

          </div>

          <div class="modal-footer">

            <span>
              New trips will initially be
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
                    : 'Create Trip'
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

  padding: 16px 18px;

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
  margin: 4px 0 0;

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

  background: transparent;

  color:
    var(--text-secondary);
}

.modal-body {
  flex: 1;

  overflow-y: auto;

  padding: 16px 18px;
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
  margin: 3px 0 0;

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

.modal-footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding: 13px 18px;

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
    grid-template-columns: 1fr;
  }

  .field-group.full {
    grid-column: auto;
  }
}
</style>