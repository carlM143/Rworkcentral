<script setup lang="ts">
import {
  CalendarDays,
  Check,
  Circle,
  ClipboardList,
  Mail,
  MoreHorizontal,
  UserRound,
} from 'lucide-vue-next'

import type {
  OnboardingEmployee,
  OnboardingStatus,
} from '~/types/onboarding'

defineProps<{
  records:
    OnboardingEmployee[]
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

const statusClass = (
  status:
    OnboardingStatus,
) => {
  if (
    status ===
    'Completed'
  ) {
    return 'completed'
  }

  if (
    status ===
    'For Completion'
  ) {
    return 'for-completion'
  }

  if (
    status ===
    'In Progress'
  ) {
    return 'in-progress'
  }

  if (
    status ===
    'On Hold'
  ) {
    return 'on-hold'
  }

  return 'not-started'
}

const progressClass = (
  progress: number,
) => {
  if (progress === 100) {
    return 'complete'
  }

  if (progress >= 70) {
    return 'high'
  }

  if (progress >= 40) {
    return 'medium'
  }

  return 'low'
}

const checklistItems = (
  item:
    OnboardingEmployee,
) => {
  return [
    {
      label: 'Documents',
      completed:
        item.checklist.documents,
    },
    {
      label: 'Profile',
      completed:
        item.checklist.employeeProfile,
    },
    {
      label: 'Account',
      completed:
        item.checklist.companyAccount,
    },
    {
      label: 'Orientation',
      completed:
        item.checklist.orientation,
    },
    {
      label: 'Policies',
      completed:
        item.checklist.policyAcknowledgment,
    },
    {
      label: 'Endorsement',
      completed:
        item.checklist.departmentEndorsement,
    },
  ]
}
</script>

<template>
  <article class="table-card">

    <div class="table-heading">

      <div>

        <h3>
          Employee Onboarding
        </h3>

        <p>
          Monitor new hire requirements,
          onboarding checklist and completion progress.
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
            <th>Onboarding No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Employment</th>
            <th>Date Hired</th>
            <th>Target Completion</th>
            <th>Checklist</th>
            <th>Progress</th>
            <th>Assigned HR</th>
            <th>Status</th>
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

              <strong class="onboarding-number">
                {{ item.onboardingNumber }}
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

                <div class="employee-info">

                  <strong>
                    {{ item.employeeName }}
                  </strong>

                  <span>
                    {{ item.employeeNumber }}
                    ·
                    {{ item.position }}
                  </span>

                  <span class="email">

                    <Mail :size="10" />

                    {{ item.email }}

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

            <!-- HIRED -->

            <td>

              <div class="date-cell">

                <CalendarDays
                  :size="13"
                />

                <span>
                  {{ formatDate(item.dateHired) }}
                </span>

              </div>

            </td>

            <!-- TARGET -->

            <td>

              <div class="date-cell target-date">

                <CalendarDays
                  :size="13"
                />

                <strong>
                  {{
                    formatDate(
                      item.targetCompletionDate,
                    )
                  }}
                </strong>

              </div>

            </td>

            <!-- CHECKLIST -->

            <td>

              <div class="checklist">

                <div
                  v-for="
                    check in checklistItems(item)
                  "
                  :key="check.label"
                  class="checklist-item"
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
                    {{
                      item.completedTasks
                    }}
                    /
                    {{
                      item.totalTasks
                    }}
                    tasks
                  </span>

                  <strong>
                    {{ item.progress }}%
                  </strong>

                </div>

                <div class="progress-track">

                  <div
                    class="progress-bar"
                    :class="
                      progressClass(
                        item.progress,
                      )
                    "
                    :style="{
                      width:
                        `${item.progress}%`,
                    }"
                  />

                </div>

              </div>

            </td>

            <!-- HR -->

            <td>

              <div class="hr-cell">

                <div class="hr-avatar">
                  HR
                </div>

                <strong>
                  {{ item.assignedHr }}
                </strong>

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

            <!-- REMARKS -->

            <td>

              <p class="remarks">
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
                title="Onboarding actions will be added later"
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

    <!-- EMPTY -->

    <div
      v-else
      class="empty-state"
    >

      <ClipboardList
        :size="36"
      />

      <strong>
        No onboarding records found
      </strong>

      <span>
        Try changing your onboarding filters.
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

  min-width: 2180px;

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

/* NUMBER */

.onboarding-number {
  color:
    var(--primary);

  font-size: 10.5px;

  white-space: nowrap;
}

/* EMPLOYEE */

.employee-cell {
  display: flex;

  min-width: 245px;

  align-items: center;

  gap: 10px;
}

.employee-avatar {
  display: flex;

  width: 38px;
  height: 38px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.employee-info strong,
.employee-info span {
  display: block;
}

.employee-info strong {
  color:
    var(--text-primary);

  font-size: 11px;
}

.employee-info span {
  margin-top: 3px;

  color:
    var(--text-muted);

  font-size: 9.5px;
}

.email {
  display: flex !important;

  align-items: center;

  gap: 4px;
}

/* DEPARTMENT */

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

.target-date svg {
  color:
    var(--orange);
}

.target-date strong {
  color:
    var(--text-primary);
}

/* CHECKLIST */

.checklist {
  display: grid;

  width: 250px;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap: 5px 8px;
}

.checklist-item {
  display: flex;

  align-items: center;

  gap: 4px;

  color:
    var(--text-muted);

  font-size: 9px;

  white-space: nowrap;
}

.checklist-item.done {
  color:
    var(--green);
}

/* PROGRESS */

.progress-cell {
  width: 155px;
}

.progress-heading {
  display: flex;

  align-items: center;
  justify-content: space-between;

  gap: 8px;

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

  transition:
    width 0.2s ease;
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

/* HR */

.hr-cell {
  display: flex;

  min-width: 130px;

  align-items: center;

  gap: 7px;
}

.hr-avatar {
  display: flex;

  width: 29px;
  height: 29px;

  flex-shrink: 0;

  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background:
    var(--purple-soft);

  color:
    var(--purple);

  font-size: 8px;
  font-weight: 700;
}

.hr-cell strong {
  color:
    var(--text-primary);

  font-size: 10px;
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

.status-badge.for-completion {
  background:
    var(--purple-soft);

  color:
    var(--purple);
}

.status-badge.in-progress {
  background:
    var(--primary-soft);

  color:
    var(--primary);
}

.status-badge.on-hold {
  background:
    var(--red-soft);

  color:
    var(--red);
}

.status-badge.not-started {
  background:
    var(--orange-soft);

  color:
    var(--orange);
}

/* REMARKS */

.remarks {
  width: 220px;

  margin: 0;

  overflow: hidden;

  color:
    var(--text-secondary);

  font-size: 10px;

  text-overflow: ellipsis;

  white-space: nowrap;
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