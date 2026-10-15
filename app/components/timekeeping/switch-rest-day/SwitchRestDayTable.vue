<script setup lang="ts">
import {
  CalendarDays,
  ArrowRight,
  RefreshCw,
} from 'lucide-vue-next'

import SwitchRestDayActions from '~/components/timekeeping/switch-rest-day/SwitchRestDayActions.vue'

import type {
  SwitchRestDayRecord,
} from '~/types/switchRestDay'

defineProps<{
  records:
    SwitchRestDayRecord[]
}>()

const emit = defineEmits<{
  view: [record: SwitchRestDayRecord]
  edit: [record: SwitchRestDayRecord]
  approve: [record: SwitchRestDayRecord]
  reject: [record: SwitchRestDayRecord]
  employee: [record: SwitchRestDayRecord]
  schedule: [record: SwitchRestDayRecord]
  cancel: [record: SwitchRestDayRecord]
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

const formatDateTime = (
  value: string,
) => {
  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    },
  ).format(
    new Date(value),
  )
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          Rest Day Switch Requests
        </h3>

        <p>
          Review employee requests to temporarily
          change their scheduled rest day.
        </p>

      </div>

    </div>

    <div
      v-if="records.length"
      class="table-scroll"
    >

      <table class="switch-table">

        <thead>
          <tr>
            <th>Request No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Current Rest Day</th>
            <th>Requested Rest Day</th>
            <th>Effective Date</th>
            <th>Effective Week</th>
            <th>Reason</th>
            <th>Requested At</th>
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
                  <RefreshCw :size="15" />
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

              <div class="
                rest-day
                current
              ">

                <CalendarDays :size="13" />

                <strong>
                  {{
                    record.currentRestDay
                  }}
                </strong>

              </div>

            </td>

            <td>

              <div class="switch-cell">

                <span>
                  {{
                    record.currentRestDay
                  }}
                </span>

                <ArrowRight :size="12" />

                <strong>
                  {{
                    record.requestedRestDay
                  }}
                </strong>

              </div>

            </td>

            <td>

              <strong class="effective-date">
                {{
                  formatDate(
                    record.effectiveDate,
                  )
                }}
              </strong>

            </td>

            <td>
              <span class="week-text">
                {{
                  record.effectiveWeek
                }}
              </span>
            </td>

            <td>

              <p
                class="reason"
                :title="
                  record.reason
                "
              >
                {{
                  record.reason
                }}
              </p>

            </td>

            <td>
              <span class="requested-at">
                {{
                  formatDateTime(
                    record.requestedAt,
                  )
                }}
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

              <SwitchRestDayActions
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
                @employee="
                  emit(
                    'employee',
                    record,
                  )
                "
                @schedule="
                  emit(
                    'schedule',
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

      <RefreshCw :size="29" />

      <strong>
        No rest day switch requests found
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

.switch-table {
  width: 100%;

  min-width: 1550px;

  border-collapse:
    collapse;
}

.switch-table th {
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

.switch-table td {
  padding: 13px;

  border-bottom:
    1px solid
    var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 10px;

  vertical-align: middle;
}

.switch-table
tbody
tr:last-child
td {
  border-bottom: 0;
}

.switch-table
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

  width: 34px;
  height: 34px;

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

.rest-day {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  padding:
    5px 8px;

  border-radius: 6px;

  white-space: nowrap;
}

.rest-day.current {
  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);
}

.switch-cell {
  display: flex;

  min-width: 155px;

  align-items: center;

  gap: 6px;
}

.switch-cell span {
  color:
    var(--text-muted);

  font-size: 8px;
}

.switch-cell svg {
  color:
    var(--primary);
}

.switch-cell strong {
  color:
    var(--primary);

  font-size: 9px;
}

.effective-date {
  color:
    var(--text-primary);

  font-size: 9px;

  white-space: nowrap;
}

.week-text {
  color:
    var(--text-secondary);

  font-size: 9px;

  white-space: nowrap;
}

.reason {
  max-width: 220px;

  margin: 0;

  overflow: hidden;

  color:
    var(--text-secondary);

  white-space: nowrap;

  text-overflow: ellipsis;
}

.requested-at {
  white-space: nowrap;

  color:
    var(--text-muted);

  font-size: 8px;
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