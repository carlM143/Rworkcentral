<script setup lang="ts">
import {
  Clock3,
  MoreHorizontal,
  Timer,
  UserRound,
  UsersRound,
} from 'lucide-vue-next'

import type {
  AttendanceReportRecord,
  AttendanceReportStatus,
} from '~/types/attendanceReport'

defineProps<{
  records: AttendanceReportRecord[]

  totals: {
    scheduledDays: number
    presentDays: number
    absentDays: number
    leaveDays: number
    lateCount: number
    undertimeCount: number
    overtimeHours: number
    workedHours: number
  }
}>()

const emit = defineEmits<{ view: [record: AttendanceReportRecord] }>()

const statusClass = (
  status:
    AttendanceReportStatus,
) => {
  if (
    status ===
    'Excellent'
  ) {
    return 'excellent'
  }

  if (
    status ===
    'Good'
  ) {
    return 'good'
  }

  if (
    status ===
    'Needs Attention'
  ) {
    return 'attention'
  }

  return 'critical'
}

const attendanceClass = (
  rate: number,
) => {
  if (
    rate >= 98
  ) {
    return 'excellent'
  }

  if (
    rate >= 90
  ) {
    return 'good'
  }

  if (
    rate >= 80
  ) {
    return 'attention'
  }

  return 'critical'
}
</script>

