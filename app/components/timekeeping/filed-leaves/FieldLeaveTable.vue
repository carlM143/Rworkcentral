<script setup lang="ts">
import {
  MapPin,
  Clock3,
  Navigation,
} from 'lucide-vue-next'

import FieldLeaveActions from '~/components/timekeeping/filed-leaves/FieldLeaveActions.vue'

import type {
  FieldLeaveRecord,
} from '~/types/fieldLeave'

defineProps<{
  records:
    FieldLeaveRecord[]
}>()

const emit = defineEmits<{
  view: [record: FieldLeaveRecord]
  edit: [record: FieldLeaveRecord]
  approve: [record: FieldLeaveRecord]
  reject: [record: FieldLeaveRecord]
  complete: [record: FieldLeaveRecord]
  employee: [record: FieldLeaveRecord]
  timeLog: [record: FieldLeaveRecord]
  trip: [record: FieldLeaveRecord]
  cancel: [record: FieldLeaveRecord]
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
          Field Leave Records
        </h3>

        <p>
          Review employee field assignments,
          client visits and official business requests.
        </p>
      </div>

    </div>

    <div
      v-if="
        records.length
      "
      class="table-scroll"
    >

      <table class="field-table">

        <thead>
          <tr>
            <th>Request No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Type</th>
            <th>Destination</th>
            <th>Date</th>
            <th>Time</th>
            <th>Purpose</th>
            <th>Related Trip</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="
              record in
              records
            "
            :key="
              record.id
            "
          >

            <td>

              <strong class="request-number">
                {{
                  record.requestNumber
                }}
              </strong>

            </td>

            <td>

              <div class="employee-cell">

                <div class="employee-icon">
                  <MapPin :size="16" />
                </div>

                <div>

                  <strong>
                    {{
                      record.employeeName
                    }}
                  </strong>

                  <span>
                    {{
                      record.employeeNumber
                    }}
                    ·
                    {{
                      record.position
                    }}
                  </span>

                </div>

              </div>

            </td>

            <td>
              {{
                record.department
              }}
            </td>

            <td>

              <span class="type-badge">
                {{
                  record.leaveType
                }}
              </span>

            </td>

            <td>

              <div class="destination">

                <MapPin :size="13" />

                <div>
                  <strong>
                    {{
                      record.destination
                    }}
                  </strong>

                  <span>
                    {{
                      record.client ||
                      'No client'
                    }}
                  </span>
                </div>

              </div>

            </td>

            <td>
              {{
                formatDate(
                  record.fieldDate,
                )
              }}
            </td>

            <td>

              <div class="time-cell">

                <Clock3 :size="13" />

                <span>
                  {{
                    formatTime(
                      record.timeFrom,
                    )
                  }}
                  -
                  {{
                    formatTime(
                      record.timeTo,
                    )
                  }}
                </span>

              </div>

            </td>

            <td>

              <p class="purpose">
                {{
                  record.purpose
                }}
              </p>

            </td>

            <td>

              <div
                v-if="
                  record.relatedTripNumber
                "
                class="trip-reference"
              >
                <Navigation :size="12" />

                {{
                  record.relatedTripNumber
                }}
              </div>

              <span
                v-else
                class="no-trip"
              >
                —
              </span>

            </td>

            <td>

              <StatusBadge
                :status="
                  record.status
                "
              />

            </td>

            <td>

              <FieldLeaveActions
                :record="
                  record
                "
                @view="
                  emit(
                    'view',
                    record,
                  )
                "
                @edit="
                  emit(
                    'edit',
                    record,
                  )
                "
                @approve="
                  emit(
                    'approve',
                    record,
                  )
                "
                @reject="
                  emit(
                    'reject',
                    record,
                  )
                "
                @complete="
                  emit(
                    'complete',
                    record,
                  )
                "
                @employee="
                  emit(
                    'employee',
                    record,
                  )
                "
                @time-log="
                  emit(
                    'timeLog',
                    record,
                  )
                "
                @trip="
                  emit(
                    'trip',
                    record,
                  )
                "
                @cancel="
                  emit(
                    'cancel',
                    record,
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

      <MapPin :size="29" />

      <strong>
        No field leave records found
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

.field-table {
  width: 100%;

  min-width: 1500px;

  border-collapse:
    collapse;
}

.field-table th {
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

.field-table td {
  padding: 13px;

  border-bottom:
    1px solid
    var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 10px;

  vertical-align: middle;
}

.field-table
tbody
tr:last-child
td {
  border-bottom: 0;
}

.field-table
tbody
tr:hover {
  background:
    var(--bg-card-soft);
}

.request-number {
  color:
    var(--primary);

  font-size: 9px;

  white-space: nowrap;
}

.employee-cell {
  display: flex;

  min-width: 190px;

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

.type-badge {
  display: inline-flex;

  padding:
    5px 8px;

  border-radius: 20px;

  background:
    var(--purple-soft);

  color:
    var(--purple);

  font-size: 8px;
  font-weight: 650;

  white-space: nowrap;
}

.destination {
  display: flex;

  min-width: 190px;

  align-items: center;

  gap: 7px;
}

.destination > svg {
  flex-shrink: 0;

  color:
    var(--primary);
}

.destination strong,
.destination span {
  display: block;
}

.destination strong {
  color:
    var(--text-primary);

  font-size: 9px;
}

.destination span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 8px;
}

.time-cell {
  display: flex;

  min-width: 125px;

  align-items: center;

  gap: 5px;

  color:
    var(--primary);

  white-space: nowrap;
}

.time-cell span {
  color:
    var(--text-primary);

  font-size: 9px;
}

.purpose {
  max-width: 210px;

  margin: 0;

  overflow: hidden;

  color:
    var(--text-secondary);

  white-space: nowrap;

  text-overflow: ellipsis;
}

.trip-reference {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  padding:
    5px 7px;

  border-radius: 6px;

  background:
    var(--primary-soft);

  color:
    var(--primary);

  font-size: 8px;
  font-weight: 600;

  white-space: nowrap;
}

.no-trip {
  color:
    var(--text-muted);
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