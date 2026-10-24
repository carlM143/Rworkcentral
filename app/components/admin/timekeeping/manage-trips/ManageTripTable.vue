<script setup lang="ts">
import {
  MapPin,
  ArrowRight,
  Navigation,
} from 'lucide-vue-next'

import ManageTripActions from '~/components/admin/timekeeping/manage-trips/ManageTripActions.vue'

import type {
  ManageTrip,
} from '~/types/manageTrip'

defineProps<{
  trips: ManageTrip[]
}>()

const emit = defineEmits<{
  view: [trip: ManageTrip]
  edit: [trip: ManageTrip]
  start: [trip: ManageTrip]
  complete: [trip: ManageTrip]
  employee: [trip: ManageTrip]
  ticket: [trip: ManageTrip]
  cancel: [trip: ManageTrip]
}>()

const formatDate = (
  value: string,
) => {
  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
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

  const displayHour =
    hour % 12 || 12

  return `${displayHour}:${minute} ${period}`
}

const duration = (
  trip: ManageTrip,
) => {
  if (
    !trip.actualDeparture ||
    !trip.actualReturn
  ) {
    return '—'
  }

  const [
    startHour = '0',
    startMinute = '0',
  ] =
    trip.actualDeparture
      .split(':')

  const [
    endHour = '0',
    endMinute = '0',
  ] =
    trip.actualReturn
      .split(':')

  const start =
    Number(startHour) * 60 +
    Number(startMinute)

  const end =
    Number(endHour) * 60 +
    Number(endMinute)

  const minutes =
    Math.max(
      0,
      end - start,
    )

  const hours =
    Math.floor(
      minutes / 60,
    )

  const remaining =
    minutes % 60

  if (!remaining) {
    return `${hours} hr`
  }

  return `${hours} hr ${remaining} min`
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>
        <h3>
          Trip Records
        </h3>

        <p>
          Monitor employee trips, destinations,
          departure times and completion status.
        </p>
      </div>

    </div>

    <div
      v-if="trips.length"
      class="table-scroll"
    >

      <table class="trip-table">

        <thead>
          <tr>
            <th>Trip No.</th>
            <th>Employee / Driver</th>
            <th>Client</th>
            <th>Route</th>
            <th>Trip Date</th>
            <th>Departure</th>
            <th>Return</th>
            <th>Duration</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="trip in trips"
            :key="trip.id"
          >

            <td>
              <strong class="trip-number">
                {{ trip.tripNumber }}
              </strong>

              <span class="ticket-number">
                {{
                  trip.tripTicketNumber ||
                  'No ticket'
                }}
              </span>
            </td>

            <td>

              <div class="employee-cell">

                <div class="employee-icon">
                  <Navigation :size="16" />
                </div>

                <div>
                  <strong>
                    {{ trip.employeeName }}
                  </strong>

                  <span>
                    {{ trip.employeeNumber }}
                    ·
                    {{ trip.department }}
                  </span>
                </div>

              </div>

            </td>

            <td>
              {{ trip.client }}
            </td>

            <td>

              <div class="route-cell">

                <MapPin :size="13" />

                <span>
                  {{ trip.origin }}
                </span>

                <ArrowRight :size="12" />

                <strong>
                  {{ trip.destination }}
                </strong>

              </div>

            </td>

            <td>
              {{
                formatDate(
                  trip.tripDate,
                )
              }}
            </td>

            <td>

              <div class="time-cell">
                <span>
                  Exp.
                  {{
                    formatTime(
                      trip.expectedDeparture,
                    )
                  }}
                </span>

                <strong>
                  {{
                    trip.actualDeparture
                      ? formatTime(
                          trip.actualDeparture,
                        )
                      : 'Not started'
                  }}
                </strong>
              </div>

            </td>

            <td>

              <div class="time-cell">
                <span>
                  Exp.
                  {{
                    formatTime(
                      trip.expectedReturn,
                    )
                  }}
                </span>

                <strong>
                  {{
                    trip.actualReturn
                      ? formatTime(
                          trip.actualReturn,
                        )
                      : '—'
                  }}
                </strong>
              </div>

            </td>

            <td>
              <strong class="duration">
                {{ duration(trip) }}
              </strong>
            </td>

            <td>
              <StatusBadge
                :status="trip.status"
              />
            </td>

            <td>

              <ManageTripActions
                :trip="trip"
                @view="
                  emit(
                    'view',
                    trip,
                  )
                "
                @edit="
                  emit(
                    'edit',
                    trip,
                  )
                "
                @start="
                  emit(
                    'start',
                    trip,
                  )
                "
                @complete="
                  emit(
                    'complete',
                    trip,
                  )
                "
                @employee="
                  emit(
                    'employee',
                    trip,
                  )
                "
                @ticket="
                  emit(
                    'ticket',
                    trip,
                  )
                "
                @cancel="
                  emit(
                    'cancel',
                    trip,
                  )
                "
              />

            </td>

          </tr>

        </tbody>

      </table>

    </div>

    <div
      v-else
      class="empty-state"
    >
      <Navigation :size="28" />

      <strong>
        No trips found
      </strong>

      <span>
        Try changing your filters.
      </span>
    </div>

  </article>
</template>

<style scoped>
.table-card {
  overflow: hidden;

  border:
    1px solid var(--border);

  border-radius: 11px;

  background:
    var(--bg-card);

  box-shadow:
    var(--shadow);
}

.table-heading {
  padding: 15px 16px;

  border-bottom:
    1px solid
    var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 14px;
  font-weight: 700;
}

.table-heading p {
  margin: 5px 0 0;

  color:
    var(--text-muted);

  font-size: 10px;
}

.table-scroll {
  overflow-x: auto;
}

.trip-table {
  width: 100%;

  min-width: 1450px;

  border-collapse: collapse;
}

.trip-table th {
  padding: 12px 13px;

  border-bottom:
    1px solid var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-size: 9px;
  font-weight: 700;

  text-align: left;
  text-transform: uppercase;

  white-space: nowrap;
}

.trip-table td {
  padding: 13px;

  border-bottom:
    1px solid
    var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 10px;

  vertical-align: middle;
}

.trip-table
tbody
tr:last-child
td {
  border-bottom: 0;
}

.trip-table
tbody
tr:hover {
  background:
    var(--bg-card-soft);
}

.trip-number,
.ticket-number {
  display: block;
}

.trip-number {
  color:
    var(--primary);

  font-size: 10px;
}

.ticket-number {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

.employee-cell {
  display: flex;

  min-width: 180px;

  align-items: center;

  gap: 9px;
}

.employee-icon {
  display: flex;

  width: 35px;
  height: 35px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 8px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.employee-cell strong,
.employee-cell span {
  display: block;
}

.employee-cell strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.employee-cell span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 8px;
}

.route-cell {
  display: flex;

  min-width: 230px;

  align-items: center;

  gap: 5px;

  white-space: nowrap;
}

.route-cell svg {
  color:
    var(--text-muted);
}

.route-cell strong {
  color:
    var(--text-primary);

  font-weight: 600;
}

.time-cell {
  min-width: 110px;
}

.time-cell span,
.time-cell strong {
  display: block;
}

.time-cell span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.time-cell strong {
  margin-top: 3px;

  color:
    var(--text-primary);

  font-size: 9px;
}

.duration {
  color:
    var(--primary);

  white-space: nowrap;
}

.empty-state {
  display: flex;

  min-height: 250px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 7px;

  color:
    var(--text-muted);
}

.empty-state strong {
  color:
    var(--text-primary);

  font-size: 11px;
}

.empty-state span {
  font-size: 9px;
}
</style>