<template>
  <article class="table-card">

    <!-- ================================================
         HEADER
    ================================================= -->

    <div class="table-heading">

      <div>

        <h3>
          Attendance Summary
        </h3>

        <p>
          Employee attendance, absences, lateness,
          undertime and overtime summary for the
          selected reporting period.
        </p>

      </div>

    </div>

    <!-- ================================================
         TABLE
    ================================================= -->

    <div
      v-if="records.length"
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Employee</th>
            <th>Department</th>
            <th>Employment</th>
            <th>Work Days</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Leave</th>
            <th>Late</th>
            <th>Late Minutes</th>
            <th>Undertime</th>
            <th>Undertime Min.</th>
            <th>OT Hours</th>
            <th>Worked Hours</th>
            <th>Attendance Rate</th>
            <th>Status</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="item in records"
            :key="item.id"
          >

            <!-- EMPLOYEE -->

            <td>

              <div class="employee-cell">

                <div class="employee-avatar">

                  <UserRound
                    :size="17"
                  />

                </div>

                <div>

                  <strong>
                    {{ item.employeeName }}
                  </strong>

                  <span>
                    {{ item.employeeNumber }}
                  </span>

                  <span>
                    {{ item.position }}
                  </span>

                </div>

              </div>

            </td>

            <!-- DEPARTMENT -->

            <td>

              <strong class="department-name">
                {{ item.department }}
              </strong>

            </td>

            <!-- EMPLOYMENT -->

            <td>

              <span class="employment-badge">
                {{ item.employmentType }}
              </span>

            </td>

            <!-- WORK DAYS -->

            <td>

              <strong class="numeric-value">
                {{ item.scheduledDays }}
              </strong>

            </td>

            <!-- PRESENT -->

            <td>

              <span class="present-value">
                {{ item.presentDays }}
              </span>

            </td>

            <!-- ABSENT -->

            <td>

              <span
                class="absence-value"
                :class="{
                  hasValue:
                    item.absentDays > 0,
                }"
              >
                {{ item.absentDays }}
              </span>

            </td>

            <!-- LEAVE -->

            <td>

              <span class="leave-value">
                {{ item.leaveDays }}
              </span>

            </td>

            <!-- LATE -->

            <td>

              <div class="metric-cell">

                <Clock3
                  :size="12"
                />

                <strong>
                  {{ item.lateCount }}
                </strong>

              </div>

            </td>

            <!-- LATE MINUTES -->

            <td>

              <span
                :class="{
                  warningValue:
                    item.lateMinutes > 30,
                }"
              >
                {{ item.lateMinutes }} min
              </span>

            </td>

            <!-- UNDERTIME -->

            <td>

              <div class="metric-cell">

                <Timer
                  :size="12"
                />

                <strong>
                  {{ item.undertimeCount }}
                </strong>

              </div>

            </td>

            <!-- UNDERTIME MIN -->

            <td>

              <span
                :class="{
                  warningValue:
                    item.undertimeMinutes > 30,
                }"
              >
                {{ item.undertimeMinutes }} min
              </span>

            </td>

            <!-- OT -->

            <td>

              <strong class="overtime-value">
                {{
                  item.overtimeHours.toFixed(
                    1,
                  )
                }}
                hrs
              </strong>

            </td>

            <!-- WORKED -->

            <td>

              <strong class="worked-value">
                {{
                  item.totalWorkedHours.toFixed(
                    1,
                  )
                }}
                hrs
              </strong>

            </td>

            <!-- RATE -->

            <td>

              <div class="rate-cell">

                <div class="rate-heading">

                  <strong
                    :class="
                      attendanceClass(
                        item.attendanceRate,
                      )
                    "
                  >
                    {{
                      item.attendanceRate.toFixed(
                        2,
                      )
                    }}%
                  </strong>

                </div>

                <div class="rate-track">

                  <div
                    class="rate-bar"
                    :class="
                      attendanceClass(
                        item.attendanceRate,
                      )
                    "
                    :style="{
                      width:
                        `${Math.min(
                          item.attendanceRate,
                          100,
                        )}%`,
                    }"
                  />

                </div>

              </div>

            </td>

            <!-- STATUS -->

            <td>

              <span
                class="status-badge"
                :class="
                  statusClass(
                    item.status,
                  )
                "
              >

                <span class="status-dot" />

                {{ item.status }}

              </span>

            </td>

            <!-- ACTION -->

            <td>

              <button
                type="button"
                class="action-button"
                title="View report details"
                aria-label="View report details"
                @click="emit('view', item)"
              >

                <MoreHorizontal
                  :size="18"
                />

              </button>

            </td>

          </tr>

        </tbody>

        <!-- ================================================
             TOTALS
        ================================================= -->

        <tfoot>

          <tr>

            <td colspan="3">

              <div class="totals-label">

                <UsersRound
                  :size="14"
                />

                <strong>
                  Report Totals
                </strong>

              </div>

            </td>

            <td>
              {{ totals.scheduledDays }}
            </td>

            <td>
              {{ totals.presentDays }}
            </td>

            <td>
              {{ totals.absentDays }}
            </td>

            <td>
              {{ totals.leaveDays }}
            </td>

            <td>
              {{ totals.lateCount }}
            </td>

            <td>
              —
            </td>

            <td>
              {{ totals.undertimeCount }}
            </td>

            <td>
              —
            </td>

            <td>
              {{ totals.overtimeHours }} hrs
            </td>

            <td>
              {{ totals.workedHours }} hrs
            </td>

            <td colspan="3">
              —
            </td>

          </tr>

        </tfoot>

      </table>

    </div>

    <!-- EMPTY -->

    <div
      v-else
      class="empty-state"
    >

      <UsersRound
        :size="36"
      />

      <strong>
        No attendance records found
      </strong>

      <span>
        Try changing your report filters.
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
    16px 17px;

  border-bottom:
    1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;

  color:
    var(--text-primary);

  font-size: 15px;
}

.table-heading p {
  margin:
    5px 0 0;

  color:
    var(--text-muted);

  font-size: 11px;
}

.table-scroll {
  overflow-x: auto;
}

table {
  width: 100%;

  min-width: 2150px;

  border-collapse:
    collapse;
}

/* ================================================
   HEADER
================================================ */

th {
  padding:
    12px 13px;

  background:
    var(--bg-card-soft);

  color:
    var(--text-secondary);

  font-size: 10px;
  font-weight: 700;

  text-align: left;

  text-transform:
    uppercase;

  white-space: nowrap;
}

/* ================================================
   BODY
================================================ */

