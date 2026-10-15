<script setup lang="ts">
import {
  X,
  Ticket,
  UserRound,
  MapPin,
  CalendarDays,
  Clock3,
  Car,
  Building2,
  FileText,
  Navigation,
  AlertCircle,
} from 'lucide-vue-next'

import type {
  ManageTrip,
} from '~/types/manageTrip'

const props = defineProps<{
  open: boolean
  trip: ManageTrip | null
}>()

const emit = defineEmits<{
  close: []
}>()

/* =========================================================
   HAS TICKET
========================================================= */

const hasTicket =
  computed(() => {
    return Boolean(
      props.trip
        ?.tripTicketNumber,
    )
  })

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
   DATE + TIME FORMAT
========================================================= */

const formatDateTime = (
  value?: string,
) => {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    },
  ).format(
    new Date(value),
  )
}

/* =========================================================
   TIME FORMAT
========================================================= */

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

  if (
    Number.isNaN(hour)
  ) {
    return value
  }

  const period =
    hour >= 12
      ? 'PM'
      : 'AM'

  const displayHour =
    hour % 12 || 12

  return `${displayHour}:${minute} ${period}`
}

/* =========================================================
   DURATION
========================================================= */

const duration =
  computed(() => {
    if (
      !props.trip
        ?.actualDeparture ||
      !props.trip
        ?.actualReturn
    ) {
      return '—'
    }

    const [
      startHour = '0',
      startMinute = '0',
    ] =
      props.trip
        .actualDeparture
        .split(':')

    const [
      endHour = '0',
      endMinute = '0',
    ] =
      props.trip
        .actualReturn
        .split(':')

    const start =
      Number(startHour) *
        60 +
      Number(startMinute)

    const end =
      Number(endHour) *
        60 +
      Number(endMinute)

    let totalMinutes =
      end - start

    /*
     * Support trips that may
     * finish after midnight.
     */
    if (
      totalMinutes < 0
    ) {
      totalMinutes +=
        24 * 60
    }

    const hours =
      Math.floor(
        totalMinutes /
          60,
      )

    const minutes =
      totalMinutes %
      60

    if (
      hours &&
      minutes
    ) {
      return `${hours} hr ${minutes} min`
    }

    if (hours) {
      return `${hours} hr`
    }

    return `${minutes} min`
  })

/* =========================================================
   CLOSE
========================================================= */

const handleClose = () => {
  emit('close')
}

/* =========================================================
   ESCAPE
========================================================= */

const handleKeydown = (
  event: KeyboardEvent,
) => {
  if (
    event.key ===
      'Escape' &&
    props.open
  ) {
    handleClose()
  }
}

onMounted(() => {
  window.addEventListener(
    'keydown',
    handleKeydown,
  )
})

onBeforeUnmount(() => {
  window.removeEventListener(
    'keydown',
    handleKeydown,
  )
})
</script>

