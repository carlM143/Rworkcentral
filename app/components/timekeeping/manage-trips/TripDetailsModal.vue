<script setup lang="ts">
import {
  X,
  Navigation,
  UserRound,
  MapPin,
  CalendarDays,
  Car,
  Ticket,
  FileText,
  ShieldCheck,
} from 'lucide-vue-next'

import type {
  ManageTrip,
} from '~/types/manageTrip'

defineProps<{
  open: boolean
  trip: ManageTrip | null
}>()

const emit = defineEmits<{
  close: []
}>()

const formatDate = (
  value: string,
) => {
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
          trip
        "
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
                  Trip Details
                </h2>

                <p>
                  {{ trip.tripNumber }}
                  ·
                  {{ trip.employeeName }}
                </p>
              </div>

            </div>

            <div class="header-right">

              <StatusBadge
                :status="trip.status"
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

            <section class="section-card">

              <div class="section-title">
                <UserRound :size="16" />
                <h3>
                  Driver Information
                </h3>
              </div>

              <div class="info-grid">

                <div>
                  <span>Employee</span>
                  <strong>
                    {{ trip.employeeName }}
                  </strong>
                </div>

                <div>
                  <span>Employee ID</span>
                  <strong>
                    {{ trip.employeeNumber }}
                  </strong>
                </div>

                <div>
                  <span>Department</span>
                  <strong>
                    {{ trip.department }}
                  </strong>
                </div>

                <div>
                  <span>Position</span>
                  <strong>
                    {{ trip.position }}
                  </strong>
                </div>

              </div>

            </section>

            <section class="section-card">

              <div class="section-title">
                <MapPin :size="16" />
                <h3>
                  Trip Information
                </h3>
              </div>

              <div class="info-grid">

                <div>
                  <span>Client</span>
                  <strong>
                    {{ trip.client }}
                  </strong>
                </div>

                <div>
                  <span>Purpose</span>
                  <strong>
                    {{ trip.purpose }}
                  </strong>
                </div>

                <div>
                  <span>Origin</span>
                  <strong>
                    {{ trip.origin }}
                  </strong>
                </div>

                <div>
                  <span>Destination</span>
                  <strong>
                    {{ trip.destination }}
                  </strong>
                </div>

              </div>

            </section>

            <section class="section-card">

              <div class="section-title">
                <CalendarDays :size="16" />
                <h3>
                  Trip Schedule
                </h3>
              </div>

              <div class="info-grid">

                <div>
                  <span>Trip Date</span>

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

                  <strong class="blue">
                    {{
                      formatTime(
                        trip.actualDeparture,
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
                        trip.expectedReturn,
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
                        trip.actualReturn,
                      )
                    }}
                  </strong>
                </div>

              </div>

            </section>

            <section class="section-card">

              <div class="section-title">
                <Car :size="16" />
                <h3>
                  Vehicle Information
                </h3>
              </div>

              <div class="info-grid">

                <div>
                  <span>Vehicle</span>
                  <strong>
                    {{ trip.vehicle }}
                  </strong>
                </div>

                <div>
                  <span>Plate Number</span>
                  <strong>
                    {{ trip.plateNumber }}
                  </strong>
                </div>

                <div>
                  <span>
                    Trip Ticket
                  </span>

                  <strong class="blue">
                    {{
                      trip.tripTicketNumber ||
                      'Not assigned'
                    }}
                  </strong>
                </div>

              </div>

            </section>

            <section
              v-if="
                trip.notes
              "
              class="section-card"
            >

              <div class="section-title">
                <FileText :size="16" />
                <h3>
                  Notes
                </h3>
              </div>

              <p class="notes">
                {{ trip.notes }}
              </p>

            </section>

            <section
              v-if="
                trip.cancellationReason
              "
              class="
                section-card
                cancelled-card
              "
            >

              <div class="section-title">
                <FileText :size="16" />

                <h3>
                  Cancellation Reason
                </h3>
              </div>

              <p class="notes">
                {{
                  trip.cancellationReason
                }}
              </p>

            </section>

            <section class="section-card">

              <div class="section-title">
                <ShieldCheck :size="16" />
                <h3>
                  Audit Trail
                </h3>
              </div>

              <div class="info-grid">

                <div>
                  <span>Created By</span>
                  <strong>
                    {{ trip.createdBy }}
                  </strong>
                </div>

                <div>
                  <span>Created At</span>
                  <strong>
                    {{
                      formatDateTime(
                        trip.createdAt,
                      )
                    }}
                  </strong>
                </div>

                <div>
                  <span>Started By</span>
                  <strong>
                    {{
                      trip.startedBy ||
                      '—'
                    }}
                  </strong>
                </div>

                <div>
                  <span>Started At</span>
                  <strong>
                    {{
                      formatDateTime(
                        trip.startedAt,
                      )
                    }}
                  </strong>
                </div>

                <div>
                  <span>Completed By</span>
                  <strong>
                    {{
                      trip.completedBy ||
                      '—'
                    }}
                  </strong>
                </div>

                <div>
                  <span>Completed At</span>
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

          <div class="modal-footer">

            <span>
              Trip ID: #{{ trip.id }}
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

.modal-header {
  display: flex;

  align-items: center;
  justify-content: space-between;

  padding: 16px 18px;

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

.cancelled-card {
  border-color:
    color-mix(
      in srgb,
      var(--red) 30%,
      var(--border)
    );
}

.section-title {
  display: flex;

  align-items: center;

  gap: 7px;

  margin-bottom: 12px;

  color:
    var(--primary);
}

.section-title h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 11px;
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
  padding: 10px;

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

.notes {
  margin: 0;

  color:
    var(--text-secondary);

  font-size: 9px;

  line-height: 1.6;
}

.modal-footer {
  display: flex;

  align-items: center;
  justify-content: space-between;

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

@media (max-width: 700px) {
  .info-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }
}
</style>