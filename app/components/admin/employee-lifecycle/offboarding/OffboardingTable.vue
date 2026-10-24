<script setup lang="ts">
import {
  CalendarDays,
  Check,
  Circle,
  ClipboardCheck,
  MoreHorizontal,
  UserRound,
  WalletCards,
} from 'lucide-vue-next'

import type {
  FinalPayStatus,
  OffboardingRecord,
  OffboardingStatus,
  OffboardingType,
} from '~/types/offboarding'

defineProps<{
  records:
    OffboardingRecord[]
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

const statusClass = (
  status:
    OffboardingStatus,
) => {
  if (
    status ===
    'Completed'
  ) {
    return 'completed'
  }

  if (
    status ===
    'Ready for Final Pay'
  ) {
    return 'final-pay'
  }

  if (
    status ===
    'Clearance In Progress'
  ) {
    return 'progress'
  }

  if (
    status ===
    'Pending Clearance'
  ) {
    return 'pending'
  }

  if (
    status ===
    'For Review'
  ) {
    return 'review'
  }

  if (
    status ===
    'Cancelled'
  ) {
    return 'cancelled'
  }

  return 'draft'
}

const typeClass = (
  type:
    OffboardingType,
) => {
  if (
    type ===
    'Resignation'
  ) {
    return 'resignation'
  }

  if (
    type ===
    'End of Contract'
  ) {
    return 'contract'
  }

  if (
    type ===
    'Retirement'
  ) {
    return 'retirement'
  }

  if (
    type ===
    'Termination'
  ) {
    return 'termination'
  }

  return 'redundancy'
}

const finalPayClass = (
  status:
    FinalPayStatus,
) => {
  if (
    status ===
    'Released'
  ) {
    return 'released'
  }

  if (
    status ===
    'Ready for Release'
  ) {
    return 'ready'
  }

  if (
    status ===
      'For Processing' ||
    status ===
      'For Review'
  ) {
    return 'processing'
  }

  return 'not-started'
}

const checklistItems = (
  item:
    OffboardingRecord,
) => {
  return [
    {
      label: 'HR',
      completed:
        item.checklist.hrClearance,
    },
    {
      label: 'Department',
      completed:
        item.checklist.departmentClearance,
    },
    {
      label: 'Finance',
      completed:
        item.checklist.financeClearance,
    },
    {
      label: 'IT',
      completed:
        item.checklist.itClearance,
    },
    {
      label: 'Assets',
      completed:
        item.checklist.assetReturn,
    },
    {
      label: 'Exit Interview',
      completed:
        item.checklist.exitInterview,
    },
  ]
}

const progressClass = (
  progress: number,
) => {
  if (
    progress === 100
  ) {
    return 'complete'
  }

  if (
    progress >= 70
  ) {
    return 'high'
  }

  if (
    progress >= 40
  ) {
    return 'medium'
  }

  return 'low'
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          Employee Offboarding
        </h3>

        <p>
          Monitor employee separation,
          clearance, asset return, exit interview
          and final pay readiness.
        </p>

      </div>

    </div>

    <div
      v-if="records.length"
      class="table-scroll"
    >

      <table>

        <thead>

          <tr>
            <th>Offboarding No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Offboarding Type</th>
            <th>Notice Date</th>
            <th>Last Working Day</th>
            <th>Separation Date</th>
            <th>Clearance Checklist</th>
            <th>Progress</th>
            <th>Exit Interview</th>
            <th>Final Pay</th>
            <th>Initiated By</th>
            <th>Approved By</th>
            <th>Status</th>
            <th>Reason</th>
            <th>Remarks</th>
            <th />
          </tr>

        </thead>

        <tbody>

          <tr
            v-for="item in records"
            :key="item.id"
          >

            <!-- NUMBER -->

            <td>

              <strong class="record-number">
                {{ item.offboardingNumber }}
              </strong>

            </td>

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

              <strong class="department">
                {{ item.department }}
              </strong>

            </td>

            <!-- TYPE -->

            <td>

              <span
                class="type-badge"
                :class="
                  typeClass(
                    item.offboardingType,
                  )
                "
              >
                {{ item.offboardingType }}
              </span>

            </td>

            <!-- NOTICE -->

            <td>

              <div class="date-cell">

                <CalendarDays
                  :size="13"
                />

                {{
                  formatDate(
                    item.noticeDate,
                  )
                }}

              </div>

            </td>

            <!-- LAST DAY -->

            <td>

              <div class="date-cell last-day">

                <CalendarDays
                  :size="13"
                />

                <strong>
                  {{
                    formatDate(
                      item.lastWorkingDay,
                    )
                  }}
                </strong>

              </div>

            </td>

            <!-- SEPARATION -->

            <td>

              <strong class="separation-date">
                {{
                  formatDate(
                    item.separationDate,
                  )
                }}
              </strong>

            </td>

            <!-- CHECKLIST -->

            <td>

              <div class="checklist">

                <div
                  v-for="
                    check in checklistItems(item)
                  "
                  :key="check.label"
                  class="check-item"
                  :class="{
                    done:
                      check.completed,
                  }"
                >

                  <Check
                    v-if="check.completed"
                    :size="10"
                  />

                  <Circle
                    v-else
                    :size="9"
                  />

                  <span>
                    {{ check.label }}
                  </span>

                </div>

              </div>

            </td>

            <!-- PROGRESS -->

            <td>

              <div class="progress-cell">

                <div class="progress-heading">

                  <span>
                    {{ item.completedTasks }}
                    /
                    {{ item.totalTasks }}
                  </span>

                  <strong>
                    {{ item.clearanceProgress }}%
                  </strong>

                </div>

                <div class="progress-track">

                  <div
                    class="progress-bar"
                    :class="
                      progressClass(
                        item.clearanceProgress,
                      )
                    "
                    :style="{
                      width:
                        `${item.clearanceProgress}%`,
                    }"
                  />

                </div>

              </div>

            </td>

            <!-- EXIT -->

            <td>

              <div
                v-if="
                  item.exitInterviewDate
                "
                class="exit-date"
              >

                <ClipboardCheck
                  :size="13"
                />

                <strong>
                  {{
                    formatDate(
                      item.exitInterviewDate,
                    )
                  }}
                </strong>

              </div>

              <span
                v-else
                class="pending-text"
              >
                Not Scheduled
              </span>

            </td>

            <!-- FINAL PAY -->

            <td>

              <span
                class="final-pay-badge"
                :class="
                  finalPayClass(
                    item.finalPayStatus,
                  )
                "
              >

                <WalletCards
                  :size="12"
                />

                {{
                  item.finalPayStatus
                }}

              </span>

            </td>

            <!-- INITIATED -->

            <td>

              <strong class="person-name">
                {{ item.initiatedBy }}
              </strong>

            </td>

            <!-- APPROVED -->

            <td>

              <strong
                v-if="item.approvedBy"
                class="person-name approved-person"
              >
                {{ item.approvedBy }}
              </strong>

              <span
                v-else
                class="pending-text"
              >
                Pending
              </span>

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

            <!-- REASON -->

            <td>

              <p
                class="reason-text"
                :title="item.reason"
              >
                {{ item.reason }}
              </p>

            </td>

            <!-- REMARKS -->

            <td>

              <p
                class="remarks"
                :title="
                  item.remarks ||
                  'No remarks'
                "
              >
                {{
                  item.remarks ||
                  'No remarks'
                }}
              </p>

            </td>

            <!-- ACTION -->

            <td>

              <button
                type="button"
                class="action-button"
                title="Offboarding actions will be added later"
              >

                <MoreHorizontal
                  :size="18"
                />

              </button>

            </td>

          </tr>

        </tbody>

      </table>

    </div>

    <div
      v-else
      class="empty-state"
    >

      <UserRound
        :size="36"
      />

      <strong>
        No offboarding records found
      </strong>

      <span>
        Try changing your offboarding filters.
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

  min-width: 2850px;

  border-collapse:
    collapse;
}

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

