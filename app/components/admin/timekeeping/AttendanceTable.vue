<script setup lang="ts">
import {
  Clock3,
  Users,
  Eye,
} from 'lucide-vue-next'

import type {
  AttendanceRecord,
} from '~/types/timekeeping'

defineProps<{
  records: AttendanceRecord[]
}>()

const emit = defineEmits<{
  view: [record: AttendanceRecord]
}>()

const minutesLabel = (
  value: number,
) => {
  if (!value) {
    return '—'
  }

  return `${value} min`
}
</script>

<template>
  <div class="attendance-card">

    <!-- HEADER -->
    <div class="table-heading">
      <div>
        <h3>
          Today's Attendance
        </h3>

        <p>
          Review employee time logs,
          attendance status, late and undertime records.
        </p>
      </div>
    </div>

    <!-- TABLE -->
    <div
      v-if="records.length"
      class="table-scroll"
    >
      <table class="attendance-table">

        <thead>
          <tr>
            <th>Employee</th>
            <th>Schedule</th>
            <th>Time In</th>
            <th>Time Out</th>
            <th>Late</th>
            <th>Undertime</th>
            <th>Status</th>
            <th class="action-column" />
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="record in records"
            :key="record.id"
          >

            <!-- EMPLOYEE -->
            <td>
              <div class="employee-cell">

                <div class="employee-icon">
                  <Users :size="16" />
                </div>

                <div class="employee-info">
                  <strong>
                    {{ record.employeeName }}
                  </strong>

                  <span>
                    {{ record.employeeNumber }}
                    ·
                    {{ record.department }}
                  </span>
                </div>

              </div>
            </td>

            <!-- SCHEDULE -->
            <td>
              <div class="schedule-cell">
                <Clock3 :size="13" />

                {{ record.schedule }}
              </div>
            </td>

            <!-- TIME IN -->
            <td>
              <strong
                :class="{
                  late:
                    record.status === 'Late',
                }"
              >
                {{ record.timeIn || '—' }}
              </strong>
            </td>

            <!-- TIME OUT -->
            <td>
              {{ record.timeOut || '—' }}
            </td>

            <!-- LATE -->
            <td>
              <span
                :class="{
                  'issue-value':
                    record.lateMinutes > 0,
                }"
              >
                {{
                  minutesLabel(
                    record.lateMinutes,
                  )
                }}
              </span>
            </td>

            <!-- UNDERTIME -->
            <td>
              <span
                :class="{
                  'issue-value':
                    record.undertimeMinutes > 0,
                }"
              >
                {{
                  minutesLabel(
                    record.undertimeMinutes,
                  )
                }}
              </span>
            </td>

            <!-- STATUS -->
            <td>
              <StatusBadge
                :status="record.status"
              />
            </td>

            <!-- ACTION -->
            <td class="action-column">
              <button
                type="button"
                class="view-button"
                title="View attendance"
                @click="
                  emit(
                    'view',
                    record,
                  )
                "
              >
                <Eye :size="15" />
              </button>
            </td>

          </tr>
        </tbody>
      </table>
    </div>

    <!-- EMPTY -->
    <div
      v-else
      class="empty-state"
    >
      <div class="empty-icon">
        <Clock3 :size="24" />
      </div>

      <strong>
        No attendance records found
      </strong>

      <p>
        Try changing the selected filters or date.
      </p>
    </div>

  </div>
</template>

<style scoped>
.attendance-card {
  position: relative;

  border: 1px solid var(--border);
  border-radius: 11px;

  background: var(--bg-card);

  box-shadow: var(--shadow);
}

.table-heading {
  padding: 15px 17px;

  border-bottom:
    1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  color: var(--text-primary);

  font-size: 13px;
  font-weight: 700;
}

.table-heading p {
  margin: 4px 0 0;

  color: var(--text-muted);

  font-size: 9px;
}

.table-scroll {
  overflow-x: auto;
}

.attendance-table {
  width: 100%;
  min-width: 1050px;

  border-collapse: collapse;
}

.attendance-table th {
  padding: 11px 14px;

  border-bottom:
    1px solid var(--border);

  background: var(--bg-card-soft);
  color: var(--text-secondary);

  font-size: 9px;
  font-weight: 650;

  text-align: left;
  text-transform: uppercase;

  letter-spacing: 0.35px;
}

.attendance-table td {
  padding: 12px 14px;

  border-bottom:
    1px solid var(--border-soft);

  color: var(--text-secondary);

  font-size: 10px;
}

.attendance-table tbody
tr:last-child td {
  border-bottom: 0;
}

.attendance-table tbody tr:hover {
  background: var(--bg-card-soft);
}

/* EMPLOYEE */

.employee-cell {
  display: flex;
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

  background: var(--primary-soft);
  color: var(--primary);
}

.employee-info strong,
.employee-info span {
  display: block;
}

.employee-info strong {
  color: var(--text-primary);

  font-size: 10px;
}

.employee-info span {
  margin-top: 3px;

  color: var(--text-muted);

  font-size: 8px;
}

/* SCHEDULE */

.schedule-cell {
  display: flex;
  align-items: center;
  gap: 6px;

  white-space: nowrap;
}

.late,
.issue-value {
  color: var(--orange);
}

/* ACTION */

.action-column {
  width: 50px;

  text-align: right !important;
}

.view-button {
  display: inline-flex;

  width: 30px;
  height: 30px;

  align-items: center;
  justify-content: center;

  border: 1px solid var(--border);
  border-radius: 7px;

  background: transparent;
  color: var(--text-secondary);
}

.view-button:hover {
  background: var(--primary-soft);
  color: var(--primary);
}

/* EMPTY */

.empty-state {
  display: flex;

  min-height: 260px;

  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 30px;

  text-align: center;
}

.empty-icon {
  display: flex;

  width: 48px;
  height: 48px;

  align-items: center;
  justify-content: center;

  margin-bottom: 12px;

  border-radius: 12px;

  background: var(--primary-soft);
  color: var(--primary);
}

.empty-state strong {
  color: var(--text-primary);

  font-size: 13px;
}

.empty-state p {
  margin: 5px 0 0;

  color: var(--text-muted);

  font-size: 10px;
}
</style>