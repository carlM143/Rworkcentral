<script setup lang="ts">
import {
  Ticket,
  MapPin,
  ArrowRight,
  Car,
} from 'lucide-vue-next'

import TripTicketActions from '~/components/timekeeping/trip-tickets/TripTicketActions.vue'

import type {
  TripTicket,
} from '~/types/tripTicket'

defineProps<{
  tickets:
    TripTicket[]
}>()

const emit = defineEmits<{
  view: [ticket: TripTicket]
  edit: [ticket: TripTicket]
  issue: [ticket: TripTicket]
  inUse: [ticket: TripTicket]
  complete: [ticket: TripTicket]
  trip: [ticket: TripTicket]
  employee: [ticket: TripTicket]
  cancel: [ticket: TripTicket]
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

  return `${
    hour % 12 || 12
  }:${minute} ${period}`
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>
        <h3>
          Trip Ticket Records
        </h3>

        <p>
          Manage issued trip tickets,
          drivers, vehicles and ticket status.
        </p>
      </div>

    </div>

    <div
      v-if="tickets.length"
      class="table-scroll"
    >

      <table class="ticket-table">

        <thead>
          <tr>
            <th>Ticket No.</th>
            <th>Trip No.</th>
            <th>Employee / Driver</th>
            <th>Client</th>
            <th>Route</th>
            <th>Vehicle</th>
            <th>Trip Date</th>
            <th>Departure</th>
            <th>Return</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="
              ticket in
              tickets
            "
            :key="
              ticket.id
            "
          >

            <td>

              <div class="ticket-cell">

                <div class="ticket-icon">
                  <Ticket :size="15" />
                </div>

                <strong>
                  {{
                    ticket.ticketNumber
                  }}
                </strong>

              </div>

            </td>

            <td>
              <strong class="trip-number">
                {{ ticket.tripNumber }}
              </strong>
            </td>

            <td>

              <div class="employee-cell">

                <strong>
                  {{ ticket.employeeName }}
                </strong>

                <span>
                  {{ ticket.employeeNumber }}
                  ·
                  {{ ticket.department }}
                </span>

              </div>

            </td>

            <td>
              {{ ticket.client }}
            </td>

            <td>

              <div class="route-cell">

                <MapPin :size="12" />

                <span>
                  {{ ticket.origin }}
                </span>

                <ArrowRight :size="11" />

                <strong>
                  {{ ticket.destination }}
                </strong>

              </div>

            </td>

            <td>

              <div class="vehicle-cell">

                <Car :size="13" />

                <div>
                  <strong>
                    {{ ticket.vehicle }}
                  </strong>

                  <span>
                    {{ ticket.plateNumber }}
                  </span>
                </div>

              </div>

            </td>

            <td>
              {{
                formatDate(
                  ticket.tripDate,
                )
              }}
            </td>

            <td>

              <div class="time-cell">

                <span>
                  Exp.
                  {{
                    formatTime(
                      ticket.expectedDeparture,
                    )
                  }}
                </span>

                <strong>
                  {{
                    ticket.actualDeparture
                      ? formatTime(
                          ticket.actualDeparture,
                        )
                      : '—'
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
                      ticket.expectedReturn,
                    )
                  }}
                </span>

                <strong>
                  {{
                    ticket.actualReturn
                      ? formatTime(
                          ticket.actualReturn,
                        )
                      : '—'
                  }}
                </strong>

              </div>

            </td>

            <td>
              <StatusBadge
                :status="
                  ticket.status
                "
              />
            </td>

            <td>

              <TripTicketActions
                :ticket="ticket"
                @view="
                  emit(
                    'view',
                    ticket,
                  )
                "
                @edit="
                  emit(
                    'edit',
                    ticket,
                  )
                "
                @issue="
                  emit(
                    'issue',
                    ticket,
                  )
                "
                @in-use="
                  emit(
                    'inUse',
                    ticket,
                  )
                "
                @complete="
                  emit(
                    'complete',
                    ticket,
                  )
                "
                @trip="
                  emit(
                    'trip',
                    ticket,
                  )
                "
                @employee="
                  emit(
                    'employee',
                    ticket,
                  )
                "
                @cancel="
                  emit(
                    'cancel',
                    ticket,
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

      <Ticket :size="29" />

      <strong>
        No trip tickets found
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
  padding:
    15px 16px;

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
  margin:
    5px 0 0;

  color:
    var(--text-muted);

  font-size: 10px;
}

.table-scroll {
  overflow-x: auto;
}

.ticket-table {
  width: 100%;

  min-width: 1500px;

  border-collapse:
    collapse;
}

.ticket-table th {
  padding:
    12px 13px;

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

.ticket-table td {
  padding: 13px;

  border-bottom:
    1px solid
    var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 10px;

  vertical-align: middle;
}

.ticket-table
tbody
tr:last-child
td {
  border-bottom: 0;
}

.ticket-table
tbody
tr:hover {
  background:
    var(--bg-card-soft);
}

.ticket-cell {
  display: flex;

  min-width: 125px;

  align-items: center;

  gap: 7px;
}

.ticket-icon {
  display: flex;

  width: 31px;
  height: 31px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 7px;

  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.ticket-cell strong,
.trip-number {
  color:
    var(--primary);

  font-size: 9px;
}

.employee-cell {
  min-width: 170px;
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

  min-width: 225px;

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
}

.vehicle-cell {
  display: flex;

  min-width: 140px;

  align-items: center;

  gap: 6px;
}

.vehicle-cell svg {
  color:
    var(--primary);
}

.vehicle-cell strong,
.vehicle-cell span {
  display: block;
}

.vehicle-cell strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

.vehicle-cell span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 8px;
}

.time-cell {
  min-width: 105px;
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