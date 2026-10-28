<script setup lang="ts">
import {
  Clock3,
  Paperclip,
} from 'lucide-vue-next'

import ManualTimeActions from '~/components/admin/timekeeping/manual-time-in-out/ManualTimeActions.vue'

import type {
  ManualTimeEntry,
} from '~/types/manualTimeEntry'

defineProps<{
  entries:
    ManualTimeEntry[]
}>()

const emit = defineEmits<{
  view: [
    entry:
      ManualTimeEntry,
  ]

  edit: [
    entry:
      ManualTimeEntry,
  ]

  validate: [
    entry:
      ManualTimeEntry,
  ]

  employee: [
    entry:
      ManualTimeEntry,
  ]

  timeLog: [
    entry:
      ManualTimeEntry,
  ]

  cancel: [
    entry:
      ManualTimeEntry,
  ]
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
          Manual Time Entries
        </h3>

        <p>
          Review manually encoded attendance
          entries and validation status.
        </p>
      </div>

    </div>

    <div
      v-if="entries.length"
      class="table-scroll"
    >

      <table class="entry-table">

        <thead>
          <tr>
            <th>Employee</th>
            <th>Date</th>
            <th>Schedule</th>
            <th>Entry Type</th>
            <th>Time</th>
            <th>Reason</th>
            <th>Encoded By</th>
            <th>Encoded At</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="entry in entries"
            :key="entry.id"
          >

            <td>

              <div class="employee-cell">

                <div class="employee-icon">
                  <Clock3 :size="16" />
                </div>

                <div>
                  <strong>
                    {{ entry.employeeName }}
                  </strong>

                  <span>
                    {{ entry.employeeNumber }}
                    ·
                    {{ entry.department }}
                  </span>
                </div>

              </div>

            </td>

            <td>
              {{
                formatDate(
                  entry.attendanceDate,
                )
              }}
            </td>

            <td class="schedule">
              {{ entry.schedule }}
            </td>

            <td>
              <span class="entry-type">
                {{ entry.entryType }}
              </span>
            </td>

            <td>
              <strong class="time-value">
                {{ entry.time }}
              </strong>
            </td>

            <td>

              <div class="reason-cell">
                <span>
                  {{ entry.reason }}
                </span>

                <Paperclip
                  v-if="
                    entry.attachment
                  "
                  :size="13"
                />
              </div>

            </td>

            <td>
              {{ entry.encodedBy }}
            </td>

            <td>
              {{
                formatDateTime(
                  entry.encodedAt,
                )
              }}
            </td>

            <td>
              <StatusBadge
                :status="
                  entry.status
                "
              />
            </td>

            <td>

              <ManualTimeActions
                :entry="entry"
                @view="
                  emit(
                    'view',
                    entry,
                  )
                "
                @edit="
                  emit(
                    'edit',
                    entry,
                  )
                "
                @validate="
                  emit(
                    'validate',
                    entry,
                  )
                "
                @employee="
                  emit(
                    'employee',
                    entry,
                  )
                "
                @time-log="
                  emit(
                    'timeLog',
                    entry,
                  )
                "
                @cancel="
                  emit(
                    'cancel',
                    entry,
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
      <Clock3 :size="28" />

      <strong>
        No manual time entries found
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

.entry-table {
  width: 100%;

  min-width: 1350px;

  border-collapse:
    collapse;
}

.entry-table th {
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

.entry-table td {
  padding: 13px;

  border-bottom:
    1px solid
    var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 10px;

  vertical-align: middle;
}

.entry-table
tbody
tr:last-child
td {
  border-bottom: 0;
}

.entry-table
tbody
tr:hover {
  background:
    var(--bg-card-soft);
}

.employee-cell {
  display: flex;

  min-width: 190px;

  align-items: center;

  gap: 9px;
}

.employee-icon {
  display: flex;

  width: 36px;
  height: 36px;

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

.schedule {
  white-space: nowrap;
}

.entry-type {
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

.time-value {
  color:
    var(--primary);

  white-space: nowrap;
}

.reason-cell {
  display: flex;

  max-width: 210px;

  align-items: center;

  gap: 6px;
}

.reason-cell span {
  overflow: hidden;

  white-space: nowrap;

  text-overflow: ellipsis;
}

.reason-cell svg {
  flex-shrink: 0;

  color:
    var(--primary);
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