td {
  padding:
    13px;

  border-top:
    1px solid var(--border-soft);

  color:
    var(--text-secondary);

  font-size: 10.5px;

  vertical-align: middle;
}

tbody tr:hover {
  background:
    var(--bg-card-soft);
}

.record-number {
  color:
    var(--primary);

  white-space:
    nowrap;
}

/* EMPLOYEE */

.employee-cell {
  display: flex;

  min-width: 205px;

  align-items: center;

  gap: 9px;
}

.employee-avatar {
  display: flex;

  width: 36px;
  height: 36px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background:
    var(--red-soft);

  color:
    var(--red);
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

.department {
  color:
    var(--text-primary);

  white-space: nowrap;
}

/* TYPE */

.type-badge {
  display: inline-flex;

  padding:
    5px 8px;

  border-radius: 20px;

  font-size: 9px;
  font-weight: 650;

  white-space: nowrap;
}

.type-badge.resignation {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.type-badge.contract {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.type-badge.retirement {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.type-badge.termination {
  background:
    var(--red-soft);

  color:
    var(--red);
}

.type-badge.redundancy {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

/* DATES */

.date-cell {
  display: flex;

  align-items: center;

  gap: 5px;

  white-space: nowrap;
}

.date-cell svg {
  color:
    var(--text-muted);
}

.last-day svg {
  color:
    var(--orange);
}

.last-day strong,
.separation-date {
  color:
    var(--text-primary);

  white-space: nowrap;
}

/* CHECKLIST */

.checklist {
  display: grid;

  width: 230px;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 5px 8px;
}

.check-item {
  display: flex;

  align-items: center;

  gap: 4px;

  color:
    var(--text-muted);

  font-size: 9px;

  white-space: nowrap;
}

.check-item.done {
  color:
    var(--green);
}

/* PROGRESS */

.progress-cell {
  width: 150px;
}

.progress-heading {
  display: flex;

  align-items: center;
  justify-content: space-between;

  margin-bottom: 6px;
}

.progress-heading span {
  color:
    var(--text-muted);

  font-size: 9px;
}

.progress-heading strong {
  color:
    var(--text-primary);

  font-size: 10px;
}

.progress-track {
  overflow: hidden;

  height: 6px;

  border-radius: 100px;

  background:
    var(--border-soft);
}

.progress-bar {
  height: 100%;

  border-radius: inherit;
}

.progress-bar.low {
  background:
    var(--red);
}

.progress-bar.medium {
  background:
    var(--orange);
}

.progress-bar.high {
  background:
    var(--primary);
}

.progress-bar.complete {
  background:
    var(--green);
}

/* EXIT */

.exit-date {
  display: flex;

  align-items: center;

  gap: 5px;

  white-space: nowrap;

  color:
    var(--purple);
}

.exit-date strong {
  color:
    var(--text-primary);
}

/* FINAL PAY */

.final-pay-badge {
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

.final-pay-badge.released {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.final-pay-badge.ready {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.final-pay-badge.processing {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.final-pay-badge.not-started {
  background:
    var(--bg-card-soft);

  color:
    var(--text-muted);
}

/* PERSON */

.person-name {
  color:
    var(--text-primary);

  white-space: nowrap;
}

.approved-person {
  color:
    var(--green);
}

.pending-text {
  color:
    var(--text-muted);

  font-size: 9.5px;

  font-style: italic;

  white-space: nowrap;
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

.status-badge.completed {
  background:
    var(--green-soft);

  color:
    var(--green);
}

.status-badge.final-pay {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.status-badge.progress {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.status-badge.pending,
.status-badge.review {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

.status-badge.cancelled {
  background:
    var(--red-soft);

  color:
    var(--red);
}

.status-badge.draft {
  background:
    var(--bg-card-soft);

  color:
    var(--text-muted);
}

/* TEXT */

.reason-text,
.remarks {
  width: 230px;

  margin: 0;

  overflow: hidden;

  color:
    var(--text-secondary);

  font-size: 10px;

  text-overflow:
    ellipsis;

  white-space: nowrap;
}

.remarks {
  width: 200px;

  color:
    var(--text-muted);
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