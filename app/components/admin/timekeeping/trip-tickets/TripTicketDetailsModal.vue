<script setup lang="ts">
import {
  X,
  Ticket,
  UserRound,
  Building2,
  MapPin,
  CalendarDays,
  Clock3,
  Car,
  FileText,
  ShieldCheck,
  AlertCircle,
} from 'lucide-vue-next'

import type {
  TripTicket,
} from '~/types/tripTicket'

defineProps<{
  open: boolean

  ticket:
    TripTicket | null
}>()

const emit = defineEmits<{
  close: []
}>()

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
</script>

<template>
  <Teleport to="body">

    <Transition name="modal">

      <div
        v-if="
          open &&
          ticket
        "
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
                <Ticket :size="20" />
              </div>

              <div>
                <h2>
                  Trip Ticket
                </h2>

                <p>
                  {{ ticket.ticketNumber }}
                  ·
                  {{ ticket.tripNumber }}
                </p>
              </div>

            </div>

            <div class="header-right">

              <StatusBadge
                :status="
                  ticket.status
                "
              />

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

          </div>

          <div class="modal-body">

            <!-- HERO -->

            <section class="ticket-hero">

              <div class="hero-left">

                <div class="hero-icon">
                  <Ticket :size="21" />
                </div>

                <div>
                  <span>
                    Ticket Number
                  </span>

                  <strong>
                    {{
                      ticket.ticketNumber
                    }}
                  </strong>

                  <small>
                    Linked to
                    {{
                      ticket.tripNumber
                    }}
                  </small>
                </div>

              </div>

              <StatusBadge
                :status="
                  ticket.status
                "
              />

            </section>

            <!-- INFO -->

            <section class="section-card">

              <div class="section-heading">

                <Ticket :size="16" />

                <h3>
                  Ticket Information
                </h3>

              </div>

              <div class="info-grid">

                <div>
                  <span>Ticket No.</span>

                  <strong class="blue">
                    {{
                      ticket.ticketNumber
                    }}
                  </strong>
                </div>

                <div>
                  <span>Trip No.</span>

                  <strong class="blue">
                    {{
                      ticket.tripNumber
                    }}
                  </strong>
                </div>

                <div>
                  <span>Trip Date</span>

                  <strong>
                    {{
                      formatDate(
                        ticket.tripDate,
                      )
                    }}
                  </strong>
                </div>

                <div>
                  <span>Purpose</span>

                  <strong>
                    {{
                      ticket.purpose
                    }}
                  </strong>
                </div>

              </div>

            </section>

            <!-- EMPLOYEE -->

            <section class="section-card">

              <div class="section-heading">

                <UserRound :size="16" />

                <h3>
                  Employee / Driver
                </h3>

              </div>

              <div class="info-grid">

                <div>
                  <span>Employee</span>

                  <strong>
                    {{
                      ticket.employeeName
                    }}
                  </strong>
                </div>

                <div>
                  <span>Employee ID</span>

                  <strong>
                    {{
                      ticket.employeeNumber
                    }}
                  </strong>
                </div>

                <div>
                  <span>Department</span>

                  <strong>
                    {{
                      ticket.department
                    }}
                  </strong>
                </div>

                <div>
                  <span>Position</span>

                  <strong>
                    {{
                      ticket.position
                    }}
                  </strong>
                </div>

              </div>

            </section>

            <!-- CLIENT -->

            <section class="section-card">

              <div class="section-heading">

                <Building2 :size="16" />

                <h3>
                  Client
                </h3>

              </div>

              <div class="client-row">

                <Building2 :size="17" />

                <strong>
                  {{ ticket.client }}
                </strong>

              </div>

            </section>

            <!-- ROUTE -->

            <section class="section-card">

              <div class="section-heading">

                <MapPin :size="16" />

                <h3>
                  Route
                </h3>

              </div>

              <div class="route-box">

                <div>
                  <span>Origin</span>

                  <strong>
                    {{ ticket.origin }}
                  </strong>
                </div>

                <div class="route-line" />

                <div>
                  <span>
                    Destination
                  </span>

                  <strong>
                    {{ ticket.destination }}
                  </strong>
                </div>

              </div>

            </section>

            <!-- SCHEDULE -->

            <section class="section-card">

              <div class="section-heading">

                <Clock3 :size="16" />

                <h3>
                  Trip Schedule
                </h3>

              </div>

              <div class="info-grid">

                <div>
                  <span>
                    Expected Departure
                  </span>

                  <strong>
                    {{
                      formatTime(
                        ticket.expectedDeparture,
                      )
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Actual Departure
                  </span>

                  <strong class="blue">
                    {{
                      formatTime(
                        ticket.actualDeparture,
                      )
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
                        ticket.expectedReturn,
                      )
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    Actual Return
                  </span>

                  <strong class="green">
                    {{
                      formatTime(
                        ticket.actualReturn,
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

                <h3>
                  Vehicle Information
                </h3>

              </div>

              <div class="info-grid two">

                <div>
                  <span>Vehicle</span>

                  <strong>
                    {{ ticket.vehicle }}
                  </strong>
                </div>

                <div>
                  <span>
                    Plate Number
                  </span>

                  <strong>
                    {{ ticket.plateNumber }}
                  </strong>
                </div>

              </div>

            </section>

            <!-- NOTES -->

            <section
              v-if="
                ticket.notes
              "
              class="section-card"
            >

              <div class="section-heading">

                <FileText :size="16" />

                <h3>
                  Notes
                </h3>

              </div>

              <p class="notes">
                {{ ticket.notes }}
              </p>

            </section>

            <!-- CANCEL -->

            <section
              v-if="
                ticket.cancellationReason
              "
              class="
                section-card
                cancel-card
              "
            >

              <div class="
                section-heading
                danger-heading
              ">

                <AlertCircle :size="16" />

                <h3>
                  Cancellation
                </h3>

              </div>

              <p class="notes">
                {{
                  ticket.cancellationReason
                }}
              </p>

            </section>

            <!-- AUDIT -->

            <section class="section-card">

              <div class="section-heading">

                <ShieldCheck :size="16" />

                <h3>
                  Ticket Audit
                </h3>

              </div>

              <div class="audit-grid">

                <div>
                  <span>Created By</span>

                  <strong>
                    {{
                      ticket.createdBy
                    }}
                  </strong>
                </div>

                <div>
                  <span>Created At</span>

                  <strong>
                    {{
                      formatDateTime(
                        ticket.createdAt,
                      )
                    }}
                  </strong>
                </div>

                <div>
                  <span>Issued By</span>

                  <strong>
                    {{
                      ticket.issuedBy ||
                      '—'
                    }}
                  </strong>
                </div>

                <div>
                  <span>Issued At</span>

                  <strong>
                    {{
                      formatDateTime(
                        ticket.issuedAt,
                      )
                    }}
                  </strong>
                </div>

                <div>
                  <span>
                    In Use At
                  </span>

                  <strong>
                    {{
                      formatDateTime(
                        ticket.inUseAt,
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
                        ticket.completedAt,
                      )
                    }}
                  </strong>
                </div>

              </div>

            </section>

          </div>

          <div class="modal-footer">

            <span>
              Ticket ID:
              #{{ ticket.id }}
            </span>

            <AppButton
              variant="secondary"
              @click="
                emit('close')
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
  max-width: 870px;

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

.header-left,
.header-right {
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

.ticket-hero {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 12px;

  margin-bottom: 11px;

  padding: 13px;

  border:
    1px solid
    color-mix(
      in srgb,
      var(--purple) 25%,
      var(--border)
    );

  border-radius: 9px;

  background:
    var(--purple-soft);
}

.hero-left {
  display: flex;

  align-items: center;

  gap: 9px;
}

.hero-icon {
  display: flex;

  width: 42px;
  height: 42px;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background:
    var(--bg-card);

  color:
    var(--purple);
}

.hero-left span,
.hero-left strong,
.hero-left small {
  display: block;
}

.hero-left span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.hero-left strong {
  margin-top: 2px;

  color:
    var(--text-primary);

  font-size: 13px;
}

.hero-left small {
  margin-top: 2px;

  color:
    var(--text-secondary);

  font-size: 8px;
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

  gap: 7px;

  margin-bottom: 11px;

  color:
    var(--primary);
}

.section-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 11px;
}

.info-grid,
.audit-grid {
  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 8px;
}

.info-grid.two {
  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );
}

.info-grid > div,
.audit-grid > div {
  padding: 9px;

  border:
    1px solid
    var(--border-soft);

  border-radius: 7px;

  background:
    var(--bg-card);
}

.info-grid span,
.info-grid strong,
.audit-grid span,
.audit-grid strong {
  display: block;
}

.info-grid span,
.audit-grid span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.info-grid strong,
.audit-grid strong {
  margin-top: 3px;

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

.client-row {
  display: flex;

  align-items: center;

  gap: 8px;

  padding: 10px;

  border:
    1px solid var(--border);

  border-radius: 7px;

  background:
    var(--bg-card);

  color:
    var(--primary);
}

.client-row strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.route-box {
  padding:
    4px 2px;
}

.route-box > div:not(
  .route-line
) {
  padding: 6px;
}

.route-box span,
.route-box strong {
  display: block;
}

.route-box span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.route-box strong {
  margin-top: 2px;

  color:
    var(--text-primary);

  font-size: 10px;
}

.route-line {
  width: 2px;
  height: 22px;

  margin-left: 10px;

  background:
    var(--border);
}

.notes {
  margin: 0;

  color:
    var(--text-secondary);

  font-size: 9px;

  line-height: 1.6;
}

.cancel-card {
  border-color:
    color-mix(
      in srgb,
      var(--red) 25%,
      var(--border)
    );
}

.danger-heading {
  color:
    var(--red);
}

.modal-footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

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
  .info-grid,
  .audit-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }
}
</style>