td {
  padding:
    13px;

  border-top:
    1px solid var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 10.5px;

  vertical-align:
    middle;
}

tbody tr:hover {
  background:
    var(--bg-card-soft);
}

/* EMPLOYEE */

.employee-cell {
  display: flex;

  min-width: 215px;

  align-items: center;

  gap: 9px;
}

.employee-avatar {
  display: flex;

  width: 37px;
  height: 37px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

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

  font-size: 11px;
}

.employee-cell span {
  margin-top: 2px;

  color:
    var(--text-muted);

  font-size: 9.5px;
}

.department-name {
  color:
    var(--text-primary);

  white-space: nowrap;
}

/* EMPLOYMENT */

.employment-badge {
  display: inline-flex;

  padding:
    5px 8px;

  border-radius: 20px;

  background:
    var(--primary-soft);

  color:
    var(--primary);

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

/* VALUES */

.numeric-value {
  color:
    var(--text-primary);
}

.present-value {
  color:
    var(--green);

  font-weight: 700;
}

.absence-value {
  color:
    var(--text-muted);

  font-weight: 700;
}

.absence-value.hasValue {
  color:
    var(--red);
}

.leave-value {
  color:
    var(--purple);

  font-weight: 700;
}

.metric-cell {
  display: flex;

  align-items: center;

  gap: 5px;

  white-space: nowrap;
}

.metric-cell svg {
  color:
    var(--orange);
}

.metric-cell strong {
  color:
    var(--text-primary);
}

.warningValue {
  color:
    var(--red);

  font-weight: 650;
}

.overtime-value {
  color:
    var(--purple);

  white-space: nowrap;
}

.worked-value {
  color:
    var(--text-primary);

  white-space: nowrap;
}

/* ATTENDANCE RATE */

.rate-cell {
  width: 135px;
}

.rate-heading {
  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-bottom: 6px;
}

.rate-heading strong {
  font-size: 10px;
}

.rate-heading strong.excellent {
  color:
    var(--green);
}

.rate-heading strong.good {
  color:
    var(--primary);
}

.rate-heading strong.attention {
  color:
    var(--orange);
}

.rate-heading strong.critical {
  color:
    var(--red);
}

.rate-track {
  overflow: hidden;

  height: 5px;

  border-radius: 100px;

  background:
    var(--border-soft);
}

.rate-bar {
  height: 100%;

  border-radius: inherit;
}

.rate-bar.excellent {
  background:
    var(--green);
}

.rate-bar.good {
  background:
    var(--primary);
}

.rate-bar.attention {
  background:
    var(--orange);
}

.rate-bar.critical {
  background:
    var(--red);
}

/* STATUS */

.status-badge {
  display: inline-flex;

  align-items: center;

  gap: 5px;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

.status-dot {
  width: 5px;
  height: 5px;

  border-radius: 50%;

  background:
    currentColor;
}

.status-badge.excellent {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.status-badge.good {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.status-badge.attention {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.status-badge.critical {
  background:
    var(--red-soft);

  color:
    var(--red);
}

/* ACTION */

.action-button {
  display: flex;

  width: 32px;
  height: 32px;

  align-items: center;
  justify-content: center;

  border:
    1px solid transparent;

  border-radius: 7px;

  background:
    transparent;

  color:
    var(--text-secondary);
}

.action-button:hover {
  border-color:
    var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--primary);
}

/* ================================================
   TOTALS
================================================ */

tfoot td {
  border-top:
    1px solid var(--border);

  background:
    var(--bg-card-soft);

  color:
    var(--text-primary);

  font-size: 10px;
  font-weight: 700;
}

.totals-label {
  display: flex;

  align-items: center;

  gap: 6px;

  color:
    var(--primary);
}

/* EMPTY */

.empty-state {
  display: flex;

  min-height: 280px;

  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 8px;

  color:
    var(--text-muted);
}

.empty-state strong {
  color:
    var(--text-primary);

  font-size: 13px;
}

.empty-state span {
  font-size: 11px;
}
</style>