<template>
  <Teleport to="body">

    <Transition name="modal">

      <div
        v-if="
          open &&
          trip
        "
        class="modal-backdrop"
        @click.self="
          handleClose
        "
      >

        <div class="modal-card">

          <!-- =============================================
               HEADER
          ============================================== -->

          <div class="modal-header">

            <div class="header-left">

              <div class="header-icon">
                <Ticket :size="20" />
              </div>

              <div>

                <h2>
                  Trip Ticket
                </h2>

                <p>
                  {{
                    trip.tripTicketNumber ||
                    'No ticket assigned'
                  }}
                  ·
                  {{ trip.tripNumber }}
                </p>

              </div>

            </div>

            <div class="header-right">

              <StatusBadge
                :status="
                  trip.status
                "
              />

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

          </div>

          <!-- =============================================
               NO TICKET
          ============================================== -->

          <template
            v-if="
              !hasTicket
            "
          >

            <div class="empty-body">

              <div class="empty-icon">
                <AlertCircle :size="28" />
              </div>

              <h3>
                No Trip Ticket Assigned
              </h3>

              <p>
                This trip does not currently
                have an assigned trip ticket.
              </p>

              <div class="empty-trip-summary">

                <div>
                  <span>
                    Trip Number
                  </span>

                  <strong>
                    {{ trip.tripNumber }}
                  </strong>
                </div>

                <div>
                  <span>
                    Employee
                  </span>

                  <strong>
                    {{ trip.employeeName }}
                  </strong>
                </div>

                <div>
                  <span>
                    Trip Date
                  </span>

                  <strong>
                    {{
                      formatDate(
                        trip.tripDate,
                      )
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Status
                  </span>

                  <StatusBadge
                    :status="
                      trip.status
                    "
                  />
                </div>

              </div>

            </div>

          </template>

          <!-- =============================================
               TICKET CONTENT
          ============================================== -->

          <template v-else>

            <div class="modal-body">

              <!-- TICKET SUMMARY -->

              <section class="ticket-hero">

                <div class="ticket-number-area">

                  <div class="ticket-symbol">
                    <Ticket :size="22" />
                  </div>

                  <div>
                    <span>
                      Trip Ticket Number
                    </span>

                    <strong>
                      {{
                        trip.tripTicketNumber
                      }}
                    </strong>

                    <small>
                      Linked to
                      {{ trip.tripNumber }}
                    </small>
                  </div>

                </div>

                <div class="ticket-status">

                  <span>
                    Trip Status
                  </span>

                  <StatusBadge
                    :status="
                      trip.status
                    "
                  />

                </div>

              </section>

              <!-- TRIP INFORMATION -->

              <section class="section-card">

                <div class="section-heading">

                  <Navigation :size="16" />

                  <div>
                    <h3>
                      Trip Information
                    </h3>

                    <p>
                      General trip and client
                      information.
                    </p>
                  </div>

                </div>

                <div class="info-grid">

                  <div>
                    <span>
                      Trip Number
                    </span>

                    <strong class="blue">
                      {{ trip.tripNumber }}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Trip Date
                    </span>

                    <strong>
                      {{
                        formatDate(
                          trip.tripDate,
                        )
                      }}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Purpose
                    </span>

                    <strong>
                      {{ trip.purpose }}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Duration
                    </span>

                    <strong>
                      {{ duration }}
                    </strong>
                  </div>

                </div>

              </section>

              <!-- DRIVER -->

              <section class="section-card">

                <div class="section-heading">

                  <UserRound :size="16" />

                  <div>
                    <h3>
                      Employee / Driver
                    </h3>

                    <p>
                      Employee assigned to the trip.
                    </p>
                  </div>

                </div>

                <div class="employee-block">

                  <div class="employee-avatar">
                    <UserRound :size="19" />
                  </div>

                  <div class="employee-name">

                    <strong>
                      {{ trip.employeeName }}
                    </strong>

                    <span>
                      {{ trip.employeeNumber }}
                      ·
                      {{ trip.department }}
                      ·
                      {{ trip.position }}
                    </span>

                  </div>

                </div>

              </section>

              <!-- CLIENT -->

              <section class="section-card">

                <div class="section-heading">

                  <Building2 :size="16" />

                  <div>
                    <h3>
                      Client
                    </h3>

                    <p>
                      Client associated with
                      this trip.
                    </p>
                  </div>

                </div>

                <div class="client-box">

                  <Building2 :size="18" />

                  <div>
                    <span>
                      Client Name
                    </span>

                    <strong>
                      {{ trip.client }}
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
                      Route
                    </h3>

                    <p>
                      Official trip origin
                      and destination.
                    </p>
                  </div>

                </div>

                <div class="route-box">

                  <div class="route-point">

                    <div
                      class="
                        route-dot
                        origin
                      "
                    />

                    <div>
                      <span>
                        Origin
                      </span>

                      <strong>
                        {{ trip.origin }}
                      </strong>
                    </div>

                  </div>

                  <div class="route-line" />

                  <div class="route-point">

                    <div
                      class="
                        route-dot
                        destination
                      "
                    />

                    <div>
                      <span>
                        Destination
                      </span>

                      <strong>
                        {{ trip.destination }}
                      </strong>
                    </div>

                  </div>

                </div>

              </section>

              <!-- SCHEDULE -->

              <section class="section-card">

                <div class="section-heading">

                  <Clock3 :size="16" />

                  <div>
                    <h3>
                      Trip Schedule
                    </h3>

                    <p>
                      Expected and actual
                      departure / return time.
                    </p>
                  </div>

                </div>

                <div class="schedule-grid">

                  <div>
                    <span>
                      Expected Departure
                    </span>

                    <strong>
                      {{
                        formatTime(
                          trip.expectedDeparture,
                        )
                      }}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Actual Departure
                    </span>

                    <strong
                      :class="{
                        blue:
                          trip.actualDeparture,
                      }"
                    >
                      {{
                        trip.actualDeparture
                          ? formatTime(
                              trip.actualDeparture,
                            )
                          : 'Not started'
                      }}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Expected Return
                    </span>

                    <strong>
                      {{
                        formatTime(
                          trip.expectedReturn,
                        )
                      }}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Actual Return
                    </span>

                    <strong
                      :class="{
                        green:
                          trip.actualReturn,
                      }"
                    >
                      {{
                        trip.actualReturn
                          ? formatTime(
                              trip.actualReturn,
                            )
                          : '—'
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
                      Vehicle assigned to
                      this trip ticket.
                    </p>
                  </div>

                </div>

                <div class="vehicle-grid">

                  <div class="vehicle-card">

                    <div class="vehicle-icon">
                      <Car :size="18" />
                    </div>

                    <div>
                      <span>
                        Vehicle
                      </span>

                      <strong>
                        {{ trip.vehicle }}
                      </strong>
                    </div>

                  </div>

                  <div class="vehicle-card">

                    <div class="vehicle-icon">
                      <FileText :size="18" />
                    </div>

                    <div>
                      <span>
                        Plate Number
                      </span>

                      <strong>
                        {{ trip.plateNumber }}
                      </strong>
                    </div>

                  </div>

                </div>

              </section>

              <!-- NOTES -->

              <section
                v-if="
                  trip.notes
                "
                class="section-card"
              >

                <div class="section-heading">

                  <FileText :size="16" />

                  <div>
                    <h3>
                      Trip Notes
                    </h3>

                    <p>
                      Additional trip
                      instructions or remarks.
                    </p>
                  </div>

                </div>

                <div class="notes-box">
                  {{ trip.notes }}
                </div>

              </section>

              <!-- CANCELLATION -->

              <section
                v-if="
                  trip.cancellationReason
                "
                class="
                  section-card
                  cancellation-card
                "
              >

                <div class="section-heading red-heading">

                  <AlertCircle :size="16" />

                  <div>
                    <h3>
                      Cancellation Information
                    </h3>

                    <p>
                      Reason why this trip
                      was cancelled.
                    </p>
                  </div>

                </div>

                <div class="notes-box">
                  {{
                    trip.cancellationReason
                  }}
                </div>

              </section>

              <!-- AUDIT -->

              <section class="section-card">

                <div class="section-heading">

                  <CalendarDays :size="16" />

                  <div>
                    <h3>
                      Ticket Audit Information
                    </h3>

                    <p>
                      Activity timestamps
                      related to this trip.
                    </p>
                  </div>

                </div>

                <div class="audit-grid">

                  <div>
                    <span>
                      Created By
                    </span>

                    <strong>
                      {{ trip.createdBy }}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Created At
                    </span>

                    <strong>
                      {{
                        formatDateTime(
                          trip.createdAt,
                        )
                      }}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Started At
                    </span>

                    <strong>
                      {{
                        formatDateTime(
                          trip.startedAt,
                        )
                      }}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Completed At
                    </span>

                    <strong>
                      {{
                        formatDateTime(
                          trip.completedAt,
                        )
                      }}
                    </strong>
                  </div>

                </div>

              </section>

            </div>

          </template>

          <!-- =============================================
               FOOTER
          ============================================== -->

          <div class="modal-footer">

            <div class="footer-reference">

              <Ticket :size="14" />

              <span>
                {{
                  trip.tripTicketNumber ||
                  trip.tripNumber
                }}
              </span>

            </div>

            <AppButton
              variant="secondary"
              @click="
                handleClose
              "
            >
              Close
            </AppButton>

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
  max-width: 880px;

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

/* =========================================================
   HEADER
========================================================= */

.modal-header {
  display: flex;

  flex-shrink: 0;

  align-items: center;
  justify-content: space-between;

  gap: 12px;

  padding:
    16px 18px;

  border-bottom:
    1px solid
    var(--border-soft);
}

.header-left,
.header-right {
  display: flex;

  align-items: center;

  gap: 10px;
}

.header-left {
  min-width: 0;
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
    var(--purple-soft);

  color:
    var(--purple);
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

  font-size: 9px;
}

.close-button {
  display: flex;

  width: 34px;
  height: 34px;

  flex-shrink: 0;

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

/* =========================================================
   BODY
========================================================= */

.modal-body {
  flex: 1;

  overflow-y: auto;

  padding:
    16px 18px;
}

/* =========================================================
   HERO
========================================================= */

.ticket-hero {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 16px;

  margin-bottom: 11px;

  padding: 14px;

  border:
    1px solid
    color-mix(
      in srgb,
      var(--purple) 25%,
      var(--border)
    );

  border-radius: 10px;

  background:
    var(--purple-soft);
}

.ticket-number-area {
  display: flex;

  align-items: center;

  gap: 10px;
}

.ticket-symbol {
  display: flex;

  width: 45px;
  height: 45px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background:
    var(--bg-card);

  color:
    var(--purple);
}

.ticket-number-area span,
.ticket-number-area strong,
.ticket-number-area small {
  display: block;
}

.ticket-number-area span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.ticket-number-area strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 14px;
  font-weight: 700;
}

.ticket-number-area small {
  margin-top: 3px;

  color:
    var(--text-secondary);

  font-size: 8px;
}

.ticket-status {
  text-align: right;
}

.ticket-status > span {
  display: block;

  margin-bottom: 5px;

  color:
    var(--text-muted);

  font-size: 8px;
}

/* =========================================================
   SECTION
========================================================= */

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
  font-weight: 700;
}

.section-heading p {
  margin:
    3px 0 0;

  color:
    var(--text-muted);

  font-size: 8px;
}

.red-heading {
  color:
    var(--red);
}

/* =========================================================
   INFO GRID
========================================================= */

.info-grid,
.schedule-grid,
.audit-grid {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.info-grid > div,
.schedule-grid > div,
.audit-grid > div {
  padding: 10px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.info-grid span,
.info-grid strong,
.schedule-grid span,
.schedule-grid strong,
.audit-grid span,
.audit-grid strong {
  display: block;
}

.info-grid span,
.schedule-grid span,
.audit-grid span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.info-grid strong,
.schedule-grid strong,
.audit-grid strong {
  margin-top: 4px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.blue {
  color:
    var(--primary) !important;
}

.green {
  color:
    var(--green) !important;
}

/* =========================================================
   EMPLOYEE
========================================================= */

.employee-block {
  display: flex;

  align-items: center;

  gap: 10px;

  padding: 11px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    var(--bg-card);
}

.employee-avatar {
  display: flex;

  width: 38px;
  height: 38px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.employee-name strong,
.employee-name span {
  display: block;
}

.employee-name strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.employee-name span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

/* =========================================================
   CLIENT
========================================================= */

.client-box {
  display: flex;

  align-items: center;

  gap: 9px;

  padding: 11px;

  border:
    1px solid var(--border);

  border-radius: 8px;

  background:
    var(--bg-card);

  color:
    var(--primary);
}

.client-box span,
.client-box strong {
  display: block;
}

.client-box span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.client-box strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 10px;
}

/* =========================================================
   ROUTE
========================================================= */

.route-box {
  position: relative;

  padding:
    6px 3px;
}

.route-point {
  position: relative;

  z-index: 2;

  display: flex;

  align-items: center;

  gap: 10px;
}

.route-point span,
.route-point strong {
  display: block;
}

.route-point span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.route-point strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 10px;
}

.route-dot {
  width: 12px;
  height: 12px;

  flex-shrink: 0;

  border:
    3px solid var(--bg-card);

  border-radius: 50%;
}

.route-dot.origin {
  background:
    var(--primary);
}

.route-dot.destination {
  background:
    var(--green);
}

.route-line {
  width: 2px;
  height: 26px;

  margin:
    2px 0 2px 5px;

  background:
    var(--border);
}

/* =========================================================
   VEHICLE
========================================================= */

.vehicle-grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.vehicle-card {
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

.vehicle-icon {
  display: flex;

  width: 36px;
  height: 36px;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.vehicle-card span,
.vehicle-card strong {
  display: block;
}

.vehicle-card span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.vehicle-card strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 10px;
}

/* =========================================================
   NOTES
========================================================= */

.notes-box {
  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card);

  color:
    var(--text-secondary);

  font-size: 9px;

  line-height: 1.6;
}

.cancellation-card {
  border-color:
    color-mix(
      in srgb,
      var(--red) 25%,
      var(--border)
    );
}

/* =========================================================
   EMPTY
========================================================= */

.empty-body {
  display: flex;

  min-height: 370px;

  flex: 1;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  padding: 30px;

  text-align: center;
}

.empty-icon {
  display: flex;

  width: 58px;
  height: 58px;

  align-items: center;
  justify-content: center;

  margin-bottom: 12px;

  border-radius: 50%;

  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.empty-body h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
}

.empty-body > p {
  max-width: 370px;

  margin:
    6px 0 17px;

  color:
    var(--text-muted);

  font-size: 9px;

  line-height: 1.6;
}

.empty-trip-summary {
  display: grid;

  width: 100%;
  max-width: 560px;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 8px;

  padding: 11px;

  border:
    1px solid var(--border);

  border-radius: 9px;

  background:
    var(--bg-card-soft);

  text-align: left;
}

.empty-trip-summary > div {
  min-height: 55px;

  padding: 9px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.empty-trip-summary span,
.empty-trip-summary strong {
  display: block;
}

.empty-trip-summary span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.empty-trip-summary strong {
  margin-top: 4px;

  color:
    var(--text-primary);

  font-size: 9px;
}

/* =========================================================
   FOOTER
========================================================= */

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

.footer-reference {
  display: flex;

  align-items: center;

  gap: 6px;

  color:
    var(--text-muted);

  font-size: 8px;
}

/* =========================================================
   TRANSITION
========================================================= */

.modal-enter-active,
.modal-leave-active {
  transition:
    opacity 0.15s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media (max-width: 720px) {
  .info-grid,
  .schedule-grid,
  .audit-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }

  .ticket-hero {
    align-items:
      flex-start;

    flex-direction:
      column;
  }

  .ticket-status {
    text-align: left;
  }
}

@media (max-width: 500px) {
  .info-grid,
  .schedule-grid,
  .audit-grid,
  .vehicle-grid,
  .empty-trip-summary {
    grid-template-columns:
      1fr;
  }

  .header-right
  > :first-child {
    display: none;
  }
}
</style>