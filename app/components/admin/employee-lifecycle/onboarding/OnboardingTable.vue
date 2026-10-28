
<script setup lang="ts">
import {
  CalendarDays,
  ClipboardList,
  Mail,
  UserRound,
} from 'lucide-vue-next'

import LifecycleActionMenu from '~/components/admin/employee-lifecycle/LifecycleActionMenu.vue'

import type {
  OnboardingEmployee,
  OnboardingStatus,
} from '~/types/onboarding'

defineProps<{
  records: OnboardingEmployee[]
}>()

const emit = defineEmits<{
  view: [record: OnboardingEmployee]
  details: [record: OnboardingEmployee]
  history: [record: OnboardingEmployee]
}>()

const formatDate = (value: string) => {
  if (!value) return '—'

  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

const statusClass = (status: OnboardingStatus) => {
  if (status === 'Completed') return 'completed'
  if (status === 'For Completion') return 'for-completion'
  if (status === 'In Progress') return 'in-progress'
  if (status === 'On Hold') return 'on-hold'

  return 'not-started'
}
</script>

<template>
  <article class="table-card">

    <!-- TABLE HEADER -->
    <div class="table-heading">
      <div>
        <h3>Employee Onboarding</h3>

        <p>
          Monitor employee onboarding records, employment
          information, completion status and remarks.
        </p>
      </div>

      <span class="record-count">
        {{ records.length }}
        {{ records.length === 1 ? 'Record' : 'Records' }}
      </span>
    </div>

    <!-- TABLE -->
    <div v-if="records.length" class="table-scroll">
      <table>

        <thead>
          <tr>
            <th>Onboarding No.</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Employment</th>
            <th>Date Hired</th>
            <th>Target Completion</th>
            <th>Status</th>
            <th>Remarks</th>
            <th class="actions-heading">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="item in records"
            :key="item.id"
          >

            <!-- ONBOARDING NUMBER -->
            <td>
              <strong class="onboarding-number">
                {{ item.onboardingNumber }}
              </strong>
            </td>

            <!-- EMPLOYEE -->
            <td>
              <div class="employee-cell">

                <div class="employee-avatar">
                  <UserRound :size="17" />
                </div>

                <div class="employee-info">
                  <strong>
                    {{ item.employeeName }}
                  </strong>

                  <span class="employee-meta">
                    {{ item.employeeNumber }}
                    ·
                    {{ item.position }}
                  </span>

                  <span class="employee-email">
                    <Mail :size="11" />
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

            <!-- DATE HIRED -->
            <td>
              <div class="date-cell">
                <CalendarDays :size="14" />

                <span>
                  {{ formatDate(item.dateHired) }}
                </span>
              </div>
            </td>

            <!-- TARGET COMPLETION -->
            <td>
              <div class="date-cell target-date">
                <CalendarDays :size="14" />

                <strong>
                  {{ formatDate(item.targetCompletionDate) }}
                </strong>
              </div>
            </td>

            <!-- STATUS -->
            <td>
              <span
                class="status-badge"
                :class="statusClass(item.status)"
              >
                <span class="status-dot" />
                {{ item.status }}
              </span>
            </td>

            <!-- REMARKS -->
            <td>
              <p
                class="remarks"
                :title="item.remarks || 'No remarks'"
              >
                {{ item.remarks || 'No remarks' }}
              </p>
            </td>

            <!-- ACTIONS -->
            <td class="actions-cell">
              <LifecycleActionMenu
                detail-label="View Progress"
                :show-history="true"
                @view="emit('view', item)"
                @details="emit('details', item)"
                @history="emit('history', item)"
              />
            </td>

          </tr>
        </tbody>

      </table>
    </div>

    <!-- EMPTY STATE -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <ClipboardList :size="25" />
      </div>

      <strong>
        No onboarding records found
      </strong>

      <span>
        Try changing your search or onboarding filters.
      </span>
    </div>

  </article>
</template>

<style scoped>
.table-card {
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 11px;
  background: var(--bg-card);
  box-shadow: var(--shadow);
}

/* HEADER */

.table-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 17px;
  border-bottom: 1px solid var(--border-soft);
}

.table-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 700;
}

.table-heading p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 11px;
}

.record-count {
  flex-shrink: 0;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 650;
}

/* TABLE */

.table-scroll {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1280px;
  border-collapse: collapse;
}

th {
  padding: 13px 14px;
  background: var(--bg-card-soft);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

td {
  padding: 13px 14px;
  border-top: 1px solid var(--border-soft);
  color: var(--text-secondary);
  font-size: 10.5px;
  vertical-align: middle;
}

tbody tr {
  transition: background 0.15s ease;
}

tbody tr:hover {
  background: var(--bg-card-soft);
}

/* ONBOARDING NUMBER */

.onboarding-number {
  color: var(--primary);
  font-size: 10.5px;
  font-weight: 700;
  white-space: nowrap;
}

/* EMPLOYEE */

.employee-cell {
  display: flex;
  min-width: 220px;
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
  background: var(--primary-soft);
  color: var(--primary);
}

.employee-info {
  min-width: 0;
}

.employee-info strong {
  display: block;
  color: var(--text-primary);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.employee-meta {
  display: block;
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 9.5px;
  white-space: nowrap;
}

.employee-email {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
  color: var(--text-muted);
  font-size: 9.5px;
  white-space: nowrap;
}

.employee-email svg {
  flex-shrink: 0;
}

/* DEPARTMENT */

.department-name {
  color: var(--text-primary);
  font-size: 10.5px;
  font-weight: 650;
  white-space: nowrap;
}

/* EMPLOYMENT */

.employment-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 20px;
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
}

/* DATES */

.date-cell {
  display: flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
}

.date-cell svg {
  flex-shrink: 0;
  color: var(--text-muted);
}

.target-date svg {
  color: var(--orange);
}

.target-date strong {
  color: var(--text-primary);
  font-size: 10.5px;
  font-weight: 650;
}

/* STATUS */

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
}

.status-dot {
  width: 5px;
  height: 5px;
  flex-shrink: 0;
  border-radius: 50%;
  background: currentColor;
}

.status-badge.completed {
  background: var(--green-soft);
  color: var(--green);
}

.status-badge.for-completion {
  background: var(--purple-soft);
  color: var(--purple);
}

.status-badge.in-progress {
  background: var(--primary-soft);
  color: var(--primary);
}

.status-badge.on-hold {
  background: var(--red-soft);
  color: var(--red);
}

.status-badge.not-started {
  background: var(--orange-soft);
  color: var(--orange);
}

/* REMARKS */

.remarks {
  max-width: 230px;
  margin: 0;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ACTIONS */

.actions-heading {
  text-align: center;
}

.actions-cell {
  width: 75px;
  text-align: center;
}

/* EMPTY STATE */

.empty-state {
  display: flex;
  min-height: 250px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 25px;
  text-align: center;
}

.empty-icon {
  display: flex;
  width: 52px;
  height: 52px;
  align-items: center;
  justify-content: center;
  border-radius: 13px;
  background: var(--primary-soft);
  color: var(--primary);
}

.empty-state strong {
  color: var(--text-primary);
  font-size: 13px;
}

.empty-state span {
  color: var(--text-muted);
  font-size: 11px;
}

/* RESPONSIVE */

@media (max-width: 768px) {
  .table-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  table {
    min-width: 1150px;
  }
}
</style>
