<script setup lang="ts">
import {
  Clock3,
  ArrowRight,
} from 'lucide-vue-next'

import LateAdjustmentActions from '~/components/admin/timekeeping/late-adjustment/LateAdjustmentActions.vue'

import type {
  LateAdjustmentRecord,
} from '~/types/lateAdjustment'

defineProps<{
  adjustments:
    LateAdjustmentRecord[]
}>()

const emit = defineEmits<{
  view: [
    adjustment:
      LateAdjustmentRecord,
  ]

  adjust: [
    adjustment:
      LateAdjustmentRecord,
  ]

  approve: [
    adjustment:
      LateAdjustmentRecord,
  ]

  reject: [
    adjustment:
      LateAdjustmentRecord,
  ]

  employee: [
    adjustment:
      LateAdjustmentRecord,
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

const minutesLabel = (
  minutes: number,
) => {
  return `${minutes} min`
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>
        <h3>
          Late Adjustment Records
        </h3>

        <p>
          Review employee late records,
          requested adjustments and approval status.
        </p>
      </div>

    </div>

    <div
      v-if="adjustments.length"
      class="table-scroll"
    >

      <table class="adjustment-table">

        <thead>
          <tr>
            <th>Employee</th>
            <th>Date</th>
            <th>Schedule</th>
            <th>Actual Time In</th>
            <th>Original Late</th>
            <th>Adjusted Late</th>
            <th>Adjustment</th>
            <th>Reason</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>

        <tbody>

          <tr
            v-for="
              adjustment in
              adjustments
            "
            :key="
              adjustment.id
            "
          >

            <td>

              <div class="employee-cell">

                <div class="employee-icon">
                  <Clock3 :size="16" />
                </div>

                <div>
                  <strong>
                    {{
                      adjustment.employeeName
                    }}
                  </strong>

                  <span>
                    {{
                      adjustment.employeeNumber
                    }}
                    ·
                    {{
                      adjustment.department
                    }}
                  </span>
                </div>

              </div>

            </td>

            <td>
              {{
                formatDate(
                  adjustment.attendanceDate,
                )
              }}
            </td>

            <td class="schedule">
              {{ adjustment.schedule }}
            </td>

            <td>
              <strong
                class="actual-time"
              >
                {{
                  adjustment.actualTimeIn
                }}
              </strong>
            </td>

            <td>
              <span class="late-value">
                {{
                  minutesLabel(
                    adjustment.originalLateMinutes,
                  )
                }}
              </span>
            </td>

            <td>
              <span class="adjusted-value">
                {{
                  minutesLabel(
                    adjustment.adjustedLateMinutes,
                  )
                }}
              </span>
            </td>

            <td>

              <div class="difference">

                <span>
                  {{
                    adjustment.originalLateMinutes
                  }}
                </span>

                <ArrowRight :size="12" />

                <strong>
                  {{
                    adjustment.adjustedLateMinutes
                  }}
                </strong>

              </div>

            </td>

            <td>

              <p class="reason">
                {{ adjustment.reason }}
              </p>

            </td>

            <td>

              <StatusBadge
                :status="
                  adjustment.status
                "
              />

            </td>

            <td>

              <LateAdjustmentActions
                :adjustment="
                  adjustment
                "
                @view="
                  emit(
                    'view',
                    adjustment,
                  )
                "
                @adjust="
                  emit(
                    'adjust',
                    adjustment,
                  )
                "
                @approve="
                  emit(
                    'approve',
                    adjustment,
                  )
                "
                @reject="
                  emit(
                    'reject',
                    adjustment,
                  )
                "
                @employee="
                  emit(
                    'employee',
                    adjustment,
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
        No late adjustments found
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

.adjustment-table {
  width: 100%;

  min-width: 1300px;

  border-collapse:
    collapse;
}

.adjustment-table th {
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

.adjustment-table td {
  padding: 13px;

  border-bottom:
    1px solid
    var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 10px;

  vertical-align: middle;
}

.adjustment-table
tbody
tr:last-child
td {
  border-bottom: 0;
}

.adjustment-table
tbody
tr:hover {
  background:
    var(--bg-card-soft);
}

.employee-cell {
  display: flex;

  min-width: 185px;

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
    var(--orange-soft);

  color:
    var(--orange);
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

.actual-time {
  color:
    var(--orange);

  white-space: nowrap;
}

.late-value {
  color:
    var(--red);

  font-weight: 650;

  white-space: nowrap;
}

.adjusted-value {
  color:
    var(--green);

  font-weight: 650;

  white-space: nowrap;
}

.difference {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  padding:
    5px 8px;

  border-radius: 7px;

  background:
    var(--bg-card-soft);

  white-space: nowrap;
}

.difference span {
  color:
    var(--red);

  font-weight: 600;
}

.difference svg {
  color:
    var(--text-muted);
}

.difference strong {
  color:
    var(--green);
}

.reason {
  max-width: 210px;

  margin: 0;

  overflow: hidden;

  color:
    var(--text-secondary);

  white-space: nowrap;

  text-overflow: ellipsis;
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