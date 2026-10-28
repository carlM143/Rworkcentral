<script setup lang="ts">
import {
  X,
  Ticket,
  MapPin,
  UserRound,
  Car,
  CalendarDays,
  FileText,
  Save,
} from 'lucide-vue-next'

import type {
  ManageTrip,
} from '~/types/manageTrip'

import type {
  TripTicket,
  TripTicketFormData,
} from '~/types/tripTicket'

const props = defineProps<{
  open: boolean

  ticket:
    TripTicket | null

  trips:
    ManageTrip[]
}>()

const emit = defineEmits<{
  close: []

  save: [
    data:
      TripTicketFormData,
  ]
}>()

const {
  error,
} = useToast()

const form =
  reactive<
    TripTicketFormData
  >({
    tripId: null,

    vehicle: '',

    plateNumber: '',

    notes: '',
  })

const isEdit =
  computed(() => {
    return Boolean(
      props.ticket,
    )
  })

const selectedTrip =
  computed(() => {
    if (
      form.tripId ===
      null
    ) {
      return null
    }

    return props.trips.find(
      trip =>
        trip.id ===
        form.tripId,
    ) ?? null
  })

/* =========================================================
   LOAD
========================================================= */

const resetForm = () => {
  form.tripId =
    null

  form.vehicle =
    ''

  form.plateNumber =
    ''

  form.notes =
    ''
}

const loadTicket = () => {
  if (!props.ticket) {
    resetForm()

    return
  }

  form.tripId =
    props.ticket.tripId

  form.vehicle =
    props.ticket.vehicle

  form.plateNumber =
    props.ticket.plateNumber

  form.notes =
    props.ticket.notes ??
    ''
}

watch(
  [
    () => props.open,
    () => props.ticket?.id,
  ],
  () => {
    if (props.open) {
      loadTicket()
    }
  },
  {
    immediate: true,
  },
)

/* =========================================================
   AUTO FILL FROM TRIP
========================================================= */

watch(
  () => form.tripId,
  (
    tripId,
    oldTripId,
  ) => {
    if (
      !props.open ||
      tripId === null ||
      tripId === oldTripId
    ) {
      return
    }

    const trip =
      props.trips.find(
        item =>
          item.id ===
          tripId,
      )

    if (!trip) {
      return
    }

    form.vehicle =
      trip.vehicle

    form.plateNumber =
      trip.plateNumber

    if (!isEdit.value) {
      form.notes =
        trip.notes ?? ''
    }
  },
)

/* =========================================================
   DATE/TIME
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

const formatTime = (
  value?: string,
) => {
  if (!value) {
    return '—'
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

  return `${
    hour % 12 || 12
  }:${minute} ${period}`
}

/* =========================================================
   SAVE
========================================================= */

const handleSave = () => {
  if (
    form.tripId ===
    null
  ) {
    error(
      'Trip Required',
      'Please select a related trip.',
    )

    return
  }

  if (
    !form.vehicle.trim()
  ) {
    error(
      'Vehicle Required',
      'Please enter the assigned vehicle.',
    )

    return
  }

  if (
    !form.plateNumber.trim()
  ) {
    error(
      'Plate Number Required',
      'Please enter the vehicle plate number.',
    )

    return
  }

  emit('save', {
    tripId:
      form.tripId,

    vehicle:
      form.vehicle.trim(),

    plateNumber:
      form.plateNumber.trim(),

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
                <Ticket :size="20" />
              </div>

              <div>
                <h2>
                  {{
                    isEdit
                      ? 'Edit Trip Ticket'
                      : 'Create Trip Ticket'
                  }}
                </h2>

                <p>
                  Create and assign a ticket
                  to an employee trip.
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

            <!-- TRIP -->

            <section class="section-card">

              <div class="section-heading">

                <MapPin :size="16" />

                <div>
                  <h3>
                    Related Trip
                  </h3>

                  <p>
                    Select the trip associated
                    with this ticket.
                  </p>
                </div>

              </div>

              <div class="field-group">

                <label>
                  Trip
                  <span>*</span>
                </label>

                <select
                  v-model.number="
                    form.tripId
                  "
                  class="native-input"
                >
                  <option
                    :value="null"
                    disabled
                  >
                    Select Trip
                  </option>

                  <option
                    v-for="
                      trip in
                      trips
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
                      trip.employeeName
                    }}
                    -
                    {{
                      trip.destination
                    }}
                  </option>
                </select>

              </div>

            </section>

            <!-- AUTO FILLED -->

            <section
              v-if="
                selectedTrip
              "
              class="section-card"
            >

              <div class="section-heading">

                <UserRound :size="16" />

                <div>
                  <h3>
                    Trip Information
                  </h3>

                  <p>
                    Information automatically
                    loaded from Manage Trips.
                  </p>
                </div>

              </div>

              <div class="info-grid">

                <div>
                  <span>Employee</span>

                  <strong>
                    {{
                      selectedTrip.employeeName
                    }}
                  </strong>
                </div>

                <div>
                  <span>Employee ID</span>

                  <strong>
                    {{
                      selectedTrip.employeeNumber
                    }}
                  </strong>
                </div>

                <div>
                  <span>Client</span>

                  <strong>
                    {{
                      selectedTrip.client
                    }}
                  </strong>
                </div>

                <div>
                  <span>Purpose</span>

                  <strong>
                    {{
                      selectedTrip.purpose
                    }}
                  </strong>
                </div>

              </div>

              <div class="route-preview">

                <MapPin :size="15" />

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

              <div class="trip-meta">

                <div>
                  <CalendarDays :size="14" />

                  <div>
                    <span>
                      Trip Date
                    </span>

                    <strong>
                      {{
                        formatDate(
                          selectedTrip.tripDate,
                        )
                      }}
                    </strong>
                  </div>
                </div>

                <div>
                  <span>
                    Departure
                  </span>

                  <strong>
                    {{
                      formatTime(
                        selectedTrip.expectedDeparture,
                      )
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Return
                  </span>

                  <strong>
                    {{
                      formatTime(
                        selectedTrip.expectedReturn,
                      )
                    }}
                  </strong>
                </div>

              </div>

            </section>

            <!-- VEHICLE -->

            <section class="section-card">

              <div class="section-heading">

                <Car :size="16" />

                <div>
                  <h3>
                    Vehicle Information
                  </h3>

                  <p>
                    Confirm the vehicle assigned
                    to the ticket.
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
                    placeholder="Toyota Hiace"
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
                    placeholder="ABC 1234"
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
                    Optional instructions or
                    remarks for the ticket.
                  </p>
                </div>

              </div>

              <textarea
                v-model="
                  form.notes
                "
                rows="4"
                placeholder="Enter ticket notes..."
              />

            </section>

          </div>

          <div class="modal-footer">

            <span>
              New tickets will start
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
                    : 'Create Ticket'
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
    var(--purple-soft);

  color:
    var(--purple);
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

.info-grid {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.info-grid > div {
  padding: 9px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.info-grid span,
.info-grid strong {
  display: block;
}

.info-grid span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.info-grid strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.route-preview {
  display: flex;

  align-items: center;

  gap: 8px;

  margin-top: 8px;

  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card);

  color:
    var(--primary);
}

.route-preview div {
  flex: 1;
}

.route-preview span,
.route-preview strong {
  display: block;
}

.route-preview span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.route-preview strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.trip-meta {
  display: grid;

  grid-template-columns:
    repeat(
      3,
      minmax(0, 1fr)
    );

  gap: 8px;

  margin-top: 8px;
}

.trip-meta > div {
  display: flex;

  align-items: center;

  gap: 7px;

  padding: 9px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.trip-meta span,
.trip-meta strong {
  display: block;
}

.trip-meta span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.trip-meta strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 9px;
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
  .info-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }

  .trip-meta,
  .form-grid {
    grid-template-columns:
      1fr;
  }
}
</style>